// ============================================
// READ ALOUD MODULE
// Paste text, read aloud, get WPM + filler stats
// ============================================

const ReadAloudModule = (function() {

  const FILLER_WORDS = ['um','uh','er','like','you know','i mean','actually','basically',
    'literally','sort of','kind of','right','so','well','okay'];

  const SAMPLE_TEXT = `Good communication is one of the most valuable skills you can develop. Whether you are speaking to a colleague, presenting to an audience, or simply having a conversation with a friend, the ability to express yourself clearly and confidently makes a profound difference. Strong speakers choose their words deliberately, vary their pace, and pause with purpose rather than filling silence with hesitation. The good news is that eloquence is not a talent you are born with — it is a skill you can practice, refine, and master over time. Every sentence you speak is an opportunity to improve.`;

  let recognition = null;
  let isRecording = false;
  let startTime = null;
  let elapsedInterval = null;
  let finalTranscript = '';
  let fillerCount = 0;
  let fillerBreakdown = {};
  let currentText = '';

  function init() {
    const startBtn = document.getElementById('readaloud-start-btn');
    const stopBtn = document.getElementById('readaloud-stop-btn');
    const sampleBtn = document.getElementById('readaloud-sample-btn');
    const retryBtn = document.getElementById('readaloud-retry-btn');
    const newBtn = document.getElementById('readaloud-new-btn');
    const textInput = document.getElementById('readaloud-text-input');

    if (!startBtn) return;

    if (!DeepgramSTT.isSupported()) {
      document.getElementById('readaloud-unsupported-msg').style.display = 'block';
      startBtn.disabled = true;
    }

    textInput.addEventListener('input', updateEstTime);

    sampleBtn.addEventListener('click', function() {
      textInput.value = SAMPLE_TEXT;
      updateEstTime();
    });

    startBtn.addEventListener('click', startSession);
    stopBtn.addEventListener('click', stopSession);
    retryBtn.addEventListener('click', retrySession);
    newBtn.addEventListener('click', newText);
  }

  function updateEstTime() {
    const text = document.getElementById('readaloud-text-input').value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    const estSeconds = Math.round((wordCount / 150) * 60); // ~150 WPM average
    const estEl = document.getElementById('readaloud-est-time');
    if (!estEl) return;
    if (wordCount === 0) {
      estEl.textContent = '—';
    } else if (estSeconds < 60) {
      estEl.textContent = `~${estSeconds}s`;
    } else {
      const m = Math.floor(estSeconds / 60);
      const s = estSeconds % 60;
      estEl.textContent = `~${m}m ${s}s`;
    }
  }

  function startSession() {
    const text = document.getElementById('readaloud-text-input').value.trim();
    if (!text) {
      alert('Please paste some text first.');
      return;
    }

    currentText = text;
    finalTranscript = '';
    fillerCount = 0;
    fillerBreakdown = {};

    document.getElementById('readaloud-setup').style.display = 'none';
    document.getElementById('readaloud-results').style.display = 'none';
    document.getElementById('readaloud-active').style.display = '';

    renderScript(text);
    startTime = Date.now();
    updateElapsed();
    elapsedInterval = setInterval(updateElapsed, 1000);

    setupRecognition();
  }

  function renderScript(text) {
    const el = document.getElementById('readaloud-script-display');
    if (!el) return;
    // Wrap each word in a span for potential future highlighting
    const words = text.split(/(\s+)/);
    el.innerHTML = words.map((w, i) => {
      if (/\S/.test(w)) return `<span class="script-word" data-idx="${i}">${w}</span>`;
      return w;
    }).join('');
  }

  function setupRecognition() {
    if (!DeepgramSTT.isSupported()) return;

    recognition = new DeepgramSTT();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          countFillers(transcript);
          updateLiveStats();
        } else {
          interim = transcript;
        }
      }
      const statusEl = document.getElementById('readaloud-status');
      if (statusEl) statusEl.textContent = interim ? `Hearing: "${interim}"` : '';
    };

    recognition.onerror = function(e) {
      if (e.error !== 'no-speech') {
        const statusEl = document.getElementById('readaloud-status');
        if (statusEl) statusEl.textContent = 'Mic error: ' + e.error;
      }
    };

    recognition.onend = function() {
      if (isRecording) recognition.start();
    };

    isRecording = true;
    recognition.start();
  }

  function countFillers(text) {
    const lower = text.toLowerCase();
    FILLER_WORDS.forEach(f => {
      const regex = new RegExp('\\b' + f.replace(/\s+/g, '\\s+') + '\\b', 'gi');
      const matches = lower.match(regex);
      if (matches) {
        fillerCount += matches.length;
        fillerBreakdown[f] = (fillerBreakdown[f] || 0) + matches.length;
      }
    });
  }

  function updateLiveStats() {
    const wpmEl = document.getElementById('readaloud-wpm');
    const fillersEl = document.getElementById('readaloud-fillers');
    if (!wpmEl) return;

    const words = finalTranscript.trim().split(/\s+/).filter(Boolean).length;
    const elapsedMin = (Date.now() - startTime) / 60000;
    const wpm = elapsedMin > 0 ? Math.round(words / elapsedMin) : 0;

    wpmEl.textContent = wpm || '—';
    fillersEl.textContent = fillerCount;
  }

  function updateElapsed() {
    const el = document.getElementById('readaloud-elapsed');
    if (!el || !startTime) return;
    const sec = Math.floor((Date.now() - startTime) / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    updateLiveStats();
  }

  function stopSession() {
    isRecording = false;
    if (recognition) { try { recognition.stop(); } catch(e) {} }
    clearInterval(elapsedInterval);

    document.getElementById('readaloud-active').style.display = 'none';
    showResults();
  }

  function showResults() {
    const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
    const words = finalTranscript.trim().split(/\s+/).filter(Boolean).length;
    const elapsedMin = elapsedSec / 60;
    const wpm = elapsedMin > 0 ? Math.round(words / elapsedMin) : 0;
    const targetWords = currentText.trim().split(/\s+/).length;
    const coverage = targetWords > 0 ? Math.min(100, Math.round((words / targetWords) * 100)) : 0;

    let wpmRating = '';
    if (wpm < 100) wpmRating = 'Too slow — aim for 130–160 WPM';
    else if (wpm < 130) wpmRating = 'A bit slow — ideal for careful reading';
    else if (wpm <= 170) wpmRating = 'Great pace!';
    else wpmRating = 'A bit fast — try slowing down';

    const m = Math.floor(elapsedSec / 60);
    const s = elapsedSec % 60;

    const resultsGrid = document.getElementById('readaloud-results-grid');
    resultsGrid.innerHTML = [
      { label: 'Words per Minute', value: wpm || '—', note: wpmRating },
      { label: 'Filler Words', value: fillerCount, note: fillerCount === 0 ? 'Perfect!' : fillerCount <= 3 ? 'Very good' : 'Work on reducing these' },
      { label: 'Time Elapsed', value: `${m}:${s.toString().padStart(2,'0')}`, note: '' },
      { label: 'Text Coverage', value: `${coverage}%`, note: coverage >= 90 ? 'Full read-through' : 'Partial session' }
    ].map(r => `
      <div style="background: var(--bg-main); border-radius: var(--border-radius-sm); padding: var(--spacing-md); text-align: center;">
        <div style="font-size: var(--font-size-xxl); font-weight: 700; color: var(--primary-color);">${r.value}</div>
        <div style="font-weight: 600; color: var(--text-primary); margin: 4px 0;">${r.label}</div>
        <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">${r.note}</div>
      </div>
    `).join('');

    const breakdownEl = document.getElementById('readaloud-filler-breakdown');
    if (fillerCount > 0) {
      const items = Object.entries(fillerBreakdown).sort((a,b) => b[1]-a[1]);
      breakdownEl.innerHTML = `
        <div style="background: var(--bg-main); border-radius: var(--border-radius-sm); padding: var(--spacing-md);">
          <strong>Filler word breakdown:</strong>
          <div style="margin-top: var(--spacing-sm); display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
            ${items.map(([w, c]) => `<span style="background: var(--accent-color); color: white; padding: 2px 10px; border-radius: 999px; font-size: var(--font-size-sm);">${w}: ${c}</span>`).join('')}
          </div>
        </div>
      `;
    } else {
      breakdownEl.innerHTML = '';
    }

    // Log to progress charts (cloud-synced)
    if (typeof ProgressChartsModule !== 'undefined') {
      ProgressChartsModule.logSpeechSession(wpm, fillerCount);
    }

    // Nudge toward Practice after a Read Aloud session
    if (typeof NudgeModule !== 'undefined') {
      NudgeModule.show(
        'nudge-readaloud-done',
        'Nice session. Try retelling that passage in your own words — head to Storytelling.',
        'Go to Practice',
        'storytelling',
        'storytelling'
      );
    }

    renderReadAloudAIButton(currentText, finalTranscript);

    document.getElementById('readaloud-results').style.display = '';
  }

  function renderReadAloudAIButton(passage, transcript) {
    const resultsEl = document.getElementById('readaloud-results');
    if (!resultsEl) return;

    const existing = resultsEl.querySelector('.ai-feedback-area');
    if (existing) existing.remove();

    if (!transcript.trim()) return;

    const area = document.createElement('div');
    area.className = 'ai-feedback-area';
    area.style.cssText = 'margin-bottom: var(--spacing-lg);';

    // Check cache
    const cacheKey = passage.slice(0, 60) + '|' + transcript.slice(0, 60) + '|' + transcript.length;
    let cache = {};
    try { cache = JSON.parse(localStorage.getItem('ai_feedback_cache')) || {}; } catch {}
    if (cache[cacheKey]) {
      area.appendChild(buildReadAloudCard(cache[cacheKey]));
      // Insert before the buttons
      const controls = resultsEl.querySelector('.exercise-controls');
      if (controls) resultsEl.insertBefore(area, controls);
      else resultsEl.appendChild(area);
      return;
    }

    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary';
    btn.style.cssText = 'width: 100%; margin-bottom: var(--spacing-md);';
    btn.textContent = 'Get AI Feedback';

    btn.addEventListener('click', async function() {
      btn.disabled = true;
      btn.textContent = 'Getting AI feedback...';
      try {
        const res = await fetch('/.netlify/functions/claude-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ task: 'read_aloud_feedback', payload: { passage, transcript } })
        });
        if (!res.ok) throw new Error('Server error ' + res.status);
        const data = await res.json();
        let freshCache = {};
        try { freshCache = JSON.parse(localStorage.getItem('ai_feedback_cache')) || {}; } catch {}
        freshCache[cacheKey] = data;
        try { localStorage.setItem('ai_feedback_cache', JSON.stringify(freshCache)); } catch {}
        area.innerHTML = '';
        area.appendChild(buildReadAloudCard(data));
      } catch {
        btn.disabled = false;
        btn.textContent = 'Get AI Feedback';
      }
    });

    area.appendChild(btn);
    const controls = resultsEl.querySelector('.exercise-controls');
    if (controls) resultsEl.insertBefore(area, controls);
    else resultsEl.appendChild(area);
  }

  function buildReadAloudCard(data) {
    const card = document.createElement('div');
    card.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); padding: var(--spacing-md);';

    const header = document.createElement('div');
    header.style.cssText = 'display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);';
    header.innerHTML = '<span style="font-weight: 600; font-size: var(--font-size-base);">AI Feedback</span>';
    card.appendChild(header);

    [['Coverage', 'coverage'], ['Delivery', 'delivery'], ['Accuracy', 'accuracy']].forEach(([label, key]) => {
      if (!data[key]) return;
      const row = document.createElement('div');
      row.style.cssText = 'margin-bottom: var(--spacing-sm);';
      row.innerHTML = `<span style="font-weight: 600; font-size: var(--font-size-sm);">${label}:</span> <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${data[key]}</span>`;
      card.appendChild(row);
    });

    if (data.tip) {
      const tip = document.createElement('div');
      tip.style.cssText = 'margin-top: var(--spacing-md); padding: var(--spacing-sm) var(--spacing-md); background: var(--bg-secondary); border-left: 3px solid var(--primary-color); border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0; font-size: var(--font-size-sm);';
      tip.innerHTML = `<strong>Tip:</strong> ${data.tip}`;
      card.appendChild(tip);
    }

    return card;
  }

  function retrySession() {
    document.getElementById('readaloud-results').style.display = 'none';
    document.getElementById('readaloud-setup').style.display = '';
    // Keep the same text
  }

  function newText() {
    document.getElementById('readaloud-results').style.display = 'none';
    document.getElementById('readaloud-text-input').value = '';
    document.getElementById('readaloud-est-time').textContent = '—';
    document.getElementById('readaloud-setup').style.display = '';
  }

  function refresh() {
    init();
  }

  return {
    init: init,
    refresh: refresh
  };
})();

console.log('ReadAloudModule loaded');
