// ============================================
// PLAY MODULE
// 30-second synonym/antonym multiple-choice game
// ============================================

const PlayModule = (function () {

  // ── Constants ─────────────────────────────────────────────────────────────
  const START_DURATION  = 30;
  const BONUS_CORRECT   = 5;
  const POINTS_CORRECT  = 10;
  const BASE_CHOICES    = 4;

  // ── State ─────────────────────────────────────────────────────────────────
  let supabase    = null;
  let currentUser = null;

  // Game state
  let questions      = [];   // array of QuizQuestion objects
  let currentIdx     = 0;
  let score          = 0;
  let correctCount   = 0;
  let totalAnswered  = 0;
  let missedWords    = [];   // { wordId, word, definition }
  let pickedIdx      = null; // index of choice tapped (null = waiting)
  let timeLeft       = START_DURATION;
  let maxSeconds     = START_DURATION;
  let gameRunning    = false;
  let rafId          = null;
  let lastTimestamp  = null;

  // DOM refs — game tab
  let loginGate, readyScreen, playingScreen, postgameScreen;
  let startBtn, playAgainBtn, challengeBtn;
  let timerBar, timerLabel, scoreEl, correctEl;
  let questionTypeEl, questionPromptEl, choiceGrid;
  let postgameScoreEl, postgameCorrectEl, postgameStreakEl;
  let missedSection, missedList;

  // DOM refs — tabs
  let tabBtns, tabPanels;

  // DOM refs — leaderboard / stats
  let leaderboardBody;
  let statsBody, statsLoginGate;
  let pstatStreak, pstatBest, pstatGames, pstatAvg;

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    if (!document.getElementById('play-view')) return;
    _cacheDom();
    _bindTabs();
    _bindGameButtons();
    if (loginGate)    loginGate.style.display   = 'none';
    if (readyScreen)  readyScreen.style.display  = '';
  }

  function _resolveAuth() {
    supabase     = AuthModule.getClient ? AuthModule.getClient() : null;
    currentUser  = AuthModule.getUser   ? AuthModule.getUser()   : null;
  }

  function _cacheDom() {
    loginGate      = document.getElementById('play-login-gate');
    readyScreen    = document.getElementById('play-ready-screen');
    playingScreen  = document.getElementById('play-playing-screen');
    postgameScreen = document.getElementById('play-postgame-screen');

    startBtn       = document.getElementById('play-start-btn');
    playAgainBtn   = document.getElementById('play-again-btn');
    challengeBtn   = document.getElementById('play-challenge-btn');

    timerBar       = document.getElementById('play-timer-bar');
    timerLabel     = document.getElementById('play-timer-label');
    scoreEl        = document.getElementById('play-score');
    correctEl      = document.getElementById('play-correct-count');

    questionTypeEl   = document.getElementById('play-question-type');
    questionPromptEl = document.getElementById('play-question-prompt');
    choiceGrid       = document.getElementById('play-choice-grid');

    postgameScoreEl   = document.getElementById('play-postgame-score');
    postgameCorrectEl = document.getElementById('play-postgame-correct');
    postgameStreakEl  = document.getElementById('play-postgame-streak');
    missedSection     = document.getElementById('play-missed-section');
    missedList        = document.getElementById('play-missed-list');

    tabBtns   = document.querySelectorAll('.vocab-category-tab');
    tabPanels = document.querySelectorAll('.play-tab-panel');

    leaderboardBody = document.getElementById('play-leaderboard-body');
    statsBody       = document.getElementById('play-stats-body');
    statsLoginGate  = document.getElementById('play-stats-login-gate');
    pstatStreak = document.getElementById('pstat-streak');
    pstatBest   = document.getElementById('pstat-best');
    pstatGames  = document.getElementById('pstat-games');
    pstatAvg    = document.getElementById('pstat-avg');
  }

  // ── Tab Switching ─────────────────────────────────────────────────────────

  function _bindTabs() {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const tab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.style.display = 'none');
        btn.classList.add('active');
        const panel = document.getElementById('play-tab-' + tab);
        if (panel) panel.style.display = '';
        if (tab === 'leaderboard') _loadLeaderboard();
        if (tab === 'my-stats')    _loadMyStats();
      });
    });
  }

  // ── Login Gate ────────────────────────────────────────────────────────────

  function _showLoginGate() {
    _showScreen(loginGate);
    const btn = document.getElementById('play-signin-btn');
    if (btn && !btn._bound) {
      btn._bound = true;
      btn.addEventListener('click', function () {
        const authBtn = document.getElementById('auth-nav-btn');
        if (authBtn) authBtn.click();
      });
    }
  }

  // ── Game Flow ─────────────────────────────────────────────────────────────

  function _bindGameButtons() {
    if (startBtn)    startBtn.addEventListener('click', _startGame);
    if (playAgainBtn) playAgainBtn.addEventListener('click', _resetToReady);
    if (challengeBtn) challengeBtn.addEventListener('click', _shareChallenge);
    document.querySelectorAll('.play-stats-signin-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const authBtn = document.getElementById('auth-nav-btn');
        if (authBtn) authBtn.click();
      });
    });
  }

  async function _startGame() {
    _resolveAuth();
    if (!currentUser) { _showLoginGate(); return; }
    if (!supabase)    { _showToast('Could not connect. Please refresh.', 'error'); return; }

    score = 0; correctCount = 0; totalAnswered = 0;
    missedWords = []; currentIdx = 0;
    timeLeft = START_DURATION; maxSeconds = START_DURATION;
    gameRunning = false; pickedIdx = null;

    startBtn.disabled = true;
    startBtn.textContent = 'Loading…';

    const words = await _fetchWords();

    startBtn.disabled = false;
    startBtn.textContent = 'Start Game';

    if (words.length < 4) {
      _showToast('Could not load enough words. Check your connection.', 'error');
      return;
    }

    questions = _buildQuestions(words);

    if (questions.length === 0) {
      _showToast('Not enough words to generate questions.', 'error');
      return;
    }

    _showScreen(playingScreen);
    _updateScoreDisplay();
    _showQuestion();
    _startTimer();
  }

  // ── Word Fetching ─────────────────────────────────────────────────────────

  async function _fetchWords() {
    try {
      const today = new Date().toISOString().slice(0, 10);

      const { data: seenRows } = await supabase
        .from('daily_played_words')
        .select('word_id')
        .eq('user_id', currentUser.id)
        .eq('played_on', today);

      const seenIds = (seenRows || []).map(r => r.word_id);

      let query = supabase
        .from('words')
        .select('id, word, definition, difficulty, synonyms, antonyms')
        .limit(100);

      if (seenIds.length > 0) {
        query = query.not('id', 'in', '(' + seenIds.join(',') + ')');
      }

      const { data: words, error } = await query;

      if (error || !words || words.length < 4) {
        // All seen today — allow replay
        const { data: allWords } = await supabase
          .from('words')
          .select('id, word, definition, difficulty, synonyms, antonyms')
          .limit(100);
        return _shuffle(allWords || []);
      }

      return _shuffle(words);
    } catch (err) {
      console.error('PlayModule: fetchWords error', err);
      return [];
    }
  }

  // ── Question Building ─────────────────────────────────────────────────────
  // Mirrors Vocabulary Voyager play.server.ts buildQuestions logic

  function _buildQuestions(pool) {
    const questions = [];

    for (const w of pool) {
      const types = [];
      if (w.synonyms && w.synonyms.length) types.push('synonym');
      if (w.antonyms && w.antonyms.length) types.push('antonym');
      if (types.length === 0) continue;

      const type    = types[Math.floor(Math.random() * types.length)];
      const correct = (type === 'synonym' ? w.synonyms : w.antonyms)[0];

      // Build distractors: use opposite-type words from other words first,
      // then fall back to other words' names. Mirrors Voyager logic.
      const others = _shuffle(pool.filter(x => x.id !== w.id));
      const distractors = [];

      for (const o of others) {
        if (distractors.length >= 9) break;
        const candidate = type === 'synonym'
          ? (o.antonyms && o.antonyms[0])
          : (o.synonyms && o.synonyms[0]);
        if (candidate && candidate !== correct && candidate !== w.word && !distractors.includes(candidate)) {
          distractors.push(candidate);
        }
      }

      // Fill remaining slots with word names as distractors
      for (const o of others) {
        if (distractors.length >= 9) break;
        const filler = o.word;
        if (!distractors.includes(filler) && filler !== correct && filler !== w.word) {
          distractors.push(filler);
        }
      }

      if (distractors.length < 3) continue; // need at least 3 distractors for 4 choices

      questions.push({
        id:          w.id + '-' + type,
        wordId:      w.id,
        word:        w.word,
        difficulty:  w.difficulty || 1,
        type:        type,
        prompt:      type === 'synonym'
          ? 'Which word is <u><strong>closest in meaning</strong></u> to "' + w.word + '"?'
          : 'Which word is the <u><strong>opposite</strong></u> of "' + w.word + '"?',
        correct:     correct,
        distractors: distractors,
        definition:  w.definition || ''
      });
    }

    return questions;
  }

  // ── Showing a Question ────────────────────────────────────────────────────

  function _showQuestion() {
    if (currentIdx >= questions.length) {
      _endGame();
      return;
    }

    const q = questions[currentIdx];
    pickedIdx = null;

    // How many choices to show: grows by 1 every 10 correct answers, max = distractors+1
    const choiceCount = Math.min(
      BASE_CHOICES + Math.floor(correctCount / 10),
      1 + q.distractors.length
    );

    // Build shuffled options using a seeded shuffle (matches Voyager approach)
    const distractors = q.distractors.slice(0, choiceCount - 1);
    const all = [q.correct].concat(distractors);
    const options = _seededShuffle(all, q.id);
    const correctIndex = options.indexOf(q.correct);

    // Update question type label
    if (questionTypeEl) {
      questionTypeEl.textContent =
        (q.type === 'synonym' ? 'SYNONYM' : 'ANTONYM') + ' · ' + choiceCount + ' CHOICES';
    }

    // Update prompt (uses innerHTML for bold/underline markup)
    if (questionPromptEl) {
      questionPromptEl.innerHTML = q.prompt;
    }

    // Render choice buttons
    if (choiceGrid) {
      choiceGrid.innerHTML = '';
      // 2-col grid for 4 choices, 1-col for 5+
      choiceGrid.className = 'play-choice-grid' + (choiceCount > 4 ? ' play-choice-grid--wide' : '');

      options.forEach(function (opt, i) {
        const btn = document.createElement('button');
        btn.className = 'play-choice-btn';
        btn.textContent = opt;
        btn.addEventListener('click', function () {
          _handleChoice(i, correctIndex);
        });
        choiceGrid.appendChild(btn);
      });
    }
  }

  // ── Handling a Choice ─────────────────────────────────────────────────────

  function _handleChoice(i, correctIndex) {
    if (pickedIdx !== null || !gameRunning) return;
    pickedIdx = i;

    const q = questions[currentIdx];
    const isCorrect = i === correctIndex;

    totalAnswered++;

    // Flash the buttons
    const btns = choiceGrid.querySelectorAll('.play-choice-btn');
    btns.forEach(function (btn, idx) {
      btn.disabled = true;
      if (idx === correctIndex) {
        btn.classList.add('play-choice-btn--correct');
      } else if (idx === i && !isCorrect) {
        btn.classList.add('play-choice-btn--wrong');
      } else {
        btn.classList.add('play-choice-btn--dim');
      }
    });

    if (isCorrect) {
      score += POINTS_CORRECT;
      correctCount++;
      timeLeft = Math.min(timeLeft + BONUS_CORRECT, 90);
      _updateScoreDisplay();
      _recordDailyPlayed(q.wordId);
    } else {
      missedWords.push({ wordId: q.wordId, word: q.word, definition: q.definition });
      _recordDailyPlayed(q.wordId);
      _recordIncorrect(q.wordId);
    }

    // Advance after brief delay
    setTimeout(function () {
      currentIdx++;
      _showQuestion();
    }, 450);
  }

  // ── Timer ─────────────────────────────────────────────────────────────────

  function _startTimer() {
    gameRunning   = true;
    lastTimestamp = performance.now();
    rafId = requestAnimationFrame(_timerTick);
  }

  function _timerTick(timestamp) {
    if (!gameRunning) return;

    const elapsed = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    timeLeft -= elapsed;

    if (timeLeft <= 0) {
      timeLeft = 0;
      _updateTimerDisplay();
      _endGame();
      return;
    }

    _updateTimerDisplay();
    rafId = requestAnimationFrame(_timerTick);
  }

  function _updateTimerDisplay() {
    if (timerLabel) timerLabel.textContent = Math.max(0, timeLeft).toFixed(1) + 'S';

    const pct = Math.min((timeLeft / maxSeconds) * 100, 100);
    if (timerBar) {
      timerBar.style.width = pct + '%';
      if (timeLeft <= 10) {
        timerBar.style.background = 'var(--accent-color)';
      } else if (timeLeft <= 20) {
        timerBar.style.background = '#f59e0b';
      } else {
        timerBar.style.background = 'var(--primary-color)';
      }
    }
  }

  function _updateScoreDisplay() {
    if (scoreEl)   scoreEl.textContent   = score;
    if (correctEl) correctEl.textContent = correctCount;
  }

  // ── End Game ──────────────────────────────────────────────────────────────

  async function _endGame() {
    gameRunning = false;
    if (rafId) cancelAnimationFrame(rafId);

    let streakCount = null;
    try {
      if (supabase && currentUser) {
        await supabase.from('play_sessions').insert({
          user_id:       currentUser.id,
          score:         score,
          correct_count: correctCount,
          total_answered: totalAnswered
        });

        const { data: streakRow } = await supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', currentUser.id)
          .single();
        if (streakRow) streakCount = streakRow.current_streak;
      }
    } catch (err) {
      console.error('PlayModule: endGame submit error', err);
    }

    _showPostgame(streakCount);

    // Nudge toward Learn if they missed words, otherwise toward Stats
    if (typeof NudgeModule !== 'undefined') {
      if (missedWords.length > 0) {
        NudgeModule.show(
          'nudge-play-done',
          'You missed ' + missedWords.length + ' word' + (missedWords.length > 1 ? 's' : '') + ' — add them to your Word Bank to study them.',
          'Go to Word Bank',
          'vocabulary',
          'bank'
        );
      } else {
        NudgeModule.show(
          'nudge-play-done',
          'Clean game! See how your progress is trending in Stats.',
          'Go to Stats',
          'progress',
          null
        );
      }
    }
  }

  function _showPostgame(streakCount) {
    if (postgameScoreEl)   postgameScoreEl.textContent   = score;
    if (postgameCorrectEl) postgameCorrectEl.textContent =
      correctCount + ' correct out of ' + totalAnswered + ' answered';
    if (postgameStreakEl) {
      postgameStreakEl.textContent = streakCount !== null
        ? streakCount + ' day streak'
        : '';
    }

    // Missed words list
    if (missedWords.length > 0) {
      missedSection.style.display = '';
      missedList.innerHTML = '';
      missedWords.forEach(function (w) {
        const li = document.createElement('li');
        li.className = 'play-missed-item';
        li.innerHTML =
          '<div class="play-missed-word-info">' +
            '<span class="play-missed-word">' + _escHtml(w.word) + '</span>' +
            '<span class="play-missed-def">'  + _escHtml(w.definition || '') + '</span>' +
          '</div>' +
          '<button class="btn btn-secondary play-missed-save-btn" data-word="' + _escHtml(w.word) + '" data-def="' + _escHtml(w.definition) + '">Save for Later</button>';
        missedList.appendChild(li);
      });

      missedList.querySelectorAll('.play-missed-save-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const word = btn.getAttribute('data-word');
          const def  = btn.getAttribute('data-def');
          if (typeof WordBankModule !== 'undefined' && WordBankModule.quickSave) {
            WordBankModule.quickSave(word, def);
            btn.textContent = 'Saved!';
            btn.disabled = true;
          } else {
            _showToast('Word Bank not available on this page.', 'error');
          }
        });
      });
    } else {
      if (missedSection) missedSection.style.display = 'none';
    }

    _showScreen(postgameScreen);
  }

  function _resetToReady() {
    _showScreen(readyScreen);
  }

  // ── Challenge ─────────────────────────────────────────────────────────────

  async function _shareChallenge() {
    _resolveAuth();
    if (!supabase || !currentUser) return;

    try {
      const code = _randomCode(8);
      const displayName = currentUser.user_metadata?.nickname
        || currentUser.user_metadata?.first_name
        || currentUser.email;

      await supabase.from('challenges').insert({
        code:              code,
        challenger_id:     currentUser.id,
        score:             score,
        display_name:      displayName
      });

      const link = window.location.origin + '/play?challenge=' + code;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        _showToast('Challenge link copied!', 'success');
      } else {
        prompt('Copy this challenge link:', link);
      }
    } catch (err) {
      console.error('PlayModule: challenge error', err);
      _showToast('Could not create challenge link.', 'error');
    }
  }

  // ── Leaderboard ───────────────────────────────────────────────────────────

  async function _loadLeaderboard() {
    _resolveAuth();
    if (!supabase) {
      leaderboardBody.innerHTML = '<p class="play-empty">Sign in to see the leaderboard.</p>';
      return;
    }

    leaderboardBody.innerHTML = '<p class="play-loading">Loading…</p>';

    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('display_name, avg_score, user_id')
        .order('avg_score', { ascending: false })
        .limit(20);

      if (error || !data || !data.length) {
        leaderboardBody.innerHTML = '<p class="play-empty">No scores yet. Play a game to get on the board!</p>';
        return;
      }

      let html = '<ol class="play-leaderboard-list">';
      data.forEach(function (row, i) {
        const isMe = currentUser && row.user_id === currentUser.id;
        html += '<li class="play-lb-row' + (isMe ? ' play-lb-row--me' : '') + '">' +
          '<span class="play-lb-rank">' + (i + 1) + '</span>' +
          '<span class="play-lb-name">' + _escHtml(row.display_name || 'Player') + (isMe ? ' (you)' : '') + '</span>' +
          '<span class="play-lb-score">' + Math.round(row.avg_score) + '</span>' +
          '</li>';
      });
      html += '</ol>';
      leaderboardBody.innerHTML = html;
    } catch (err) {
      console.error('PlayModule: leaderboard error', err);
      leaderboardBody.innerHTML = '<p class="play-empty">Could not load leaderboard.</p>';
    }
  }

  // ── My Stats ──────────────────────────────────────────────────────────────

  async function _loadMyStats() {
    _resolveAuth();

    if (!currentUser || !supabase) {
      if (statsLoginGate) statsLoginGate.style.display = '';
      if (statsBody)      statsBody.style.display      = 'none';
      return;
    }

    if (statsLoginGate) statsLoginGate.style.display = 'none';
    if (statsBody)      statsBody.style.display      = '';

    try {
      const [streakRes, sessionsRes] = await Promise.all([
        supabase.from('streaks').select('current_streak').eq('user_id', currentUser.id).single(),
        supabase.from('play_sessions').select('score').eq('user_id', currentUser.id)
      ]);

      const streak   = streakRes.data ? streakRes.data.current_streak : 0;
      const sessions = sessionsRes.data || [];
      const games    = sessions.length;
      const best     = games ? Math.max(...sessions.map(s => s.score)) : 0;
      const avg      = games ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / games) : 0;

      if (pstatStreak) pstatStreak.textContent = streak;
      if (pstatBest)   pstatBest.textContent   = best;
      if (pstatGames)  pstatGames.textContent   = games;
      if (pstatAvg)    pstatAvg.textContent     = avg;
    } catch (err) {
      console.error('PlayModule: stats error', err);
    }
  }

  // ── Supabase Helpers ──────────────────────────────────────────────────────

  async function _recordDailyPlayed(wordId) {
    if (!supabase || !currentUser) return;
    const today = new Date().toISOString().slice(0, 10);
    try {
      await supabase.from('daily_played_words').upsert({
        user_id:   currentUser.id,
        word_id:   wordId,
        played_on: today
      }, { onConflict: 'user_id,word_id,played_on' });
    } catch (e) { /* non-critical */ }
  }

  async function _recordIncorrect(wordId) {
    if (!supabase || !currentUser) return;
    try {
      await supabase.from('incorrect_play_words').upsert({
        user_id: currentUser.id,
        word_id: wordId
      }, { onConflict: 'user_id,word_id', ignoreDuplicates: true });
    } catch (e) { /* non-critical */ }
  }

  // ── Screen Helpers ────────────────────────────────────────────────────────

  function _showScreen(screen) {
    [loginGate, readyScreen, playingScreen, postgameScreen].forEach(function (s) {
      if (s) s.style.display = 'none';
    });
    if (screen) screen.style.display = '';
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  function _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Deterministic shuffle keyed off question id — same question always has
  // the same option order, preventing answer-position memorisation.
  function _seededShuffle(arr, seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    const rand = function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function _randomCode(len) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  function _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _showToast(message, type) {
    // showToast is a global defined in app.js; fall back to manual toast if unavailable
    if (typeof window.showToast === 'function') { window.showToast(message, type); return; }
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return { init: init };

})();
