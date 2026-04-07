// ============================================
// WORD BANK MODULE
// Handles display of learned words and custom word additions
// ============================================

/**
 * WordBankModule - Module for word bank feature
 * Uses the Revealing Module Pattern
 */
const WordBankModule = (function() {
  // Private variables
  let userData = null;

  // DOM elements
  let addWordForm = null;
  let appLearnedWordsContainer = null;
  let stillLearningWordsContainer = null;
  let customWordsContainer = null;
  let appWordsCountElement = null;
  let stillLearningCountElement = null;
  let customWordsCountElement = null;
  let lookupButton = null;
  let lookupStatus = null;

  // Quiz elements
  let quizStartScreen = null;
  let quizActiveScreen = null;
  let quizResultsScreen = null;
  let quizTotalWordsElement = null;
  let startQuizBtn = null;
  let quizQuestionElement = null;
  let quizOptionsElement = null;
  let quizProgressElement = null;
  let quizScoreElement = null;
  let quizCurrentElement = null;
  let quizTotalElement = null;
  let nextQuestionBtn = null;
  let quitQuizBtn = null;
  let finalScoreElement = null;
  let finalPercentageElement = null;
  let retryQuizBtn = null;
  let doneQuizBtn = null;

  // Quiz state
  let quizWords = [];
  let currentQuestionIndex = 0;
  let quizScore = 0;
  let selectedAnswer = null;
  let quizResults = [];

  // Review elements
  let reviewQuizBtn = null;
  let quizReview = null;
  let quizReviewList = null;

  /**
   * Initialize the word bank module
   */
  function init() {
    console.log('WordBankModule initializing...');

    // Get DOM elements
    addWordForm = document.getElementById('add-custom-word-form');
    appLearnedWordsContainer = document.getElementById('app-learned-words');
    stillLearningWordsContainer = document.getElementById('still-learning-words');
    customWordsContainer = document.getElementById('custom-words-list');
    appWordsCountElement = document.getElementById('app-words-count');
    stillLearningCountElement = document.getElementById('still-learning-words-count');
    customWordsCountElement = document.getElementById('custom-words-count');
    lookupButton = document.getElementById('lookup-word-btn');
    lookupStatus = document.getElementById('lookup-status');

    // Get quiz DOM elements
    quizStartScreen = document.getElementById('quiz-start-screen');
    quizActiveScreen = document.getElementById('quiz-active-screen');
    quizResultsScreen = document.getElementById('quiz-results-screen');
    quizTotalWordsElement = document.getElementById('quiz-total-words');
    startQuizBtn = document.getElementById('start-quiz-btn');
    quizQuestionElement = document.getElementById('quiz-question');
    quizOptionsElement = document.getElementById('quiz-options');
    quizProgressElement = document.getElementById('quiz-progress');
    quizScoreElement = document.getElementById('quiz-score');
    quizCurrentElement = document.getElementById('quiz-current');
    quizTotalElement = document.getElementById('quiz-total');
    nextQuestionBtn = document.getElementById('quiz-next-btn');
    quitQuizBtn = document.getElementById('quit-quiz-btn');
    finalScoreElement = document.getElementById('final-score');
    finalPercentageElement = document.getElementById('final-percentage');
    retryQuizBtn = document.getElementById('retry-quiz-btn');
    doneQuizBtn = document.getElementById('done-quiz-btn');
    reviewQuizBtn = document.getElementById('review-quiz-btn');
    quizReview = document.getElementById('quiz-review');
    quizReviewList = document.getElementById('quiz-review-list');

    // Load user data
    userData = StorageManager.load();

    if (!userData) {
      console.error('No user data found');
      return;
    }

    // Initialize custom words array if it doesn't exist
    if (!userData.customWords) {
      userData.customWords = [];
      StorageManager.save(userData);
    }

    // Set up event listeners
    setupEventListeners();

    // Check if we're already on the word-bank view on page load
    const currentHash = window.location.hash.replace('#', '');
    if (currentHash === 'word-bank') {
      console.log('Word Bank view active on init, loading data...');
      // Give scripts time to load, then refresh
      setTimeout(() => refresh(), 250);
    }

    console.log('WordBankModule initialized successfully');
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Add to Word Bank button (click only — Enter key does not submit)
    const addWordBtn = document.getElementById('add-word-btn');
    if (addWordBtn) {
      addWordBtn.addEventListener('click', handleAddCustomWord);
    }

    // Lookup button
    if (lookupButton) {
      lookupButton.addEventListener('click', handleLookupWord);
    }

    // Enter key in the word input triggers lookup, not form submit
    const customWordInput = document.getElementById('custom-word');
    if (customWordInput) {
      customWordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleLookupWord();
        }
      });
    }

    // Quiz event listeners
    if (startQuizBtn) {
      startQuizBtn.addEventListener('click', startQuiz);
    }

    if (nextQuestionBtn) {
      nextQuestionBtn.addEventListener('click', nextQuestion);
    }

    if (quitQuizBtn) {
      quitQuizBtn.addEventListener('click', quitQuiz);
    }

    if (retryQuizBtn) {
      retryQuizBtn.addEventListener('click', startQuiz);
    }

    if (doneQuizBtn) {
      doneQuizBtn.addEventListener('click', exitQuiz);
    }

    if (reviewQuizBtn) {
      reviewQuizBtn.addEventListener('click', toggleReview);
    }

    // Listen for view changes
    document.addEventListener('viewChanged', function(e) {
      if (e.detail.viewName === 'word-bank') {
        refresh();
      }
    });
  }

  /**
   * Convert IPA phonetic notation to more readable English-like pronunciation
   * @param {string} ipa - IPA phonetic string
   * @returns {string} Simplified pronunciation guide
   */
  function convertIPAToReadable(ipa) {
    if (!ipa) return '';

    let readable = ipa.replace(/[\/\[\]]/g, '');
    readable = readable.replace(/\./g, '-');
    readable = readable.replace(/\(([^)]+)\)/g, '$1');

    const conversions = {
      'ɛ': 'e',
      'ɪ': 'i',
      'ə': 'uh',
      'ʌ': 'u',
      'ɔ': 'o',
      'æ': 'a',
      'ʊ': 'oo',
      'ɑ': 'ah',
      'ɜ': 'er',
      'ɒ': 'o',
      'ː': '',
      'θ': 'th',
      'ð': 'th',
      'ʃ': 'sh',
      'ʒ': 'zh',
      'ŋ': 'ng',
      'ɹ': 'r',
      'j': 'y',
    };

    for (const [ipaChar, replacement] of Object.entries(conversions)) {
      readable = readable.split(ipaChar).join(replacement);
    }

    readable = readable.replace(/ˈ([a-z])/g, (match, letter) => letter.toUpperCase());
    readable = readable.replace(/[ˈˌ]/g, '');
    readable = readable.replace(/--+/g, '-').replace(/^-|-$/g, '');

    return readable;
  }

  /**
   * Handle dictionary lookup
   */
  async function handleLookupWord() {
    const wordInput = document.getElementById('custom-word');
    const word = wordInput.value.trim().toLowerCase();

    if (!word) {
      showLookupStatus('Please enter a word first', 'error');
      return;
    }

    // Show loading state
    lookupButton.disabled = true;
    lookupButton.textContent = 'Looking up...';
    showLookupStatus('Fetching definition...', 'info');

    try {
      // Use APIService for caching and consistent error handling
      if (typeof APIService !== 'undefined') {
        const wordData = await APIService.getWordDefinition(word);

        if (wordData) {
          // Populate form fields
          if (wordData.phonetic) {
            document.getElementById('custom-pronunciation').value = convertIPAToReadable(wordData.phonetic);
          }

          if (wordData.partOfSpeech) {
            const posSelect = document.getElementById('custom-part-of-speech');
            const normalizedPos = wordData.partOfSpeech.toLowerCase();
            if (['noun', 'verb', 'adjective', 'adverb'].includes(normalizedPos)) {
              posSelect.value = normalizedPos;
            } else {
              posSelect.value = 'other';
            }
          }

          if (wordData.definition) {
            document.getElementById('custom-definition').value = wordData.definition;
          }

          if (wordData.example) {
            document.getElementById('custom-example').value = wordData.example;
          }

          if (wordData.synonyms && wordData.synonyms.length > 0) {
            document.getElementById('custom-synonyms').value = wordData.synonyms.slice(0, 5).join(', ');
          }

          showLookupStatus('✓ Definition loaded! You can edit any fields before adding.', 'success');
        } else {
          showLookupStatus('Word not found in dictionary. You can still add it manually.', 'warning');
        }
      } else {
        // Fallback to direct API call if APIService not loaded
        throw new Error('APIService not available');
      }
    } catch (error) {
      console.error('Dictionary lookup error:', error);
      showLookupStatus('Unable to fetch definition. You can still add the word manually.', 'error');
    } finally {
      lookupButton.disabled = false;
      lookupButton.textContent = 'Look Up';
    }
  }

  /**
   * Show lookup status message
   * @param {string} message - Status message
   * @param {string} type - Message type (info, success, warning, error)
   */
  function showLookupStatus(message, type) {
    if (!lookupStatus) return;

    const icons = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      error: '✗'
    };

    const colors = {
      info: '#4A90E2',
      success: '#50C878',
      warning: '#FFA500',
      error: '#FF6B6B'
    };

    lookupStatus.innerHTML = `
      <span style="color: ${colors[type]};">
        ${icons[type]} ${message}
      </span>
    `;

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (lookupStatus) {
          lookupStatus.innerHTML = '';
        }
      }, 5000);
    }
  }

  /**
   * Handle add custom word form submission
   * @param {Event} e - Form submit event
   */
  function handleAddCustomWord() {

    // Get form values
    const word = document.getElementById('custom-word').value.trim();
    const pronunciation = document.getElementById('custom-pronunciation').value.trim();
    const partOfSpeech = document.getElementById('custom-part-of-speech').value;
    const definition = document.getElementById('custom-definition').value.trim();
    const example = document.getElementById('custom-example').value.trim();
    const synonymsInput = document.getElementById('custom-synonyms').value.trim();
    const synonyms = synonymsInput ? synonymsInput.split(',').map(s => s.trim()).filter(s => s) : [];

    // Validate required fields
    if (!word) {
      showToast('Word is required', 'error');
      return;
    }

    // Create custom word object
    const customWord = {
      id: Date.now(), // Use timestamp as unique ID
      word: word,
      pronunciation: pronunciation || '',
      partOfSpeech: partOfSpeech || 'other',
      definition: definition || '',
      exampleSentence: example || '',
      synonyms: synonyms,
      isCustom: true,
      addedDate: new Date().toISOString()
    };

    // Add to user data
    if (!userData.customWords) {
      userData.customWords = [];
    }
    userData.customWords.push(customWord);

    // Save to storage
    if (StorageManager.save(userData)) {
      showToast('Word added to your Word Bank!', 'success');

      // Clear form
      addWordForm.reset();

      // Refresh display
      displayCustomWords();
      updateCounts();
    } else {
      showToast('Failed to save word', 'error');
    }
  }

  /**
   * Display app learned words
   */
  function displayAppLearnedWords(sortBy) {
    if (!appLearnedWordsContainer || !userData) return;

    const learnedWords = userData.vocabulary.learned;

    if (learnedWords.length === 0) {
      appLearnedWordsContainer.innerHTML = '<p class="text-secondary">No words learned yet. Visit the Vocabulary Builder to start learning!</p>';
      return;
    }

    // Check if vocabularyDatabase is available and properly loaded
    if (typeof vocabularyDatabase === 'undefined' || !vocabularyDatabase.beginner) {
      console.warn('vocabularyDatabase not available in displayAppLearnedWords');
      appLearnedWordsContainer.innerHTML = '<p class="text-secondary">Loading vocabulary database...</p>';
      return;
    }

    // Get word objects for learned word IDs
    const allWords = [
      ...vocabularyDatabase.beginner,
      ...vocabularyDatabase.intermediate,
      ...vocabularyDatabase.advanced
    ];

    const learnedWordObjects = learnedWords.map(id => {
      return allWords.find(w => w.id === id);
    }).filter(w => w !== undefined);

    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const currentSort = sortBy || (document.getElementById('app-learned-sort') ? document.getElementById('app-learned-sort').value : 'alpha');
    if (currentSort === 'difficulty') {
      learnedWordObjects.sort((a, b) => (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99) || a.word.localeCompare(b.word));
    } else {
      learnedWordObjects.sort((a, b) => a.word.localeCompare(b.word));
    }

    // Display as detailed cards
    const html = learnedWordObjects.map(word => `
      <div class="word-bank-card" onclick="WordBankModule.showWordDetail(${word.id}, false)">
        <div class="word-bank-card-header">
          <div class="word-bank-word">${word.word}</div>
          <span class="badge badge-primary">${word.partOfSpeech}</span>
        </div>
        <div class="word-bank-pronunciation">${word.pronunciation}</div>
        <div class="word-bank-definition">${truncateText(word.definition, 80)}</div>
      </div>
    `).join('');

    appLearnedWordsContainer.innerHTML = html;
  }

  /**
   * Display still learning words
   */
  function displayStillLearningWords(sortBy) {
    if (!stillLearningWordsContainer || !userData) return;

    const stillLearningWords = userData.vocabulary.stillLearning || [];

    if (stillLearningWords.length === 0) {
      stillLearningWordsContainer.innerHTML = '<p class="text-secondary">No words in Still Learning yet. Visit the Vocabulary Builder to add words!</p>';
      return;
    }

    // Check if vocabularyDatabase is available and properly loaded
    if (typeof vocabularyDatabase === 'undefined' || !vocabularyDatabase.beginner) {
      console.warn('vocabularyDatabase not available in displayStillLearningWords');
      stillLearningWordsContainer.innerHTML = '<p class="text-secondary">Loading vocabulary database...</p>';
      return;
    }

    // Get word objects for still learning word IDs
    const allWords = [
      ...vocabularyDatabase.beginner,
      ...vocabularyDatabase.intermediate,
      ...vocabularyDatabase.advanced
    ];

    const stillLearningWordObjects = stillLearningWords.map(id => {
      return allWords.find(w => w.id === id);
    }).filter(w => w !== undefined);

    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const currentSort = sortBy || (document.getElementById('still-learning-sort') ? document.getElementById('still-learning-sort').value : 'alpha');
    if (currentSort === 'difficulty') {
      stillLearningWordObjects.sort((a, b) => (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99) || a.word.localeCompare(b.word));
    } else {
      stillLearningWordObjects.sort((a, b) => a.word.localeCompare(b.word));
    }

    // Display as detailed cards
    const html = stillLearningWordObjects.map(word => `
      <div class="word-bank-card" onclick="WordBankModule.showStillLearningWordDetail(${word.id})">
        <div class="word-bank-card-header">
          <div class="word-bank-word">${word.word}</div>
          ${word.partOfSpeech ? `<span class="badge badge-primary">${word.partOfSpeech}</span>` : ''}
        </div>
        <div class="word-bank-pronunciation">${word.pronunciation}</div>
        <div class="word-bank-definition">${truncateText(word.definition, 80)}</div>
      </div>
    `).join('');

    stillLearningWordsContainer.innerHTML = html;
  }

  /**
   * Display custom words
   */
  function displayCustomWords(sortBy) {
    if (!customWordsContainer || !userData) return;

    const customWords = [...(userData.customWords || [])];

    if (customWords.length === 0) {
      customWordsContainer.innerHTML = '<p class="text-secondary">No custom words yet. Use the form above to add words you\'ve learned elsewhere!</p>';
      return;
    }

    const currentSort = sortBy || (document.getElementById('custom-words-sort') ? document.getElementById('custom-words-sort').value : 'date');
    if (currentSort === 'alpha') {
      customWords.sort((a, b) => a.word.localeCompare(b.word));
    } else {
      // date: newest first
      customWords.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
    }

    // Display as detailed cards with delete option
    const html = customWords.map(word => `
      <div class="word-bank-card custom-word-card" onclick="WordBankModule.showWordDetail(${word.id}, true)">
        <div class="word-bank-card-header">
          <div class="word-bank-word">${word.word}</div>
          <div>
            ${word.partOfSpeech ? `<span class="badge badge-secondary">${word.partOfSpeech}</span>` : ''}
            <button class="btn-icon" onclick="event.stopPropagation(); WordBankModule.deleteCustomWord(${word.id})" title="Delete word">
              ✕
            </button>
          </div>
        </div>
        ${word.pronunciation ? `<div class="word-bank-pronunciation">${word.pronunciation}</div>` : ''}
        ${word.definition ? `<div class="word-bank-definition">${truncateText(word.definition, 80)}</div>` : ''}
      </div>
    `).join('');

    customWordsContainer.innerHTML = html;
  }

  /**
   * Show word detail in a modal
   * @param {number} wordId - The word ID
   * @param {boolean} isCustom - Whether it's a custom word
   */
  function showWordDetail(wordId, isCustom) {
    let word;

    if (isCustom) {
      word = userData.customWords.find(w => w.id === wordId);
    } else {
      // Check if vocabularyDatabase is available and properly loaded
      if (typeof vocabularyDatabase === 'undefined' || !vocabularyDatabase.beginner) {
        console.error('vocabularyDatabase not available');
        showToast('Unable to load word details', 'error');
        return;
      }

      const allWords = [
        ...vocabularyDatabase.beginner,
        ...vocabularyDatabase.intermediate,
        ...vocabularyDatabase.advanced
      ];
      word = allWords.find(w => w.id === wordId);
    }

    if (!word) return;

    const content = `
      <div class="word-card">
        <div class="word-main">${word.word}</div>
        ${word.pronunciation ? `<div class="word-pronunciation">${word.pronunciation}</div>` : ''}
        <div class="word-meta">
          ${word.partOfSpeech ? `<span class="badge badge-primary">${word.partOfSpeech}</span>` : ''}
          ${isCustom ? '<span class="badge badge-secondary">Custom</span>' : `<span class="badge badge-secondary">${word.difficulty}</span>`}
        </div>
        ${word.definition ? `
          <div class="word-definition">
            <strong>Definition:</strong> ${word.definition}
          </div>
        ` : ''}
        ${word.exampleSentence ? `
          <div class="word-example">
            <strong>Example:</strong> "${word.exampleSentence}"
          </div>
        ` : ''}
        ${word.synonyms && word.synonyms.length > 0 ? `
          <div class="word-synonyms">
            <strong>Synonyms:</strong> ${word.synonyms.join(', ')}
          </div>
        ` : ''}
        ${isCustom ? `
          <div class="word-meta" style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
            Added: ${new Date(word.addedDate).toLocaleDateString()}
          </div>
        ` : ''}
        ${!isCustom ? `
          <div class="action-buttons" style="margin-top: 1rem;">
            <button class="btn btn-secondary" onclick="WordBankModule.moveWordToStillLearning(${wordId})">
              Move to Still Learning
            </button>
          </div>
        ` : ''}
      </div>
    `;

    Modal.show(content);
  }

  /**
   * Show still learning word detail in a modal
   * @param {number} wordId - The word ID
   */
  function showStillLearningWordDetail(wordId) {
    // Check if vocabularyDatabase is available and properly loaded
    if (typeof vocabularyDatabase === 'undefined' || !vocabularyDatabase.beginner) {
      console.error('vocabularyDatabase not available');
      showToast('Unable to load word details', 'error');
      return;
    }

    const allWords = [
      ...vocabularyDatabase.beginner,
      ...vocabularyDatabase.intermediate,
      ...vocabularyDatabase.advanced
    ];
    const word = allWords.find(w => w.id === wordId);

    if (!word) return;

    const content = `
      <div class="word-card">
        <div class="word-main">${word.word}</div>
        <div class="word-pronunciation">${word.pronunciation}</div>
        <div class="word-meta">
          <span class="badge badge-primary">${word.partOfSpeech}</span>
          <span class="badge badge-secondary">${word.difficulty}</span>
          <span class="badge badge-warning">Still Learning</span>
        </div>
        <div class="word-definition">
          <strong>Definition:</strong> ${word.definition}
        </div>
        <div class="word-example">
          <strong>Example:</strong> "${word.exampleSentence}"
        </div>
        <div class="word-synonyms">
          <strong>Synonyms:</strong> ${word.synonyms.join(', ')}
        </div>
        <div class="action-buttons" style="margin-top: 1rem;">
          <button class="btn btn-success" onclick="WordBankModule.moveWordToLearned(${wordId})">
            Move to Learned Words
          </button>
        </div>
      </div>
    `;

    Modal.show(content);
  }

  /**
   * Move a word from still learning to learned
   * @param {number} wordId - The word ID to move
   */
  function moveWordToLearned(wordId) {
    if (!userData) return;

    // Remove from still learning
    const stillLearningIndex = userData.vocabulary.stillLearning.indexOf(wordId);
    if (stillLearningIndex > -1) {
      userData.vocabulary.stillLearning.splice(stillLearningIndex, 1);
    }

    // Add to learned if not already there
    if (!userData.vocabulary.learned.includes(wordId)) {
      userData.vocabulary.learned.push(wordId);
      userData.vocabulary.totalWordsLearned = userData.vocabulary.learned.length;
      userData.vocabulary.lastLearnedDate = StorageManager.getTodayString();
    }

    // Save to storage
    if (StorageManager.save(userData)) {
      showToast('Word moved to Learned Words!', 'success');

      // Update displays
      displayAppLearnedWords();
      displayStillLearningWords();
      updateCounts();

      // Close modal
      Modal.hide();

      // Notify vocabulary module if available
      if (typeof VocabularyModule !== 'undefined' && VocabularyModule.refresh) {
        VocabularyModule.refresh();
      }
    } else {
      showToast('Failed to save progress', 'error');
    }
  }

  /**
   * Move a word from learned to still learning
   * @param {number} wordId - The word ID to move
   */
  function moveWordToStillLearning(wordId) {
    if (!userData) return;

    // Remove from learned
    const learnedIndex = userData.vocabulary.learned.indexOf(wordId);
    if (learnedIndex > -1) {
      userData.vocabulary.learned.splice(learnedIndex, 1);
      userData.vocabulary.totalWordsLearned = userData.vocabulary.learned.length;
    }

    // Add to still learning if not already there
    if (!userData.vocabulary.stillLearning.includes(wordId)) {
      userData.vocabulary.stillLearning.push(wordId);
    }

    // Save to storage
    if (StorageManager.save(userData)) {
      showToast('Word moved to Still Learning!', 'success');

      // Update displays
      displayAppLearnedWords();
      displayStillLearningWords();
      updateCounts();

      // Close modal
      Modal.hide();

      // Notify vocabulary module if available
      if (typeof VocabularyModule !== 'undefined' && VocabularyModule.refresh) {
        VocabularyModule.refresh();
      }
    } else {
      showToast('Failed to save progress', 'error');
    }
  }

  /**
   * Delete a custom word
   * @param {number} wordId - The word ID to delete
   */
  function deleteCustomWord(wordId) {
    if (!userData || !userData.customWords) return;

    const word = userData.customWords.find(w => w.id === wordId);
    if (!word) return;

    Modal.confirm({
      title: 'Delete Word',
      message: `Are you sure you want to delete "${word.word}" from your Word Bank?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        // Remove from array
        userData.customWords = userData.customWords.filter(w => w.id !== wordId);

        // Save
        if (StorageManager.save(userData)) {
          showToast('Word deleted', 'success');
          displayCustomWords();
          updateCounts();
        } else {
          showToast('Failed to delete word', 'error');
        }
      }
    });
  }

  /**
   * Update counts display
   */
  function updateCounts() {
    if (appWordsCountElement && userData) {
      appWordsCountElement.textContent = userData.vocabulary.learned.length;
    }

    if (stillLearningCountElement && userData) {
      const stillLearningCount = userData.vocabulary.stillLearning ? userData.vocabulary.stillLearning.length : 0;
      stillLearningCountElement.textContent = stillLearningCount;
    }

    if (customWordsCountElement && userData) {
      customWordsCountElement.textContent = userData.customWords ? userData.customWords.length : 0;
    }
  }

  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
   * Get all words available for quiz (learned + custom)
   * @returns {Array} Array of word objects
   */
  function getAllQuizWords() {
    if (!userData) return [];

    const words = [];

    // Check if vocabularyDatabase is available and properly loaded
    if (typeof vocabularyDatabase === 'undefined' || !vocabularyDatabase.beginner) {
      console.warn('vocabularyDatabase not available');
      // Only return custom words if database isn't loaded
      const customWords = userData.customWords || [];
      customWords.forEach(word => {
        if (word.definition) {
          words.push(word);
        }
      });
      return words;
    }

    // Get learned words from vocabulary builder
    const learnedWords = userData.vocabulary.learned || [];
    const allWords = [
      ...vocabularyDatabase.beginner,
      ...vocabularyDatabase.intermediate,
      ...vocabularyDatabase.advanced
    ];

    learnedWords.forEach(id => {
      const word = allWords.find(w => w.id === id);
      if (word) {
        words.push(word);
      }
    });

    // Add custom words
    const customWords = userData.customWords || [];
    customWords.forEach(word => {
      // Only include custom words that have a definition
      if (word.definition) {
        words.push(word);
      }
    });

    return words;
  }

  /**
   * Start the quiz
   */
  function startQuiz() {
    // Get all available words
    let allWords = getAllQuizWords();

    // Filter based on word source selection
    const quizSourceSelect = document.getElementById('quiz-source');
    const selectedSource = quizSourceSelect ? quizSourceSelect.value : 'all';

    if (selectedSource === 'stillLearning') {
      // Only include still learning words
      const stillLearningIds = userData.vocabulary.stillLearning || [];
      const dbWords = [
        ...vocabularyDatabase.beginner,
        ...vocabularyDatabase.intermediate,
        ...vocabularyDatabase.advanced
      ];
      allWords = stillLearningIds.map(id => dbWords.find(w => w.id === id)).filter(w => w !== undefined);
    } else if (selectedSource === 'learned') {
      // Only include words from vocabulary builder (have numeric IDs from database)
      allWords = allWords.filter(word => typeof word.id === 'number' && word.id < 1000000);
    } else if (selectedSource === 'custom') {
      // Only include custom words (have large timestamp-based IDs or isCustom flag)
      allWords = allWords.filter(word => word.isCustom === true || word.id >= 1000000);
    }
    // If 'all', no filtering needed

    if (allWords.length < 4) {
      showToast('You need at least 4 words to start a quiz', 'warning');
      return;
    }

    // Shuffle all words first
    allWords = shuffleArray(allWords);

    // Get selected quiz length
    const quizLengthSelect = document.getElementById('quiz-length');
    const selectedLength = quizLengthSelect ? quizLengthSelect.value : '10';

    // Limit words based on selection
    if (selectedLength === 'all') {
      quizWords = allWords;
    } else {
      const numQuestions = parseInt(selectedLength, 10);
      quizWords = allWords.slice(0, Math.min(numQuestions, allWords.length));
    }

    // Check minimum after slicing
    if (quizWords.length < 4) {
      showToast('You need at least 4 words to start a quiz', 'warning');
      return;
    }

    // Reset quiz state
    currentQuestionIndex = 0;
    quizScore = 0;
    selectedAnswer = null;
    quizResults = [];

    // Show active screen
    if (quizStartScreen) quizStartScreen.style.display = 'none';
    if (quizResultsScreen) quizResultsScreen.style.display = 'none';
    if (quizActiveScreen) quizActiveScreen.style.display = 'block';

    // Show first question
    showQuestion();
  }

  /**
   * Display the current question
   */
  function showQuestion() {
    if (currentQuestionIndex >= quizWords.length) {
      showResults();
      return;
    }

    const currentWord = quizWords[currentQuestionIndex];
    selectedAnswer = null;

    // Update question text
    if (quizQuestionElement) {
      quizQuestionElement.textContent = `What is the definition of "${currentWord.word}"?`;
    }

    // Generate multiple choice options
    const options = generateOptions(currentWord);

    // Display options
    if (quizOptionsElement) {
      quizOptionsElement.innerHTML = options.map((option, index) => `
        <button class="quiz-option" data-index="${index}" data-correct="${option.isCorrect}">
          ${option.text}
        </button>
      `).join('');

      // Add click listeners to options
      const optionButtons = quizOptionsElement.querySelectorAll('.quiz-option');
      optionButtons.forEach(button => {
        button.addEventListener('click', function() {
          selectOption(this);
        });
      });
    }

    // Update progress
    if (quizCurrentElement) {
      quizCurrentElement.textContent = currentQuestionIndex + 1;
    }
    if (quizTotalElement) {
      quizTotalElement.textContent = quizWords.length;
    }
    if (quizProgressElement) {
      const percentage = ((currentQuestionIndex) / quizWords.length) * 100;
      quizProgressElement.style.width = `${percentage}%`;
    }

    // Update score display
    if (quizScoreElement) {
      quizScoreElement.textContent = quizScore;
    }

    // Hide next button initially
    if (nextQuestionBtn) {
      nextQuestionBtn.style.display = 'none';
      nextQuestionBtn.disabled = true;
    }
  }

  /**
   * Generate multiple choice options
   * @param {Object} correctWord - The correct word object
   * @returns {Array} Array of option objects
   */
  function generateOptions(correctWord) {
    const options = [
      { text: correctWord.definition, isCorrect: true }
    ];

    // Build the largest possible pool for distractors:
    // full vocabulary database + custom words, excluding the correct word
    let distractorPool = [];

    if (typeof vocabularyDatabase !== 'undefined' && vocabularyDatabase.beginner) {
      distractorPool = [
        ...vocabularyDatabase.beginner,
        ...vocabularyDatabase.intermediate,
        ...vocabularyDatabase.advanced
      ];
    }

    // Add custom words with definitions
    const customWords = (userData && userData.customWords) ? userData.customWords : [];
    customWords.forEach(w => { if (w.definition) distractorPool.push(w); });

    // Fall back to quiz words if database isn't available
    if (distractorPool.length === 0) {
      distractorPool = quizWords;
    }

    // Exclude the correct word
    distractorPool = distractorPool.filter(w => w.id !== correctWord.id && w.definition);

    const shuffledPool = shuffleArray(distractorPool);

    // Add 3 wrong answers
    for (let i = 0; i < 3 && i < shuffledPool.length; i++) {
      options.push({
        text: shuffledPool[i].definition,
        isCorrect: false
      });
    }

    // If we don't have enough words, generate generic wrong answers
    while (options.length < 4) {
      options.push({
        text: "This definition is not available",
        isCorrect: false
      });
    }

    // Shuffle options
    return shuffleArray(options);
  }

  /**
   * Handle option selection
   * @param {HTMLElement} button - The selected option button
   */
  function selectOption(button) {
    // Remove previous selections
    const allOptions = quizOptionsElement.querySelectorAll('.quiz-option');
    allOptions.forEach(opt => {
      opt.classList.remove('selected', 'correct', 'incorrect');
      opt.disabled = true;
    });

    // Mark selected option
    const isCorrect = button.dataset.correct === 'true';
    button.classList.add('selected');

    if (isCorrect) {
      button.classList.add('correct');
      quizScore++;
      if (quizScoreElement) {
        quizScoreElement.textContent = quizScore;
      }
    } else {
      button.classList.add('incorrect');
      // Show the correct answer
      allOptions.forEach(opt => {
        if (opt.dataset.correct === 'true') {
          opt.classList.add('correct');
        }
      });
    }

    selectedAnswer = isCorrect;

    // Record result for review
    quizResults.push({
      word: quizWords[currentQuestionIndex],
      correct: isCorrect
    });

    // Show and enable next button
    if (nextQuestionBtn) {
      nextQuestionBtn.style.display = 'block';
      nextQuestionBtn.disabled = false;
    }
  }

  /**
   * Move to next question
   */
  function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
  }

  /**
   * Quit the quiz early
   */
  function quitQuiz() {
    Modal.confirm({
      title: 'Quit Quiz',
      message: 'Are you sure you want to quit? Your progress will be lost.',
      confirmText: 'Quit',
      cancelText: 'Continue',
      onConfirm: exitQuiz
    });
  }

  /**
   * Exit quiz and return to start screen
   */
  function exitQuiz() {
    if (quizActiveScreen) quizActiveScreen.style.display = 'none';
    if (quizResultsScreen) quizResultsScreen.style.display = 'none';
    if (quizStartScreen) quizStartScreen.style.display = 'block';

    // Reset state
    quizWords = [];
    currentQuestionIndex = 0;
    quizScore = 0;
    selectedAnswer = null;
    quizResults = [];

    // Reset review
    if (quizReview) quizReview.style.display = 'none';
    if (reviewQuizBtn) reviewQuizBtn.textContent = 'Review Words';
  }

  /**
   * Toggle the quiz review section
   */
  function toggleReview() {
    if (!quizReview) return;
    const isHidden = quizReview.style.display === 'none';
    if (isHidden) {
      renderReview();
      quizReview.style.display = 'block';
      reviewQuizBtn.textContent = 'Hide Review';
    } else {
      quizReview.style.display = 'none';
      reviewQuizBtn.textContent = 'Review Words';
    }
  }

  /**
   * Render the quiz review list
   */
  function renderReview() {
    if (!quizReviewList) return;
    const html = quizResults.map(result => `
      <div class="quiz-review-item ${result.correct ? 'review-correct' : 'review-incorrect'}">
        <div class="quiz-review-item-header">
          <span class="quiz-review-icon">${result.correct ? '✓' : '✗'}</span>
          <span class="quiz-review-word">${result.word.word}</span>
          ${result.word.partOfSpeech ? `<span class="badge badge-primary">${result.word.partOfSpeech}</span>` : ''}
        </div>
        <div class="quiz-review-definition">${result.word.definition}</div>
        ${result.word.exampleSentence ? `<div class="quiz-review-example">"${result.word.exampleSentence}"</div>` : ''}
      </div>
    `).join('');
    quizReviewList.innerHTML = html;
  }

  /**
   * Show quiz results
   */
  function showResults() {
    // Hide active screen, show results
    if (quizActiveScreen) quizActiveScreen.style.display = 'none';
    if (quizResultsScreen) quizResultsScreen.style.display = 'block';

    // Calculate percentage
    const percentage = Math.round((quizScore / quizWords.length) * 100);

    // Display results
    if (finalScoreElement) {
      finalScoreElement.textContent = `${quizScore} / ${quizWords.length}`;
    }

    if (finalPercentageElement) {
      finalPercentageElement.textContent = `${percentage}%`;
    }

    // Update progress bar to 100%
    if (quizProgressElement) {
      quizProgressElement.style.width = '100%';
    }
  }

  /**
   * Shuffle an array (Fisher-Yates algorithm)
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Refresh the module (reload data)
   * @param {number} retryCount - Number of retry attempts (internal use)
   */
  function refresh(retryCount = 0) {
    const MAX_RETRIES = 10;

    userData = StorageManager.load();
    if (!userData) return;

    // Check if vocabularyDatabase is available
    if (typeof vocabularyDatabase === 'undefined' || !vocabularyDatabase.beginner) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`vocabularyDatabase not ready, retry ${retryCount + 1}/${MAX_RETRIES}...`);
        // Retry with increasing delay
        setTimeout(() => refresh(retryCount + 1), 200);
        return;
      } else {
        console.error('vocabularyDatabase failed to load after max retries');
        // Show what we can (custom words only)
      }
    }

    // Reset search state on refresh
    const searchInput = document.getElementById('word-bank-search');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('word-bank-search-clear');
    if (clearBtn) clearBtn.style.display = 'none';

    displayAppLearnedWords();
    displayStillLearningWords();
    displayCustomWords();
    updateCounts();

    // Update quiz total words count
    const totalQuizWords = getAllQuizWords().length;
    if (quizTotalWordsElement) {
      quizTotalWordsElement.textContent = totalQuizWords;
    }

    // Enable/disable start button based on word count
    if (startQuizBtn) {
      startQuizBtn.disabled = totalQuizWords < 4;
      if (totalQuizWords < 4) {
        startQuizBtn.textContent = 'Need at least 4 words';
      } else {
        startQuizBtn.textContent = 'Start Quiz';
      }
    }
  }

  /**
   * Search words across all three sections, filtering cards in-place
   * @param {string} query - search string
   */
  function searchWords(query) {
    const q = (query || '').trim().toLowerCase();
    const clearBtn = document.getElementById('word-bank-search-clear');
    if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

    // Helper: filter a grid container's cards by word text / definition
    function filterGrid(container) {
      if (!container) return;
      const cards = container.querySelectorAll('.word-bank-card');
      if (cards.length === 0) return; // already showing an empty-state message

      let visible = 0;
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const match = !q || text.includes(q);
        card.style.display = match ? '' : 'none';
        if (match) visible++;
      });

      // Show/hide a "no results" notice inside the container
      let notice = container.querySelector('.wb-search-no-results');
      if (visible === 0 && q) {
        if (!notice) {
          notice = document.createElement('p');
          notice.className = 'wb-search-no-results text-secondary';
          container.appendChild(notice);
        }
        notice.textContent = `No results for "${query}"`;
        notice.style.display = '';
      } else if (notice) {
        notice.style.display = 'none';
      }
    }

    filterGrid(stillLearningWordsContainer);
    filterGrid(appLearnedWordsContainer);
    filterGrid(customWordsContainer);
  }

  /**
   * Clear the search input and restore all cards
   */
  function clearSearch() {
    const input = document.getElementById('word-bank-search');
    if (input) input.value = '';
    searchWords('');
  }

  /**
   * Re-render a section with a new sort order
   * @param {string} section - 'stillLearning', 'appLearned', or 'custom'
   * @param {string} sortBy - sort option value
   */
  function sortSection(section, sortBy) {
    if (section === 'stillLearning') {
      displayStillLearningWords(sortBy);
    } else if (section === 'appLearned') {
      displayAppLearnedWords(sortBy);
    } else if (section === 'custom') {
      displayCustomWords(sortBy);
    }
  }

  // Public API
  return {
    init: init,
    showWordDetail: showWordDetail,
    showStillLearningWordDetail: showStillLearningWordDetail,
    moveWordToLearned: moveWordToLearned,
    moveWordToStillLearning: moveWordToStillLearning,
    deleteCustomWord: deleteCustomWord,
    refresh: refresh,
    sortSection: sortSection,
    searchWords: searchWords,
    clearSearch: clearSearch
  };
})();

// Log that WordBankModule is loaded
console.log('WordBankModule loaded successfully');
