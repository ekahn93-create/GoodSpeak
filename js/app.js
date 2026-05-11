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
    console.log('Articulation Trainer App initializing...');

    // Check if LocalStorage is available
    if (!StorageManager.isAvailable()) {
      alert('LocalStorage is not available. The app requires LocalStorage to save your progress.');
      return;
    }

    // Initialize or load user data
    userData = StorageManager.initialize();

    // Update session stats
    StorageManager.updateSession();

    // Initialize components
    Modal.init();

    // Show onboarding for new users
    OnboardingModule.init();

    // Initialize all feature modules
    // Note: VocabularyModule.init() restores the saved tab and calls refresh()
    // on whichever sub-module was active, so those modules must be initialized first.
    WordBankModule.init();
    StorytellingModule.init();
    DailyWordModule.init();
    MWWordOfDayModule.init();
    GrammarModule.init();
    FluencyModule.init();
    VocabularyModule.init();
    ReadAloudModule.init();
    SRSModule.init();
    RecordingsModule.init();
    ShadowingModule.init();
    ProgressChartsModule.init();

    // Initialize dashboard
    initializeDashboard();

    // Listen for view changes to update data
    document.addEventListener('viewChanged', handleViewChange);

    // Re-render all modules whenever a cloud sync completes
    document.addEventListener('syncComplete', function() {
      userData = StorageManager.load();
      updateDashboardStats();
      VocabularyModule.refresh();
      WordBankModule.refresh();
    });

    // Initialize router last so the initial viewChanged event fires
    // after all modules and listeners are ready
    Router.init();

    // Initialize progress view (handles case where progress is initial route)
    initializeProgressView();

    // Load remote config then initialize auth
    AppConfig.load().then(() => {
      AuthModule.init(function(event, user) {
        if (event === 'INITIAL_SESSION') {
          // Page load with existing session — pull cloud data then re-render
          SyncModule.onSignIn().then(() => {
            userData = StorageManager.load();
            updateDashboardStats();
            VocabularyModule.refresh();
            WordBankModule.refresh();
          });
        } else if (event === 'SIGNED_IN') {
          // New login via modal — pull cloud data then re-render
          SyncModule.onSignIn().then(() => {
            userData = StorageManager.load();
            updateDashboardStats();
            VocabularyModule.refresh();
            WordBankModule.refresh();
          });
        } else if (event === 'SIGNED_OUT') {
          SyncModule.onSignOut();
          userData = StorageManager.load();
          updateDashboardStats();
          VocabularyModule.refresh();
          WordBankModule.refresh();
        }
      });
    });

    // Hook StorageManager.save to schedule a cloud sync on every local save
    const _originalSave = StorageManager.save;
    StorageManager.save = function(data) {
      const result = _originalSave.call(StorageManager, data);
      SyncModule.scheduleSave();
      return result;
    };

    // Mark as initialized
    isInitialized = true;

    console.log('Articulation Trainer App initialized successfully!');
  }

  /**
   * Initialize the dashboard (home view)
   */
  function initializeDashboard() {
    // Update dashboard statistics
    updateDashboardStats();
    // Initialise learning path + checklist
    initLearningPath();
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
    const fluencyVisited = !!localStorage.getItem('fluency_visited');
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
      { id: 'lp-step-review',   done: days     >= stepDoneAt.days     }
    ];
    let foundCurrent = false;
    steps.forEach(function(s) {
      const el = document.getElementById(s.id);
      if (!el) return;
      el.classList.remove('lp-step-done', 'lp-step-current');
      if (s.done) {
        el.classList.add('lp-step-done');
      } else if (!foundCurrent) {
        el.classList.add('lp-step-current');
        foundCurrent = true;
      }
    });

    // --- Tier-aware checklist (Option A) ---
    updateChecklist(tier, words, stories, days, fluencyVisited);

    // --- Daily suggestions (Option B) ---
    updateSuggestions(tier, words, stories, streak, fluencyVisited);
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
      { key: 'words',   text: 'Learn 5 words',                  link: '#vocabulary',  linkLabel: 'Vocabulary Builder',  check: function(w,s,d) { return w >= 5;  }, target: 5,  current: function(w,s,d) { return w; }, unit: 'words' },
      { key: 'polish',  text: 'Try a pronunciation drill',       link: '#fluency',     linkLabel: 'Polish',              check: function(w,s,d,f) { return f;    } },
      { key: 'stories', text: 'Complete a storytelling prompt',  link: '#storytelling',linkLabel: 'Practice',            check: function(w,s,d) { return s >= 1;  }, target: 1,  current: function(w,s,d) { return s; }, unit: 'completed' },
      { key: 'days',    text: 'Use the app 3 different days',    link: '#vocabulary',  linkLabel: 'Keep going',          check: function(w,s,d) { return d >= 3;  }, target: 3,  current: function(w,s,d) { return d; }, unit: 'days' }
    ],
    Building: [
      { key: 'words',   text: 'Reach 20 words learned',          link: '#vocabulary',  linkLabel: 'Vocabulary Builder',  check: function(w,s,d) { return w >= 20; }, target: 20, current: function(w,s,d) { return w; }, unit: 'words' },
      { key: 'stories', text: 'Complete 5 storytelling prompts', link: '#storytelling',linkLabel: 'Practice',            check: function(w,s,d) { return s >= 5;  }, target: 5,  current: function(w,s,d) { return s; }, unit: 'completed' },
      { key: 'days',    text: 'Stay active for 14 days',         link: '#vocabulary',  linkLabel: 'Keep going',          check: function(w,s,d) { return d >= 14; }, target: 14, current: function(w,s,d) { return d; }, unit: 'days' },
      { key: 'quiz',    text: 'Pass a Knowledge Check quiz',     link: '#vocabulary',  linkLabel: 'Knowledge Check',    check: function(w,s,d) { return w >= 10; } }
    ],
    Intermediate: [
      { key: 'words',   text: 'Reach 50 words learned',          link: '#vocabulary',  linkLabel: 'Vocabulary Builder',  check: function(w,s,d) { return w >= 50; }, target: 50, current: function(w,s,d) { return w; }, unit: 'words' },
      { key: 'stories', text: 'Complete 15 storytelling prompts',link: '#storytelling',linkLabel: 'Practice',            check: function(w,s,d) { return s >= 15; }, target: 15, current: function(w,s,d) { return s; }, unit: 'completed' },
      { key: 'days',    text: 'Stay active for 30 days',         link: '#vocabulary',  linkLabel: 'Keep going',          check: function(w,s,d) { return d >= 30; }, target: 30, current: function(w,s,d) { return d; }, unit: 'days' },
      { key: 'drill',   text: 'Finish 10 daily drills',          link: '#home',        linkLabel: 'Daily Drill',         check: function(w,s,d) { return d >= 10; } }
    ],
    Advanced: [
      { key: 'words',   text: '100 words learned — sustain it',  link: '#vocabulary',  linkLabel: 'Vocabulary Builder',  check: function(w,s,d) { return w >= 100; }, target: 100, current: function(w,s,d) { return w; }, unit: 'words' },
      { key: 'stories', text: '30 stories completed',            link: '#storytelling',linkLabel: 'Practice',            check: function(w,s,d) { return s >= 30;  }, target: 30,  current: function(w,s,d) { return s; }, unit: 'completed' },
      { key: 'days',    text: 'Active on 60+ different days',    link: '#vocabulary',  linkLabel: 'Keep going',          check: function(w,s,d) { return d >= 60;  }, target: 60,  current: function(w,s,d) { return d; }, unit: 'days' }
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

    // Render list
    const list = card.querySelector('.bcl-list');
    const completeEl = card.querySelector('.bcl-complete');
    if (!list) return;

    let allDone = true;
    list.innerHTML = goals.map(function(g) {
      const done = g.check(words, stories, days, fluencyVisited);
      if (!done) allDone = false;

      var progressHtml = '';
      if (!done && g.target && g.current) {
        var cur = Math.min(g.current(words, stories, days), g.target);
        var pct = Math.round((cur / g.target) * 100);
        progressHtml =
          '<div class="bcl-progress">' +
            '<div class="bcl-progress-header">' +
              '<span class="bcl-progress-label">' + cur + ' / ' + g.target + ' ' + g.unit + '</span>' +
            '</div>' +
            '<div class="bcl-progress-bar-track">' +
              '<div class="bcl-progress-bar-fill" style="width:' + pct + '%"></div>' +
            '</div>' +
          '</div>';
      }

      return '<li class="bcl-item' + (done ? ' bcl-item-done' : '') + '">' +
        '<span class="bcl-check' + (done ? ' bcl-check-done' : '') + '"></span>' +
        '<div class="bcl-item-body">' +
          '<span class="bcl-text">' + g.text + '</span>' +
          progressHtml +
        '</div>' +
        (done ? '' : '<a href="' + g.link + '" class="bcl-link">' + g.linkLabel + ' &#8594;</a>') +
        '</li>';
    }).join('');

    if (completeEl) {
      if (allDone && tier.name === 'Advanced') {
        // Top tier complete — hide the whole card
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
  }

  function nextTierName(tier) {
    const idx = TIERS.findIndex(function(t) { return t.name === tier.name; });
    return idx < TIERS.length - 1 ? TIERS[idx + 1].name : 'Advanced';
  }

  // ----------------------------------------------------------------
  // DAILY SUGGESTIONS (Option B)
  // ----------------------------------------------------------------

  function updateSuggestions(tier, words, stories, streak, fluencyVisited) {
    const container = document.getElementById('daily-suggestions');
    if (!container) return;

    const suggestions = [];
    const srsData     = getSRSDueCount();

    // Priority 1 — urgent: SRS reviews due
    if (srsData > 0) {
      suggestions.push({
        icon: '🔁',
        text: srsData + ' word' + (srsData === 1 ? '' : 's') + ' due for review — keep them fresh',
        link: '#vocabulary',
        tab: 'knowledge-check',
        label: 'Start Review'
      });
    }

    // Priority 2 — streak at risk
    const activeDates = userData.stats.activeDates || [];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const doneToday = activeDates.includes(today);
    const activeYesterday = activeDates.includes(yesterday);
    if (!doneToday && streak > 0 && activeYesterday) {
      suggestions.push({
        icon: '🔥',
        text: 'Your ' + streak + '-day streak is at risk — do something today',
        link: '#home',
        tab: null,
        label: 'Do Today\'s Drill'
      });
    }

    // Priority 3 — tier-specific nudges
    if (tier.name === 'Beginner') {
      if (words < 5) {
        suggestions.push({ icon: '📚', text: 'Start with your first words — even one a day adds up', link: '#vocabulary', tab: 'builder', label: 'Learn a Word' });
      }
      if (!fluencyVisited) {
        suggestions.push({ icon: '🎤', text: 'Try a pronunciation drill to build confidence out loud', link: '#fluency', tab: null, label: 'Go to Polish' });
      }
      if (words >= 3 && stories === 0) {
        suggestions.push({ icon: '📖', text: 'You have some words — try putting them into a story', link: '#storytelling', tab: 'storytelling', label: 'Try a Prompt' });
      }
    } else if (tier.name === 'Building') {
      if (words < 20) {
        suggestions.push({ icon: '📚', text: 'Keep building — you need ' + (20 - words) + ' more words to reach Intermediate', link: '#vocabulary', tab: 'builder', label: 'Learn Words' });
      }
      if (stories < 5) {
        suggestions.push({ icon: '📖', text: 'Practice makes permanent — ' + (5 - stories) + ' more stories to reach Intermediate', link: '#storytelling', tab: 'storytelling', label: 'Tell a Story' });
      }
      suggestions.push({ icon: '🎯', text: 'Challenge yourself with a quiz on your word bank', link: '#vocabulary', tab: 'knowledge-check', label: 'Take a Quiz' });
    } else if (tier.name === 'Intermediate') {
      suggestions.push({ icon: '🗣️', text: 'Try Impromptu Speaking — 60 seconds, no preparation', link: '#storytelling', tab: 'practical', label: 'Speak Now' });
      if (words < 50) {
        suggestions.push({ icon: '📚', text: (50 - words) + ' more words to reach Advanced', link: '#vocabulary', tab: 'builder', label: 'Learn Words' });
      }
      suggestions.push({ icon: '👥', text: 'Try shadowing to refine your delivery and rhythm', link: '#fluency', tab: null, label: 'Go to Shadowing' });
    } else if (tier.name === 'Advanced') {
      suggestions.push({ icon: '🏆', text: 'Advanced tier — focus on consistency and nuance', link: '#storytelling', tab: 'storytelling', label: 'New Story' });
      suggestions.push({ icon: '🔁', text: 'Keep your SRS reviews up to maintain long-term retention', link: '#vocabulary', tab: 'knowledge-check', label: 'Review Words' });
      suggestions.push({ icon: '🎙️', text: 'Read Aloud mode builds pace and clarity — try it today', link: '#fluency', tab: null, label: 'Read Aloud' });
    }

    // Cap at 3 suggestions
    const shown = suggestions.slice(0, 3);

    container.innerHTML = shown.map(function(s) {
      const tabAttr = s.tab ? ' data-tab="' + s.tab + '"' : '';
      return '<div class="suggestion-item">' +
        '<span class="suggestion-icon">' + s.icon + '</span>' +
        '<span class="suggestion-text">' + s.text + '</span>' +
        '<a href="' + s.link + '" class="suggestion-link btn btn-sm btn-primary"' + tabAttr + '>' + s.label + '</a>' +
        '</div>';
    }).join('');

    // Wire up tab-switching for suggestion links
    container.querySelectorAll('[data-tab]').forEach(function(link) {
      link.addEventListener('click', function() {
        const tab = this.getAttribute('data-tab');
        const href = this.getAttribute('href').replace('#', '');
        if (tab && href) {
          setTimeout(function() {
            if (href === 'vocabulary' && typeof VocabularyModule !== 'undefined') {
              VocabularyModule.switchVocabCategory(tab);
            } else if (href === 'storytelling') {
              const btn = document.querySelector('.storytelling-category-tab[data-story-category="' + tab + '"]');
              if (btn) btn.click();
            }
          }, 150);
        }
      });
    });
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
        ProgressChartsModule.refresh();
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
      const done  = words.filter(w => learned.includes(w.id)).length;
      const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
      const color = colors[diff] || '#818cf8';
      html += `
        <div class="review-vocab-bar-item">
          <div class="review-vocab-bar-row">
            <span class="review-vocab-bar-label">${diff}</span>
            <span class="review-vocab-bar-count" style="color:${color}">${done} / ${total}</span>
          </div>
          <div class="review-vocab-bar-bg">
            <div class="review-vocab-bar-fill" style="width:${pct}%; background:${color}"></div>
          </div>
        </div>
      `;
    });

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
          ProgressChartsModule.refresh();
        });
        break;
      case 'vocabulary':
        // Handled by VocabularyModule
        SRSModule.refresh();
        break;
      case 'storytelling':
        // Handled by StorytellingModule
        break;
      case 'fluency':
        FluencyModule.refresh();
        localStorage.setItem('fluency_visited', '1');
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
    isInitialized: getInitialized
  };
})();

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, starting Articulation Trainer...');
  App.init();
});

// Log that App module is loaded
console.log('App module loaded successfully');
