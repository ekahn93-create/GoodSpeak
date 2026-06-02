// ============================================
// RECORDINGS MODULE
// Record, playback, and compare speaking sessions
// ============================================

const RecordingsModule = (function() {

  const META_KEY = 'recordingsMeta';
  const DB_NAME = 'ArticulationRecordings';
  const DB_VERSION = 1;
  const STORE_NAME = 'blobs';

  let db = null;
  let mediaRecorder = null;
  let chunks = [];
  let timerInterval = null;
  let startTime = null;
  let isRecording = false;
  let liveTranscript = '';
  let recRecognition = null;

  // ── IndexedDB helpers ──────────────────────────────────────────

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        e.target.result.createObjectStore(STORE_NAME);
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = e => reject(e.target.error);
    });
  }

  function saveBlob(id, blob) {
    return openDB().then(database => new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(blob, id);
      tx.oncomplete = resolve;
      tx.onerror = e => reject(e.target.error);
    }));
  }

  function loadBlob(id) {
    return openDB().then(database => new Promise((resolve, reject) => {
      const req = database.transaction(STORE_NAME, 'readonly')
                          .objectStore(STORE_NAME).get(id);
      req.onsuccess = e => resolve(e.target.result || null);
      req.onerror = e => reject(e.target.error);
    }));
  }

  function deleteBlob(id) {
    return openDB().then(database => new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = resolve;
      tx.onerror = e => reject(e.target.error);
    }));
  }

  // ── Metadata helpers (localStorage) ───────────────────────────

  function getMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveMeta(meta) {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  }

  // ── Formatting ─────────────────────────────────────────────────

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  // ── Init ───────────────────────────────────────────────────────

  function init() {
    const startBtn = document.getElementById('rec-start-btn');
    const stopBtn = document.getElementById('rec-stop-btn');

    if (!startBtn) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      document.getElementById('rec-unsupported').style.display = 'block';
      startBtn.disabled = true;
      return;
    }

    // Remove previous listeners by cloning
    const newStart = startBtn.cloneNode(true);
    const newStop = stopBtn.cloneNode(true);
    startBtn.parentNode.replaceChild(newStart, startBtn);
    stopBtn.parentNode.replaceChild(newStop, stopBtn);

    newStart.addEventListener('click', startRecording);
    newStop.addEventListener('click', stopRecording);

    openDB().then(() => renderList());
  }

  // ── Recording ──────────────────────────────────────────────────

  function startRecording() {
    stopAllPlayback();
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        chunks = [];
        liveTranscript = '';
        const options = MediaRecorder.isTypeSupported('audio/webm')
          ? { mimeType: 'audio/webm' }
          : {};
        mediaRecorder = new MediaRecorder(stream, options);

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          if (recRecognition) {
            recRecognition.onend = () => { recRecognition = null; saveRecording(); };
            try { recRecognition.stop(); } catch(e) { recRecognition = null; saveRecording(); }
          } else {
            saveRecording();
          }
        };

        mediaRecorder.start(100);
        isRecording = true;
        startTime = Date.now();

        // Start live speech recognition for transcript capture
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recRecognition = new SpeechRecognition();
          recRecognition.continuous = true;
          recRecognition.interimResults = false;
          recRecognition.lang = 'en-US';
          recRecognition.onresult = e => {
            for (let i = e.resultIndex; i < e.results.length; i++) {
              if (e.results[i].isFinal) liveTranscript += e.results[i][0].transcript + ' ';
            }
          };
          recRecognition.onend = () => { if (isRecording) recRecognition.start(); };
          recRecognition.start();
        }

        document.getElementById('rec-start-btn').style.display = 'none';
        document.getElementById('rec-stop-btn').style.display = '';
        setStatus('Recording…');
        timerInterval = setInterval(updateTimer, 500);
      })
      .catch(err => {
        setStatus('Microphone access denied: ' + err.message);
      });
  }

  function stopRecording() {
    if (mediaRecorder && isRecording) {
      isRecording = false;
      mediaRecorder.stop();
      clearInterval(timerInterval);
      document.getElementById('rec-start-btn').style.display = '';
      document.getElementById('rec-stop-btn').style.display = 'none';
      setStatus('Ready to record');
      document.getElementById('rec-timer').textContent = '0:00';
    }
  }

  function saveRecording() {
    const blob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
    const id = 'rec_' + Date.now();
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const prompt = (document.getElementById('rec-prompt-input')?.value || '').trim();
    const transcript = liveTranscript.trim();

    const meta = getMeta();
    meta.unshift({ id, prompt: prompt || 'Free recording', duration, createdAt: new Date().toISOString(), transcript });
    saveMeta(meta.slice(0, 20));

    const promptInput = document.getElementById('rec-prompt-input');
    if (promptInput) promptInput.value = '';

    saveBlob(id, blob).then(() => renderList());
  }

  // ── Render list ────────────────────────────────────────────────

  function renderList() {
    const listEl = document.getElementById('rec-list');
    if (!listEl) return;

    const meta = getMeta();
    if (meta.length === 0) {
      listEl.innerHTML = '<p style="color: var(--text-secondary);">No recordings yet. Hit record to start!</p>';
      return;
    }

    listEl.innerHTML = meta.map(r => `
      <div class="rec-item" id="rec-item-${r.id}">
        <div class="rec-item-info">
          <div class="rec-item-prompt">${r.prompt}</div>
          <div class="rec-item-meta">${formatDate(r.createdAt)} &bull; ${formatDuration(r.duration)}</div>
        </div>
        <div class="rec-item-controls">
          <button class="btn btn-sm btn-primary" id="rec-play-btn-${r.id}" onclick="RecordingsModule.togglePlay('${r.id}')">▶ Play</button>
          ${r.transcript ? `<button class="btn btn-sm btn-secondary" id="rec-feedback-btn-${r.id}" onclick="RecordingsModule.toggleFeedback('${r.id}')">Speech Feedback</button>` : ''}
          <button class="btn btn-sm btn-secondary" onclick="RecordingsModule.deleteRec('${r.id}')">Delete</button>
        </div>
        <div class="rec-player-wrap" id="rec-player-${r.id}" style="display:none; margin-top: var(--spacing-sm); width:100%;">
          <audio id="rec-audio-${r.id}" style="display:none;"></audio>
          <div class="rec-custom-player">
            <span class="rec-time-current" id="rec-time-cur-${r.id}">0:00</span>
            <div class="rec-progress-track" id="rec-track-${r.id}" onclick="RecordingsModule.seekTo('${r.id}', event)">
              <div class="rec-progress-fill" id="rec-progress-${r.id}"></div>
            </div>
            <span class="rec-time-total" id="rec-time-tot-${r.id}">0:00</span>
          </div>
        </div>
        <div id="rec-feedback-${r.id}" style="display:none; margin-top: var(--spacing-md); width:100%;">
          <div id="rec-feedback-grid-${r.id}" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--spacing-md);"></div>
        </div>
      </div>
    `).join('');
  }

  // ── Playback ───────────────────────────────────────────────────

  function stopAllPlayback() {
    getMeta().forEach(r => {
      const audioEl = document.getElementById(`rec-audio-${r.id}`);
      const btn = document.getElementById(`rec-play-btn-${r.id}`);
      if (audioEl && !audioEl.paused) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
      if (btn) btn.textContent = '▶ Play';
      updateProgress(r.id);
    });
  }

  function updateProgress(id) {
    const audioEl  = document.getElementById(`rec-audio-${id}`);
    const fill     = document.getElementById(`rec-progress-${id}`);
    const curEl    = document.getElementById(`rec-time-cur-${id}`);
    const totEl    = document.getElementById(`rec-time-tot-${id}`);
    if (!audioEl || !fill) return;
    const dur = isFinite(audioEl.duration) ? audioEl.duration : 0;
    const cur = audioEl.currentTime || 0;
    fill.style.width = dur > 0 ? `${(cur / dur) * 100}%` : '0%';
    if (curEl) curEl.textContent = formatDuration(Math.floor(cur));
    if (totEl && dur > 0) totEl.textContent = formatDuration(Math.floor(dur));
  }

  function togglePlay(id) {
    const playerWrap = document.getElementById(`rec-player-${id}`);
    const audioEl    = document.getElementById(`rec-audio-${id}`);
    const btn        = document.getElementById(`rec-play-btn-${id}`);

    if (!playerWrap || !audioEl || !btn) return;

    // Stop all other recordings before playing this one
    getMeta().forEach(r => {
      if (r.id === id) return;
      const otherAudio = document.getElementById(`rec-audio-${r.id}`);
      const otherBtn   = document.getElementById(`rec-play-btn-${r.id}`);
      if (otherAudio && !otherAudio.paused) {
        otherAudio.pause();
        otherAudio.currentTime = 0;
      }
      if (otherBtn) otherBtn.textContent = '▶ Play';
      updateProgress(r.id);
    });

    // If already loaded and playing, pause
    if (audioEl.src && !audioEl.paused) {
      audioEl.pause();
      btn.textContent = '▶ Play';
      return;
    }

    // If already loaded and paused, resume
    if (audioEl.src && audioEl.paused && audioEl.currentTime > 0) {
      audioEl.play();
      btn.textContent = '⏸ Pause';
      return;
    }

    // First time — load from IndexedDB
    loadBlob(id).then(blob => {
      if (!blob) {
        playerWrap.innerHTML = '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">Recording not available. Record again to create a new session.</p>';
        playerWrap.style.display = '';
        return;
      }

      const url = URL.createObjectURL(blob);
      audioEl.src = url;
      audioEl.load();
      playerWrap.style.display = '';
      btn.textContent = '⏸ Pause';

      audioEl.ontimeupdate = () => updateProgress(id);

      audioEl.onloadedmetadata = () => {
        audioEl.onloadedmetadata = null;
        if (!isFinite(audioEl.duration)) {
          audioEl.currentTime = 1e101;
          audioEl.onseeked = () => {
            audioEl.onseeked = null;
            audioEl.currentTime = 0;
            updateProgress(id);
            audioEl.play();
          };
        } else {
          updateProgress(id);
          audioEl.currentTime = 0;
          audioEl.play();
        }
      };

      audioEl.onended = () => {
        btn.textContent = '▶ Play';
        updateProgress(id);
      };
    });
  }

  function seekTo(id, event) {
    const audioEl = document.getElementById(`rec-audio-${id}`);
    const track   = document.getElementById(`rec-track-${id}`);
    if (!audioEl || !track || !isFinite(audioEl.duration)) return;
    const rect = track.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    audioEl.currentTime = pct * audioEl.duration;
    updateProgress(id);
  }

  function deleteRec(id) {
    deleteBlob(id);
    const meta = getMeta().filter(r => r.id !== id);
    saveMeta(meta);
    renderList();
  }

  function toggleFeedback(id) {
    const panel = document.getElementById(`rec-feedback-${id}`);
    const grid  = document.getElementById(`rec-feedback-grid-${id}`);
    const btn   = document.getElementById(`rec-feedback-btn-${id}`);
    if (!panel || !grid) return;

    const isVisible = panel.style.display !== 'none';
    if (isVisible) {
      panel.style.display = 'none';
      if (btn) btn.textContent = 'Speech Feedback';
      return;
    }

    // Only render if grid is empty (avoid re-running on every toggle open)
    if (!grid.hasChildNodes()) {
      const rec = getMeta().find(r => r.id === id);
      if (!rec || !rec.transcript) return;

      if (typeof WebSpeechModule !== 'undefined' && WebSpeechModule.buildAndRenderFeedback) {
        WebSpeechModule.buildAndRenderFeedback(grid, panel, rec.transcript, rec.prompt, rec.duration, [], true);
      } else {
        grid.innerHTML = '<p style="color: var(--text-secondary);">Speech analysis unavailable.</p>';
      }
    }

    panel.style.display = '';
    if (btn) btn.textContent = 'Hide Feedback';
  }

  // ── Timer / status ─────────────────────────────────────────────

  function updateTimer() {
    const el = document.getElementById('rec-timer');
    if (!el || !startTime) return;
    el.textContent = formatDuration(Math.floor((Date.now() - startTime) / 1000));
  }

  function setStatus(msg) {
    const el = document.getElementById('rec-status');
    if (el) el.textContent = msg;
  }

  function refresh() {
    init();
  }

  return {
    init,
    refresh,
    togglePlay,
    deleteRec,
    toggleFeedback,
    seekTo
  };
})();

