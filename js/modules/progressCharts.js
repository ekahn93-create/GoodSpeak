// ============================================
// PROGRESS CHARTS MODULE
// Rich canvas charts for the Review dashboard
// ============================================

const ProgressChartsModule = (function() {

  const WEEKLY_GOAL = 5; // target active days per week

  // ---- Storage helpers ----
  // All chart data lives inside articulationAppData so it cloud-syncs automatically.

  function getSpeechSessions() {
    if (typeof StorageManager === 'undefined') return [];
    const d = StorageManager.load();
    return (d && d.stats && d.stats.speechSessions) ? d.stats.speechSessions : [];
  }

  function getVocabHistory() {
    if (typeof StorageManager === 'undefined') return [];
    const d = StorageManager.load();
    return (d && d.stats && d.stats.vocabHistory) ? d.stats.vocabHistory : [];
  }

  // Called externally when a Web Speech session ends
  function logSpeechSession(wpm, fillerCount) {
    if (typeof StorageManager === 'undefined') return;
    const data = StorageManager.load();
    if (!data) return;
    if (!data.stats.speechSessions) data.stats.speechSessions = [];
    data.stats.speechSessions.push({
      date: new Date().toLocaleDateString(),
      wpm: wpm,
      fillers: fillerCount,
      ts: Date.now()
    });
    // Keep last 50 sessions
    data.stats.speechSessions = data.stats.speechSessions.slice(-50);
    StorageManager.save(data);
    StorageManager.markActiveToday();
  }

  // Called externally when vocab count changes
  function logVocabCount(count) {
    if (typeof StorageManager === 'undefined') return;
    const data = StorageManager.load();
    if (!data) return;
    if (!data.stats.vocabHistory) data.stats.vocabHistory = [];
    const today = new Date().toLocaleDateString();
    const idx = data.stats.vocabHistory.findIndex(h => h.date === today);
    if (idx > -1) {
      data.stats.vocabHistory[idx].count = count;
    } else {
      data.stats.vocabHistory.push({ date: today, count, ts: Date.now() });
    }
    // Keep last 60 entries (~2 months)
    data.stats.vocabHistory = data.stats.vocabHistory.slice(-60);
    StorageManager.save(data);
  }

  // ---- Aggregate speech sessions by day ----
  // Returns an array of {date, wpm, fillers} with one entry per calendar day,
  // spanning from the earliest session to today, with 0-filled gaps.
  function aggregateSpeechByDay(sessions) {
    if (!sessions || sessions.length === 0) return [];

    // Group by date string
    // wpmCount tracks only sessions that actually have a WPM value (>0),
    // so filler-only sessions don't drag down the average.
    const byDate = {};
    sessions.forEach(s => {
      if (!byDate[s.date]) byDate[s.date] = { wpmSum: 0, wpmCount: 0, fillerSum: 0, count: 0 };
      if (s.wpm > 0) {
        byDate[s.date].wpmSum   += s.wpm;
        byDate[s.date].wpmCount += 1;
      }
      byDate[s.date].fillerSum += s.fillers || 0;
      byDate[s.date].count     += 1;
    });

    // Find the date range: earliest session → today
    const dates = Object.keys(byDate);
    const earliest = new Date(Math.min(...dates.map(d => new Date(d))));
    const today    = new Date();
    today.setHours(0, 0, 0, 0);

    const result = [];
    const cursor = new Date(earliest);
    cursor.setHours(0, 0, 0, 0);

    while (cursor <= today) {
      const key = cursor.toLocaleDateString();
      if (byDate[key]) {
        const g = byDate[key];
        result.push({
          date:    key,
          wpm:     g.wpmCount > 0 ? Math.round(g.wpmSum / g.wpmCount) : 0,
          fillers: g.fillerSum  // sum fillers across all sessions that day
        });
      } else {
        result.push({ date: key, wpm: 0, fillers: 0 });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }

  // ---- Date formatting ----
  function formatShortDate(dateStr) {
    // Input is toLocaleDateString() like "4/7/2026" or "04/07/2026"
    // Output: M/D/YY
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const yr = String(d.getFullYear()).slice(-2);
    return m + '/' + day + '/' + yr;
  }

  // ---- Colour palette ----
  const COLORS = {
    indigo:  '#818cf8',
    violet:  '#a78bfa',
    rose:    '#f43f5e',
    emerald: '#34d399',
    amber:   '#fbbf24',
    cyan:    '#22d3ee',
    grid:    'rgba(148,163,184,0.15)',
    label:   '#94a3b8',
  };

  // ---- Generic helpers ----

  function dpr() { return window.devicePixelRatio || 1; }

  function setupCanvas(canvas) {
    const ratio = dpr();
    // getBoundingClientRect is reliable even when offsetWidth returns 0
    let displayW = canvas.getBoundingClientRect().width;
    if (!displayW) {
      let el = canvas.parentElement;
      while (el && !displayW) { displayW = el.getBoundingClientRect().width; el = el.parentElement; }
    }
    if (!displayW) displayW = 600;
    // Use CSS-computed height (set via stylesheet), fall back to 280
    const displayH = parseInt(getComputedStyle(canvas).height) || 280;
    canvas.width  = displayW * ratio;
    canvas.height = displayH * ratio;
    canvas.style.width  = displayW + 'px';
    canvas.style.height = displayH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    return { ctx, W: displayW, H: displayH };
  }

  // ---- Shared canvas tooltip ----
  // One floating div reused by all charts. Works on both mouse and touch.

  const _tip = (function() {
    const el = document.createElement('div');
    el.id = 'chart-tooltip';
    el.style.cssText = [
      'position:fixed',
      'background:rgba(15,23,42,0.92)',
      'color:#f1f5f9',
      'font:600 12px/1.4 Inter,sans-serif',
      'padding:6px 10px',
      'border-radius:7px',
      'pointer-events:none',
      'white-space:nowrap',
      'z-index:9999',
      'display:none',
      'box-shadow:0 4px 16px rgba(0,0,0,0.4)',
      'border:1px solid rgba(255,255,255,0.08)'
    ].join(';');
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(el));
    // Also append immediately in case DOM is already ready
    if (document.body) document.body.appendChild(el);
    return el;
  })();

  let _tipHideTimer = null;

  function showTip(html, clientX, clientY) {
    clearTimeout(_tipHideTimer);
    _tip.innerHTML = html;
    _tip.style.display = 'block';
    _positionTip(clientX, clientY);
  }

  function hideTip(delay) {
    clearTimeout(_tipHideTimer);
    if (delay) {
      _tipHideTimer = setTimeout(() => { _tip.style.display = 'none'; }, delay);
    } else {
      _tip.style.display = 'none';
    }
  }

  function _positionTip(cx, cy) {
    const margin = 10;
    const tw = _tip.offsetWidth;
    const th = _tip.offsetHeight;
    let x = cx - tw / 2;
    let y = cy - th - 14;
    if (y < margin) y = cy + 18;
    x = Math.max(margin, Math.min(x, window.innerWidth - tw - margin));
    _tip.style.left = x + 'px';
    _tip.style.top  = y + 'px';
  }

  // Attach hover+touch interaction to a canvas.
  // getPoints(canvasW, canvasH) → array of { x, y, tip } in CSS-pixel space.
  function attachTooltip(canvas, getPoints) {
    // Remove old listeners by replacing the canvas node's event clone
    // (simplest way without tracking refs)
    function getCoordsFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      if (e.touches && e.touches.length > 0) {
        return { cx: e.touches[0].clientX, cy: e.touches[0].clientY,
                 x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
      }
      return { cx: e.clientX, cy: e.clientY,
               x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function findNearest(px, py) {
      const pts = getPoints(canvas.getBoundingClientRect().width, canvas.getBoundingClientRect().height);
      let best = null, bestDist = Infinity;
      pts.forEach(p => {
        const d = Math.hypot(p.x - px, p.y - py);
        if (d < bestDist) { bestDist = d; best = p; }
      });
      // Only snap if within 40px
      return bestDist <= 40 ? best : null;
    }

    canvas._ttMousemove = function(e) {
      const { cx, cy, x, y } = getCoordsFromEvent(e);
      const pt = findNearest(x, y);
      if (pt) { showTip(pt.tip, cx, cy); canvas.style.cursor = 'crosshair'; }
      else     { hideTip(); canvas.style.cursor = ''; }
    };
    canvas._ttMouseleave = function() { hideTip(); canvas.style.cursor = ''; };
    canvas._ttTouchstart = function(e) {
      const { cx, cy, x, y } = getCoordsFromEvent(e);
      const pt = findNearest(x, y);
      if (pt) { e.preventDefault(); showTip(pt.tip, cx, cy); }
    };
    canvas._ttTouchend = function() { hideTip(1800); };

    canvas.removeEventListener('mousemove',  canvas._ttMousemove);
    canvas.removeEventListener('mouseleave', canvas._ttMouseleave);
    canvas.removeEventListener('touchstart', canvas._ttTouchstart);
    canvas.removeEventListener('touchend',   canvas._ttTouchend);

    canvas.addEventListener('mousemove',  canvas._ttMousemove);
    canvas.addEventListener('mouseleave', canvas._ttMouseleave);
    canvas.addEventListener('touchstart', canvas._ttTouchstart, { passive: false });
    canvas.addEventListener('touchend',   canvas._ttTouchend);
  }

  // ---- Smooth line chart (dual series) ----
  function drawDualLineChart(canvasId, emptyId, labels, series1, series2, color1, color2) {
    const canvas = document.getElementById(canvasId);
    const emptyEl = document.getElementById(emptyId);
    if (!canvas) return;

    const hasData = series1 && series1.length > 0;
    if (!hasData) {
      canvas.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }
    canvas.style.display = '';
    if (emptyEl) emptyEl.style.display = 'none';

    const { ctx, W, H } = setupCanvas(canvas);
    const pad = { top: 12, right: 16, bottom: 44, left: 40 };
    const w = W - pad.left - pad.right;
    const h = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const allVals = [...(series1 || []), ...(series2 || [])];
    const maxVal = Math.max(...allVals, 1);

    // Grid
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = pad.top + h - (i / gridLines) * h;
      ctx.beginPath();
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + w, y);
      ctx.stroke();
      ctx.fillStyle = COLORS.label;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round((i / gridLines) * maxVal), pad.left - 8, y + 4);
    }

    function drawSeries(values, color) {
      if (!values || values.length === 0) return;
      const pts = values.map((v, i) => ({
        x: pad.left + (i / Math.max(values.length - 1, 1)) * w,
        y: pad.top + h - (v / maxVal) * h
      }));

      // Area fill
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + h);
      grad.addColorStop(0, color + '40');
      grad.addColorStop(1, color + '00');
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pad.top + h);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length - 1].x, pad.top + h);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Line (smooth via quadratic curves)
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const mx = (pts[i-1].x + pts[i].x) / 2;
        ctx.bezierCurveTo(mx, pts[i-1].y, mx, pts[i].y, pts[i].x, pts[i].y);
      }
      ctx.stroke();

      // Dots
      pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    drawSeries(series2, color2);
    drawSeries(series1, color1);

    // X labels — skip labels that would overlap the previous drawn one
    const shortLabels = labels.map(formatShortDate);
    const pts0 = labels.map((_, i) => pad.left + (i / Math.max(labels.length - 1, 1)) * w);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = COLORS.label;
    const minGap = ctx.measureText('12/31/99').width + 10;
    let lastDrawnX = -Infinity;
    const labelY = pad.top + h + 20;
    shortLabels.forEach((label, i) => {
      const x = pts0[i];
      const isFirst = i === 0;
      const isLast  = i === shortLabels.length - 1;
      // Always try to draw first and last; skip middle ones that are too close
      if (!isFirst && !isLast && x - lastDrawnX < minGap) return;
      // Also skip last if it would overlap the previous
      if (isLast && x - lastDrawnX < minGap) return;
      ctx.textAlign = isLast ? 'right' : (isFirst ? 'left' : 'center');
      ctx.fillText(label, x, labelY);
      lastDrawnX = x;
    });

    // Attach hover/touch tooltip — build point list from series1 (primary)
    attachTooltip(canvas, function() {
      const pts = [];
      const n = labels.length;
      if (series1 && series1.length) {
        series1.forEach((v, i) => {
          if (v == null) return;
          pts.push({
            x: pad.left + (i / Math.max(n - 1, 1)) * w,
            y: pad.top + h - (v / maxVal) * h,
            tip: '<span style="color:' + (color1||'#818cf8') + '">●</span> ' +
                 formatShortDate(labels[i]) + ': <b>' + v + '</b>' +
                 (series2 && series2[i] != null
                   ? '&nbsp;&nbsp;<span style="color:' + (color2||'#f43f5e') + '">●</span> fillers: <b>' + series2[i] + '</b>'
                   : '')
          });
        });
      }
      return pts;
    });
  }

  // ---- Single line chart ----
  function drawLineChart(canvasId, emptyId, labels, values, color) {
    drawDualLineChart(canvasId, emptyId, labels, values, null, color, null);
  }

  // ---- Bar chart (weekly activity) ----
  function drawBarChart(canvasId, emptyId, labels, values, colors) {
    const canvas = document.getElementById(canvasId);
    const emptyEl = document.getElementById(emptyId);
    if (!canvas) return;

    const hasData = values && values.some(v => v > 0);
    if (!hasData) {
      canvas.style.display = 'none';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }
    canvas.style.display = '';
    if (emptyEl) emptyEl.style.display = 'none';

    const { ctx, W, H } = setupCanvas(canvas);
    const pad = { top: 12, right: 16, bottom: 44, left: 40 };
    const w = W - pad.left - pad.right;
    const h = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    const maxVal = Math.max(...values, 1);
    const barW = (w / labels.length) * 0.55;
    const gap  = (w / labels.length);

    // Grid
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + h - (i / 4) * h;
      ctx.beginPath();
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + w, y);
      ctx.stroke();
      ctx.fillStyle = COLORS.label;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round((i / 4) * maxVal), pad.left - 6, y + 4);
    }

    values.forEach((val, i) => {
      const x = pad.left + i * gap + (gap - barW) / 2;
      const barH = (val / maxVal) * h;
      const y = pad.top + h - barH;

      // Rounded top bar
      const radius = Math.min(6, barW / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, pad.top + h);
      ctx.lineTo(x, pad.top + h);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, y, 0, pad.top + h);
      const c = colors[i % colors.length];
      grad.addColorStop(0, c);
      grad.addColorStop(1, c + '88');
      ctx.fillStyle = grad;
      ctx.fill();

      // Value on top
      if (val > 0) {
        ctx.fillStyle = COLORS.label;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, x + barW / 2, y - 5);
      }

      // X label — bar chart labels are short day names (Mon, Tue…) so always show them
      ctx.fillStyle = COLORS.label;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, pad.top + h + 20);
    });

    // Attach hover/touch tooltip — snap to bar centre
    attachTooltip(canvas, function() {
      return values.map((val, i) => ({
        x: pad.left + i * gap + gap / 2,
        y: val > 0 ? pad.top + h - (val / Math.max(...values, 1)) * h : pad.top + h,
        tip: '<b>' + labels[i] + '</b>: ' + (val > 0 ? 'active' : 'no activity')
      }));
    });
  }

  // ---- Donut / Ring gauge ----
  function drawGoalRing(canvasId, pct) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const size = 120;
    const ratio = dpr();
    canvas.width  = size * ratio;
    canvas.height = size * ratio;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);

    const cx = size / 2, cy = size / 2;
    const r = 46;
    const stroke = 10;
    const startAngle = -Math.PI / 2;
    const endAngle   = startAngle + (Math.PI * 2 * Math.min(pct, 1));

    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(129,140,248,0.2)';
    ctx.lineWidth = stroke;
    ctx.stroke();

    // Progress arc
    if (pct > 0) {
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#818cf8');
      grad.addColorStop(1, '#6366f1');
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = stroke;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // ---- Weekly activity data ----
  // Returns 7 days ending today. active=1 if the user did anything that day, 0 otherwise.
  function getWeeklyData(activeDates) {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    // activeDates are YYYY-MM-DD strings
    const activeSet = new Set(activeDates || []);
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = days[d.getDay()];
      // Build YYYY-MM-DD key to match activeDates format
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, '0');
      const dd   = String(d.getDate()).padStart(2, '0');
      const dateKey = yyyy + '-' + mm + '-' + dd;
      weekData.push({ label, active: activeSet.has(dateKey) ? 1 : 0, date: dateKey });
    }

    return weekData;
  }

  // ---- Build quality breakdown from last session ----
  function renderQualityBreakdown(speechSessions) {
    const el = document.getElementById('review-quality-breakdown');
    if (!el) return;

    if (!speechSessions || speechSessions.length === 0) {
      el.innerHTML = '<div class="review-quality-empty">No speech session recorded yet.</div>';
      return;
    }

    const last = speechSessions[speechSessions.length - 1];

    // Normalise scores to 0-100
    const wpmScore    = Math.min(100, Math.round((last.wpm / 160) * 100));
    const fillerScore = Math.max(0, Math.round(100 - (last.fillers / 10) * 100));
    const consistency = speechSessions.length >= 5
      ? Math.min(100, Math.round((speechSessions.length / 20) * 100))
      : Math.round((speechSessions.length / 5) * 60);

    const items = [
      { name: 'Speaking Speed', val: last.wpm + ' WPM', pct: wpmScore, color: '#818cf8' },
      { name: 'Filler Control',  val: last.fillers + ' fillers', pct: fillerScore, color: '#34d399' },
      { name: 'Consistency',     val: speechSessions.length + ' sessions', pct: consistency, color: '#fbbf24' },
    ];

    el.innerHTML = items.map(item => `
      <div class="review-quality-item">
        <div class="review-quality-row">
          <span class="review-quality-name">${item.name}</span>
          <span class="review-quality-val">${item.val}</span>
        </div>
        <div class="review-quality-bar-bg">
          <div class="review-quality-bar-fill" style="width:${item.pct}%; background:${item.color}"></div>
        </div>
      </div>
    `).join('');
  }

  // ---- KPI trend badges ----
  function setTrend(elId, value, suffix, positiveIsUp, tooltip) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (!value && value !== 0) { el.textContent = '—'; return; }
    el.textContent = (value > 0 ? '+' : '') + value + (suffix || '');
    el.style.background = (value > 0) === positiveIsUp
      ? 'rgba(52,211,153,0.3)'
      : 'rgba(244,63,94,0.3)';
    if (tooltip) el.setAttribute('data-tip', tooltip);
  }

  // ---- Main render ----
  function render() {
    const speechSessions = getSpeechSessions();

    // Refresh vocab history with current learned count
    if (typeof StorageManager !== 'undefined') {
      const ud = StorageManager.load();
      if (ud) logVocabCount(ud.vocabulary.totalWordsLearned || ud.vocabulary.learned.length || 0);
    }
    const vocabHistory = getVocabHistory();

    // ---- Aggregate sessions to one point per day ----
    const dailySpeech = aggregateSpeechByDay(speechSessions);
    // Only days where at least one speech session was recorded
    const speechDays = dailySpeech.filter(s => s.wpm > 0);

    // ---- KPI: avg WPM ----
    const avgWpmEl = document.getElementById('kpi-avg-wpm');
    if (avgWpmEl) {
      if (speechDays.length > 0) {
        const avg = Math.round(speechDays.reduce((a,b) => a + b.wpm, 0) / speechDays.length);
        avgWpmEl.textContent = avg;
        if (speechDays.length >= 2) {
          const half      = Math.floor(speechDays.length / 2);
          const recentAvg = Math.round(speechDays.slice(-half).reduce((a,b) => a + b.wpm, 0) / half);
          const olderAvg  = Math.round(speechDays.slice(0, half).reduce((a,b) => a + b.wpm, 0) / half);
          const diff = recentAvg - olderAvg;
          setTrend('kpi-wpm-trend', diff, ' wpm', true,
            'Recent avg: ' + recentAvg + ' wpm vs earlier avg: ' + olderAvg + ' wpm');
        }
      } else {
        avgWpmEl.textContent = '—';
      }
    }

    // ---- KPI trends: words, streak, stories, sessions ----
    if (typeof StorageManager !== 'undefined') {
      const ud = StorageManager.load();
      if (ud) {
        const nowMs  = Date.now();
        const weekMs = 7 * 24 * 60 * 60 * 1000;

        // Words: days with new vocab this week vs last week
        const vocabThisWeek = vocabHistory.filter(v => nowMs - new Date(v.date).getTime() <= weekMs).length;
        const vocabLastWeek = vocabHistory.filter(v => {
          const age = nowMs - new Date(v.date).getTime();
          return age > weekMs && age <= 2 * weekMs;
        }).length;
        if (vocabHistory.length > 0) {
          setTrend('kpi-words-trend', vocabThisWeek - vocabLastWeek, '', true,
            'This week: ' + vocabThisWeek + ' days with new words vs last week: ' + vocabLastWeek);
        }

        // Streak: show current streak value in the trend badge
        const current = ud.stats.practiceStreak || ud.dailyWord.currentStreak || 0;
        const longest = ud.stats.longestPracticeStreak || ud.dailyWord.longestStreak || 0;
        const streakEl = document.getElementById('kpi-streak-trend');
        if (streakEl) {
          streakEl.textContent = current + ' days';
          streakEl.title = 'Current streak: ' + current + ' days  |  Best ever: ' + longest + ' days';
        }

        // Stories: this month vs last month
        const completed = (ud.storytelling.completedPrompts || []);
        const now = new Date();
        const thisMonth = completed.filter(s => {
          const d = new Date(s.completedAt);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = completed.filter(s => {
          const d = new Date(s.completedAt);
          return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
        }).length;
        if (completed.length > 0) {
          setTrend('kpi-stories-trend', thisMonth - lastMonth, '', true,
            'This month: ' + thisMonth + '  |  Last month: ' + lastMonth);
        }

        // Sessions (active days): this week vs last week from activeDates
        const activeDates = ud.stats.activeDates || [];
        const activeThisWeek = activeDates.filter(d => nowMs - new Date(d).getTime() <= weekMs).length;
        const activeLastWeek = activeDates.filter(d => {
          const age = nowMs - new Date(d).getTime();
          return age > weekMs && age <= 2 * weekMs;
        }).length;
        if (activeDates.length > 0) {
          setTrend('kpi-sessions-trend', activeThisWeek - activeLastWeek, '', true,
            'This week: ' + activeThisWeek + ' active days  |  Last week: ' + activeLastWeek);
        }

        // Words today
        const wordsToday = StorageManager.getWordsLearnedToday();
        if (wordsToday > 0) {
          setTrend('kpi-today-trend', wordsToday, '', true, wordsToday + ' words learned today');
        }
      }
    }

    // ---- Goal ring + Weekly Activity bar ----
    // Both use activeDates so any practice counts, not just speech sessions.
    const activeDatesAll = (typeof StorageManager !== 'undefined')
      ? ((StorageManager.load() || {}).stats || {}).activeDates || []
      : [];
    const weekData    = getWeeklyData(activeDatesAll);
    const activeDays  = weekData.reduce((a,b) => a + b.active, 0);
    const goalPct     = activeDays / WEEKLY_GOAL;

    drawGoalRing('chart-goal-ring', goalPct);
    const pctEl = document.getElementById('review-goal-pct');
    if (pctEl) pctEl.textContent = Math.min(100, Math.round(goalPct * 100)) + '%';
    const subEl = document.getElementById('review-goal-sub');
    if (subEl) subEl.textContent = activeDays + ' / ' + WEEKLY_GOAL + ' days active this week';

    // ---- Dual line: WPM + Fillers ----
    drawDualLineChart('chart-wpm', 'chart-wpm-empty',
      dailySpeech.map(s => s.date),
      dailySpeech.map(s => s.wpm),
      dailySpeech.map(s => s.fillers),
      COLORS.indigo, COLORS.rose
    );

    // ---- Single line: vocab growth ----
    drawLineChart('chart-vocab', 'chart-vocab-empty',
      vocabHistory.map(v => v.date),
      vocabHistory.map(v => v.count),
      COLORS.emerald
    );

    // ---- Single line: filler trend ----
    drawLineChart('chart-fillers', 'chart-fillers-empty',
      dailySpeech.map(s => s.date),
      dailySpeech.map(s => s.fillers),
      COLORS.rose
    );

    // ---- Bar chart: weekly activity (1 = active, 0 = inactive) ----
    const today = new Date().toLocaleDateString();
    const barColors = weekData.map((d) =>
      new Date(d.date).toLocaleDateString() === today ? COLORS.indigo : '#475569'
    );
    drawBarChart('chart-weekly', 'chart-weekly-empty',
      weekData.map(d => d.label),
      weekData.map(d => d.active),
      barColors
    );

    // ---- Quality breakdown ----
    renderQualityBreakdown(speechSessions);
  }

  function init() { requestAnimationFrame(render); }
  function refresh() { requestAnimationFrame(render); }

  return {
    init,
    refresh,
    logSpeechSession,
    logVocabCount
  };
})();

console.log('ProgressChartsModule loaded');
