// ============================================
// MAIN APP
// Initializes and coordinates all modules
// ============================================

/**
 * App - Main application module
 * Coordinates all other modules and handles app-wide functionality
 */
const App = (function() {
  // Private variables
  let userData = null;
  let isInitialized = false;

  /**
   * Initialize the application
   */
  function init() {

    if (!StorageManager.isAvailable()) {
      alert('LocalStorage is not available. The app requires LocalStorage to save your progress.');
      return;
    }

    // Load config and check for existing session FIRST.
    // If logged in, pull cloud data into localStorage before initializing modules.
    AppConfig.load().then(() => {
      AuthModule.init(function(event, user) {
        if (event === 'SIGNED_IN') {
          // Only reload if the user just logged in via the modal (not a token refresh on page load).
          // The boot path already handles sync for existing sessions.
          if (AuthModule.isNewLogin()) {
            SyncModule.onSignIn().then(() => {
              window.location.reload();
            });
          }
        } else if (event === 'SIGNED_OUT') {
          SyncModule.onSignOut();
          window.location.reload();
        }
      });

      // If a session already exists, sync cloud data before booting the app
      const client = AuthModule.getClient();
      if (client) {
        client.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            // Logged in — pull cloud data first, then boot
            AuthModule._setCurrentUser(session.user);
            SyncModule.onSignIn().then(() => _bootApp());
          } else {
            // Not logged in — boot immediately
            _bootApp();
          }
        });
      } else {
        _bootApp();
      }
    });
  }

  function _refreshAllModules() {
    userData = StorageManager.load();
    updateDashboardStats();
    updateLearningPath();
    if (typeof VocabularyModule !== 'undefined' && VocabularyModule.refresh) VocabularyModule.refresh();
    if (typeof WordBankModule !== 'undefined' && WordBankModule.refresh) WordBankModule.refresh();
  }

  function _bootApp() {
    // Initialize or load user data
    userData = StorageManager.initialize();

    // Update session stats
    StorageManager.updateSession();

    // Initialize components
    Modal.init();

    // Show onboarding for new users
    if (typeof OnboardingModule !== 'undefined') OnboardingModule.init();

    // Initialize all feature modules — guard each call since not every module
    // is loaded on every page (multi-page architecture)
    if (typeof WordBankModule       !== 'undefined') WordBankModule.init();
    if (typeof StorytellingModule   !== 'undefined') StorytellingModule.init();
    if (typeof DailyWordModule      !== 'undefined') DailyWordModule.init();
    if (typeof MWWordOfDayModule    !== 'undefined') MWWordOfDayModule.init();
    if (typeof GrammarModule        !== 'undefined') GrammarModule.init();
    if (typeof FluencyModule        !== 'undefined') FluencyModule.init();
    if (typeof VocabularyModule     !== 'undefined') VocabularyModule.init();
    if (typeof ReadAloudModule      !== 'undefined') ReadAloudModule.init();
    if (typeof SRSModule            !== 'undefined') SRSModule.init();
    if (typeof RecordingsModule     !== 'undefined') RecordingsModule.init();
    if (typeof ShadowingModule      !== 'undefined') ShadowingModule.init();
    if (typeof ProgressChartsModule !== 'undefined') ProgressChartsModule.init();
    if (typeof PlayModule           !== 'undefined') PlayModule.init();
    if (typeof ProfileModule        !== 'undefined') ProfileModule.init();

    // Initialize dashboard
    initializeDashboard();

    // Listen for view changes to update data
    document.addEventListener('viewChanged', handleViewChange);

    // Initialize router last
    Router.init();

    // Initialize progress view
    initializeProgressView();

    // Hook StorageManager.save to schedule a cloud sync on every local save
    const _originalSave = StorageManager.save;
    StorageManager.save = function(data) {
      const result = _originalSave.call(StorageManager, data);
      SyncModule.scheduleSave();
      return result;
    };

    // Flush any pending debounced save before the user navigates away
    window.addEventListener('beforeunload', function() {
      SyncModule.saveNow();
    });

    isInitialized = true;
  }


  /**
   * Initialize the dashboard (home view)
   */
  function initializeDashboard() {
    // Update dashboard statistics
    updateDashboardStats();
    // Initialise learning path + checklist
    initLearningPath();
    // Initialise Today's Practice checklist
    initTodaysPractice();
  }

  // ================================================================
  // TIER SYSTEM
  // Tier = minimum score across three dimensions (words, stories, days active).
  // This ensures balanced growth — heavy word learners who never practice
  // speaking stay at a lower tier until they round out their skills.
  // ================================================================

  const TIERS = [
    {
      name: 'Beginner',
      label: 'Beginner',
      description: 'Just getting started',
      color: '#64748b',
      thresholds: { words: 0,  stories: 0,  days: 0  },
      nextThresholds: { words: 5,  stories: 1,  days: 3  }
    },
    {
      name: 'Building',
      label: 'Building',
      description: 'Developing the habit',
      color: '#6366f1',
      thresholds: { words: 5,  stories: 1,  days: 3  },
      nextThresholds: { words: 20, stories: 5,  days: 14 }
    },
    {
      name: 'Intermediate',
      label: 'Intermediate',
      description: 'Consistent and growing',
      color: '#0ea5e9',
      thresholds: { words: 20, stories: 5,  days: 14 },
      nextThresholds: { words: 50, stories: 15, days: 30 }
    },
    {
      name: 'Advanced',
      label: 'Advanced',
      description: 'Speaking with confidence',
      color: '#10b981',
      thresholds: { words: 50, stories: 15, days: 30 },
      nextThresholds: null  // top tier
    }
  ];

  /**
   * Calculate the user's current tier based on their weakest dimension.
   * Returns the full tier object.
   */
  function getTier() {
    if (!userData) return TIERS[0];

    const words  = userData.vocabulary.learned.length;
    const stories = userData.storytelling.totalStories || 0;
    const days   = (userData.stats.activeDates || []).length;

    // Walk tiers from top down — user is in the highest tier where ALL
    // three dimensions meet the minimum threshold
    for (let i = TIERS.length - 1; i >= 0; i--) {
      const t = TIERS[i].thresholds;
      if (words >= t.words && stories >= t.stories && days >= t.days) {
        return TIERS[i];
      }
    }
    return TIERS[0];
  }

  // ================================================================
  // LEARNING PATH STEPPER + TIER BADGE + CHECKLIST + SUGGESTIONS
  // ================================================================

  function initLearningPath() {
    updateLearningPath();
  }

  function updateLearningPath() {
    if (!userData) return;

    const tier           = getTier();
    const words          = userData.vocabulary.learned.length;
    const stories        = userData.storytelling.totalStories || 0;
    const streak         = userData.stats.practiceStreak || userData.dailyWord.currentStreak || 0;
    const days           = (userData.stats.activeDates || []).length;
    const fluencyVisited = (userData.stats.polishSessionsCompleted || 0) >= 1;
    const next           = tier.nextThresholds;

    // --- Tier badge ---
    updateTierBadge(tier);

    // --- Path stepper stats (always live numbers) ---
    const lpLearn    = document.getElementById('lp-stat-learn');
    const lpPractice = document.getElementById('lp-stat-practice');
    const lpReview   = document.getElementById('lp-stat-review');
    if (lpLearn)    lpLearn.textContent    = words + (words === 1 ? ' word learned' : ' words learned');
    if (lpPractice) lpPractice.textContent = stories + (stories === 1 ? ' story completed' : ' stories completed');
    if (lpReview)   lpReview.textContent   = streak + (streak === 1 ? ' day streak' : ' day streak');

    // Stepper "done" thresholds scale with current tier's next targets
    // so returning users always see meaningful progress markers
    const stepDoneAt = next
      ? { learn: next.words, practice: next.stories, days: next.days }
      : { learn: TIERS[TIERS.length - 1].thresholds.words,
          practice: TIERS[TIERS.length - 1].thresholds.stories,
          days: TIERS[TIERS.length - 1].thresholds.days };

    const steps = [
      { id: 'lp-step-learn',    done: words    >= stepDoneAt.learn    },
      { id: 'lp-step-polish',   done: fluencyVisited                  },
      { id: 'lp-step-practice', done: stories  >= stepDoneAt.practice },
      { id: 'lp-step-play',     done: false                           },
      { id: 'lp-step-review',   done: days     >= stepDoneAt.days     }
    ];
    let foundCurrent = false;
    steps.forEach(function(s) {
      const el = document.getElementById(s.id);
      if (!el) return;
      el.classList.remove('lp-step-done', 'lp-step-current', 'lp-step-start-here');
      // Remove any existing "Start here" badge
      const existingBadge = el.querySelector('.lp-start-here-badge');
      if (existingBadge) existingBadge.remove();

      if (s.done) {
        el.classList.add('lp-step-done');
      } else if (!foundCurrent) {
        el.classList.add('lp-step-current');
        foundCurrent = true;
        // Show "Start here" badge until user has visited Learn page
        if (!localStorage.getItem('learnVisited')) {
          el.classList.add('lp-step-start-here');
          const badge = document.createElement('span');
          badge.className = 'lp-start-here-badge';
          badge.textContent = 'Start here';
          el.appendChild(badge);
        }
      }
    });

    // --- Tier-aware checklist (Option A) ---
    updateChecklist(tier, words, stories, days, fluencyVisited);

    // --- This Week calendar ---
    updateThisWeek();

    // --- Hero stat strip ---
    updateHeroStats();
  }

  // ----------------------------------------------------------------
  // TIER BADGE
  // ----------------------------------------------------------------

  function updateTierBadge(tier) {
    const badge = document.getElementById('tier-badge');
    if (!badge) return;
    badge.textContent = tier.label;
    badge.style.background = tier.color;
    badge.title = tier.description;

    // Also update the tier label below the badge if present
    const tierDesc = document.getElementById('tier-description');
    if (tierDesc) tierDesc.textContent = tier.description;
  }

  // ----------------------------------------------------------------
  // TIERED CHECKLIST (Option A)
  // ----------------------------------------------------------------

  // Goals for each tier — what the user needs to do to reach the NEXT tier.
  // At Advanced tier, goals shift to sustaining mastery.
  const TIER_GOALS = {
    Beginner: [
      { key: 'words',   color: '#0284c7', text: 'Learn 5 words',                  link: '/learn',    linkLabel: 'Vocabulary Builder', check: function(w,s,d) { return w >= 5;  }, target: 5,  current: function(w,s,d) { return w; }, unit: 'words' },
      { key: 'polish',  color: '#db2777', text: 'Try a pronunciation drill',       link: '/polish',   linkLabel: 'Polish',             check: function(w,s,d,f) { return f;    } },
      { key: 'stories', color: '#16a34a', text: 'Complete a storytelling prompt',  link: '/practice', linkLabel: 'Practice',           check: function(w,s,d) { return s >= 1;  }, target: 1,  current: function(w,s,d) { return s; }, unit: 'completed' },
      { key: 'days',    color: '#0284c7', text: 'Use the app 3 different days',    link: '/learn',    linkLabel: 'Keep going',         check: function(w,s,d) { return d >= 3;  }, target: 3,  current: function(w,s,d) { return d; }, unit: 'days' }
    ],
    Building: [
      { key: 'words',   color: '#0284c7', text: 'Reach 20 words learned',          link: '/learn',    linkLabel: 'Vocabulary Builder', check: function(w,s,d) { return w >= 20; }, target: 20, current: function(w,s,d) { return w; }, unit: 'words' },
      { key: 'stories', color: '#16a34a', text: 'Complete 5 storytelling prompts', link: '/practice', linkLabel: 'Practice',           check: function(w,s,d) { return s >= 5;  }, target: 5,  current: function(w,s,d) { return s; }, unit: 'completed' },
      { key: 'days',    color: '#0284c7', text: 'Stay active for 14 days',         link: '/learn',    linkLabel: 'Keep going',         check: function(w,s,d) { return d >= 14; }, target: 14, current: function(w,s,d) { return d; }, unit: 'days' },
      { key: 'quiz',    color: '#0284c7', text: 'Pass a Knowledge Check quiz',     link: '/learn',    linkLabel: 'Knowledge Check',    check: function(w,s,d) { return w >= 10; } }
    ],
    Intermediate: [
      { key: 'words',   color: '#0284c7', text: 'Reach 50 words learned',          link: '/learn',    linkLabel: 'Vocabulary Builder', check: function(w,s,d) { return w >= 50; }, target: 50, current: function(w,s,d) { return w; }, unit: 'words' },
      { key: 'stories', color: '#16a34a', text: 'Complete 15 storytelling prompts',link: '/practice', linkLabel: 'Practice',           check: function(w,s,d) { return s >= 15; }, target: 15, current: function(w,s,d) { return s; }, unit: 'completed' },
      { key: 'days',    color: '#0284c7', text: 'Stay active for 30 days',         link: '/learn',    linkLabel: 'Keep going',         check: function(w,s,d) { return d >= 30; }, target: 30, current: function(w,s,d) { return d; }, unit: 'days' },
      { key: 'drill',   color: '#6366f1', text: 'Finish 10 daily drills',          link: '/',         linkLabel: 'Daily Drill',         check: function(w,s,d) { return d >= 10; } }
    ],
    Advanced: [
      { key: 'words',   color: '#0284c7', text: '100 words learned — sustain it',  link: '/learn',    linkLabel: 'Vocabulary Builder', check: function(w,s,d) { return w >= 100; }, target: 100, current: function(w,s,d) { return w; }, unit: 'words' },
      { key: 'stories', color: '#16a34a', text: '30 stories completed',            link: '/practice', linkLabel: 'Practice',           check: function(w,s,d) { return s >= 30;  }, target: 30,  current: function(w,s,d) { return s; }, unit: 'completed' },
      { key: 'days',    color: '#0284c7', text: 'Active on 60+ different days',    link: '/learn',    linkLabel: 'Keep going',         check: function(w,s,d) { return d >= 60;  }, target: 60,  current: function(w,s,d) { return d; }, unit: 'days' }
    ]
  };

  function updateChecklist(tier, words, stories, days, fluencyVisited) {
    const card = document.getElementById('beginner-checklist-card');
    if (!card) return;

    const goals = TIER_GOALS[tier.name];
    if (!goals) { card.style.display = 'none'; return; }

    // Title
    const titleEl = card.querySelector('.bcl-title');
    const subtitleEl = card.querySelector('.bcl-subtitle');
    if (titleEl) {
      titleEl.textContent = tier.name === 'Beginner' ? 'Your First Steps' : 'Your Next Goals';
    }
    if (subtitleEl) {
      subtitleEl.textContent = tier.name === 'Advanced'
        ? 'Sustain your mastery'
        : 'Complete these to reach ' + nextTierName(tier) + ' level';
    }

    // Render list (inside collapsed body)
    const body = card.querySelector('#bcl-body') || card;
    const list = card.querySelector('.bcl-list');
    const completeEl = card.querySelector('.bcl-complete');
    if (!list) return;

    let allDone = true;
    let doneCount = 0;
    list.innerHTML = goals.map(function(g) {
      const done = g.check(words, stories, days, fluencyVisited);
      if (!done) allDone = false;
      else doneCount++;

      var progressHtml = '';
      if (!done && g.target && g.current) {
        var cur = Math.min(g.current(words, stories, days), g.target);
        var pct = Math.round((cur / g.target) * 100);
        progressHtml =
          '<div class="bcl-progress">' +
            '<div class="bcl-progress-header">' +
              '<span class="bcl-progress-label" style="color:' + g.color + '">' + cur + ' / ' + g.target + ' ' + g.unit + '</span>' +
            '</div>' +
            '<div class="bcl-progress-bar-track">' +
              '<div class="bcl-progress-bar-fill" style="width:' + pct + '%;background:' + g.color + '"></div>' +
            '</div>' +
          '</div>';
      }

      return '<li class="bcl-item' + (done ? ' bcl-item-done' : '') + '">' +
        '<span class="bcl-check' + (done ? ' bcl-check-done' : '') + '"></span>' +
        '<div class="bcl-item-body">' +
          '<span class="bcl-text">' + g.text + '</span>' +
          progressHtml +
        '</div>' +
        (done ? '' : '<a href="' + g.link + '" class="bcl-link" style="color:' + g.color + '">' + g.linkLabel + ' &#8594;</a>') +
        '</li>';
    }).join('');

    // Update progress summary in toggle header
    const summaryEl = document.getElementById('bcl-progress-summary');
    if (summaryEl) summaryEl.textContent = doneCount + ' / ' + goals.length + ' complete';

    if (completeEl) {
      if (allDone && tier.name === 'Advanced') {
        card.style.display = 'none';
        return;
      }
      list.style.display     = allDone ? 'none'  : '';
      completeEl.style.display = allDone ? 'block' : 'none';
      if (allDone) {
        completeEl.textContent = tier.name === 'Advanced'
          ? 'Outstanding — you have reached the top tier. Keep it up!'
          : 'All done! You are on track to reach ' + nextTierName(tier) + ' level.';
      }
    }

    card.style.display = '';

    // Wire toggle once
    if (!card._toggleWired) {
      card._toggleWired = true;
      const toggle = document.getElementById('bcl-toggle');
      const bclBody = document.getElementById('bcl-body');
      if (toggle && bclBody) {
        toggle.addEventListener('click', function() {
          const open = !bclBody.hidden;
          bclBody.hidden = open;
          toggle.setAttribute('aria-expanded', String(!open));
          toggle.classList.toggle('bcl-toggle--open', !open);
        });
      }
    }
  }

  function nextTierName(tier) {
    const idx = TIERS.findIndex(function(t) { return t.name === tier.name; });
    return idx < TIERS.length - 1 ? TIERS[idx + 1].name : 'Advanced';
  }

  // ----------------------------------------------------------------
  // THIS WEEK CALENDAR
  // ----------------------------------------------------------------

  function updateThisWeek() {
    const container = document.getElementById('tw-days');
    const goalLabel = document.getElementById('tw-goal-label');
    if (!container) return;

    const activeDates = (userData && userData.stats && userData.stats.activeDates) ? userData.stats.activeDates : [];
    const WEEKLY_GOAL = 5;

    // Build array of this week's dates (Mon–Sun)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    let activeDaysThisWeek = 0;

    container.innerHTML = days.map(function(label, i) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const isToday = iso === today.toISOString().split('T')[0];
      const isFuture = d > today;
      const isActive = activeDates.includes(iso);
      if (isActive) activeDaysThisWeek++;
      var cls = 'tw-day';
      if (isActive) cls += ' tw-day-active';
      else if (isToday) cls += ' tw-day-today';
      else if (isFuture) cls += ' tw-day-future';
      return '<div class="' + cls + '">' +
        '<span class="tw-day-label">' + label + '</span>' +
        '<span class="tw-day-dot"></span>' +
        '</div>';
    }).join('');

    if (goalLabel) {
      var remaining = WEEKLY_GOAL - activeDaysThisWeek;
      if (activeDaysThisWeek >= WEEKLY_GOAL) {
        goalLabel.textContent = 'Weekly goal reached!';
        goalLabel.className = 'tw-goal-label tw-goal-met';
      } else {
        goalLabel.textContent = activeDaysThisWeek + ' / ' + WEEKLY_GOAL + ' days' + (remaining === 1 ? ' — 1 more to go' : '');
        goalLabel.className = 'tw-goal-label';
      }
    }
  }

  // ----------------------------------------------------------------
  // HERO STAT STRIP
  // ----------------------------------------------------------------

  function updateHeroStats() {
    const strip = document.getElementById('hero-stat-strip');
    if (!strip || !userData) return;

    const customLearned = (userData.customWords || []).filter(w => w.status === 'learned').length;
    const words        = (userData.vocabulary.learned.length || 0) + customLearned;
    const streak       = userData.stats.practiceStreak || userData.dailyWord.currentStreak || 0;
    const daysActive   = (userData.stats.activeDates || []).length;
    const isNewUser    = words === 0 && daysActive === 0;

    if (isNewUser) {
      strip.innerHTML =
        '<a href="/learn" class="hss-nudge">Start with Learn to build your vocabulary &rarr;</a>';
    } else {
      strip.innerHTML =
        '<div class="hss-stat hss-stat--streak">' +
          '<svg class="hss-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
          '<span class="hss-value">' + streak + '</span>' +
          '<span class="hss-label">day streak</span>' +
        '</div>' +
        '<div class="hss-stat hss-stat--words">' +
          '<svg class="hss-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
          '<span class="hss-value">' + words + '</span>' +
          '<span class="hss-label">' + (words === 1 ? 'word learned' : 'words learned') + '</span>' +
        '</div>' +
        '<div class="hss-stat hss-stat--days">' +
          '<svg class="hss-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
          '<span class="hss-value">' + daysActive + '</span>' +
          '<span class="hss-label">' + (daysActive === 1 ? 'day active' : 'days active') + '</span>' +
        '</div>';
    }
  }

  // ----------------------------------------------------------------
  // TODAY'S PRACTICE CHECKLIST
  // ----------------------------------------------------------------

  const TP_STORAGE_KEY = 'todaysPractice';
  const TP_TASKS = ['word_of_day', 'srs', 'precision', 'filler', 'speaking'];

  function getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  function loadTPState() {
    try {
      const raw = localStorage.getItem(TP_STORAGE_KEY);
      if (!raw) return { date: getTodayString(), completed: [] };
      const state = JSON.parse(raw);
      // Reset if it's a new day
      if (state.date !== getTodayString()) return { date: getTodayString(), completed: [] };
      return state;
    } catch(e) { return { date: getTodayString(), completed: [] }; }
  }

  function saveTPState(state) {
    localStorage.setItem(TP_STORAGE_KEY, JSON.stringify(state));
  }

  function initTodaysPractice() {
    const container = document.getElementById('todays-practice-card');
    if (!container) return;

    const state = loadTPState();
    const srsCount = getSRSDueCount();

    // Update SRS label to show due count if any
    const srsLabel = document.getElementById('tp-label-srs');
    if (srsLabel) {
      srsLabel.textContent = srsCount > 0
        ? 'Vocab Review (' + srsCount + ' due)'
        : 'Vocab Review';
    }

    // Render check state for each task
    TP_TASKS.forEach(function(task) {
      const check = document.getElementById('tp-check-' + task);
      const item = container.querySelector('[data-task="' + task + '"]');
      if (!check || !item) return;
      const done = state.completed.includes(task);
      check.textContent = done ? '✓' : '';
      check.classList.toggle('tp-check-done', done);
      item.classList.toggle('tp-item-done', done);
    });

    updateTPProgress(state);

    // No manual check clicks — tasks are only marked done by completing the exercise.
  }

  function updateTPProgress(state) {
    const done = state.completed.length;
    const total = TP_TASKS.length;
    const fill = document.getElementById('tp-progress-fill');
    const label = document.getElementById('tp-progress-label');
    const card = document.getElementById('todays-practice-card');
    if (fill) fill.style.width = Math.round((done / total) * 100) + '%';
    if (label) label.textContent = done + ' / ' + total;
    if (card) card.classList.toggle('tp-all-done', done === total);
  }

  // Called from other pages/modules to mark a task complete programmatically
  function markTPTaskDone(taskId) {
    const state = loadTPState();
    if (!state.completed.includes(taskId)) {
      state.completed.push(taskId);
      saveTPState(state);
    }
  }

  function getSRSDueCount() {
    try {
      if (typeof SRSModule !== 'undefined' && SRSModule.getDueCount) {
        return SRSModule.getDueCount();
      }
      // Fallback: read SRS data directly
      const raw = localStorage.getItem('srsData');
      if (!raw) return 0;
      const srs = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      return Object.values(srs).filter(function(w) {
        return w.nextReview && w.nextReview <= today;
      }).length;
    } catch(e) { return 0; }
  }

  /**
   * Update dashboard statistics
   */
  function updateDashboardStats() {
    if (!userData) return;

    // Update vocabulary count
    const vocabCount = document.getElementById('vocab-learned-count');
    if (vocabCount) {
      vocabCount.textContent = userData.vocabulary.totalWordsLearned || 0;
    }

    // Update stories count
    const storiesCount = document.getElementById('stories-completed-count');
    if (storiesCount) {
      storiesCount.textContent = userData.storytelling.totalStories || 0;
    }

    // Update streak count (multi-activity streak)
    const streakCount = document.getElementById('daily-streak-count');
    if (streakCount) {
      streakCount.textContent = userData.stats.practiceStreak || userData.dailyWord.currentStreak || 0;
    }
  }

  /**
   * Initialize progress view
   */
  function initializeProgressView() {
    // If progress is the initial route, the viewChanged event fired before
    // this listener was registered, so we need to render it now.
    // Use requestAnimationFrame to ensure the DOM has been laid out and
    // canvas elements have real pixel dimensions before drawing.
    if (Router.getCurrentRoute() === 'progress') {
      requestAnimationFrame(function() {
        updateProgressView();
        if (typeof ProgressChartsModule !== 'undefined') ProgressChartsModule.refresh();
      });
    }
  }

  /**
   * Update progress view with current data
   */
  function updateProgressView() {
    if (!userData) return;

    // Update overall stats
    updateOverallStats();

    // Update vocabulary progress bars
    updateVocabularyProgress();

    // Update recent activity
    updateRecentActivity();

    // Update achievements
    updateAchievements();
  }

  /**
   * Update overall statistics cards
   */
  function updateOverallStats() {
    const totalWords        = userData.vocabulary.totalWordsLearned || 0;
    const totalStories      = userData.storytelling.totalStories || 0;
    const longestStreak     = userData.stats.longestPracticeStreak || userData.dailyWord.longestStreak || 0;
    const currentStreak     = userData.stats.practiceStreak || userData.dailyWord.currentStreak || 0;
    const totalSessions     = userData.stats.totalSessions || 0;
    const totalDaysActive   = (userData.stats.activeDates || []).length;
    const wordsToday        = StorageManager.getWordsLearnedToday();

    const el = id => document.getElementById(id);

    if (el('total-words-stat'))    el('total-words-stat').textContent    = totalWords;
    if (el('total-stories-stat'))  el('total-stories-stat').textContent  = totalStories;
    if (el('longest-streak-stat')) el('longest-streak-stat').textContent = longestStreak;
    if (el('total-sessions-stat')) el('total-sessions-stat').textContent = totalSessions;
    if (el('words-today-stat'))    el('words-today-stat').textContent    = wordsToday;
    if (el('total-days-active'))   el('total-days-active').textContent   = totalDaysActive;

    const emptyState = el('stats-empty-state');
    if (emptyState) emptyState.style.display = (totalSessions === 0 && totalWords === 0) ? '' : 'none';
  }

  /**
   * Update vocabulary progress bars (new dashboard style)
   */
  function updateVocabularyProgress() {
    const progressBarsContainer = document.getElementById('vocab-progress-bars');
    if (!progressBarsContainer) return;

    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const colors = { beginner: '#34d399', intermediate: '#818cf8', advanced: '#f43f5e' };
    const learned = userData.vocabulary.learned || [];

    let html = '';
    difficulties.forEach(diff => {
      // vocabularyDatabase is keyed by difficulty level
      const words = (vocabularyDatabase[diff] || []);
      const total = words.length;
      const done  = words.filter(w => learned.includes(w.word) || learned.includes(w.word.toLowerCase())).length;
      const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
      const color = colors[diff] || '#818cf8';
      html += `
        <div class="review-vocab-bar-item">
          <div class="review-vocab-bar-row">
            <span class="review-vocab-bar-label">${diff.charAt(0).toUpperCase() + diff.slice(1)}</span>
            <span class="review-vocab-bar-count" style="color:${color}">${done} / ${total}</span>
          </div>
          <div class="review-vocab-bar-bg">
            <div class="review-vocab-bar-fill" style="width:${pct}%; background:${color}"></div>
          </div>
        </div>
      `;
    });

    // Custom words
    const customLearned = (userData.customWords || []).filter(w => w.status === 'learned').length;
    if (customLearned > 0) {
      html += `
        <div class="review-vocab-bar-item">
          <div class="review-vocab-bar-row">
            <span class="review-vocab-bar-label">Custom</span>
            <span class="review-vocab-bar-count" style="color:#e8610a">${customLearned} word${customLearned !== 1 ? 's' : ''}</span>
          </div>
          <div class="review-vocab-bar-bg">
            <div class="review-vocab-bar-fill" style="width:100%; background:#e8610a; opacity:0.6"></div>
          </div>
        </div>
      `;
    }

    progressBarsContainer.innerHTML = html || '<p class="text-secondary">No vocabulary data yet.</p>';
  }

  /**
   * Update recent activity list
   */
  function updateRecentActivity() {
    const activityList = document.getElementById('recent-activity');
    if (!activityList) return;

    const activities = [];

    // Add vocabulary activities
    if (userData.vocabulary.lastLearnedDate) {
      activities.push({
        icon: '📚',
        text: `Learned ${userData.vocabulary.totalWordsLearned} vocabulary words`,
        time: userData.vocabulary.lastLearnedDate
      });
    }

    // Add story activities (last 3)
    const recentStories = userData.storytelling.completedPrompts
      .slice(-3)
      .reverse();

    recentStories.forEach(story => {
      const prompt = getPromptById(story.promptId);
      if (prompt) {
        activities.push({
          icon: '📖',
          text: `Completed story: "${prompt.title}"`,
          time: story.completedAt
        });
      }
    });

    // Add daily word activities
    if (userData.dailyWord.lastCompletedDate) {
      activities.push({
        icon: '✨',
        text: `${userData.stats.practiceStreak || userData.dailyWord.currentStreak || 0} day practice streak`,
        time: userData.dailyWord.lastCompletedDate
      });
    }

    // Sort by time (most recent first)
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Limit to 5 most recent
    const recentActivities = activities.slice(0, 5);

    if (recentActivities.length === 0) {
      activityList.innerHTML = '<p class="text-secondary">No recent activity. Start practicing!</p>';
      return;
    }

    // Generate HTML
    const html = recentActivities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-text">${activity.text}</div>
        <div class="activity-time">${formatDate(activity.time)}</div>
      </div>
    `).join('');

    activityList.innerHTML = html;
  }

  /**
   * Update achievements display
   */
  function updateAchievements() {
    const achievementsGrid = document.getElementById('achievements-grid');
    if (!achievementsGrid) return;

    // Define achievements
    const achievements = [
      {
        icon: '🎯',
        name: 'First Word',
        description: 'Learn your first word',
        unlocked: userData.vocabulary.totalWordsLearned >= 1
      },
      {
        icon: '📚',
        name: 'Word Master',
        description: 'Learn 25 words',
        unlocked: userData.vocabulary.totalWordsLearned >= 25
      },
      {
        icon: '🏆',
        name: 'Vocabulary Expert',
        description: 'Learn 50 words',
        unlocked: userData.vocabulary.totalWordsLearned >= 50
      },
      {
        icon: '📖',
        name: 'Storyteller',
        description: 'Complete your first story',
        unlocked: userData.storytelling.totalStories >= 1
      },
      {
        icon: '✍️',
        name: 'Author',
        description: 'Complete 10 stories',
        unlocked: userData.storytelling.totalStories >= 10
      },
      {
        icon: '🔥',
        name: 'Week Warrior',
        description: '7 day practice streak',
        unlocked: (userData.stats.practiceStreak || userData.dailyWord.currentStreak || 0) >= 7
      },
      {
        icon: '💪',
        name: 'Dedicated',
        description: '30 day practice streak',
        unlocked: (userData.stats.practiceStreak || userData.dailyWord.currentStreak || 0) >= 30
      },
      {
        icon: '⭐',
        name: 'Consistent',
        description: '50 practice sessions',
        unlocked: userData.stats.totalSessions >= 50
      }
    ];

    // Generate HTML (new dashboard card style)
    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const countEl = document.getElementById('achievements-unlocked-count');
    if (countEl) countEl.textContent = unlockedCount + ' / ' + achievements.length + ' unlocked';

    const html = achievements.map(achievement => `
      <div class="review-achievement-card ${achievement.unlocked ? 'unlocked' : ''}">
        ${achievement.unlocked ? '<span class="review-achievement-badge">Earned</span>' : ''}
        <div class="review-achievement-icon">${achievement.icon}</div>
        <div class="review-achievement-name">${achievement.name}</div>
        <div class="review-achievement-desc">${achievement.description}</div>
      </div>
    `).join('');

    achievementsGrid.innerHTML = html;
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    // Compare calendar dates, not timestamps, to avoid hour-based edge cases
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === todayStr) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    }
  }

  /**
   * Handle view changes
   * @param {CustomEvent} event - View change event
   */
  function handleViewChange(event) {
    const viewName = event.detail.viewName;

    // Reload user data
    userData = StorageManager.load();

    // Update views based on which one was navigated to
    switch (viewName) {
      case 'home':
        updateDashboardStats();
        updateLearningPath();
        break;
      case 'progress':
        updateProgressView();
        requestAnimationFrame(function() {
          if (typeof ProgressChartsModule !== 'undefined') ProgressChartsModule.refresh();
        });
        break;
      case 'vocabulary':
        if (typeof SRSModule !== 'undefined') SRSModule.refresh();
        break;
      case 'storytelling':
        break;
      case 'fluency':
        if (typeof FluencyModule !== 'undefined') FluencyModule.refresh();
        break;
    }
  }

  /**
   * Get user data
   * @returns {Object} User data object
   */
  function getUserData() {
    return userData;
  }

  /**
   * Check if app is initialized
   * @returns {boolean} True if initialized
   */
  function getInitialized() {
    return isInitialized;
  }

  // Public API
  return {
    init: init,
    getUserData: getUserData,
    isInitialized: getInitialized,
    markTPTaskDone: markTPTaskDone
  };
})();

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});

// Log that App module is loaded
