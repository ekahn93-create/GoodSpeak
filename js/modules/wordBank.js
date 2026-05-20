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
  let appWordsCountElement = null;
  let stillLearningCountElement = null;
  let lookupButton = null;
  let lookupStatus = null;
  let pickerDefs = [];

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
    appWordsCountElement = document.getElementById('app-words-count');
    stillLearningCountElement = document.getElementById('still-learning-words-count');
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

    // Initialize savedForLater if it doesn't exist
    if (!userData.savedForLater) {
      userData.savedForLater = [];
      StorageManager.save(userData);
    }

    // Show badge immediately if there are saved words
    _updateLearnBadge(userData.savedForLater.length);

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
    // Add custom word buttons
    const addStillLearningBtn = document.getElementById('add-word-still-learning-btn');
    if (addStillLearningBtn) {
      addStillLearningBtn.addEventListener('click', () => handleAddCustomWord('stillLearning'));
    }
    const addLearnedBtn = document.getElementById('add-word-learned-btn');
    if (addLearnedBtn) {
      addLearnedBtn.addEventListener('click', () => handleAddCustomWord('learned'));
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

    // Update Words Available count when source dropdown changes
    const quizSourceSelect = document.getElementById('quiz-source');
    if (quizSourceSelect) {
      quizSourceSelect.addEventListener('change', updateQuizWordCount);
    }

    // Listen for view changes
    document.addEventListener('viewChanged', function(e) {
      if (e.detail.viewName === 'vocabulary') {
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
    pickerDefs = [];
    lookupButton.disabled = true;
    lookupButton.textContent = 'Looking up...';
    showLookupStatus('Fetching definition...', 'info');

    try {
      if (typeof APIService !== 'undefined') {
        const [wordData, allDefs] = await Promise.all([
          APIService.getWordDefinition(word),
          APIService.getAllDefinitions(word)
        ]);

        if (wordData) {
          // Populate pronunciation — always set (clears stale value if new word has none)
          document.getElementById('custom-pronunciation').value = wordData.phonetic
            ? convertIPAToReadable(wordData.phonetic) : '';
          if (wordData.synonyms && wordData.synonyms.length > 0) {
            document.getElementById('custom-synonyms').value = wordData.synonyms.slice(0, 5).join(', ');
          }

          // If multiple definitions exist, show picker; otherwise auto-fill
          if (allDefs && allDefs.length > 1) {
            showDefinitionPicker(allDefs);
          } else {
            applyDefinition(wordData.partOfSpeech, wordData.definition, wordData.example, wordData.synonyms);
            showLookupStatus('✓ Definition loaded! You can edit any fields before adding.', 'success');
          }
        } else {
          showLookupStatus('Word not found in dictionary. You can still add it manually.', 'warning');
        }
      } else {
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
   * Apply a selected definition to the form fields
   */
  function applyDefinition(partOfSpeech, definition, example, synonyms) {
    if (partOfSpeech) {
      const posSelect = document.getElementById('custom-part-of-speech');
      const normalized = partOfSpeech.toLowerCase();
      posSelect.value = ['noun', 'verb', 'adjective', 'adverb'].includes(normalized) ? normalized : 'other';
    }
    if (definition) {
      document.getElementById('custom-definition').value = definition;
    }
    document.getElementById('custom-example').value = example || '';
    if (synonyms && synonyms.length > 0) {
      document.getElementById('custom-synonyms').value = synonyms.slice(0, 5).join(', ');
    } else {
      document.getElementById('custom-synonyms').value = '';
    }
  }

  /**
   * Render a clickable definition picker below the lookup status
   */
  function showDefinitionPicker(defs) {
    pickerDefs = defs;

    // Auto-fill with the first definition
    applyDefinition(defs[0].partOfSpeech, defs[0].definition, defs[0].example, defs[0].synonyms);

    if (!lookupStatus) return;

    const items = defs.map((d, i) => `
      <div class="def-picker-item${i === 0 ? ' def-picker-item--selected' : ''}"
           onclick="WordBankModule.selectDefinition(${i})"
           data-index="${i}">
        <span class="def-picker-pos">${d.partOfSpeech}</span>
        <span class="def-picker-text">${d.definition}</span>
      </div>
    `).join('');

    lookupStatus.innerHTML = `
      <div style="color: #4A90E2; margin-bottom: 6px; font-size: var(--font-size-sm); font-weight: 500;">✓ Multiple definitions found — select one:</div>
      <div id="def-picker-list" class="def-picker-list">${items}</div>
      <div style="margin-top: 8px; font-size: 0.72rem; color: var(--text-secondary); font-style: italic;">Don't see the right definition? You can fill it in manually below.</div>
    `;
  }

  /**
   * Show lookup status message
   * @param {string} message - Status message
   * @param {string} type - Message type (info, success, warning, error)
   */
  function showLookupStatus(message, type) {
    if (!lookupStatus) return;

    const icons = {
      info: '',
      success: '✓',
      warning: '',
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
  function handleAddCustomWord(status) {

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
      status: status, // 'stillLearning' or 'learned'
      addedDate: new Date().toISOString()
    };

    // Add to user data
    if (!userData.customWords) {
      userData.customWords = [];
    }
    userData.customWords.push(customWord);

    // Save to storage
    if (StorageManager.save(userData)) {
      const label = status === 'learned' ? 'Learned Words' : 'Still Learning';
      showToast(`Word added to ${label}!`, 'success');

      // Clear form and lookup status
      addWordForm.reset();
      if (lookupStatus) lookupStatus.innerHTML = '';
      pickerDefs = [];

      // Refresh display
      if (status === 'learned') {
        displayAppLearnedWords();
      } else {
        displayStillLearningWords();
      }
      updateCounts();

      // Fire background enrichment via Claude (non-blocking)
      enrichCustomWord(customWord.id);
    } else {
      showToast('Failed to save word', 'error');
    }
  }

  async function enrichCustomWord(wordId) {
    const word = userData.customWords.find(w => w.id === wordId);
    if (!word || word.aiEnriched) return;
    try {
      const res = await fetch('/.netlify/functions/claude-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'word_enrichment',
          payload: {
            word: word.word,
            partOfSpeech: word.partOfSpeech,
            definition: word.definition,
            example: word.exampleSentence
          }
        })
      });
      if (!res.ok) return;
      const data = await res.json();
      // Merge enrichment back onto the stored word
      const stored = userData.customWords.find(w => w.id === wordId);
      if (stored) {
        stored.aiExamples = data.examples || [];
        stored.aiMnemonic = data.mnemonic || '';
        stored.aiEnriched = true;
        StorageManager.save(userData);
      }
    } catch { /* silently fail — enrichment is a bonus */ }
  }

  /**
   * Display app learned words
   */
  function displayAppLearnedWords(sortBy) {
    if (!appLearnedWordsContainer || !userData) return;

    // Check if vocabularyDatabase is available and properly loaded
    if (typeof vocabularyDatabase === 'undefined' || !vocabularyDatabase.beginner) {
      console.warn('vocabularyDatabase not available in displayAppLearnedWords');
      appLearnedWordsContainer.innerHTML = '<p class="text-secondary">Loading vocabulary database...</p>';
      return;
    }

    // Get word objects for learned word IDs from the database
    const allWords = [
      ...vocabularyDatabase.beginner,
      ...vocabularyDatabase.intermediate,
      ...vocabularyDatabase.advanced
    ];

    const learnedWordObjects = (userData.vocabulary.learned || []).map(id => {
      return allWords.find(w => w.id === id || w.word === id);
    }).filter(w => w !== undefined);

    // Add custom words marked as learned
    const customLearned = (userData.customWords || []).filter(w => w.status === 'learned');

    const combined = [...learnedWordObjects, ...customLearned];

    if (combined.length === 0) {
      appLearnedWordsContainer.innerHTML = '<p class="text-secondary">No words learned yet. Visit the Vocabulary Builder to start learning!</p>';
      return;
    }

    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const currentSort = sortBy || (document.getElementById('app-learned-sort') ? document.getElementById('app-learned-sort').value : 'alpha');
    if (currentSort === 'difficulty') {
      combined.sort((a, b) => (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99) || a.word.localeCompare(b.word));
    } else {
      combined.sort((a, b) => a.word.localeCompare(b.word));
    }

    // Display as detailed cards
    const spokenWords = (userData && userData.spokenWords) ? userData.spokenWords : {};
    const html = combined.map(word => {
      const spokenCount = spokenWords[word.word] || 0;
      return `
      <div class="word-bank-card word-bank-card--learned" onclick="WordBankModule.showWordDetail(${word.id}, ${word.isCustom ? 'true' : 'false'})">
        <div class="word-bank-card-header">
          <div class="word-bank-word">${word.word}</div>
          <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">
            ${word.partOfSpeech ? `<span class="badge badge-primary">${word.partOfSpeech}</span>` : ''}
            ${word.isCustom ? '<span class="badge badge-custom">Custom</span>' : ''}
            ${spokenCount > 0 ? `<span class="badge" style="background:var(--secondary-color);color:#fff;" title="Spoken in practice">Spoken ${spokenCount}x</span>` : ''}
          </div>
        </div>
        ${word.pronunciation ? `<div class="word-bank-pronunciation">${word.pronunciation}</div>` : ''}
        <div class="word-bank-definition">${truncateText(word.definition, 80)}</div>
      </div>`;
    }).join('');

    appLearnedWordsContainer.innerHTML = html;
  }

  /**
   * Display still learning words
   */
  function displayStillLearningWords(sortBy) {
    if (!stillLearningWordsContainer || !userData) return;

    // Check if vocabularyDatabase is available and properly loaded
    if (typeof vocabularyDatabase === 'undefined' || !vocabularyDatabase.beginner) {
      console.warn('vocabularyDatabase not available in displayStillLearningWords');
      stillLearningWordsContainer.innerHTML = '<p class="text-secondary">Loading vocabulary database...</p>';
      return;
    }

    // Get word objects for still learning word IDs from the database
    const allWords = [
      ...vocabularyDatabase.beginner,
      ...vocabularyDatabase.intermediate,
      ...vocabularyDatabase.advanced
    ];

    const stillLearningWordObjects = (userData.vocabulary.stillLearning || []).map(id => {
      return allWords.find(w => w.id === id || w.word === id);
    }).filter(w => w !== undefined);

    // Add custom words marked as stillLearning
    const customStillLearning = (userData.customWords || []).filter(w => w.status === 'stillLearning');

    const combined = [...stillLearningWordObjects, ...customStillLearning];

    if (combined.length === 0) {
      stillLearningWordsContainer.innerHTML = '<p class="text-secondary">No words in Still Learning yet. Visit the Vocabulary Builder to add words!</p>';
      return;
    }

    const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const currentSort = sortBy || (document.getElementById('still-learning-sort') ? document.getElementById('still-learning-sort').value : 'alpha');
    if (currentSort === 'difficulty') {
      combined.sort((a, b) => (difficultyOrder[a.difficulty] || 99) - (difficultyOrder[b.difficulty] || 99) || a.word.localeCompare(b.word));
    } else {
      combined.sort((a, b) => a.word.localeCompare(b.word));
    }

    // Display as detailed cards
    const spokenWords = (userData && userData.spokenWords) ? userData.spokenWords : {};
    const html = combined.map(word => {
      const spokenCount = spokenWords[word.word] || 0;
      return `
      <div class="word-bank-card word-bank-card--still-learning" onclick="${word.isCustom ? `WordBankModule.showCustomWordDetail(${word.id})` : `WordBankModule.showStillLearningWordDetail(${word.id})`}">
        <div class="word-bank-card-header">
          <div class="word-bank-word">${word.word}</div>
          <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">
            ${word.partOfSpeech ? `<span class="badge badge-primary">${word.partOfSpeech}</span>` : ''}
            ${word.isCustom ? '<span class="badge badge-custom">Custom</span>' : ''}
            ${spokenCount > 0 ? `<span class="badge" style="background:var(--secondary-color);color:#fff;" title="Spoken in practice">Spoken ${spokenCount}x</span>` : ''}
          </div>
        </div>
        ${word.pronunciation ? `<div class="word-bank-pronunciation">${word.pronunciation}</div>` : ''}
        ${word.definition ? `<div class="word-bank-definition">${truncateText(word.definition, 80)}</div>` : ''}
      </div>`;
    }).join('');

    stillLearningWordsContainer.innerHTML = html;
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

    const statusClass = isCustom && word.status === 'stillLearning' ? 'word-card--still-learning' : 'word-card--learned';
    const content = `
      <div class="word-card ${statusClass}">
        <div class="word-main">${word.word}</div>
        ${word.pronunciation ? `<div class="word-pronunciation">${word.pronunciation}</div>` : ''}
        <div class="word-meta">
          ${word.partOfSpeech ? `<span class="badge badge-primary">${word.partOfSpeech}</span>` : ''}
          ${isCustom ? '<span class="badge badge-custom">Custom</span>' : `<span class="badge badge-secondary">${word.difficulty}</span>`}
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
        ${isCustom && word.aiMnemonic ? `
          <div class="word-example" style="margin-top: var(--spacing-sm);">
            <strong>Memory tip:</strong> ${word.aiMnemonic}
          </div>
        ` : ''}
        ${isCustom && word.aiExamples && word.aiExamples.length > 0 ? `
          <div class="word-example" style="margin-top: var(--spacing-sm);">
            <strong>More examples:</strong>
            <ul style="margin: var(--spacing-xs) 0 0 var(--spacing-md); padding: 0;">
              ${word.aiExamples.map(ex => `<li style="margin-bottom: 4px;">"${ex}"</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${isCustom ? `
          <div class="word-meta" style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
            Added: ${new Date(word.addedDate).toLocaleDateString()}
          </div>
          <div class="action-buttons" style="margin-top: 1rem;">
            ${word.status === 'learned'
              ? `<button class="btn btn-secondary" onclick="WordBankModule.moveCustomWordToStillLearning(${wordId})">Move to Still Learning</button>`
              : `<button class="btn btn-success" onclick="WordBankModule.moveCustomWordToLearned(${wordId})">Move to Learned</button>`
            }
          </div>
          <div style="margin-top: 0.75rem; text-align: center;">
            <button class="btn-text-danger" onclick="WordBankModule.deleteCustomWord(${wordId})">Remove from Word Bank</button>
          </div>
        ` : `
          <div class="action-buttons" style="margin-top: 1rem;">
            <button class="btn btn-secondary" onclick="WordBankModule.moveWordToStillLearning(${wordId})">
              Move to Still Learning
            </button>
          </div>
          <div style="margin-top: 0.75rem; text-align: center;">
            <button class="btn-text-danger" onclick="WordBankModule.removeWordFromLearned(${wordId})">Remove from Word Bank</button>
          </div>
        `}
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
      <div class="word-card word-card--still-learning">
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
        <div style="margin-top: 0.75rem; text-align: center;">
          <button class="btn-text-danger" onclick="WordBankModule.removeWordFromStillLearning(${wordId})">Remove from Word Bank</button>
        </div>
      </div>
    `;

    Modal.show(content);
  }

  /**
   * Show detail modal for a custom word in Still Learning
   * @param {number} wordId - The custom word ID
   */
  function showCustomWordDetail(wordId) {
    showWordDetail(wordId, true);
  }

  /**
   * Update the open modal's border and move button after a status change
   * @param {'learned'|'stillLearning'} newStatus
   * @param {number} wordId
   * @param {boolean} isCustom
   */
  function updateModalAfterMove(newStatus, wordId, isCustom) {
    const card = document.querySelector('#modal-body .word-card');
    if (!card) return;

    card.classList.remove('word-card--learned', 'word-card--still-learning');
    card.classList.add(newStatus === 'learned' ? 'word-card--learned' : 'word-card--still-learning');

    const actionButtons = card.querySelector('.action-buttons');
    if (!actionButtons) return;

    if (isCustom) {
      actionButtons.innerHTML = newStatus === 'learned'
        ? `<button class="btn btn-secondary" onclick="WordBankModule.moveCustomWordToStillLearning(${wordId})">Move to Still Learning</button>`
        : `<button class="btn btn-success" onclick="WordBankModule.moveCustomWordToLearned(${wordId})">Move to Learned</button>`;
    } else {
      actionButtons.innerHTML = newStatus === 'learned'
        ? `<button class="btn btn-secondary" onclick="WordBankModule.moveWordToStillLearning(${wordId})">Move to Still Learning</button>`
        : `<button class="btn btn-success" onclick="WordBankModule.moveWordToLearned(${wordId})">Move to Learned Words</button>`;
    }
  }

  /**
   * Move a custom word's status to learned
   * @param {number} wordId - The custom word ID
   */
  function moveCustomWordToLearned(wordId) {
    if (!userData || !userData.customWords) return;
    const word = userData.customWords.find(w => w.id === wordId);
    if (!word) return;
    word.status = 'learned';
    if (StorageManager.save(userData)) {
      showToast('Word moved to Learned!', 'success');
      displayStillLearningWords();
      displayAppLearnedWords();
      updateCounts();
      updateModalAfterMove('learned', wordId, true);
    } else {
      showToast('Failed to save progress', 'error');
    }
  }

  /**
   * Move a custom word's status to stillLearning
   * @param {number} wordId - The custom word ID
   */
  function moveCustomWordToStillLearning(wordId) {
    if (!userData || !userData.customWords) return;
    const word = userData.customWords.find(w => w.id === wordId);
    if (!word) return;
    word.status = 'stillLearning';
    if (StorageManager.save(userData)) {
      showToast('Word moved to Still Learning!', 'success');
      displayAppLearnedWords();
      displayStillLearningWords();
      updateCounts();
      updateModalAfterMove('stillLearning', wordId, true);
    } else {
      showToast('Failed to save progress', 'error');
    }
  }

  /**
   * Remove a DB word from the Learned list entirely
   * @param {number} wordId - The word ID to remove
   */
  function removeWordFromLearned(wordId) {
    if (!userData) return;
    Modal.confirm({
      title: 'Remove Word',
      message: 'Remove this word from your Word Bank? You can re-learn it from the Vocabulary Builder.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: () => {
        userData.vocabulary.learned = userData.vocabulary.learned.filter(id => id !== wordId);
        userData.vocabulary.totalWordsLearned = userData.vocabulary.learned.length;
        if (StorageManager.save(userData)) {
          showToast('Word removed', 'success');
          displayAppLearnedWords();
          updateCounts();
          Modal.hide();
          if (typeof VocabularyModule !== 'undefined' && VocabularyModule.refresh) VocabularyModule.refresh();
        } else {
          showToast('Failed to save', 'error');
        }
      }
    });
  }

  /**
   * Remove a DB word from the Still Learning list entirely
   * @param {number} wordId - The word ID to remove
   */
  function removeWordFromStillLearning(wordId) {
    if (!userData) return;
    Modal.confirm({
      title: 'Remove Word',
      message: 'Remove this word from your Word Bank? You can re-add it from the Vocabulary Builder.',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      onConfirm: () => {
        userData.vocabulary.stillLearning = (userData.vocabulary.stillLearning || []).filter(id => id !== wordId);
        if (StorageManager.save(userData)) {
          showToast('Word removed', 'success');
          displayStillLearningWords();
          updateCounts();
          Modal.hide();
          if (typeof VocabularyModule !== 'undefined' && VocabularyModule.refresh) VocabularyModule.refresh();
        } else {
          showToast('Failed to save', 'error');
        }
      }
    });
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
      updateModalAfterMove('learned', wordId, false);

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
      updateModalAfterMove('stillLearning', wordId, false);

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
          displayAppLearnedWords();
          displayStillLearningWords();
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
      const customLearnedCount = (userData.customWords || []).filter(w => w.status === 'learned').length;
      appWordsCountElement.textContent = (userData.vocabulary.learned || []).length + customLearnedCount;
    }

    if (stillLearningCountElement && userData) {
      const customStillLearningCount = (userData.customWords || []).filter(w => w.status === 'stillLearning').length;
      const stillLearningCount = (userData.vocabulary.stillLearning || []).length;
      stillLearningCountElement.textContent = stillLearningCount + customStillLearningCount;
    }

    // Update spoken practice badges
    const spokenWords = (userData && userData.spokenWords) ? userData.spokenWords : {};
    const allWordBankWords = getAllWordBankWords();

    const learnedSpoken = allWordBankWords.filter(w =>
      (userData.vocabulary.learned || []).includes(w.id) ||
      (userData.vocabulary.learned || []).includes(w.word) ||
      ((userData.customWords || []).find(c => c.word === w.word && c.status === 'learned'))
    ).filter(w => (spokenWords[w.word] || 0) > 0).length;

    const stillSpoken = allWordBankWords.filter(w =>
      (userData.vocabulary.stillLearning || []).includes(w.id) ||
      (userData.vocabulary.stillLearning || []).includes(w.word) ||
      ((userData.customWords || []).find(c => c.word === w.word && c.status === 'stillLearning'))
    ).filter(w => (spokenWords[w.word] || 0) > 0).length;

    const learnedBadge = document.getElementById('learned-spoken-badge');
    const learnedSpokenCount = document.getElementById('learned-spoken-count');
    if (learnedBadge && learnedSpokenCount) {
      learnedSpokenCount.textContent = learnedSpoken;
      learnedBadge.style.display = learnedSpoken > 0 ? '' : 'none';
    }

    const stillBadge = document.getElementById('still-learning-spoken-badge');
    const stillSpokenCount = document.getElementById('still-learning-spoken-count');
    if (stillBadge && stillSpokenCount) {
      stillSpokenCount.textContent = stillSpoken;
      stillBadge.style.display = stillSpoken > 0 ? '' : 'none';
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
        toast.remove();
      }, 300);
    }, 3000);
  }

  /**
   * Get all Word Bank words (learned + stillLearning + custom) for external use.
   * Returns lightweight objects: { word, definition, partOfSpeech, themes }
   * @returns {Array}
   */
  function getAllWordBankWords() {
    if (!userData) return [];
    const words = [];

    if (typeof vocabularyDatabase !== 'undefined' && vocabularyDatabase.beginner) {
      const dbWords = [
        ...vocabularyDatabase.beginner,
        ...vocabularyDatabase.intermediate,
        ...vocabularyDatabase.advanced
      ];
      const allIds = [
        ...(userData.vocabulary.learned || []),
        ...(userData.vocabulary.stillLearning || [])
      ];
      allIds.forEach(id => {
        const w = dbWords.find(w => w.id === id || w.word === id);
        if (w && !words.find(x => x.word === w.word)) words.push(w);
      });
    }

    (userData.customWords || []).forEach(w => {
      if ((w.status === 'learned' || w.status === 'stillLearning') && !words.find(x => x.word === w.word)) {
        words.push(w);
      }
    });

    return words;
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
      const customWords = userData.customWords || [];
      customWords.forEach(word => {
        if (word.definition && (word.status === 'learned' || word.status === 'stillLearning')) {
          words.push(word);
        }
      });
      return words;
    }

    const dbWords = [
      ...vocabularyDatabase.beginner,
      ...vocabularyDatabase.intermediate,
      ...vocabularyDatabase.advanced
    ];

    // Learned db words
    const learnedIds = userData.vocabulary.learned || [];
    learnedIds.forEach(id => {
      const word = dbWords.find(w => w.id === id || w.word === id);
      if (word) words.push({ ...word, _quizStatus: 'learned' });
    });

    // Still learning db words
    const stillLearningIds = userData.vocabulary.stillLearning || [];
    stillLearningIds.forEach(id => {
      const word = dbWords.find(w => w.id === id || w.word === id);
      if (word) words.push({ ...word, _quizStatus: 'stillLearning' });
    });

    // Custom words with a status
    const customWords = userData.customWords || [];
    customWords.forEach(word => {
      if (word.definition && (word.status === 'learned' || word.status === 'stillLearning')) {
        words.push(word);
      }
    });

    return words;
  }

  /**
   * Update the "Words Available" count based on the selected quiz source
   */
  function updateQuizWordCount() {
    if (!quizTotalWordsElement || !userData) return;

    const quizSourceSelect = document.getElementById('quiz-source');
    const selectedSource = quizSourceSelect ? quizSourceSelect.value : 'all';
    let allWords = getAllQuizWords();

    if (selectedSource === 'stillLearning') {
      allWords = allWords.filter(word => word._quizStatus === 'stillLearning' || word.status === 'stillLearning');
    } else if (selectedSource === 'learned') {
      allWords = allWords.filter(word => word._quizStatus === 'learned' || word.status === 'learned');
    } else if (selectedSource === 'custom') {
      allWords = allWords.filter(word => word.isCustom === true || word.id >= 1000000);
    }

    quizTotalWordsElement.textContent = allWords.length;
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
      allWords = allWords.filter(word => word._quizStatus === 'stillLearning' || word.status === 'stillLearning');
    } else if (selectedSource === 'learned') {
      allWords = allWords.filter(word => word._quizStatus === 'learned' || word.status === 'learned');
    } else if (selectedSource === 'custom') {
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

    // Nudge toward next step after quiz
    if (typeof NudgeModule !== 'undefined') {
      const msg = percentage >= 80
        ? 'Great score! Put those words to use — try a Storytelling prompt.'
        : 'Keep building — head to Vocabulary Builder to learn more words.';
      const linkLabel = percentage >= 80 ? 'Go to Practice' : 'Go to Vocabulary Builder';
      const targetView = percentage >= 80 ? 'storytelling' : 'vocabulary';
      const targetTab = percentage >= 80 ? 'storytelling' : 'builder';
      NudgeModule.show('nudge-quiz-done', msg, linkLabel, targetView, targetTab);
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

    renderSavedForLater();
    displayAppLearnedWords();
    displayStillLearningWords();
    updateCounts();

    // Update quiz total words count based on current source selection
    updateQuizWordCount();

    // Enable/disable start button based on word count
    const totalQuizWords = getAllQuizWords().length;
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
    }
  }

  function toggleAddSection() {
    const body = document.getElementById('word-bank-add-body');
    const toggle = document.getElementById('word-bank-add-toggle');
    const chevron = toggle && toggle.querySelector('.word-bank-add-chevron');
    if (!body) return;
    const isOpen = body.style.display !== 'none';
    body.style.display = isOpen ? 'none' : 'block';
    if (toggle) toggle.setAttribute('aria-expanded', String(!isOpen));
    if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
  }

  function toggleSection(gridId, btnId) {
    const grid = document.getElementById(gridId);
    const btn = document.getElementById(btnId);
    if (!grid || !btn) return;
    const isCollapsed = grid.classList.toggle('collapsed');
    btn.classList.toggle('collapsed', isCollapsed);
    btn.setAttribute('aria-label', isCollapsed ? 'Expand' : 'Collapse');
  }

  // Public API
  /**
   * Called when a definition picker item is clicked
   */
  function selectDefinition(index) {
    if (!pickerDefs.length) return;

    const d = pickerDefs[index];
    applyDefinition(d.partOfSpeech, d.definition, d.example, d.synonyms);

    document.querySelectorAll('.def-picker-item').forEach((el, i) => {
      el.classList.toggle('def-picker-item--selected', i === index);
    });
  }

  // ── SAVED FOR LATER (QUICK-ADD INBOX) ─────────────────────────────────────

  /**
   * Save a word to the "Saved for Later" inbox from the quick-add FAB.
   * Called from the inline FAB script on each page.
   */
  function quickSave(word, definition) {
    if (!word) return;
    const data = StorageManager.load();
    if (!data) return;

    if (!data.savedForLater) data.savedForLater = [];

    // Avoid duplicates (case-insensitive)
    const alreadyExists = data.savedForLater.some(
      item => item.word.toLowerCase() === word.toLowerCase()
    );
    if (alreadyExists) {
      _showToast('"' + word + '" is already in your inbox.');
      return;
    }

    data.savedForLater.push({ word: word, definition: definition || '', savedAt: new Date().toISOString() });
    StorageManager.save(data);

    _showToast('"' + word + '" saved for later!');
    _updateLearnBadge(data.savedForLater.length);

    // If the Word Bank panel is currently visible, re-render inbox immediately
    const bankPanel = document.getElementById('bank-category');
    if (bankPanel && bankPanel.classList.contains('active')) {
      userData = data;
      renderSavedForLater();
    }
  }

  /**
   * Render the Saved for Later inbox at the top of the Word Bank panel.
   */
  function renderSavedForLater() {
    const section = document.getElementById('saved-for-later-section');
    const list = document.getElementById('sfl-list');
    const countEl = document.getElementById('sfl-count');
    if (!section || !list) return;

    const data = StorageManager.load();
    const items = (data && data.savedForLater) || [];

    _updateLearnBadge(items.length);

    if (items.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    if (countEl) countEl.textContent = '(' + items.length + ')';

    list.innerHTML = items.map((item, idx) => {
      const hasDef = item.definition && item.definition.trim();
      return `
        <li class="sfl-item" id="sfl-item-${idx}">
          <div class="sfl-row">
            <button class="sfl-toggle" onclick="WordBankModule.toggleSflAccordion(${idx})" aria-expanded="false" aria-label="Toggle definition">
              <span class="sfl-word">${item.word}</span>
              ${hasDef ? '<svg class="sfl-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' : ''}
            </button>
            <div class="sfl-actions">
              <button class="btn btn-sm btn-secondary sfl-status-btn" onclick="WordBankModule.promoteToWordBank(${idx}, 'stillLearning')">Still Learning</button>
              <button class="btn btn-sm btn-primary sfl-status-btn" onclick="WordBankModule.promoteToWordBank(${idx}, 'learned')">Learned</button>
              <button class="sfl-dismiss" onclick="WordBankModule.dismissSavedWord(${idx})" aria-label="Dismiss">&times;</button>
            </div>
          </div>
          ${hasDef
            ? `<div class="sfl-definition" id="sfl-def-${idx}" hidden>${item.definition}</div>`
            : `<div class="sfl-no-def">Look up this word in the <strong>Look Up a Custom Word</strong> section below.</div>`
          }
        </li>
      `;
    }).join('');
  }

  /**
   * Directly add a saved word to the word bank with the given status,
   * without touching the Add Custom Word form.
   * @param {number} index - index in savedForLater array
   * @param {'learned'|'stillLearning'} status
   */
  function promoteToWordBank(index, status) {
    const data = StorageManager.load();
    if (!data || !data.savedForLater) return;

    const item = data.savedForLater[index];
    if (!item) return;

    if (!data.customWords) data.customWords = [];

    // Avoid duplicate custom words (case-insensitive)
    const alreadyCustom = data.customWords.some(
      w => w.word.toLowerCase() === item.word.toLowerCase()
    );
    if (!alreadyCustom) {
      const customWord = {
        id: Date.now(),
        word: item.word,
        pronunciation: '',
        partOfSpeech: 'other',
        definition: item.definition || '',
        exampleSentence: '',
        synonyms: [],
        isCustom: true,
        status: status,
        addedDate: new Date().toISOString()
      };
      data.customWords.push(customWord);

      // Fire background enrichment (non-blocking)
      enrichCustomWord(customWord.id);
    }

    // Remove from inbox
    data.savedForLater.splice(index, 1);
    StorageManager.save(data);
    userData = data;

    const label = status === 'learned' ? 'Learned Words' : 'Still Learning';
    _showToast('"' + item.word + '" moved to ' + label + '!');

    renderSavedForLater();

    // Refresh whichever list was affected
    if (status === 'learned') {
      displayAppLearnedWords();
    } else {
      displayStillLearningWords();
    }
    updateCounts();
  }

  /**
   * Toggle accordion expansion for a saved-for-later item.
   */
  function toggleSflAccordion(index) {
    const defEl    = document.getElementById('sfl-def-' + index);
    const toggleEl = document.querySelector('#sfl-item-' + index + ' .sfl-toggle');
    if (!defEl) return;
    const isOpen = !defEl.hidden;
    defEl.hidden = isOpen;
    if (toggleEl) toggleEl.setAttribute('aria-expanded', String(!isOpen));
    const chevron = toggleEl && toggleEl.querySelector('.sfl-chevron');
    if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
  }

  /**
   * Dismiss (delete) a word from the inbox without adding it.
   */
  function dismissSavedWord(index) {
    const data = StorageManager.load();
    if (!data || !data.savedForLater) return;

    data.savedForLater.splice(index, 1);
    StorageManager.save(data);
    userData = data;
    renderSavedForLater();
  }

  /**
   * Update the badge count on the Learn tab in the mobile bottom bar.
   */
  function _updateLearnBadge(count) {
    let badge = document.getElementById('learn-tab-badge');
    const learnTab = document.querySelector('.mobile-tab[data-view="vocabulary"]');
    if (!learnTab) return;

    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'learn-tab-badge';
        badge.className = 'mobile-tab-badge';
        learnTab.appendChild(badge);
      }
      badge.textContent = count;
    } else {
      if (badge) badge.remove();
    }
  }

  function _showToast(msg) {
    if (typeof ToastManager !== 'undefined') {
      ToastManager.show(msg, 'success');
    }
  }

  return {
    init: init,
    showWordDetail: showWordDetail,
    selectDefinition: selectDefinition,
    showStillLearningWordDetail: showStillLearningWordDetail,
    showCustomWordDetail: showCustomWordDetail,
    moveWordToLearned: moveWordToLearned,
    moveWordToStillLearning: moveWordToStillLearning,
    removeWordFromLearned: removeWordFromLearned,
    removeWordFromStillLearning: removeWordFromStillLearning,
    moveCustomWordToLearned: moveCustomWordToLearned,
    moveCustomWordToStillLearning: moveCustomWordToStillLearning,
    deleteCustomWord: deleteCustomWord,
    refresh: refresh,
    sortSection: sortSection,
    toggleSection: toggleSection,
    toggleAddSection: toggleAddSection,
    searchWords: searchWords,
    clearSearch: clearSearch,
    quickSave: quickSave,
    renderSavedForLater: renderSavedForLater,
    promoteToWordBank: promoteToWordBank,
    dismissSavedWord: dismissSavedWord,
    toggleSflAccordion: toggleSflAccordion,
    getAllWordBankWords: getAllWordBankWords
  };
})();

// Log that WordBankModule is loaded
console.log('WordBankModule loaded successfully');
