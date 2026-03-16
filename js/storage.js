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
        firstVisit: new Date().toISOString()
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

    // Deep merge nested objects
    merged.vocabulary = { ...defaults.vocabulary, ...existing.vocabulary };
    merged.storytelling = { ...defaults.storytelling, ...existing.storytelling };
    merged.dailyWord = { ...defaults.dailyWord, ...existing.dailyWord };
    merged.customWords = existing.customWords || defaults.customWords;
    merged.stats = { ...defaults.stats, ...existing.stats };

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
    getDefaultProgress: getDefaultProgress
  };
})();

// Log that StorageManager is loaded
console.log('StorageManager module loaded successfully');
