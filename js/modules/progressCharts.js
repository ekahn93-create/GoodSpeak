// ============================================
// PROGRESS CHARTS MODULE
// Rich canvas charts for the Review dashboard
// ============================================

const ProgressChartsModule = (function() {

  const SPEECH_SESSIONS_KEY = 'speechSessions'; // array of {date, wpm, fillers, ts}
  const VOCAB_HISTORY_KEY   = 'vocabHistory';    // array of {date, count, ts}
  const WEEKLY_GOAL = 5; // target sessions per week

  // ---- Storage helpers ----

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
    localStorage.setItem(SPEECH_SESSIONS_KEY, JSON.stringify(sessions.slice(-20)));
  }

  // Called externally when vocab count changes
  function logVocabCount(count) {
    const history = getData(VOCAB_HISTORY_KEY);
    const today = new Date().toLocaleDateString();
    const idx = history.findIndex(h => h.date === today);
    if (idx > -1) {
      history[idx].count = count;
    } else {
      history.push({ date: today, count, ts: Date.now() });
    }
    localStorage.setItem(VOCAB_HISTORY_KEY, JSON.stringify(history.slice(-30)));
  }

  // ---- Aggregate speech sessions by day ----
  // Returns an array of {date, wpm, fillers} with one entry per calendar day,
  // spanning from the earliest session to today, with 0-filled gaps.
  function aggregateSpeechByDay(sessions) {
    if (!sessions || sessions.length === 0) return [];

    // Group by date string
    const byDate = {};
    sessions.forEach(s => {
      if (!byDate[s.date]) byDate[s.date] = { wpmSum: 0, fillerSum: 0, count: 0 };
      byDate[s.date].wpmSum    += s.wpm    || 0;
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
          wpm:     Math.round(g.wpmSum / g.count),
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
    const displayW = canvas.offsetWidth || canvas.parentElement.offsetWidth || 400;
    const displayH = canvas.height;
    canvas.width  = displayW * ratio;
    canvas.height = displayH * ratio;
    canvas.style.width  = displayW + 'px';
    canvas.style.height = displayH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    return { ctx, W: displayW, H: displayH };
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
    const pad = { top: 16, right: 28, bottom: 36, left: 44 };
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

    // X labels — pixel-aware spacing to prevent overlap
    const shortLabels = labels.map(formatShortDate);
    const pts0 = labels.map((_, i) => pad.left + (i / Math.max(labels.length - 1, 1)) * w);
    ctx.font = '10px Inter, sans-serif';
    const labelW = ctx.measureText('12/31/99').width + 6; // widest expected label + padding
    const step = Math.max(1, Math.ceil((labelW * labels.length) / w));
    ctx.fillStyle = COLORS.label;
    shortLabels.forEach((label, i) => {
      if (i % step === 0 || i === labels.length - 1) {
        const isLast = i === labels.length - 1;
        const isFirst = i === 0;
        ctx.textAlign = isLast ? 'right' : (isFirst ? 'left' : 'center');
        const x = isLast ? (pad.left + w) : (isFirst ? pad.left : pts0[i]);
        ctx.fillText(label, x, pad.top + h + 18);
      }
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
    const pad = { top: 20, right: 28, bottom: 44, left: 44 };
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
        ctx.fillText(val, x + barW / 2, y - 6);
      }

      // X label — bar chart labels are short day names (Mon, Tue…) so always show them
      ctx.fillStyle = COLORS.label;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(formatShortDate(labels[i]), x + barW / 2, pad.top + h + 18);
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
  function getWeeklyData(speechSessions) {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = days[d.getDay()];
      const dateStr = d.toLocaleDateString();

      const sessCount = speechSessions.filter(s => s.date === dateStr).length;
      weekData.push({ label, sessCount, date: dateStr });
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
    const speechSessions  = getData(SPEECH_SESSIONS_KEY);

    // Refresh vocab history with current count
    if (typeof StorageManager !== 'undefined') {
      const ud = StorageManager.load();
      if (ud) logVocabCount(ud.vocabulary.totalWordsLearned || 0);
    }
    const vocabHistory = getData(VOCAB_HISTORY_KEY);

    // ---- Aggregate sessions to one point per day (needed for KPI too) ----
    const dailySpeech = aggregateSpeechByDay(speechSessions);
    // Active days only (days with at least one session) for averages
    const activeDays = dailySpeech.filter(s => s.wpm > 0);

    // ---- KPI: avg WPM ----
    const avgWpmEl = document.getElementById('kpi-avg-wpm');
    if (avgWpmEl) {
      if (activeDays.length > 0) {
        const avg = Math.round(activeDays.reduce((a,b) => a + b.wpm, 0) / activeDays.length);
        avgWpmEl.textContent = avg;
        if (activeDays.length >= 2) {
          const half   = Math.floor(activeDays.length / 2);
          const recentDays = activeDays.slice(-half);
          const olderDays  = activeDays.slice(0, half);
          const recentAvg  = Math.round(recentDays.reduce((a,b) => a + b.wpm, 0) / half);
          const olderAvg   = Math.round(olderDays.reduce((a,b) => a + b.wpm, 0) / half);
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
        // Words: this week vs last week (from vocabHistory)
        const nowMs = Date.now();
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        const vocabThisWeek  = vocabHistory.filter(v => nowMs - new Date(v.date).getTime() <= weekMs).length;
        const vocabLastWeek  = vocabHistory.filter(v => {
          const age = nowMs - new Date(v.date).getTime();
          return age > weekMs && age <= 2 * weekMs;
        }).length;
        const wordDiff = vocabThisWeek - vocabLastWeek;
        if (vocabHistory.length > 0) {
          setTrend('kpi-words-trend', wordDiff, '', true,
            'This week: ' + vocabThisWeek + ' days active vs last week: ' + vocabLastWeek);
        }

        // Streak: current vs longest
        const current = ud.dailyWord.currentStreak || 0;
        const longest = ud.dailyWord.longestStreak || 0;
        if (longest > 0) {
          const streakDiff = current - longest;
          setTrend('kpi-streak-trend', streakDiff === 0 ? 0 : streakDiff, ' days', streakDiff >= 0,
            'Current streak: ' + current + ' days  |  Best ever: ' + longest + ' days');
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

        // Sessions: this week vs last week
        const sessThisWeek = speechSessions.filter(s => nowMs - new Date(s.date).getTime() <= weekMs).length;
        const sessLastWeek = speechSessions.filter(s => {
          const age = nowMs - new Date(s.date).getTime();
          return age > weekMs && age <= 2 * weekMs;
        }).length;
        if (speechSessions.length > 0) {
          setTrend('kpi-sessions-trend', sessThisWeek - sessLastWeek, '', true,
            'This week: ' + sessThisWeek + ' sessions  |  Last week: ' + sessLastWeek);
        }
      }
    }

    // ---- Goal ring ----
    const weekData = getWeeklyData(speechSessions);
    const weekSessions = weekData.reduce((a,b) => a + b.sessCount, 0);
    const goalPct = weekSessions / WEEKLY_GOAL;
    drawGoalRing('chart-goal-ring', goalPct);
    const pctEl = document.getElementById('review-goal-pct');
    if (pctEl) pctEl.textContent = Math.min(100, Math.round(goalPct * 100)) + '%';
    const subEl = document.getElementById('review-goal-sub');
    if (subEl) subEl.textContent = weekSessions + ' / ' + WEEKLY_GOAL + ' sessions this week';

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

    // ---- Bar chart: weekly activity ----
    const barColors = weekData.map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString() === new Date().toLocaleDateString()
        ? COLORS.indigo
        : '#475569';
    });
    drawBarChart('chart-weekly', 'chart-weekly-empty',
      weekData.map(d => d.label),
      weekData.map(d => d.sessCount),
      barColors
    );

    // ---- Quality breakdown ----
    renderQualityBreakdown(speechSessions);
  }

  function init() { render(); }
  function refresh() { render(); }

  return {
    init,
    refresh,
    logSpeechSession,
    logVocabCount
  };
})();

console.log('ProgressChartsModule loaded');
