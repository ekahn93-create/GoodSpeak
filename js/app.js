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

    // Initialize router
    Router.init();

    // Initialize all feature modules
    VocabularyModule.init();
    StorytellingModule.init();
    DailyWordModule.init();
    MWWordOfDayModule.init();
    WordBankModule.init();
    FluencyModule.init();

    // Initialize dashboard
    initializeDashboard();

    // Initialize progress view
    initializeProgressView();

    // Listen for view changes to update data
    document.addEventListener('viewChanged', handleViewChange);

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

    // Update streak count
    const streakCount = document.getElementById('daily-streak-count');
    if (streakCount) {
      streakCount.textContent = userData.dailyWord.currentStreak || 0;
    }
  }

  /**
   * Initialize progress view
   */
  function initializeProgressView() {
    // This will be called when the progress view is first accessed
    // The actual rendering happens in updateProgressView
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
    // Total words
    const totalWordsElement = document.getElementById('total-words-stat');
    if (totalWordsElement) {
      totalWordsElement.textContent = userData.vocabulary.totalWordsLearned || 0;
    }

    // Total stories
    const totalStoriesElement = document.getElementById('total-stories-stat');
    if (totalStoriesElement) {
      totalStoriesElement.textContent = userData.storytelling.totalStories || 0;
    }

    // Longest streak
    const longestStreakElement = document.getElementById('longest-streak-stat');
    if (longestStreakElement) {
      longestStreakElement.textContent = userData.dailyWord.longestStreak || 0;
    }

    // Total sessions
    const totalSessionsElement = document.getElementById('total-sessions-stat');
    if (totalSessionsElement) {
      totalSessionsElement.textContent = userData.stats.totalSessions || 0;
    }
  }

  /**
   * Update vocabulary progress bars
   */
  function updateVocabularyProgress() {
    const progressBarsContainer = document.getElementById('vocab-progress-bars');
    if (!progressBarsContainer) return;

    // Generate progress bars using ProgressBar component
    const html = ProgressBar.createVocabularyProgress(userData, vocabularyDatabase);
    progressBarsContainer.innerHTML = html;
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
        text: `${userData.dailyWord.currentStreak} day practice streak`,
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
        unlocked: userData.dailyWord.currentStreak >= 7
      },
      {
        icon: '💪',
        name: 'Dedicated',
        description: '30 day practice streak',
        unlocked: userData.dailyWord.currentStreak >= 30
      },
      {
        icon: '⭐',
        name: 'Consistent',
        description: '50 practice sessions',
        unlocked: userData.stats.totalSessions >= 50
      }
    ];

    // Generate HTML
    const html = achievements.map(achievement => `
      <div class="achievement-badge ${achievement.unlocked ? 'unlocked' : ''}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
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
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
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
        break;
      case 'progress':
        updateProgressView();
        break;
      case 'vocabulary':
        // Handled by VocabularyModule
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
