// ============================================
// PROGRESS CHARTS MODULE
// Vanilla canvas charts for Review tab
// ============================================

const ProgressChartsModule = (function() {

  const SPEECH_SESSIONS_KEY = 'speechSessions'; // array of {date, wpm, fillers}
  const VOCAB_HISTORY_KEY = 'vocabHistory';      // array of {date, count}

  function getData(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch(e) { return []; }
  }

  // Called externally when a Web Speech session ends
  function logSpeechSession(wpm, fillerCount) {
    const sessions = getData(SPEECH_SESSIONS_KEY);
    sessions.push({
      date: new Date().toLocaleDateString(),
      wpm: wpm,
      fillers: fillerCount,
      ts: Date.now()
    });
    // Keep last 20
    localStorage.setItem(SPEECH_SESSIONS_KEY, JSON.stringify(sessions.slice(-20)));
  }

  // Called externally when vocab count changes
  function logVocabCount(count) {
    const history = getData(VOCAB_HISTORY_KEY);
    const today = new Date().toLocaleDateString();
    // Upsert today's entry
    const idx = history.findIndex(h => h.date === today);
    if (idx > -1) {
      history[idx].count = count;
    } else {
      history.push({ date: today, count, ts: Date.now() });
    }
    localStorage.setItem(VOCAB_HISTORY_KEY, JSON.stringify(history.slice(-30)));
  }

  // ---- Drawing ----

  function drawLineChart(canvasId, emptyId, labels, values, color, yLabel) {
    const canvas = document.getElementById(canvasId);
    const emptyEl = document.getElementById(emptyId);
    if (!canvas) return;

    if (!values || values.length === 0) {
      canvas.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }

    canvas.style.display = '';
    if (emptyEl) emptyEl.style.display = 'none';

    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || canvas.parentElement.offsetWidth || 400;
    const H = canvas.height;
    canvas.width = W;

    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const w = W - pad.left - pad.right;
    const h = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const maxVal = Math.max(...values, 1);
    const minVal = 0;

    // Grid lines
    ctx.strokeStyle = '#e1e8ed';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + h - (i / 4) * h;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + w, y);
      ctx.stroke();
      // Y labels
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round((i / 4) * maxVal), pad.left - 6, y + 4);
    }

    // Line
    const pts = values.map((v, i) => ({
      x: pad.left + (i / Math.max(values.length - 1, 1)) * w,
      y: pad.top + h - ((v - minVal) / (maxVal - minVal)) * h
    }));

    // Fill under line
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pad.top + h);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(pts[pts.length - 1].x, pad.top + h);
    ctx.closePath();
    ctx.fillStyle = color + '22';
    ctx.fill();

    // Line itself
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Dots
    pts.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // X labels (show every nth to avoid overlap)
    const step = Math.ceil(labels.length / 6);
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      if (i % step === 0 || i === labels.length - 1) {
        ctx.fillText(label, pts[i].x, pad.top + h + 18);
      }
    });
  }

  function render() {
    const speechSessions = getData(SPEECH_SESSIONS_KEY);
    const vocabHistory = getData(VOCAB_HISTORY_KEY);

    // Also add current vocab count
    if (typeof StorageManager !== 'undefined') {
      const ud = StorageManager.load();
      if (ud) logVocabCount(ud.vocabulary.totalWordsLearned || 0);
    }
    const vocabHistoryUpdated = getData(VOCAB_HISTORY_KEY);

    // WPM chart
    drawLineChart(
      'chart-wpm', 'chart-wpm-empty',
      speechSessions.map(s => s.date),
      speechSessions.map(s => s.wpm),
      '#4A90E2',
      'WPM'
    );

    // Fillers chart
    drawLineChart(
      'chart-fillers', 'chart-fillers-empty',
      speechSessions.map(s => s.date),
      speechSessions.map(s => s.fillers),
      '#FF6B6B',
      'Filler Words'
    );

    // Vocab chart
    drawLineChart(
      'chart-vocab', 'chart-vocab-empty',
      vocabHistoryUpdated.map(v => v.date),
      vocabHistoryUpdated.map(v => v.count),
      '#50C878',
      'Words'
    );
  }

  function init() {
    render();
  }

  function refresh() {
    render();
  }

  return {
    init: init,
    refresh: refresh,
    logSpeechSession: logSpeechSession,
    logVocabCount: logVocabCount
  };
})();

console.log('ProgressChartsModule loaded');
