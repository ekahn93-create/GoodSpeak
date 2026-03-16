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
  let customWordsContainer = null;
  let appWordsCountElement = null;
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

  /**
   * Initialize the word bank module
   */
  function init() {
    console.log('WordBankModule initializing...');

    // Get DOM elements
    addWordForm = document.getElementById('add-custom-word-form');
    appLearnedWordsContainer = document.getElementById('app-learned-words');
    customWordsContainer = document.getElementById('custom-words-list');
    appWordsCountElement = document.getElementById('app-words-count');
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
    // Add custom word form
    if (addWordForm) {
      addWordForm.addEventListener('submit', handleAddCustomWord);
    }

    // Lookup button
    if (lookupButton) {
      lookupButton.addEventListener('click', handleLookupWord);
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

    // Listen for view changes
    document.addEventListener('viewChanged', function(e) {
      if (e.detail.viewName === 'word-bank') {
        refresh();
      }
    });
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
      // Use Free Dictionary API (no API key required)
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

      if (!response.ok) {
        if (response.status === 404) {
          showLookupStatus('Word not found in dictionary. You can still add it manually.', 'warning');
        } else {
          throw new Error('Failed to fetch definition');
        }
        return;
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const wordData = data[0];

        // Extract pronunciation
        let pronunciation = '';
        if (wordData.phonetic) {
          pronunciation = wordData.phonetic;
        } else if (wordData.phonetics && wordData.phonetics.length > 0) {
          pronunciation = wordData.phonetics[0].text || '';
        }

        // Extract first meaning
        const firstMeaning = wordData.meanings && wordData.meanings[0];
        const partOfSpeech = firstMeaning?.partOfSpeech || '';
        const definition = firstMeaning?.definitions?.[0]?.definition || '';
        const example = firstMeaning?.definitions?.[0]?.example || '';

        // Extract synonyms
        const synonyms = firstMeaning?.synonyms || [];
        const synonymsText = synonyms.slice(0, 5).join(', '); // Limit to 5 synonyms

        // Populate form fields
        if (pronunciation) {
          document.getElementById('custom-pronunciation').value = pronunciation.replace(/[\/\[\]]/g, '');
        }

        if (partOfSpeech) {
          const posSelect = document.getElementById('custom-part-of-speech');
          const normalizedPos = partOfSpeech.toLowerCase();
          if (['noun', 'verb', 'adjective', 'adverb'].includes(normalizedPos)) {
            posSelect.value = normalizedPos;
          } else {
            posSelect.value = 'other';
          }
        }

        if (definition) {
          document.getElementById('custom-definition').value = definition;
        }

        if (example) {
          document.getElementById('custom-example').value = example;
        }

        if (synonymsText) {
          document.getElementById('custom-synonyms').value = synonymsText;
        }

        showLookupStatus('✓ Definition loaded! You can edit any fields before adding.', 'success');
      } else {
        showLookupStatus('No definition found. You can still add it manually.', 'warning');
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
  function handleAddCustomWord(e) {
    e.preventDefault();

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
  function displayAppLearnedWords() {
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

    // Sort alphabetically
    learnedWordObjects.sort((a, b) => a.word.localeCompare(b.word));

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
   * Display custom words
   */
  function displayCustomWords() {
    if (!customWordsContainer || !userData) return;

    const customWords = userData.customWords || [];

    if (customWords.length === 0) {
      customWordsContainer.innerHTML = '<p class="text-secondary">No custom words yet. Use the form above to add words you\'ve learned elsewhere!</p>';
      return;
    }

    // Sort alphabetically
    customWords.sort((a, b) => a.word.localeCompare(b.word));

    // Display as detailed cards with delete option
    const html = customWords.map(word => `
      <div class="word-bank-card custom-word-card">
        <div class="word-bank-card-header">
          <div class="word-bank-word" onclick="WordBankModule.showWordDetail(${word.id}, true)">${word.word}</div>
          <div>
            ${word.partOfSpeech ? `<span class="badge badge-secondary">${word.partOfSpeech}</span>` : ''}
            <button class="btn-icon" onclick="WordBankModule.deleteCustomWord(${word.id})" title="Delete word">
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
      </div>
    `;

    Modal.show(content);
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

    if (selectedSource === 'learned') {
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

    // Get wrong answers from other words
    const otherWords = quizWords.filter(w => w.id !== correctWord.id);
    const shuffledOthers = shuffleArray(otherWords);

    // Add 3 wrong answers
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
      options.push({
        text: shuffledOthers[i].definition,
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

    displayAppLearnedWords();
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

  // Public API
  return {
    init: init,
    showWordDetail: showWordDetail,
    deleteCustomWord: deleteCustomWord,
    refresh: refresh
  };
})();

// Log that WordBankModule is loaded
console.log('WordBankModule loaded successfully');
