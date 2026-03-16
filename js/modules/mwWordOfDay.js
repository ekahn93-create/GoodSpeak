// ============================================
// WORD OF THE DAY MODULE
// Fetches and displays word of the day using Free Dictionary API
// ============================================

/**
 * WordOfDayModule - Module for fetching and displaying word of the day
 * Uses the Revealing Module Pattern
 */
const MWWordOfDayModule = (function() {
  // DOM elements
  let wordContent = null;

  // Cache
  let cachedWord = null;
  let cacheDate = null;

  /**
   * Initialize the module
   */
  function init() {
    console.log('WordOfDayModule initializing...');

    // Get DOM elements
    wordContent = document.getElementById('mw-word-content');

    // Listen for view changes
    document.addEventListener('viewChanged', function(e) {
      if (e.detail.viewName === 'daily-word' || e.detail.viewName === 'vocabulary') {
        // Don't auto-fetch on vocabulary view change, only when explicitly refreshed
        // This prevents fetching when user is on other vocab tabs
      }
    });

    console.log('WordOfDayModule initialized successfully');
  }

  /**
   * Refresh the word of the day
   */
  function refresh() {
    fetchAndDisplayWord();
  }

  /**
   * Fetch and display the word of the day
   */
  async function fetchAndDisplayWord() {
    if (!wordContent) return;

    // Check cache first (cache for current date only)
    const today = new Date().toDateString();
    if (cachedWord && cacheDate === today) {
      displayWord(cachedWord);
      return;
    }

    // Show loading state
    wordContent.innerHTML = '<div class="loading-spinner">Loading today\'s word...</div>';

    try {
      // Get today's word from the curated list
      const todaysWord = getTodaysWordOfTheDay();

      // Fetch definition from Free Dictionary API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(todaysWord)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch word definition');
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const wordData = parseWordData(data[0], todaysWord);

        // Cache the result
        cachedWord = wordData;
        cacheDate = today;

        // Display the word
        displayWord(wordData);
      } else {
        throw new Error('No definition found');
      }
    } catch (error) {
      console.error('Error fetching word of the day:', error);
      displayError();
    }
  }

  /**
   * Parse word data from API response
   * @param {Object} apiData - The API response data
   * @param {string} word - The word
   * @returns {Object} Parsed word data
   */
  function parseWordData(apiData, word) {
    // Extract pronunciation
    let pronunciation = '';
    if (apiData.phonetic) {
      pronunciation = apiData.phonetic.replace(/[\/\[\]]/g, '');
    } else if (apiData.phonetics && apiData.phonetics.length > 0) {
      const phoneticText = apiData.phonetics[0].text || '';
      pronunciation = phoneticText.replace(/[\/\[\]]/g, '');
    }

    // Extract first meaning
    const firstMeaning = apiData.meanings && apiData.meanings[0];
    const partOfSpeech = firstMeaning?.partOfSpeech || '';
    const definition = firstMeaning?.definitions?.[0]?.definition || '';
    const example = firstMeaning?.definitions?.[0]?.example || '';

    // Extract synonyms
    const synonyms = firstMeaning?.synonyms || [];
    const synonymsList = synonyms.slice(0, 5);

    // Get all definitions for this part of speech
    const allDefinitions = firstMeaning?.definitions || [];
    const secondaryDefinition = allDefinitions[1]?.definition || '';

    return {
      word: word.charAt(0).toUpperCase() + word.slice(1),
      pronunciation,
      partOfSpeech,
      definition,
      secondaryDefinition,
      example,
      synonyms: synonymsList,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  }

  /**
   * Display the word of the day
   * @param {Object} wordData - The word data to display
   */
  function displayWord(wordData) {
    if (!wordContent || !wordData) return;

    const html = `
      <div class="mw-word-main">
        <div class="mw-word-title">${wordData.word}</div>
        ${wordData.pronunciation ? `<div class="mw-word-pronunciation">/${wordData.pronunciation}/</div>` : ''}
        ${wordData.partOfSpeech ? `<div class="mw-word-pos">${wordData.partOfSpeech}</div>` : ''}
      </div>

      ${wordData.definition ? `
        <div class="mw-word-definition">
          <strong>Definition:</strong> ${wordData.definition}
        </div>
      ` : ''}

      ${wordData.secondaryDefinition ? `
        <div class="mw-word-definition" style="margin-top: 0.5rem; font-size: 0.95rem; opacity: 0.9;">
          <strong>Also:</strong> ${wordData.secondaryDefinition}
        </div>
      ` : ''}

      ${wordData.example ? `
        <div class="mw-word-example">
          <strong>Example:</strong> "${wordData.example}"
        </div>
      ` : ''}

      ${wordData.synonyms && wordData.synonyms.length > 0 ? `
        <div class="mw-word-synonyms">
          <strong>Synonyms:</strong> ${wordData.synonyms.join(', ')}
        </div>
      ` : ''}

      <div class="mw-word-actions" style="margin-top: var(--spacing-md); text-align: center;">
        <button class="btn btn-primary" onclick="MWWordOfDayModule.addToWordBank()" data-tooltip="Save this word to your Word Bank">
          Add to Word Bank
        </button>
      </div>

      <div class="mw-word-footer" style="font-size: 0.85rem; color: var(--text-secondary); margin-top: var(--spacing-md);">
        Updated daily • Powered by Free Dictionary API
      </div>
    `;

    wordContent.innerHTML = html;
  }

  /**
   * Add current word to Word Bank
   */
  function addToWordBank() {
    if (!cachedWord) {
      showToast('No word to add', 'error');
      return;
    }

    // Load user data
    const userData = StorageManager.load();
    if (!userData) {
      showToast('Error loading user data', 'error');
      return;
    }

    // Initialize custom words array if needed
    if (!userData.customWords) {
      userData.customWords = [];
    }

    // Check if word already exists
    const existingWord = userData.customWords.find(w =>
      w.word.toLowerCase() === cachedWord.word.toLowerCase()
    );

    if (existingWord) {
      showToast('This word is already in your Word Bank', 'info');
      return;
    }

    // Create custom word object
    const customWord = {
      id: Date.now(),
      word: cachedWord.word,
      pronunciation: cachedWord.pronunciation || '',
      partOfSpeech: cachedWord.partOfSpeech || '',
      definition: cachedWord.definition || '',
      exampleSentence: cachedWord.example || '',
      synonyms: cachedWord.synonyms || [],
      isCustom: true,
      addedDate: new Date().toISOString(),
      source: 'Word of the Day'
    };

    // Add to custom words
    userData.customWords.push(customWord);

    // Save to storage
    if (StorageManager.save(userData)) {
      showToast(`"${cachedWord.word}" added to Word Bank!`, 'success');
    } else {
      showToast('Failed to save word', 'error');
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to show
   * @param {string} type - The type of toast (success, error, info)
   */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, 3000);
  }

  /**
   * Display error message
   */
  function displayError() {
    if (!wordContent) return;

    const html = `
      <div class="mw-word-error">
        <p>Unable to load today's word. Please check your internet connection and try again.</p>
        <p>
          <button class="btn btn-secondary" onclick="MWWordOfDayModule.fetchAndDisplayWord()">
            Retry
          </button>
        </p>
      </div>
    `;

    wordContent.innerHTML = html;
  }

  // Public API
  return {
    init: init,
    fetchAndDisplayWord: fetchAndDisplayWord,
    addToWordBank: addToWordBank,
    refresh: refresh
  };
})();

// Log that WordOfDayModule is loaded
console.log('WordOfDayModule loaded successfully');
