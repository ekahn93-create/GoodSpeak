// ============================================
// STORAGE MANAGER
// Handles all LocalStorage operations for user progress
// ============================================

/**
 * StorageManager - Module for managing LocalStorage
 * Uses the Revealing Module Pattern for clean code organization
 */
const StorageManager = (function() {
  // Private variables
  const STORAGE_KEY = 'articulationAppData';
  const VERSION = '1.0.0';

  /**
   * Default user progress structure
   * This is what gets initialized for new users
   */
  function getDefaultProgress() {
    return {
      version: VERSION,
      userId: generateUserId(),
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),

      vocabulary: {
        learned: [],           // Array of word IDs that have been learned
        stillLearning: [],     // Array of word IDs that are still being learned
        mastered: [],          // Array of word IDs that have been mastered through practice
        currentDifficulty: 'beginner',
        totalWordsLearned: 0,
        streak: 0,
        lastLearnedDate: null
      },

      storytelling: {
        completedPrompts: [],  // Array of {promptId, completedAt, notes}
        drafts: {},            // Object with promptId as key, content as value
        totalStories: 0,
        favoriteTheme: null
      },

      dailyWord: {
        currentStreak: 0,
        longestStreak: 0,
        completedDates: [],    // Array of date strings in YYYY-MM-DD format
        wordsReviewed: [],     // Array of word IDs that have been reviewed
        lastCompletedDate: null
      },

      customWords: [],         // Array of custom words added by the user

      stats: {
        totalSessionTime: 0,   // in seconds
        totalSessions: 0,
        lastSessionDate: null,
        firstVisit: new Date().toISOString(),
        activeDates: [],       // Array of unique YYYY-MM-DD strings (any activity)
        practiceStreak: 0,     // Current multi-activity streak
        longestPracticeStreak: 0,
        wordsLearnedToday: 0,  // Words learned on wordsLearnedDate
        wordsLearnedDate: null,
        speechSessions: [],    // Array of {date, wpm, fillers, ts} — cloud-synced
        vocabHistory: []       // Array of {date, count, ts} — cloud-synced
      }
    };
  }

  /**
   * Generate a unique user ID
   * @returns {string} Unique user identifier
   */
  function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Save data to LocalStorage
   * @param {Object} data - The data object to save
   * @returns {boolean} True if successful, false otherwise
   */
  function save(data) {
    try {
      // Update last visit timestamp
      data.lastVisit = new Date().toISOString();

      // Convert to JSON and save
      const jsonData = JSON.stringify(data);
      localStorage.setItem(STORAGE_KEY, jsonData);

      return true;
    } catch (error) {
      console.error('Error saving to LocalStorage:', error);

      // Check if it's a quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded!');
        // In a production app, you might want to clean up old data here
      }

      return false;
    }
  }

  /**
   * Load data from LocalStorage
   * @returns {Object|null} The loaded data or null if not found
   */
  function load() {
    try {
      const jsonData = localStorage.getItem(STORAGE_KEY);

      if (!jsonData) {
        return null;
      }

      const data = JSON.parse(jsonData);

      // Version checking - handle migrations if needed
      if (data.version !== VERSION) {
        console.log('Data version mismatch. Migrating...');
        // In future versions, handle data migrations here
      }

      return data;
    } catch (error) {
      console.error('Error loading from LocalStorage:', error);
      return null;
    }
  }

  /**
   * Initialize storage - load existing data or create new
   * @returns {Object} User progress data
   */
  function initialize() {
    let data = load();

    if (!data) {
      // No existing data, create new
      console.log('No existing data found. Creating new user profile.');
      data = getDefaultProgress();
      save(data);
    } else {
      console.log('Loaded existing user data.');

      // Ensure all required fields exist (in case of partial data)
      const defaultData = getDefaultProgress();
      data = mergeDefaults(data, defaultData);
      save(data);
    }

    return data;
  }

  /**
   * Merge default values into existing data
   * Ensures all required fields exist
   * @param {Object} existing - Existing user data
   * @param {Object} defaults - Default data structure
   * @returns {Object} Merged data
   */
  function mergeDefaults(existing, defaults) {
    const merged = { ...defaults, ...existing };

    // Preserve original creation timestamp and user ID from existing data
    merged.userId = existing.userId || defaults.userId;
    merged.createdAt = existing.createdAt || defaults.createdAt;

    // Deep merge nested objects
    merged.vocabulary = { ...defaults.vocabulary, ...existing.vocabulary };

    // Ensure stillLearning array exists
    if (!merged.vocabulary.stillLearning) {
      merged.vocabulary.stillLearning = [];
    }

    merged.storytelling = { ...defaults.storytelling, ...existing.storytelling };
    merged.dailyWord = { ...defaults.dailyWord, ...existing.dailyWord };
    merged.customWords = existing.customWords || defaults.customWords;
    merged.stats = { ...defaults.stats, ...existing.stats };

    // Preserve original firstVisit
    merged.stats.firstVisit = (existing.stats && existing.stats.firstVisit) || defaults.stats.firstVisit;

    // Ensure activeDates array exists
    if (!merged.stats.activeDates) merged.stats.activeDates = [];
    if (merged.stats.practiceStreak === undefined) merged.stats.practiceStreak = 0;
    if (merged.stats.longestPracticeStreak === undefined) merged.stats.longestPracticeStreak = 0;
    if (merged.stats.wordsLearnedToday === undefined) merged.stats.wordsLearnedToday = 0;
    if (merged.stats.wordsLearnedDate === undefined) merged.stats.wordsLearnedDate = null;
    if (!merged.stats.speechSessions) merged.stats.speechSessions = [];
    if (!merged.stats.vocabHistory) merged.stats.vocabHistory = [];

    return merged;
  }

  /**
   * Clear all data from LocalStorage
   * USE WITH CAUTION - This deletes all user progress!
   */
  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('LocalStorage cleared.');
      return true;
    } catch (error) {
      console.error('Error clearing LocalStorage:', error);
      return false;
    }
  }

  /**
   * Export data as JSON string for backup
   * @returns {string|null} JSON string of user data
   */
  function exportData() {
    try {
      const data = load();
      if (!data) return null;
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  /**
   * Import data from JSON string
   * @param {string} jsonString - JSON string containing user data
   * @returns {boolean} True if successful
   */
  function importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      // Validate that it has the required structure
      if (!data.version || !data.userId) {
        throw new Error('Invalid data format');
      }

      return save(data);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Update a specific section of the data
   * @param {string} section - Section name (e.g., 'vocabulary', 'storytelling')
   * @param {Object} updates - Object with updates to apply
   * @returns {boolean} True if successful
   */
  function updateSection(section, updates) {
    try {
      const data = load();
      if (!data) {
        console.error('No data found to update');
        return false;
      }

      // Update the section
      data[section] = { ...data[section], ...updates };

      return save(data);
    } catch (error) {
      console.error('Error updating section:', error);
      return false;
    }
  }

  /**
   * Get current user progress data
   * @returns {Object|null} Current user data
   */
  function getData() {
    return load();
  }

  /**
   * Check if LocalStorage is available
   * @returns {boolean} True if available
   */
  function isAvailable() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate today's date string in YYYY-MM-DD format
   * @returns {string} Today's date
   */
  function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Mark today as an active practice day and update multi-activity streak.
   * Call this from any module when a meaningful activity is completed.
   */
  function markActiveToday() {
    try {
      const data = load();
      if (!data) return false;

      const today = getTodayString();

      if (!data.stats.activeDates) data.stats.activeDates = [];
      if (data.stats.activeDates.includes(today)) return true; // already counted today

      data.stats.activeDates.push(today);

      // Compute streak: check if yesterday was active
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.getFullYear() + '-' +
        String(yesterday.getMonth() + 1).padStart(2, '0') + '-' +
        String(yesterday.getDate()).padStart(2, '0');

      if (data.stats.activeDates.includes(yStr)) {
        data.stats.practiceStreak = (data.stats.practiceStreak || 0) + 1;
      } else {
        data.stats.practiceStreak = 1;
      }

      if (data.stats.practiceStreak > (data.stats.longestPracticeStreak || 0)) {
        data.stats.longestPracticeStreak = data.stats.practiceStreak;
      }

      return save(data);
    } catch (error) {
      console.error('Error in markActiveToday:', error);
      return false;
    }
  }

  /**
   * Count how many vocabulary words were learned today.
   * Relies on vocabHistory in localStorage (logged by ProgressChartsModule).
   */
  function incrementWordsLearnedToday() {
    try {
      const data = load();
      if (!data) return false;
      const today = getTodayString();
      if (data.stats.wordsLearnedDate !== today) {
        data.stats.wordsLearnedToday = 0;
        data.stats.wordsLearnedDate = today;
      }
      data.stats.wordsLearnedToday += 1;
      return save(data);
    } catch (e) {
      return false;
    }
  }

  function getWordsLearnedToday() {
    try {
      const data = load();
      if (!data) return 0;
      const today = getTodayString();
      if (data.stats.wordsLearnedDate !== today) return 0;
      return data.stats.wordsLearnedToday || 0;
    } catch (e) {
      return 0;
    }
  }

  /**
   * Update session statistics
   */
  function updateSession() {
    try {
      const data = load();
      if (!data) return false;

      const today = getTodayString();

      // Update session stats
      data.stats.totalSessions += 1;
      data.stats.lastSessionDate = today;

      return save(data);
    } catch (error) {
      console.error('Error updating session:', error);
      return false;
    }
  }

  // Public API - these functions can be called from outside the module
  return {
    initialize: initialize,
    save: save,
    load: load,
    getData: getData,
    clear: clear,
    exportData: exportData,
    importData: importData,
    updateSection: updateSection,
    isAvailable: isAvailable,
    getTodayString: getTodayString,
    updateSession: updateSession,
    markActiveToday: markActiveToday,
    incrementWordsLearnedToday: incrementWordsLearnedToday,
    getWordsLearnedToday: getWordsLearnedToday,
    getDefaultProgress: getDefaultProgress
  };
})();

// Log that StorageManager is loaded
console.log('StorageManager module loaded successfully');
