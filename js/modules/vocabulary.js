// ============================================
// VOCABULARY MODULE
// Handles word learning, practice exercises, and progress tracking
// ============================================

/**
 * VocabularyModule - Module for vocabulary building feature
 * Uses the Revealing Module Pattern
 */
const VocabularyModule = (function() {
  // Private variables
  let currentWord = null;
  let currentDifficulty = 'beginner';
  let currentVocabCategory = 'builder';
  let userData = null;
  let isExerciseMode = false;

  // DOM elements - Category tabs
  let vocabCategoryTabs = null;
  let vocabCategories = null;

  // DOM elements - Vocabulary Builder
  let wordDisplay = null;
  let showWordBtn = null;
  let practiceBtn = null;
  let learnedCountElement = null;
  let learnedWordsList = null;
  let difficultyButtons = null;

  /**
   * Initialize the vocabulary module
   */
  function init() {
    console.log('VocabularyModule initializing...');

    // Get DOM elements - Category tabs
    vocabCategoryTabs = document.querySelectorAll('.vocab-category-tab');
    vocabCategories = document.querySelectorAll('.vocab-category');

    // Get DOM elements - Vocabulary Builder
    wordDisplay = document.getElementById('word-display');
    showWordBtn = document.getElementById('show-new-word-btn');
    practiceBtn = document.getElementById('practice-vocab-btn');
    learnedCountElement = document.getElementById('learned-count');
    learnedWordsList = document.getElementById('learned-words-list');
    difficultyButtons = document.querySelectorAll('.difficulty-selector .btn');

    // Load user data
    userData = StorageManager.load();

    if (!userData) {
      console.error('No user data found');
      return;
    }

    // Set current difficulty from user data
    currentDifficulty = userData.vocabulary.currentDifficulty || 'beginner';

    // Set up event listeners
    setupEventListeners();
    setupCategoryTabs();

    // Update difficulty buttons
    updateDifficultyButtons();

    // Display learned words
    displayLearnedWords();

    // Update counts
    updateCounts();

    console.log('VocabularyModule initialized successfully');
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Show new word button
    if (showWordBtn) {
      showWordBtn.addEventListener('click', showNewWord);
    }

    // Practice button
    if (practiceBtn) {
      practiceBtn.addEventListener('click', startPractice);
    }

    // Difficulty buttons
    if (difficultyButtons) {
      difficultyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const difficulty = this.getAttribute('data-difficulty');
          changeDifficulty(difficulty);
        });
      });
    }

    // Listen for view changes
    document.addEventListener('viewChanged', function(e) {
      if (e.detail.viewName === 'vocabulary') {
        refresh();
      }
    });
  }

  /**
   * Set up category tab event listeners
   */
  function setupCategoryTabs() {
    if (vocabCategoryTabs) {
      vocabCategoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          switchVocabCategory(this.dataset.vocabCategory);
        });
      });
    }
  }

  /**
   * Switch between vocabulary categories
   */
  function switchVocabCategory(category) {
    currentVocabCategory = category;

    // Update tab active states
    if (vocabCategoryTabs) {
      vocabCategoryTabs.forEach(tab => {
        if (tab.dataset.vocabCategory === category) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }

    // Update category visibility
    if (vocabCategories) {
      vocabCategories.forEach(cat => {
        if (cat.id === `${category}-category`) {
          cat.classList.add('active');
        } else {
          cat.classList.remove('active');
        }
      });
    }

    // Refresh the appropriate module
    switch(category) {
      case 'builder':
        // Already initialized, just refresh display
        displayLearnedWords();
        break;
      case 'daily':
        if (typeof DailyWordModule !== 'undefined') {
          DailyWordModule.refresh();
        }
        if (typeof MWWordOfDayModule !== 'undefined') {
          MWWordOfDayModule.refresh();
        }
        break;
      case 'bank':
        if (typeof WordBankModule !== 'undefined') {
          WordBankModule.refresh();
        }
        break;
    }
  }

  /**
   * Show a new word
   */
  function showNewWord() {
    // Get unlearned words for current difficulty
    const availableWords = vocabularyDatabase[currentDifficulty].filter(word => {
      return !userData.vocabulary.learned.includes(word.id);
    });

    if (availableWords.length === 0) {
      Modal.alert({
        title: 'Congratulations!',
        message: `You've learned all ${currentDifficulty} words! Try a different difficulty level.`,
        type: 'success'
      });
      return;
    }

    // Pick a random word
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    currentWord = availableWords[randomIndex];

    // Display the word
    displayWord(currentWord);

    // Show practice button
    if (practiceBtn) {
      practiceBtn.style.display = 'inline-block';
    }

    isExerciseMode = false;
  }

  /**
   * Display a word
   * @param {Object} word - The word object to display
   */
  function displayWord(word) {
    if (!wordDisplay) return;

    const html = `
      <div class="word-card">
        <div class="word-main">${word.word}</div>
        <div class="word-pronunciation">${word.pronunciation}</div>
        <div class="word-meta">
          <span class="badge badge-primary">${word.partOfSpeech}</span>
          <span class="badge badge-secondary">${word.difficulty}</span>
        </div>
        <div class="action-buttons" style="margin-bottom: 1rem;">
          <button class="btn btn-primary" id="reveal-definition-btn" onclick="VocabularyModule.revealDefinition()">
            Reveal Definition
          </button>
        </div>
        <div id="word-details" style="display: none;">
          <div class="word-definition">
            <strong>Definition:</strong> ${word.definition}
          </div>
          <div class="word-example">
            <strong>Example:</strong> "${word.exampleSentence}"
          </div>
          <div class="word-synonyms">
            <strong>Synonyms:</strong> <span class="synonyms-list">${word.synonyms.join(', ')}</span>
          </div>
          <div class="action-buttons">
            <button class="btn btn-success" onclick="VocabularyModule.markAsLearned(${word.id})" data-tooltip="This word will be added to Learned Words bank">
              Mark as Learned
            </button>
          </div>
        </div>
      </div>
    `;

    wordDisplay.innerHTML = html;
  }

  /**
   * Reveal the hidden definition, example, and synonyms
   */
  function revealDefinition() {
    const wordDetails = document.getElementById('word-details');
    const revealBtn = document.getElementById('reveal-definition-btn');

    if (wordDetails) {
      wordDetails.style.display = 'block';
    }

    if (revealBtn) {
      revealBtn.style.display = 'none';
    }
  }

  /**
   * Mark a word as learned
   * @param {number} wordId - The ID of the word to mark as learned
   */
  function markAsLearned(wordId) {
    if (!userData) return;

    // Check if already learned
    if (userData.vocabulary.learned.includes(wordId)) {
      showToast('This word is already in your learned list!', 'info');
      return;
    }

    // Add to learned words
    userData.vocabulary.learned.push(wordId);
    userData.vocabulary.totalWordsLearned = userData.vocabulary.learned.length;

    // Update last learned date
    userData.vocabulary.lastLearnedDate = StorageManager.getTodayString();

    // Save to storage
    if (StorageManager.save(userData)) {
      showToast('Word added to your vocabulary!', 'success');

      // Update display
      displayLearnedWords();
      updateCounts();

      // Show next word
      showNewWord();
    } else {
      showToast('Failed to save progress', 'error');
    }
  }

  /**
   * Start a practice exercise
   */
  function startPractice() {
    if (!currentWord) {
      showToast('Please show a word first', 'error');
      return;
    }

    isExerciseMode = true;

    // Generate a multiple choice exercise
    generateMultipleChoiceExercise(currentWord);
  }

  /**
   * Generate a multiple choice exercise
   * @param {Object} word - The word to create an exercise for
   */
  function generateMultipleChoiceExercise(word) {
    // Get 3 random wrong definitions from other words
    const allWords = vocabularyDatabase[currentDifficulty];
    const wrongWords = allWords.filter(w => w.id !== word.id);

    // Shuffle and get 3 wrong options
    const shuffled = wrongWords.sort(() => 0.5 - Math.random());
    const wrongOptions = shuffled.slice(0, 3);

    // Create options array with correct answer
    const options = [
      { text: word.definition, correct: true },
      { text: wrongOptions[0].definition, correct: false },
      { text: wrongOptions[1].definition, correct: false },
      { text: wrongOptions[2].definition, correct: false }
    ];

    // Shuffle options
    options.sort(() => 0.5 - Math.random());

    // Display exercise
    const html = `
      <div class="word-card">
        <h3>Practice Exercise</h3>
        <div class="exercise-question">
          What is the definition of <strong>"${word.word}"</strong>?
        </div>
        <div class="exercise-options" id="exercise-options">
          ${options.map((opt, index) => `
            <div class="exercise-option" data-correct="${opt.correct}" data-index="${index}">
              ${opt.text}
            </div>
          `).join('')}
        </div>
        <div id="exercise-feedback"></div>
      </div>
    `;

    if (wordDisplay) {
      wordDisplay.innerHTML = html;
    }

    // Add click handlers to options
    const optionElements = document.querySelectorAll('.exercise-option');
    optionElements.forEach(option => {
      option.addEventListener('click', function() {
        handleExerciseAnswer(this, word.id);
      });
    });
  }

  /**
   * Handle exercise answer
   * @param {HTMLElement} optionElement - The clicked option element
   * @param {number} wordId - The word ID
   */
  function handleExerciseAnswer(optionElement, wordId) {
    const isCorrect = optionElement.getAttribute('data-correct') === 'true';
    const allOptions = document.querySelectorAll('.exercise-option');
    const feedbackElement = document.getElementById('exercise-feedback');

    // Disable all options
    allOptions.forEach(opt => {
      opt.style.pointerEvents = 'none';

      // Highlight correct and incorrect
      if (opt.getAttribute('data-correct') === 'true') {
        opt.classList.add('correct');
      } else if (opt === optionElement && !isCorrect) {
        opt.classList.add('incorrect');
      }
    });

    // Show feedback
    if (isCorrect) {
      feedbackElement.innerHTML = `
        <div class="exercise-feedback correct">
          ✓ Correct! Great job!
          <div style="margin-top: 1rem;">
            <button class="btn btn-success" onclick="VocabularyModule.markAsLearned(${wordId})" data-tooltip="This word will be added to Learned Words bank">
              Mark as Learned
            </button>
            <button class="btn btn-secondary" onclick="VocabularyModule.showNewWord()" data-tooltip="Word will remain in pool and can come up again">
              Next Word
            </button>
          </div>
        </div>
      `;

      // Add to mastered if not already
      if (!userData.vocabulary.mastered.includes(wordId)) {
        userData.vocabulary.mastered.push(wordId);
        StorageManager.save(userData);
      }
    } else {
      feedbackElement.innerHTML = `
        <div class="exercise-feedback incorrect">
          ✗ Not quite. Try again with another word!
          <div style="margin-top: 1rem;">
            <button class="btn btn-secondary" onclick="VocabularyModule.showNewWord()" data-tooltip="Word will remain in pool and can come up again">
              Next Word
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Display learned words
   */
  function displayLearnedWords() {
    if (!learnedWordsList || !userData) return;

    const learnedWords = userData.vocabulary.learned;

    if (learnedWords.length === 0) {
      learnedWordsList.innerHTML = '<p class="text-secondary">No words learned yet. Start learning!</p>';
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

    // Display as chips
    const html = learnedWordObjects.map(word => `
      <div class="word-chip" onclick="VocabularyModule.showLearnedWord(${word.id})" title="${word.definition}">
        ${word.word}
      </div>
    `).join('');

    learnedWordsList.innerHTML = html;
  }

  /**
   * Show a learned word in a modal
   * @param {number} wordId - The word ID to show
   */
  function showLearnedWord(wordId) {
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
      </div>
    `;

    Modal.show(content);
  }

  /**
   * Update counts display
   */
  function updateCounts() {
    if (learnedCountElement && userData) {
      learnedCountElement.textContent = userData.vocabulary.totalWordsLearned;
    }
  }

  /**
   * Change difficulty level
   * @param {string} difficulty - The difficulty level
   */
  function changeDifficulty(difficulty) {
    currentDifficulty = difficulty;

    // Update user data
    if (userData) {
      userData.vocabulary.currentDifficulty = difficulty;
      StorageManager.save(userData);
    }

    // Update button states
    updateDifficultyButtons();

    // Clear current word
    if (wordDisplay) {
      wordDisplay.innerHTML = '<div class="empty-state"><p>Click "Show New Word" to start learning</p></div>';
    }

    // Hide practice button
    if (practiceBtn) {
      practiceBtn.style.display = 'none';
    }

    showToast(`Switched to ${difficulty} level`, 'success');
  }

  /**
   * Update difficulty button states
   */
  function updateDifficultyButtons() {
    if (!difficultyButtons) return;

    difficultyButtons.forEach(btn => {
      const btnDifficulty = btn.getAttribute('data-difficulty');

      if (btnDifficulty === currentDifficulty) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
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
   * Refresh the module (reload data)
   */
  function refresh() {
    userData = StorageManager.load();
    if (userData) {
      currentDifficulty = userData.vocabulary.currentDifficulty || 'beginner';
      updateDifficultyButtons();
      displayLearnedWords();
      updateCounts();
    }
  }

  /**
   * Get current difficulty
   * @returns {string} Current difficulty level
   */
  function getCurrentDifficulty() {
    return currentDifficulty;
  }

  /**
   * Get user progress data
   * @returns {Object} Vocabulary progress data
   */
  function getProgress() {
    return userData ? userData.vocabulary : null;
  }

  // Public API
  return {
    init: init,
    showNewWord: showNewWord,
    revealDefinition: revealDefinition,
    markAsLearned: markAsLearned,
    startPractice: startPractice,
    showLearnedWord: showLearnedWord,
    refresh: refresh,
    getCurrentDifficulty: getCurrentDifficulty,
    getProgress: getProgress,
    switchVocabCategory: switchVocabCategory
  };
})();

// Log that VocabularyModule is loaded
console.log('VocabularyModule loaded successfully');
