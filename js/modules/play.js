// ============================================
// PLAY MODULE
// 30-second vocabulary game powered by Supabase words table
// ============================================

const PlayModule = (function () {

  // ── State ─────────────────────────────────────────────────────────────────
  let supabase = null;
  let currentUser = null;

  // Game state
  let gameWords = [];         // words fetched for this session
  let currentWordIndex = 0;
  let score = 0;
  let wordCount = 0;
  let missedWords = [];       // words the user got wrong this game
  let timeLeft = 30;          // seconds remaining
  let gameRunning = false;
  let rafId = null;
  let lastTimestamp = null;
  let startTime = 30;         // initial timer value (may grow with correct answers)

  // DOM refs — game tab
  let loginGate, readyScreen, playingScreen, postgameScreen;
  let startBtn, correctBtn, wrongBtn, playAgainBtn, challengeBtn;
  let timerBar, timerLabel, scoreEl, wordCountEl;
  let wordEl, posEl, definitionEl, difficultyDotsEl;
  let postgameScoreEl, postgameWordsEl, postgameStreakEl;
  let missedSection, missedList;

  // DOM refs — tabs
  let tabBtns, tabPanels;

  // DOM refs — leaderboard / stats
  let leaderboardBody;
  let statsBody, statsLoginGate;
  let pstatStreak, pstatBest, pstatGames, pstatAvg;

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    console.log('PlayModule initializing...');

    // Only run on the play page
    if (!document.getElementById('play-view')) return;

    _cacheDom();
    _bindTabs();
    _bindGameButtons();

    // Show ready screen by default — login gate shown only when Start is clicked without a session
    if (loginGate) loginGate.style.display = 'none';
    if (readyScreen) readyScreen.style.display = '';

    console.log('PlayModule initialized');
  }

  // Lazily resolve supabase client and current user at action time
  function _resolveAuth() {
    supabase = AuthModule.getClient ? AuthModule.getClient() : null;
    currentUser = AuthModule.getUser ? AuthModule.getUser() : null;
  }

  function _cacheDom() {
    loginGate       = document.getElementById('play-login-gate');
    readyScreen     = document.getElementById('play-ready-screen');
    playingScreen   = document.getElementById('play-playing-screen');
    postgameScreen  = document.getElementById('play-postgame-screen');

    startBtn        = document.getElementById('play-start-btn');
    correctBtn      = document.getElementById('play-correct-btn');
    wrongBtn        = document.getElementById('play-wrong-btn');
    playAgainBtn    = document.getElementById('play-again-btn');
    challengeBtn    = document.getElementById('play-challenge-btn');

    timerBar        = document.getElementById('play-timer-bar');
    timerLabel      = document.getElementById('play-timer-label');
    scoreEl         = document.getElementById('play-score');
    wordCountEl     = document.getElementById('play-word-count');
    wordEl          = document.getElementById('play-word');
    posEl           = document.getElementById('play-pos');
    definitionEl    = document.getElementById('play-definition');
    difficultyDotsEl = document.getElementById('play-difficulty-dots');

    postgameScoreEl  = document.getElementById('play-postgame-score');
    postgameWordsEl  = document.getElementById('play-postgame-words');
    postgameStreakEl = document.getElementById('play-postgame-streak');
    missedSection    = document.getElementById('play-missed-section');
    missedList       = document.getElementById('play-missed-list');

    tabBtns   = document.querySelectorAll('.play-tab');
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

    const gateSigninBtn = document.getElementById('play-signin-btn');
    if (gateSigninBtn && !gateSigninBtn._bound) {
      gateSigninBtn._bound = true;
      gateSigninBtn.addEventListener('click', function () {
        const authBtn = document.getElementById('auth-nav-btn');
        if (authBtn) authBtn.click();
      });
    }
  }

  // ── Game Flow ─────────────────────────────────────────────────────────────

  function _bindGameButtons() {
    if (startBtn)    startBtn.addEventListener('click', _startGame);
    if (correctBtn)  correctBtn.addEventListener('click', _handleCorrect);
    if (wrongBtn)    wrongBtn.addEventListener('click', _handleWrong);
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
    if (!supabase) { _showToast('Could not connect. Please refresh.', 'error'); return; }
    if (!supabase) { _showToast('Could not connect. Please refresh.', 'error'); return; }

    // Reset state
    score = 0;
    wordCount = 0;
    missedWords = [];
    currentWordIndex = 0;
    timeLeft = 30;
    gameRunning = false;

    startBtn.disabled = true;
    startBtn.textContent = 'Loading...';

    gameWords = await _fetchWords();

    startBtn.disabled = false;
    startBtn.textContent = 'Start Game';

    if (!gameWords.length) {
      _showToast('Could not load words. Check your connection.', 'error');
      return;
    }

    _showScreen(playingScreen);
    _updateScoreDisplay();
    _showWord();
    _startTimer();
  }

  async function _fetchWords() {
    try {
      // Get words seen today to exclude them
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

      const { data: seenRows } = await supabase
        .from('daily_played_words')
        .select('word_id')
        .eq('user_id', currentUser.id)
        .eq('play_date', today);

      const seenIds = (seenRows || []).map(r => r.word_id);

      // Fetch unseen words — up to 50 to have a pool
      let query = supabase
        .from('words')
        .select('id, word, definition, difficulty, synonyms, antonyms')
        .order('difficulty', { ascending: true })
        .limit(50);

      if (seenIds.length > 0) {
        query = query.not('id', 'in', '(' + seenIds.join(',') + ')');
      }

      const { data: words, error } = await query;

      if (error || !words || !words.length) {
        // All words seen today — allow replay
        const { data: allWords } = await supabase
          .from('words')
          .select('id, word, definition, difficulty, synonyms, antonyms')
          .limit(50);
        return _shuffle(allWords || []);
      }

      return _shuffle(words);
    } catch (err) {
      console.error('PlayModule: fetchWords error', err);
      return [];
    }
  }

  function _showWord() {
    if (currentWordIndex >= gameWords.length) {
      // Ran out of words — end game
      _endGame();
      return;
    }

    const w = gameWords[currentWordIndex];
    wordEl.textContent = w.word;
    posEl.textContent = '';
    definitionEl.textContent = w.definition || '';
    _renderDifficultyDots(w.difficulty || 1);
  }

  function _renderDifficultyDots(difficulty) {
    difficultyDotsEl.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const dot = document.createElement('span');
      dot.className = 'play-dot' + (i <= difficulty ? ' play-dot--filled' : '');
      difficultyDotsEl.appendChild(dot);
    }
  }

  function _handleCorrect() {
    if (!gameRunning) return;
    const w = gameWords[currentWordIndex];
    const points = (w.difficulty || 1) * 10;
    score += points;
    wordCount++;
    timeLeft = Math.min(timeLeft + 5, 90); // +5s, cap at 90
    _updateScoreDisplay();
    _recordDailyPlayed(w.id);
    currentWordIndex++;
    _showWord();
    _flashCard('correct');
  }

  function _handleWrong() {
    if (!gameRunning) return;
    const w = gameWords[currentWordIndex];
    missedWords.push(w);
    _recordDailyPlayed(w.id);
    _recordIncorrect(w.id);
    currentWordIndex++;
    _showWord();
    _flashCard('wrong');
  }

  function _flashCard(type) {
    const card = document.querySelector('.play-word-card');
    if (!card) return;
    card.classList.remove('flash-correct', 'flash-wrong');
    void card.offsetWidth; // reflow to restart animation
    card.classList.add(type === 'correct' ? 'flash-correct' : 'flash-wrong');
  }

  // ── Timer ─────────────────────────────────────────────────────────────────

  function _startTimer() {
    gameRunning = true;
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
    const secs = Math.ceil(timeLeft);
    if (timerLabel) timerLabel.textContent = secs;

    // Bar width — treat 30s as "full" but allow it to grow above 100% visually
    const pct = Math.min((timeLeft / 30) * 100, 100);
    if (timerBar) {
      timerBar.style.width = pct + '%';
      // Color shifts red when under 10s
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
    if (scoreEl)    scoreEl.textContent = score;
    if (wordCountEl) wordCountEl.textContent = wordCount;
  }

  // ── End Game ──────────────────────────────────────────────────────────────

  async function _endGame() {
    gameRunning = false;
    if (rafId) cancelAnimationFrame(rafId);

    // Submit score to Supabase (bump_streak trigger fires automatically)
    let streakCount = null;
    try {
      if (supabase && currentUser) {
        await supabase.from('play_sessions').insert({
          user_id:    currentUser.id,
          score:      score,
          words_seen: wordCount,
          missed:     missedWords.length
        });

        // Fetch updated streak
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
  }

  function _showPostgame(streakCount) {
    if (postgameScoreEl) postgameScoreEl.textContent = score;
    if (postgameWordsEl) postgameWordsEl.textContent = wordCount + ' word' + (wordCount !== 1 ? 's' : '');
    if (postgameStreakEl) {
      postgameStreakEl.textContent = streakCount !== null
        ? streakCount + ' day streak'
        : '— streak';
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
            '<span class="play-missed-def">' + _escHtml(w.definition || '') + '</span>' +
          '</div>' +
          '<button class="btn btn-secondary play-missed-save-btn" data-word="' + _escHtml(w.word) + '">Save to Word Bank</button>';
        missedList.appendChild(li);
      });

      // Bind save buttons
      missedList.querySelectorAll('.play-missed-save-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const word = btn.getAttribute('data-word');
          if (typeof WordBankModule !== 'undefined' && WordBankModule.quickSave) {
            WordBankModule.quickSave(word);
            btn.textContent = 'Saved!';
            btn.disabled = true;
          } else {
            _showToast('Word Bank not available on this page.', 'error');
          }
        });
      });
    } else {
      missedSection.style.display = 'none';
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
        code:         code,
        challenger_id: currentUser.id,
        score:        score,
        display_name: displayName
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

    leaderboardBody.innerHTML = '<p class="play-loading">Loading...</p>';

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
      statsLoginGate.style.display = '';
      statsBody.style.display = 'none';
      return;
    }

    statsLoginGate.style.display = 'none';
    statsBody.style.display = '';

    try {
      const [streakRes, sessionsRes] = await Promise.all([
        supabase.from('streaks').select('current_streak').eq('user_id', currentUser.id).single(),
        supabase.from('play_sessions').select('score').eq('user_id', currentUser.id)
      ]);

      const streak = streakRes.data ? streakRes.data.current_streak : 0;
      const sessions = sessionsRes.data || [];
      const games = sessions.length;
      const best = games ? Math.max(...sessions.map(s => s.score)) : 0;
      const avg = games ? Math.round(sessions.reduce((a, s) => a + s.score, 0) / games) : 0;

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
        play_date: today
      }, { onConflict: 'user_id,word_id,play_date' });
    } catch (e) { /* non-critical */ }
  }

  async function _recordIncorrect(wordId) {
    if (!supabase || !currentUser) return;
    try {
      await supabase.from('incorrect_play_words').upsert({
        user_id: currentUser.id,
        word_id: wordId,
        count:   1
      }, { onConflict: 'user_id,word_id', ignoreDuplicates: false });
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
    if (typeof showToast === 'function') {
      showToast(message, type);
      return;
    }
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3000);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    init: init
  };

})();
