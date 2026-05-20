// ============================================
// DEEPGRAM STT WRAPPER
// Drop-in replacement for webkitSpeechRecognition.
// Fetches a short-lived key from the Netlify proxy,
// then opens a WebSocket to Deepgram for real-time
// streaming transcription.
//
// Public API mirrors the Web Speech API subset used
// across modules:
//   const rec = new DeepgramSTT();
//   rec.continuous      = true/false
//   rec.interimResults  = true/false
//   rec.lang            = 'en-US'   (ignored — always en-US)
//   rec.onresult        = function(event) { ... }
//   rec.onerror         = function(event) { ... }
//   rec.onend           = function() { ... }
//   rec.start()
//   rec.stop()
//
// The onresult event shape matches SpeechRecognitionEvent:
//   event.resultIndex
//   event.results[i][0].transcript
//   event.results[i].isFinal
// ============================================

class DeepgramSTT {
  constructor() {
    this.continuous     = true;
    this.interimResults = true;
    this.lang           = 'en-US';
    this.onresult       = null;
    this.onerror        = null;
    this.onend          = null;

    this._ws            = null;
    this._mediaStream   = null;
    this._audioContext  = null;
    this._processor     = null;
    this._running       = false;
    this._resultIndex   = 0;
    this._interimBuffer = ''; // current unconfirmed transcript
  }

  async start() {
    if (this._running) return;
    this._running = true;
    this._resultIndex = 0;
    this._interimBuffer = '';

    try {
      // 1. Get a short-lived Deepgram key from our proxy
      console.log('[DeepgramSTT] fetching token...');
      const tokenRes = await fetch('/.netlify/functions/deepgram-token', { method: 'POST' });
      if (!tokenRes.ok) throw new Error('Failed to get Deepgram token');
      const { key } = await tokenRes.json();
      console.log('[DeepgramSTT] token received, opening WebSocket...');

      // 2. Get microphone access
      this._mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      // 3. Open WebSocket to Deepgram
      const params = new URLSearchParams({
        model: 'nova-2',
        language: 'en-US',
        smart_format: 'true',
        filler_words: 'true',
        punctuate: 'true',
        interim_results: this.interimResults ? 'true' : 'false',
        endpointing: '300',
        encoding: 'linear16',
        sample_rate: '16000'
      });

      const wsUrl = `wss://api.deepgram.com/v1/listen?${params}`;
      this._ws = new WebSocket(wsUrl, ['token', key]);
      this._ws.binaryType = 'arraybuffer';

      this._ws.onopen = () => {
        console.log('[DeepgramSTT] WebSocket open, starting stream');
        this._startStreaming();
      };

      this._ws.onmessage = (msg) => {
        console.log('[DeepgramSTT] message:', msg.data);
        this._handleMessage(msg);
      };

      this._ws.onerror = (err) => {
        console.error('[DeepgramSTT] WebSocket error:', err);
        if (this.onerror) this.onerror({ error: 'network' });
      };

      this._ws.onclose = (evt) => {
        console.log('[DeepgramSTT] WebSocket closed:', evt.code, evt.reason);
        this._stopStreaming();
        if (this._running && this.onend) this.onend();
      };

    } catch (err) {
      console.error('DeepgramSTT.start() error:', err);
      this._running = false;
      this._cleanup();

      // Surface the error to the module
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        if (this.onerror) this.onerror({ error: 'not-allowed' });
      } else {
        if (this.onerror) this.onerror({ error: 'network' });
      }
    }
  }

  stop() {
    this._running = false;
    this._cleanup();
    if (this.onend) this.onend();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _startStreaming() {
    if (!this._mediaStream || !this._ws) return;

    // Use the browser's native sample rate — tell Deepgram via URL params
    this._audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const nativeSampleRate = this._audioContext.sampleRate;
    console.log('[DeepgramSTT] native sample rate:', nativeSampleRate);

    // Update the sample_rate param to match actual rate
    // (We already sent the URL — Deepgram will use what we told it.
    //  So we downsample to 16000 before sending.)
    const source = this._audioContext.createMediaStreamSource(this._mediaStream);

    // bufferSize 4096, 1 input channel, 1 output channel
    this._processor = this._audioContext.createScriptProcessor(4096, 1, 1);
    this._processor.onaudioprocess = (e) => {
      if (!this._ws || this._ws.readyState !== WebSocket.OPEN) return;
      const float32 = e.inputBuffer.getChannelData(0);
      // Downsample from native rate to 16000 if needed
      const downsampled = this._downsample(float32, nativeSampleRate, 16000);
      const int16 = this._float32ToInt16(downsampled);
      this._ws.send(int16.buffer);
    };

    source.connect(this._processor);
    this._processor.connect(this._audioContext.destination);

    // Send a keepalive every 8s so Deepgram doesn't close the connection during silence
    this._keepaliveInterval = setInterval(() => {
      if (this._ws && this._ws.readyState === WebSocket.OPEN) {
        this._ws.send(JSON.stringify({ type: 'KeepAlive' }));
      }
    }, 8000);
  }

  _stopStreaming() {
    if (this._keepaliveInterval) {
      clearInterval(this._keepaliveInterval);
      this._keepaliveInterval = null;
    }
    if (this._processor) {
      try { this._processor.disconnect(); } catch(e) {}
      this._processor = null;
    }
    if (this._audioContext) {
      try { this._audioContext.close(); } catch(e) {}
      this._audioContext = null;
    }
  }

  _cleanup() {
    this._stopStreaming();
    if (this._ws) {
      try { this._ws.close(); } catch(e) {}
      this._ws = null;
    }
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach(t => t.stop());
      this._mediaStream = null;
    }
  }

  _handleMessage(msg) {
    let data;
    try { data = JSON.parse(msg.data); } catch { return; }

    // Deepgram sends both interim and final results in the same response shape
    if (data.type !== 'Results') return;

    const alt = data.channel && data.channel.alternatives && data.channel.alternatives[0];
    if (!alt) return;

    const transcript = alt.transcript || '';
    const isFinal    = data.is_final === true;

    if (!transcript) return;

    if (isFinal) {
      this._resultIndex++;
      this._interimBuffer = '';
    } else {
      this._interimBuffer = transcript;
    }

    // Build a SpeechRecognitionEvent-compatible object.
    // results[i] is an array-like with isFinal, and results[i][0].transcript
    const resultItem = [{ transcript, confidence: alt.confidence || 1 }];
    resultItem.isFinal = isFinal;

    const results = [resultItem];
    results.length = 1;

    const event = { resultIndex: 0, results };
    if (this.onresult) this.onresult(event);
  }

  _downsample(buffer, fromRate, toRate) {
    if (fromRate === toRate) return buffer;
    const ratio = fromRate / toRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      result[i] = buffer[Math.round(i * ratio)];
    }
    return result;
  }

  _float32ToInt16(float32) {
    const int16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  }
}

// ── Feature detection + factory ──────────────────────────────────────────────
// Modules can call DeepgramSTT.isSupported() to check before instantiating.
DeepgramSTT.isSupported = function() {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.WebSocket &&
    (window.AudioContext || window.webkitAudioContext)
  );
};

console.log('DeepgramSTT module loaded');
