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

    // Initialize daily drill
    DailyDrillModule.init();

    // Initialize dashboard
    initializeDashboard();

    // Listen for view changes to update data
    document.addEventListener('viewChanged', handleViewChange);

    // Initialize router last so the initial viewChanged event fires
    // after all modules and listeners are ready
    Router.init();

    // Initialize progress view (handles case where progress is initial route)
    initializeProgressView();

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
        DailyDrillModule.refresh();
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
