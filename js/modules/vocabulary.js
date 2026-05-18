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

  // Dynamic word pool — arrays of { word, category } objects per difficulty
  // Backed by localStorage keys: wordPool_beginner, wordPool_intermediate, wordPool_advanced
  const POOL_KEY = diff => `wordPool_${diff}`;
  // In-session cache of full word objects fetched from the API, keyed by word string
  const wordCache = new Map();

  function loadPool(diff) {
    try {
      return JSON.parse(localStorage.getItem(POOL_KEY(diff)) || '[]');
    } catch { return []; }
  }

  function savePool(diff, pool) {
    localStorage.setItem(POOL_KEY(diff), JSON.stringify(pool));
  }

  // Seed the pool from the hardcoded database so it works immediately on first use
  function seedPoolFromDatabase(diff) {
    if (typeof vocabularyDatabase === 'undefined') return;
    const pool = vocabularyDatabase[diff].map(w => ({ word: w.word, category: w.category }));
    savePool(diff, pool);
    // Also pre-populate the word cache from hardcoded data
    vocabularyDatabase[diff].forEach(w => wordCache.set(w.word, w));
  }

  // Ensure a pool exists for the given difficulty; seed from DB if empty
  function ensurePool(diff) {
    let pool = loadPool(diff);
    if (pool.length === 0) {
      seedPoolFromDatabase(diff);
      pool = loadPool(diff);
    }
    return pool;
  }

  // Background-refill the pool from Datamuse when it runs low
  async function refillPoolIfNeeded(diff) {
    const pool = loadPool(diff);
    if (pool.length >= (typeof POOL_REFILL_THRESHOLD !== 'undefined' ? POOL_REFILL_THRESHOLD : 20)) return;

    console.log(`Word pool for ${diff} is low (${pool.length}), refilling from Datamuse...`);
    try {
      const candidates = await APIService.buildWordPool(diff);
      if (!candidates.length) return;

      // Filter out words already in the pool
      const existing = new Set(pool.map(p => p.word.toLowerCase()));
      const newWords = candidates.filter(c => !existing.has(c.word.toLowerCase()));

      const maxSize = typeof POOL_MAX_SIZE !== 'undefined' ? POOL_MAX_SIZE : 200;
      const merged = [...pool, ...newWords].slice(0, maxSize);
      savePool(diff, merged);
      console.log(`Pool for ${diff} refilled to ${merged.length} words`);
    } catch (err) {
      console.warn('Pool refill failed:', err);
    }
  }

  // Synchronous cache lookup — handles both string IDs and legacy integer IDs
  function resolveFromCache(id) {
    // Try direct cache hit (string ID)
    if (wordCache.has(id)) return wordCache.get(id);
    // Try legacy integer ID — find by numeric id in cache values
    if (typeof id === 'number' || (typeof id === 'string' && !isNaN(id))) {
      const numId = Number(id);
      for (const word of wordCache.values()) {
        if (word.id === numId) return word;
      }
    }
    return null;
  }

  // Look up a full word object — from cache first, then API
  async function resolveWord(wordStr, category, diff) {
    if (wordCache.has(wordStr)) return wordCache.get(wordStr);

    // Check hardcoded database
    if (typeof vocabularyDatabase !== 'undefined') {
      const all = [
        ...vocabularyDatabase.beginner,
        ...vocabularyDatabase.intermediate,
        ...vocabularyDatabase.advanced
      ];
      const found = all.find(w => w.word === wordStr);
      if (found) {
        wordCache.set(wordStr, found);
        return found;
      }
    }

    // Fetch from API
    const wordObj = await APIService.getWordData(wordStr, diff, category);
    if (wordObj) wordCache.set(wordStr, wordObj);
    return wordObj;
  }

  // DOM elements - Category tabs
  let vocabCategoryTabs = null;
  let vocabCategories = null;

  // DOM elements - Vocabulary Builder
  let wordDisplay = null;
  let showWordBtn = null;
  let practiceBtn = null;
  let modeToggle = null;
  let definitionModeBtn = null;
  let practiceModeBtn = null;
  let learnedCountElement = null;
  let learnedWordsList = null;
  let difficultyButtons = null;
  let currentMode = 'definition';

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
    modeToggle = document.getElementById('vocab-mode-toggle');
    definitionModeBtn = document.getElementById('definition-mode-btn');
    practiceModeBtn = document.getElementById('practice-mode-btn');
    learnedCountElement = document.getElementById('learned-count');
    learnedWordsList = document.getElementById('learned-words-list');
    difficultyButtons = document.querySelectorAll('.difficulty-selector .btn');

    // Pre-seed word cache from hardcoded database so learned words resolve after reload
    if (typeof vocabularyDatabase !== 'undefined') {
      [
        ...vocabularyDatabase.beginner,
        ...vocabularyDatabase.intermediate,
        ...vocabularyDatabase.advanced
      ].forEach(w => wordCache.set(w.word, w));
    }

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

    // Display still learning words
    displayStillLearningWords();

    // Update counts
    updateCounts();

    // Restore saved category from localStorage
    const savedCategory = localStorage.getItem('vocabulary_currentCategory');
    if (savedCategory) {
      currentVocabCategory = savedCategory;
      switchVocabCategory(savedCategory);
    }

    // Auto-show a word on first load so the user doesn't see an empty state
    if (currentVocabCategory === 'builder') {
      showNewWord();
      if (typeof MWWordOfDayModule !== 'undefined') {
        MWWordOfDayModule.refresh();
      }
    }

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
    window.scrollTo(0, 0);
    currentVocabCategory = category;

    // Save to localStorage
    localStorage.setItem('vocabulary_currentCategory', category);

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
        if (typeof MWWordOfDayModule !== 'undefined') {
          MWWordOfDayModule.refresh();
        }
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
      case 'knowledge-check':
        if (typeof SRSModule !== 'undefined') {
          SRSModule.refresh();
        }
        if (typeof WordBankModule !== 'undefined') {
          WordBankModule.refresh();
        }
        initTWAL();
        initUIS();
        switchKCTab('vocab');
        break;
      case 'grammar':
        if (typeof GrammarModule !== 'undefined') {
          GrammarModule.refresh();
        }
        break;
    }
  }

  /**
   * Show a new word (async — may fetch from API)
   */
  async function showNewWord() {
    if (!userData) return;

    // Show loading state
    if (wordDisplay) {
      wordDisplay.innerHTML = '<div class="empty-state"><p>Finding a word for you...</p></div>';
    }

    // Ensure pool exists for current difficulty
    const pool = ensurePool(currentDifficulty);

    // Filter out already learned/still-learning words
    const learned = new Set(userData.vocabulary.learned);
    const stillLearning = new Set(userData.vocabulary.stillLearning);
    const available = pool.filter(p => !learned.has(p.word) && !stillLearning.has(p.word));

    if (available.length === 0) {
      if (wordDisplay) {
        wordDisplay.innerHTML = '<div class="empty-state"><p>No more words available at this level. Try a different difficulty!</p></div>';
      }
      // Trigger a background refill for next time
      refillPoolIfNeeded(currentDifficulty);
      return;
    }

    // Pick a random candidate
    const candidate = available[Math.floor(Math.random() * available.length)];

    // Resolve full word data (cache → hardcoded DB → API)
    const wordObj = await resolveWord(candidate.word, candidate.category, currentDifficulty);

    if (!wordObj) {
      // Word not in dictionary — remove from pool and try again
      const updatedPool = loadPool(currentDifficulty).filter(p => p.word !== candidate.word);
      savePool(currentDifficulty, updatedPool);
      return showNewWord();
    }

    currentWord = wordObj;
    if (currentMode === 'practice') {
      isExerciseMode = true;
      generateMultipleChoiceExercise(currentWord);
    } else {
      isExerciseMode = false;
      displayWord(currentWord);
    }

    // Kick off background refill if pool is getting low
    refillPoolIfNeeded(currentDifficulty);
  }

  /**
   * Display a word
   * @param {Object} word - The word object to display
   */
  function displayWord(word) {
    if (!wordDisplay) return;

    const safeWord = word.word.replace(/'/g, "\\'");
    const html = `
      <div class="word-card">
        <div class="word-card-mode-toggle">
          <div class="word-card-mode-toggle-buttons">
            <div class="word-card-mode-toggle-buttons-row">
              <button class="word-mode-btn${currentMode === 'definition' ? ' active' : ''}" onclick="VocabularyModule.setMode('definition')">Definition Mode</button>
              <button class="word-mode-btn${currentMode === 'practice' ? ' active' : ''}" onclick="VocabularyModule.setMode('practice')">Practice Mode</button>
            </div>
            <span class="word-mode-hint">${currentMode === 'definition' ? 'Full definition, example &amp; synonyms' : 'Guess the definition from 4 choices'}</span>
          </div>
        </div>
        <div class="word-main">
          ${word.word}
          <button class="tts-btn" onclick="VocabularyModule.speakWord('${safeWord}')" title="Hear pronunciation" aria-label="Hear pronunciation">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
        </div>
        ${word.pronunciation ? `<div class="word-pronunciation">${word.pronunciation}</div>` : ''}
        <div class="word-meta">
          ${word.partOfSpeech ? `<span class="badge badge-primary">${word.partOfSpeech}</span>` : ''}
          <span class="badge badge-secondary">${word.difficulty}</span>
        </div>
        <div class="word-definition">
          <strong>Definition:</strong> ${word.definition}
        </div>
        ${word.exampleSentence ? `<div class="word-example"><strong>Example:</strong> "${word.exampleSentence}"</div>` : ''}
        ${word.synonyms && word.synonyms.length > 0 ? `<div class="word-synonyms"><strong>Synonyms:</strong> <span class="synonyms-list">${word.synonyms.join(', ')}</span></div>` : ''}
        <div class="action-buttons">
          <button class="btn btn-success" onclick="VocabularyModule.markAsLearned('${safeWord}')" data-tooltip="Add to your learned words">
            Mark as Learned
          </button>
          <button class="btn btn-secondary" onclick="VocabularyModule.markAsStillLearning('${safeWord}')" data-tooltip="Add to still learning — you'll revisit this">
            Still Learning
          </button>
        </div>
      </div>
    `;

    wordDisplay.innerHTML = html;
  }

  /**
   * Mark a word as learned
   * @param {string} wordId - The word string used as ID
   */
  function markAsLearned(wordId) {
    if (!userData) return;

    // Check if already learned
    if (userData.vocabulary.learned.includes(wordId)) {
      showToast('This word is already in your learned list!', 'info');
      return;
    }

    // Remove from still learning if present
    const stillLearningIndex = userData.vocabulary.stillLearning.indexOf(wordId);
    if (stillLearningIndex > -1) {
      userData.vocabulary.stillLearning.splice(stillLearningIndex, 1);
    }

    // Add to learned words
    userData.vocabulary.learned.push(wordId);
    userData.vocabulary.totalWordsLearned = userData.vocabulary.learned.length;

    // Update last learned date
    userData.vocabulary.lastLearnedDate = StorageManager.getTodayString();

    // Save to storage
    if (StorageManager.save(userData)) {
      StorageManager.markActiveToday();
      StorageManager.incrementWordsLearnedToday();
      showToast('Word added to your vocabulary!', 'success');

      // Nudge toward Knowledge Check after learning words
      if (typeof NudgeModule !== 'undefined') {
        const learnedCount = userData.vocabulary.learned.length;
        const msg = learnedCount >= 5
          ? `You have ${learnedCount} words — test yourself in Knowledge Check!`
          : `Great word! Keep going — you need 5 learned words to unlock the quiz.`;
        NudgeModule.show('nudge-vocab-learned', msg, 'Go to Knowledge Check', 'vocabulary', 'knowledge-check');
      }

      // Log vocab count for progress charts
      if (typeof ProgressChartsModule !== 'undefined') {
        ProgressChartsModule.logVocabCount(userData.vocabulary.totalWordsLearned);
      }

      // Enroll word in SRS
      if (typeof SRSModule !== 'undefined') {
        SRSModule.enrollWord(wordId);
      }

      // Update display
      displayLearnedWords();
      displayStillLearningWords();
      updateCounts();

      // Show next word
      showNewWord();
    } else {
      showToast('Failed to save progress', 'error');
    }
  }

  /**
   * Mark a word as still learning
   * @param {string} wordId - The word string used as ID
   */
  function markAsStillLearning(wordId) {
    if (!userData) return;

    // Check if already in still learning
    if (userData.vocabulary.stillLearning.includes(wordId)) {
      showToast('This word is already in your still learning list!', 'info');
      return;
    }

    // Check if already in learned words
    if (userData.vocabulary.learned.includes(wordId)) {
      showToast('This word is already in your learned list!', 'info');
      return;
    }

    // Add to still learning words
    userData.vocabulary.stillLearning.push(wordId);

    // Save to storage
    if (StorageManager.save(userData)) {
      showToast('Word added to Still Learning!', 'success');

      // Update display
      displayStillLearningWords();
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
   * Set the display mode (definition or practice)
   * @param {string} mode - 'definition' or 'practice'
   */
  function setMode(mode) {
    currentMode = mode;
    if (mode === 'definition') {
      isExerciseMode = false;
      if (currentWord) displayWord(currentWord);
    } else {
      startPractice();
    }
  }

  /**
   * Generate a multiple choice exercise
   * @param {Object} word - The word to create an exercise for
   */
  function generateMultipleChoiceExercise(word) {
    // Build a pool of wrong-answer candidates from the word cache + hardcoded DB
    const allCached = Array.from(wordCache.values()).filter(w => w.word !== word.word && w.definition);
    let pool = allCached.length >= 3 ? allCached : [];

    if (pool.length < 3 && typeof vocabularyDatabase !== 'undefined') {
      const hardcoded = [
        ...vocabularyDatabase.beginner,
        ...vocabularyDatabase.intermediate,
        ...vocabularyDatabase.advanced
      ].filter(w => w.word !== word.word);
      const hardcodedWords = new Set(pool.map(w => w.word));
      pool = [...pool, ...hardcoded.filter(w => !hardcodedWords.has(w.word))];
    }

    // Shuffle and get 3 wrong options
    const shuffled = pool.sort(() => 0.5 - Math.random());
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
        <div class="word-card-mode-toggle">
          <div class="word-card-mode-toggle-buttons">
            <div class="word-card-mode-toggle-buttons-row">
              <button class="word-mode-btn" onclick="VocabularyModule.setMode('definition')">Definition Mode</button>
              <button class="word-mode-btn active" onclick="VocabularyModule.setMode('practice')">Practice Mode</button>
            </div>
            <span class="word-mode-hint">Guess the definition from 4 choices</span>
          </div>
        </div>
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
        handleExerciseAnswer(this, word.word);
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
            <button class="btn btn-success js-mark-learned" data-tooltip="This word will be added to Learned Words bank">
              Mark as Learned
            </button>
            <button class="btn btn-secondary js-mark-still-learning" data-tooltip="This word will be added to Still Learning">
              Mark as Still Learning
            </button>
            <button class="btn btn-secondary" onclick="VocabularyModule.showNewWord()" data-tooltip="Word will remain in pool and can come up again">
              Next Word
            </button>
          </div>
        </div>
      `;
      feedbackElement.querySelector('.js-mark-learned').addEventListener('click', () => markAsLearned(wordId));
      feedbackElement.querySelector('.js-mark-still-learning').addEventListener('click', () => markAsStillLearning(wordId));

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
            <button class="btn btn-secondary js-mark-still-learning" data-tooltip="This word will be added to Still Learning">
              Mark as Still Learning
            </button>
            <button class="btn btn-secondary" onclick="VocabularyModule.showNewWord()" data-tooltip="Word will remain in pool and can come up again">
              Next Word
            </button>
          </div>
        </div>
      `;
      feedbackElement.querySelector('.js-mark-still-learning').addEventListener('click', () => markAsStillLearning(wordId));
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

    const learnedWordObjects = learnedWords.map(id => resolveFromCache(id)).filter(w => w);

    // Display as chips
    const html = learnedWordObjects.map(word => `
      <div class="word-chip word-chip--learned" onclick="VocabularyModule.showLearnedWord('${word.word.replace(/'/g, "\\'")}')" title="${word.definition}">
        ${word.word}
      </div>
    `).join('');

    learnedWordsList.innerHTML = html;
  }

  /**
   * Display still learning words
   */
  function displayStillLearningWords() {
    const stillLearningList = document.getElementById('still-learning-words-list');
    if (!stillLearningList || !userData) return;

    const stillLearningWords = userData.vocabulary.stillLearning || [];

    if (stillLearningWords.length === 0) {
      stillLearningList.innerHTML = '<p class="text-secondary">No words in Still Learning yet.</p>';
      return;
    }

    const stillLearningWordObjects = stillLearningWords.map(id => resolveFromCache(id)).filter(w => w);

    // Display as chips with option to move to learned
    const html = stillLearningWordObjects.map(word => `
      <div class="word-chip word-chip--still-learning" onclick="VocabularyModule.showStillLearningWord('${word.word.replace(/'/g, "\\'")}')" title="${word.definition}">
        ${word.word}
      </div>
    `).join('');

    stillLearningList.innerHTML = html;
  }

  /**
   * Show a learned word in a modal
   * @param {number} wordId - The word ID to show
   */
  function showLearnedWord(wordId) {
    const word = wordCache.get(wordId) || { word: wordId, id: wordId, definition: '', pronunciation: '', partOfSpeech: '', difficulty: '', exampleSentence: '', synonyms: [] };
    const safeId = wordId.replace(/'/g, "\\'");

    const content = `
      <div class="word-card word-card--learned">
        <div class="word-main">${word.word}</div>
        ${word.pronunciation ? `<div class="word-pronunciation">${word.pronunciation}</div>` : ''}
        <div class="word-meta">
          ${word.partOfSpeech ? `<span class="badge badge-primary">${word.partOfSpeech}</span>` : ''}
          ${word.difficulty ? `<span class="badge badge-secondary">${word.difficulty}</span>` : ''}
        </div>
        ${word.definition ? `<div class="word-definition"><strong>Definition:</strong> ${word.definition}</div>` : ''}
        ${word.exampleSentence ? `<div class="word-example"><strong>Example:</strong> "${word.exampleSentence}"</div>` : ''}
        ${word.synonyms && word.synonyms.length ? `<div class="word-synonyms"><strong>Synonyms:</strong> ${word.synonyms.join(', ')}</div>` : ''}
        <div class="action-buttons" style="margin-top: 1rem;">
          <button class="btn btn-secondary" onclick="VocabularyModule.moveToStillLearning('${safeId}')">
            Move to Still Learning
          </button>
        </div>
      </div>
    `;

    Modal.show(content);
  }

  /**
   * Show a still learning word in a modal with option to move to learned
   * @param {number} wordId - The word ID to show
   */
  function showStillLearningWord(wordId) {
    const word = wordCache.get(wordId) || { word: wordId, id: wordId, definition: '', pronunciation: '', partOfSpeech: '', difficulty: '', exampleSentence: '', synonyms: [] };
    const safeId = wordId.replace(/'/g, "\\'");

    const content = `
      <div class="word-card word-card--still-learning">
        <div class="word-main">${word.word}</div>
        ${word.pronunciation ? `<div class="word-pronunciation">${word.pronunciation}</div>` : ''}
        <div class="word-meta">
          ${word.partOfSpeech ? `<span class="badge badge-primary">${word.partOfSpeech}</span>` : ''}
          ${word.difficulty ? `<span class="badge badge-secondary">${word.difficulty}</span>` : ''}
          <span class="badge badge-warning">Still Learning</span>
        </div>
        ${word.definition ? `<div class="word-definition"><strong>Definition:</strong> ${word.definition}</div>` : ''}
        ${word.exampleSentence ? `<div class="word-example"><strong>Example:</strong> "${word.exampleSentence}"</div>` : ''}
        ${word.synonyms && word.synonyms.length ? `<div class="word-synonyms"><strong>Synonyms:</strong> ${word.synonyms.join(', ')}</div>` : ''}
        <div class="action-buttons" style="margin-top: 1rem;">
          <button class="btn btn-success" onclick="VocabularyModule.moveToLearned('${safeId}')">
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
  function moveToLearned(wordId) {
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
      displayLearnedWords();
      displayStillLearningWords();
      updateCounts();

      // Close modal
      Modal.hide();

      // Notify Word Bank module if available
      if (typeof WordBankModule !== 'undefined' && WordBankModule.refresh) {
        WordBankModule.refresh();
      }
    } else {
      showToast('Failed to save progress', 'error');
    }
  }

  /**
   * Move a word from learned to still learning
   * @param {number} wordId - The word ID to move
   */
  function moveToStillLearning(wordId) {
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
      displayLearnedWords();
      displayStillLearningWords();
      updateCounts();

      // Close modal
      Modal.hide();

      // Notify Word Bank module if available
      if (typeof WordBankModule !== 'undefined' && WordBankModule.refresh) {
        WordBankModule.refresh();
      }
    } else {
      showToast('Failed to save progress', 'error');
    }
  }

  /**
   * Update counts display
   */
  function updateCounts() {
    if (learnedCountElement && userData) {
      learnedCountElement.textContent = userData.vocabulary.totalWordsLearned;
    }

    const stillLearningCountElement = document.getElementById('still-learning-count');
    if (stillLearningCountElement && userData) {
      const stillLearningCount = userData.vocabulary.stillLearning ? userData.vocabulary.stillLearning.length : 0;
      stillLearningCountElement.textContent = stillLearningCount;
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

    // Auto-show a word for the new difficulty
    showNewWord();

    currentMode = 'definition';

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
        toast.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Speak a word aloud using Web Speech Synthesis
   * @param {string} word - The word to speak
   */
  function speakWord(word) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.85;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
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
      displayStillLearningWords();
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

  // ============================================
  // KNOWLEDGE CHECK SUB-TABS
  // ============================================

  let currentKCTab = 'vocab';
  let kcSubTabsSetup = false;

  function setupKCSubTabs() {
    if (kcSubTabsSetup) return;
    kcSubTabsSetup = true;
    const subtabs = document.querySelectorAll('.kc-subtab');
    subtabs.forEach(tab => {
      tab.addEventListener('click', function() {
        switchKCTab(this.dataset.kcTab);
      });
    });
  }

  function switchKCTab(tab) {
    window.scrollTo(0, 0);
    currentKCTab = tab;
    document.querySelectorAll('.kc-subtab').forEach(t => {
      t.classList.toggle('active', t.dataset.kcTab === tab);
    });
    document.querySelectorAll('.kc-panel').forEach(p => {
      p.classList.toggle('active', p.id === `kc-${tab}-panel`);
    });
    if (tab === 'grammar') {
      if (typeof GrammarModule !== 'undefined' && GrammarModule.initKnowledgeCheck) {
        GrammarModule.initKnowledgeCheck();
      }
    }
  }

  // ============================================
  // 2 WORDS AND A LIE
  // ============================================

  const TWAL_CACHE_KEY = 'twal_sentence_cache';
  let twalScore = { correct: 0, played: 0 };
  let twalCurrentWord = null;
  let twalAnswered = false;

  function initTWAL() {
    setupKCSubTabs();

    const startBtn = document.getElementById('twal-start-btn');
    const nextBtn = document.getElementById('twal-next-btn');

    if (startBtn) startBtn.addEventListener('click', twalPlay);
    if (nextBtn) nextBtn.addEventListener('click', twalPlay);
  }

  function twalGetWordBank() {
    const data = StorageManager.load();
    if (!data) return [];
    const allAppWords = [
      ...vocabularyDatabase.beginner,
      ...vocabularyDatabase.intermediate,
      ...vocabularyDatabase.advanced
    ];
    const learnedAppWords = allAppWords.filter(w =>
      data.vocabulary.learned.includes(w.id) || data.vocabulary.stillLearning.includes(w.id)
    ).map(w => ({
      word: w.word,
      partOfSpeech: w.partOfSpeech,
      definition: w.definition,
      exampleSentence: w.exampleSentence
    }));
    const customWords = (data.customWords || []).map(w => ({
      word: w.word,
      partOfSpeech: w.partOfSpeech || 'word',
      definition: w.definition || '',
      exampleSentence: w.example || ''
    })).filter(w => w.definition);
    return [...learnedAppWords, ...customWords];
  }

  function twalGetCached(word) {
    try {
      const raw = localStorage.getItem(TWAL_CACHE_KEY);
      if (!raw) return null;
      const cache = JSON.parse(raw);
      return cache[word] || null;
    } catch { return null; }
  }

  function twalSetCached(word, data) {
    try {
      const raw = localStorage.getItem(TWAL_CACHE_KEY);
      const cache = raw ? JSON.parse(raw) : {};
      cache[word] = data;
      // Keep cache from growing unbounded — max 100 entries
      const keys = Object.keys(cache);
      if (keys.length > 100) delete cache[keys[0]];
      localStorage.setItem(TWAL_CACHE_KEY, JSON.stringify(cache));
    } catch {}
  }

  async function twalPlay() {
    const words = twalGetWordBank();
    const noWordsMsg = document.getElementById('twal-no-words-msg');
    const readyDiv = document.getElementById('twal-ready');

    if (words.length === 0) {
      if (noWordsMsg) noWordsMsg.style.display = 'block';
      if (readyDiv) readyDiv.style.display = 'none';
      return;
    }

    // Pick a random word
    twalCurrentWord = words[Math.floor(Math.random() * words.length)];
    twalAnswered = false;

    // Show loading
    twalSetState('loading');

    // Check cache first
    let result = twalGetCached(twalCurrentWord.word);

    if (!result) {
      try {
        const response = await fetch('/.netlify/functions/claude-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task: 'two_words_and_a_lie',
            payload: {
              word: twalCurrentWord.word,
              partOfSpeech: twalCurrentWord.partOfSpeech,
              definition: twalCurrentWord.definition,
              exampleSentence: twalCurrentWord.exampleSentence
            }
          })
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          console.error('TWAL server error:', response.status, errBody);
          throw new Error(`Server error ${response.status}: ${errBody.detail || errBody.error || 'unknown'}`);
        }
        result = await response.json();
        if (!result.sentences) throw new Error('Bad response shape');
        twalSetCached(twalCurrentWord.word, result);
      } catch (err) {
        console.error('TWAL fetch error:', err);
        twalSetState('idle');
        showToast('Could not load sentences. Check your connection and try again.', 'error');
        return;
      }
    }

    twalRender(result);
  }

  function twalRender(result) {
    const wordEl = document.getElementById('twal-word');
    const posEl = document.getElementById('twal-pos');
    const sentencesEl = document.getElementById('twal-sentences');
    const feedbackEl = document.getElementById('twal-feedback');
    const actionsEl = document.getElementById('twal-actions');

    if (wordEl) wordEl.textContent = twalCurrentWord.word;
    if (posEl) posEl.textContent = twalCurrentWord.partOfSpeech;
    if (feedbackEl) { feedbackEl.style.display = 'none'; feedbackEl.textContent = ''; }
    if (actionsEl) actionsEl.style.display = 'none';

    if (sentencesEl) {
      sentencesEl.innerHTML = result.sentences.map((s, i) => `
        <button class="twal-sentence-btn" data-index="${i}" data-correct="${s.correct}">
          <span class="twal-label">${String.fromCharCode(65 + i)}.</span>
          <span class="twal-text">${s.text}</span>
        </button>
      `).join('');

      sentencesEl.querySelectorAll('.twal-sentence-btn').forEach(btn => {
        btn.addEventListener('click', () => twalAnswer(btn, result));
      });
    }

    twalSetState('active');
  }

  function twalAnswer(btn, result) {
    if (twalAnswered) return;
    twalAnswered = true;

    const isCorrectGuess = btn.dataset.correct === 'false'; // user picks the LIE
    twalScore.played++;
    if (isCorrectGuess) twalScore.correct++;

    // Style all buttons
    const allBtns = document.querySelectorAll('.twal-sentence-btn');
    allBtns.forEach(b => {
      b.disabled = true;
      if (b.dataset.correct === 'false') {
        b.classList.add('twal-incorrect-sentence');
      } else {
        b.classList.add('twal-correct-sentence');
      }
    });

    // Highlight chosen
    btn.classList.add(isCorrectGuess ? 'twal-chosen-right' : 'twal-chosen-wrong');

    // Feedback
    const feedbackEl = document.getElementById('twal-feedback');
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.className = `twal-feedback ${isCorrectGuess ? 'twal-feedback-correct' : 'twal-feedback-wrong'}`;
      feedbackEl.innerHTML = isCorrectGuess
        ? `<strong>Correct!</strong> You spotted the lie. <em>${result.explanation}</em>`
        : `<strong>Not quite.</strong> <em>${result.explanation}</em>`;
    }

    // Score
    const scoreCorrect = document.getElementById('twal-score-correct');
    const scorePlayed = document.getElementById('twal-score-played');
    const scoreBar = document.getElementById('twal-score-bar');
    if (scoreCorrect) scoreCorrect.textContent = twalScore.correct;
    if (scorePlayed) scorePlayed.textContent = twalScore.played;
    if (scoreBar) scoreBar.style.display = 'block';

    // Show next button
    const actionsEl = document.getElementById('twal-actions');
    if (actionsEl) actionsEl.style.display = 'block';

    StorageManager.markActiveToday();
  }

  function twalSetState(state) {
    const idle = document.getElementById('twal-idle');
    const loading = document.getElementById('twal-loading');
    const active = document.getElementById('twal-active');
    if (idle) idle.style.display = state === 'idle' ? 'block' : 'none';
    if (loading) loading.style.display = state === 'loading' ? 'block' : 'none';
    if (active) active.style.display = state === 'active' ? 'block' : 'none';
  }

  // ============================================
  // USE IT IN A SENTENCE
  // ============================================

  let uisCurrentWord = null;
  let uisSetup = false;

  function initUIS() {
    if (uisSetup) return;
    uisSetup = true;

    const shuffleBtn = document.getElementById('uis-shuffle-btn');
    const submitBtn = document.getElementById('uis-submit-btn');
    const tryAgainBtn = document.getElementById('uis-try-again-btn');

    if (shuffleBtn) shuffleBtn.addEventListener('click', uisPickWord);
    if (submitBtn) submitBtn.addEventListener('click', uisSubmit);
    if (tryAgainBtn) tryAgainBtn.addEventListener('click', uisReset);

    uisPickWord();
  }

  function uisGetWordBank() {
    return twalGetWordBank(); // reuse same word bank helper
  }

  function uisPickWord() {
    const words = uisGetWordBank();
    const noWordsMsg = document.getElementById('uis-no-words-msg');
    const readyDiv = document.getElementById('uis-ready');

    if (words.length === 0) {
      if (noWordsMsg) noWordsMsg.style.display = 'block';
      if (readyDiv) readyDiv.style.display = 'none';
      return;
    }

    if (noWordsMsg) noWordsMsg.style.display = 'none';
    if (readyDiv) readyDiv.style.display = 'block';

    uisCurrentWord = words[Math.floor(Math.random() * words.length)];

    const wordEl = document.getElementById('uis-word');
    const posEl = document.getElementById('uis-pos');
    const defEl = document.getElementById('uis-definition');
    const textarea = document.getElementById('uis-textarea');

    if (wordEl) wordEl.textContent = uisCurrentWord.word;
    if (posEl) posEl.textContent = uisCurrentWord.partOfSpeech;
    if (defEl) defEl.textContent = uisCurrentWord.definition;
    if (textarea) textarea.value = '';

    uisSetState('picker');
  }

  async function uisSubmit() {
    const textarea = document.getElementById('uis-textarea');
    const sentence = textarea ? textarea.value.trim() : '';

    if (!sentence) {
      showToast('Write a sentence first.', 'error');
      return;
    }

    if (!uisCurrentWord) return;

    uisSetState('loading');

    try {
      const response = await fetch('/.netlify/functions/claude-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'grade_sentence',
          payload: {
            word: uisCurrentWord.word,
            partOfSpeech: uisCurrentWord.partOfSpeech,
            definition: uisCurrentWord.definition,
            sentence: sentence
          }
        })
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const result = await response.json();
      if (typeof result.correct === 'undefined') throw new Error('Bad response shape');

      uisShowFeedback(sentence, result);
      StorageManager.markActiveToday();
    } catch (err) {
      console.error('UIS fetch error:', err);
      uisSetState('picker');
      showToast('Could not check sentence. Try again.', 'error');
    }
  }

  function uisShowFeedback(sentence, result) {
    const feedbackWordEl = document.getElementById('uis-feedback-word');
    const submittedEl = document.getElementById('uis-submitted-sentence');
    const resultCard = document.getElementById('uis-result-card');

    if (feedbackWordEl) feedbackWordEl.textContent = uisCurrentWord.word;
    if (submittedEl) submittedEl.textContent = `"${sentence}"`;

    if (resultCard) {
      const icon = result.correct ? '✓' : '✗';
      const cls = result.correct ? 'uis-result-correct' : 'uis-result-incorrect';
      const suggestionHtml = (!result.correct && result.suggestion)
        ? `<div class="uis-suggestion"><strong>Try this instead:</strong> <em>${result.suggestion}</em></div>`
        : '';

      resultCard.className = `uis-result-card ${cls}`;
      resultCard.innerHTML = `
        <div class="uis-result-header">
          <span class="uis-result-icon">${icon}</span>
          <span class="uis-result-label">${result.correct ? 'Correct usage!' : 'Not quite right'}</span>
        </div>
        <div class="uis-result-feedback">${result.feedback}</div>
        ${suggestionHtml}
      `;
    }

    uisSetState('feedback');
  }

  function uisReset() {
    uisPickWord();
  }

  function uisSetState(state) {
    const picker = document.getElementById('uis-picker');
    const loading = document.getElementById('uis-loading');
    const feedback = document.getElementById('uis-feedback');
    if (picker) picker.style.display = state === 'picker' ? 'block' : 'none';
    if (loading) loading.style.display = state === 'loading' ? 'block' : 'none';
    if (feedback) feedback.style.display = state === 'feedback' ? 'block' : 'none';
  }

  // Public API
  return {
    init: init,
    showNewWord: showNewWord,
    markAsLearned: markAsLearned,
    markAsStillLearning: markAsStillLearning,
    startPractice: startPractice,
    setMode: setMode,
    showLearnedWord: showLearnedWord,
    showStillLearningWord: showStillLearningWord,
    moveToLearned: moveToLearned,
    moveToStillLearning: moveToStillLearning,
    refresh: refresh,
    getCurrentDifficulty: getCurrentDifficulty,
    getProgress: getProgress,
    switchVocabCategory: switchVocabCategory,
    speakWord: speakWord,
    initTWAL: initTWAL,
    initUIS: initUIS,
    switchKCTab: switchKCTab
  };
})();

// Log that VocabularyModule is loaded
console.log('VocabularyModule loaded successfully');
