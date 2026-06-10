// ============================================
// GRAMMAR MODULE
// Handles grammar exercises and structure practice
// ============================================

/**
 * GrammarModule - Module for grammar and sentence structure practice
 * Uses the Revealing Module Pattern
 */
const GrammarModule = (function() {
  // Private variables
  let currentSentence = null;
  let currentError = null;
  let currentAgreement = null;
  let currentVoice = null;

  // Data collections
  const sentenceTransformExercises = [
    {
      simple: "The cat sleeps.",
      complex: "The cat, exhausted from its adventures, sleeps peacefully on the windowsill.",
      hint: "Add descriptive details about the cat's state and location"
    },
    {
      simple: "She reads books.",
      complex: "She reads books voraciously, consuming multiple novels each week.",
      hint: "Add adverbs and additional information about frequency"
    },
    {
      simple: "The team won.",
      complex: "The team won decisively after a hard-fought battle that lasted three hours.",
      hint: "Describe how they won and add temporal context"
    },
    {
      simple: "He speaks clearly.",
      complex: "He speaks clearly and confidently, articulating each word with precision.",
      hint: "Add another adverb and elaborate on the manner of speaking"
    },
    {
      simple: "The meeting ended.",
      complex: "The meeting ended abruptly when the fire alarm interrupted the presentation.",
      hint: "Explain how and why the meeting ended"
    }
  ];

  const combiningExercises = [
    {
      sentences: ["The presentation was informative.", "The presentation was engaging.", "Everyone stayed focused."],
      hint: "Use 'and' to combine the first two, then use 'so' or 'therefore' for the result"
    },
    {
      sentences: ["She practiced daily.", "She improved quickly.", "She gained confidence."],
      hint: "Use 'and as a result' or 'consequently' to show the progression"
    },
    {
      sentences: ["The weather was cold.", "We decided to stay inside.", "We played board games."],
      hint: "Use 'because' or 'since' for cause, then 'and' for the additional action"
    },
    {
      sentences: ["He studied grammar.", "He practiced writing.", "His communication skills improved."],
      hint: "Combine with 'and' then show the result with 'which' or 'thereby'"
    }
  ];

  const errorCorrections = [
    {
      incorrect: "Between you and I, this is confidential.",
      correct: "Between you and me, this is confidential.",
      explanation: "Use 'me' (object pronoun) after prepositions like 'between', not 'I' (subject pronoun)"
    },
    {
      incorrect: "The data shows interesting results.",
      correct: "The data show interesting results.",
      explanation: "'Data' is plural (singular is 'datum'), so use 'show' not 'shows'"
    },
    {
      incorrect: "I could of helped you with that.",
      correct: "I could have helped you with that.",
      explanation: "Use 'could have' (or could've), not 'could of'"
    },
    {
      incorrect: "Your going to love this restaurant.",
      correct: "You're going to love this restaurant.",
      explanation: "Use 'you're' (you are), not 'your' (possessive)"
    },
    {
      incorrect: "Me and John went to the store.",
      correct: "John and I went to the store.",
      explanation: "Use 'I' when it's the subject, and put yourself last"
    },
    {
      incorrect: "There are less people here today.",
      correct: "There are fewer people here today.",
      explanation: "Use 'fewer' for countable items, 'less' for uncountable things"
    },
    {
      incorrect: "The team are winning the game.",
      correct: "The team is winning the game.",
      explanation: "Collective nouns like 'team' take singular verbs in American English"
    },
    {
      incorrect: "Each of the students have their own laptop.",
      correct: "Each of the students has their own laptop.",
      explanation: "'Each' is singular, so use 'has' not 'have'"
    }
  ];

  const agreementExercises = [
    {
      sentence: "The group of students ___ working on the project.",
      options: ["is", "are"],
      correct: "is",
      explanation: "The subject is 'group' (singular), not 'students'"
    },
    {
      sentence: "Neither the manager nor the employees ___ available.",
      options: ["is", "are"],
      correct: "are",
      explanation: "With 'neither...nor', the verb agrees with the closest subject ('employees')"
    },
    {
      sentence: "Everyone in the audience ___ applauding.",
      options: ["was", "were"],
      correct: "was",
      explanation: "'Everyone' is always singular"
    },
    {
      sentence: "The news ___ broadcasting at 6 PM.",
      options: ["is", "are"],
      correct: "is",
      explanation: "'News' is singular despite ending in 's'"
    },
    {
      sentence: "Either the cats or the dog ___ making that noise.",
      options: ["is", "are"],
      correct: "is",
      explanation: "With 'either...or', the verb agrees with the closest subject ('dog')"
    },
    {
      sentence: "The majority of voters ___ in favor of the proposal.",
      options: ["was", "were"],
      correct: "were",
      explanation: "When referring to individual members, use plural"
    }
  ];

  const voiceExercises = [
    {
      sentence: "The committee approved the proposal.",
      type: "active",
      transformation: "The proposal was approved by the committee.",
      hint: "Move the object to the front and add 'was/were' + past participle"
    },
    {
      sentence: "The report was written by the team.",
      type: "passive",
      transformation: "The team wrote the report.",
      hint: "Make the 'by' phrase the subject and use simple past tense"
    },
    {
      sentence: "Shakespeare wrote Hamlet.",
      type: "active",
      transformation: "Hamlet was written by Shakespeare.",
      hint: "Object becomes subject, add 'was/were' + past participle"
    },
    {
      sentence: "The decision was made by the board.",
      type: "passive",
      transformation: "The board made the decision.",
      hint: "Move the 'by' phrase to the front as the subject"
    },
    {
      sentence: "The chef prepares each dish carefully.",
      type: "active",
      transformation: "Each dish is prepared carefully by the chef.",
      hint: "Object first, then 'is/are' + past participle"
    }
  ];

  /**
   * Initialize the grammar module
   */
  function init() {

    // Set up event listeners
    setupEventListeners();

    // Don't load initial exercises here - they will be loaded
    // when the grammar category becomes visible via refresh()

  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Use event delegation on the grammar category container
    const grammarCategory = document.getElementById('grammar-category');

    if (!grammarCategory) return;

    // Event delegation for all button clicks in grammar category
    grammarCategory.addEventListener('click', function(e) {
      const target = e.target;

      // Handle "New Exercise" buttons
      if (target.id === 'new-sentence-transform-btn') {
        loadNewSentenceTransform();
      } else if (target.id === 'new-combining-btn') {
        loadNewCombining();
      } else if (target.id === 'new-error-btn') {
        const correctionDiv = document.getElementById('correction-display');
        if (correctionDiv) correctionDiv.style.display = 'none';
        loadNewError();
      } else if (target.id === 'new-agreement-btn') {
        loadNewAgreement();
      } else if (target.id === 'new-voice-btn') {
        loadNewVoice();
      }
      // Handle "Show Hint" buttons
      else if (target.id === 'show-sentence-hint-btn') {
        const hint = document.getElementById('sentence-hint'); // Get fresh reference
        if (hint) {
          hint.classList.toggle('hidden');
          target.textContent = hint.classList.contains('hidden') ? 'Show Hint' : 'Hide Hint';

          // Scroll hint into view when shown
          if (!hint.classList.contains('hidden')) {
            hint.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } else if (target.id === 'show-combining-hint-btn') {
        const hint = document.getElementById('combining-hint'); // Get fresh reference
        if (hint) {
          hint.classList.toggle('hidden');
          target.textContent = hint.classList.contains('hidden') ? 'Show Hint' : 'Hide Hint';

          // Scroll hint into view when shown
          if (!hint.classList.contains('hidden')) {
            hint.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } else if (target.id === 'show-voice-hint-btn') {
        const hint = document.getElementById('voice-hint'); // Get fresh reference
        if (hint) {
          hint.classList.toggle('hidden');
          target.textContent = hint.classList.contains('hidden') ? 'Show Hint' : 'Hide Hint';

          // Scroll hint into view when shown
          if (!hint.classList.contains('hidden')) {
            hint.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
      // Handle "Show Correction" button
      else if (target.id === 'show-correction-btn') {
        showCorrection();
      }
      // Handle agreement option buttons
      else if (target.classList.contains('agreement-option-btn') && target.dataset.option) {
        checkAgreement(target.dataset.option);
      }
    });
  }

  /**
   * Load new sentence transform exercise
   */
  function loadNewSentenceTransform() {
    currentSentence = sentenceTransformExercises[Math.floor(Math.random() * sentenceTransformExercises.length)];

    const sentenceDisplay = document.getElementById('simple-sentence');
    if (sentenceDisplay) {
      sentenceDisplay.textContent = currentSentence.simple;
    }

    // Get fresh reference to hint element
    const hint = document.getElementById('sentence-hint');
    if (hint) {
      hint.innerHTML = `<strong>Hint:</strong> ${currentSentence.hint}<br><br><strong>Example transformation:</strong> ${currentSentence.complex}`;
      hint.classList.add('hidden');
    }

    // Reset hint button text
    const hintBtn = document.getElementById('show-sentence-hint-btn');
    if (hintBtn) {
      hintBtn.textContent = 'Show Hint';
    }
  }

  /**
   * Load new combining exercise
   */
  function loadNewCombining() {
    const exercise = combiningExercises[Math.floor(Math.random() * combiningExercises.length)];

    const sentencesDisplay = document.getElementById('sentences-to-combine');
    if (sentencesDisplay) {
      sentencesDisplay.innerHTML = `
        <div style="margin-bottom: var(--spacing-lg);">
          ${exercise.sentences.map((s, i) => `<p class="exercise-text" style="margin-bottom: var(--spacing-sm);">${i + 1}. ${s}</p>`).join('')}
        </div>
      `;
    }

    // Get fresh reference to hint element
    const hint = document.getElementById('combining-hint');
    if (hint) {
      hint.innerHTML = `<strong>Hint:</strong> ${exercise.hint}`;
      hint.classList.add('hidden');
    }

    // Reset hint button text
    const hintBtn = document.getElementById('show-combining-hint-btn');
    if (hintBtn) {
      hintBtn.textContent = 'Show Hint';
    }
  }

  /**
   * Load new error correction exercise
   */
  function loadNewError() {
    currentError = errorCorrections[Math.floor(Math.random() * errorCorrections.length)];

    const sentenceDisplay = document.getElementById('error-sentence');
    if (sentenceDisplay) {
      sentenceDisplay.textContent = currentError.incorrect;
    }
  }

  /**
   * Show correction for error
   */
  function showCorrection() {
    if (!currentError) return;

    const correctionDiv = document.getElementById('correction-display');
    if (!correctionDiv) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'background: #50C878; color: white; padding: 16px; border-radius: 8px; margin-top: 16px;';

    const correctP = document.createElement('p');
    correctP.style.cssText = 'margin: 0 0 8px 0;';
    correctP.innerHTML = '<strong>Correct:</strong> ';
    correctP.appendChild(document.createTextNode(currentError.correct));

    const explanationP = document.createElement('p');
    explanationP.style.cssText = 'margin: 0; opacity: 0.9;';
    explanationP.innerHTML = '<strong>Explanation:</strong> ';
    explanationP.appendChild(document.createTextNode(currentError.explanation));

    wrapper.appendChild(correctP);
    wrapper.appendChild(explanationP);

    correctionDiv.innerHTML = '';
    correctionDiv.appendChild(wrapper);
    correctionDiv.style.display = 'block';
  }

  /**
   * Load new agreement exercise
   */
  function loadNewAgreement() {
    currentAgreement = agreementExercises[Math.floor(Math.random() * agreementExercises.length)];

    const sentenceDisplay = document.getElementById('agreement-sentence');
    if (sentenceDisplay) {
      sentenceDisplay.textContent = currentAgreement.sentence;
    }

    const optionsDiv = document.getElementById('agreement-options');
    if (optionsDiv) {
      optionsDiv.innerHTML = currentAgreement.options.map(option => `
        <button class="agreement-option-btn btn btn-secondary" data-option="${option}">
          ${option}
        </button>
      `).join('');
    }
  }

  /**
   * Check agreement answer
   */
  function checkAgreement(selected) {
    if (!currentAgreement) return;

    const isCorrect = selected === currentAgreement.correct;
    const buttons = document.querySelectorAll('.agreement-option-btn');

    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.dataset.option === currentAgreement.correct) {
        btn.style.backgroundColor = '#50C878';
        btn.style.color = 'white';
        btn.style.borderColor = '#50C878';
      } else if (btn.dataset.option === selected && !isCorrect) {
        btn.style.backgroundColor = '#FF6B6B';
        btn.style.color = 'white';
        btn.style.borderColor = '#FF6B6B';
      }
    });

    // Show feedback message
    const optionsDiv = document.getElementById('agreement-options');
    if (optionsDiv) {
      const feedback = document.createElement('div');
      feedback.style.marginTop = 'var(--spacing-md)';
      feedback.style.padding = 'var(--spacing-md)';
      feedback.style.borderRadius = 'var(--border-radius-sm)';
      feedback.style.fontWeight = '600';

      if (isCorrect) {
        feedback.style.backgroundColor = '#50C878';
        feedback.style.color = 'white';
        feedback.innerHTML = '✓ Correct! Well done!';
      } else {
        feedback.style.backgroundColor = '#FF6B6B';
        feedback.style.color = 'white';
        feedback.innerHTML = '✗ Incorrect. The correct answer is highlighted in green.';
      }

      optionsDiv.appendChild(feedback);

      // Show explanation after feedback
      setTimeout(() => {
        const explanation = document.createElement('div');
        explanation.className = 'hint-text';
        explanation.style.display = 'block';
        explanation.style.marginTop = 'var(--spacing-md)';
        explanation.innerHTML = `<strong>Explanation:</strong> ${currentAgreement.explanation}`;
        optionsDiv.appendChild(explanation);
      }, 500);
    }
  }

  /**
   * Load new voice transformation exercise
   */
  function loadNewVoice() {
    currentVoice = voiceExercises[Math.floor(Math.random() * voiceExercises.length)];

    const sentenceDisplay = document.getElementById('voice-sentence');
    if (sentenceDisplay) {
      sentenceDisplay.textContent = currentVoice.sentence;
    }

    const typeLabel = document.getElementById('voice-type');
    if (typeLabel) {
      typeLabel.innerHTML = `<strong>Current Voice:</strong> ${currentVoice.type.charAt(0).toUpperCase() + currentVoice.type.slice(1)}`;
    }

    // Get fresh reference to hint element
    const hint = document.getElementById('voice-hint');
    if (hint) {
      hint.innerHTML = `
        <strong>Hint:</strong> ${currentVoice.hint}<br><br>
        <strong>Transformation:</strong> ${currentVoice.transformation}
      `;
      hint.classList.add('hidden');
    }

    // Reset hint button text
    const hintBtn = document.getElementById('show-voice-hint-btn');
    if (hintBtn) {
      hintBtn.textContent = 'Show Hint';
    }
  }

  /**
   * Refresh the grammar module (reload exercises)
   * Called when the grammar category becomes visible
   */
  function refresh() {
    loadNewSentenceTransform();
    loadNewCombining();
    loadNewError();
    loadNewAgreement();
    loadNewVoice();
  }

  // ============================================
  // KNOWLEDGE CHECK — SPOT THE ERROR
  // ============================================

  let steScore = 0;
  let steTotal = 0;
  let steStreak = 0;
  let steCurrentError = null;
  let steAnswered = false;
  let steInitialized = false;

  function initSpotTheError() {
    const newBtn = document.getElementById('ste-new-btn');
    if (newBtn && !newBtn._steListenerAdded) {
      newBtn.addEventListener('click', steLoad);
      newBtn._steListenerAdded = true;
    }
    steLoad();
  }

  function steLoad() {
    steAnswered = false;
    steCurrentError = errorCorrections[Math.floor(Math.random() * errorCorrections.length)];

    const sentenceEl = document.getElementById('ste-sentence');
    const feedbackEl = document.getElementById('ste-feedback');
    if (feedbackEl) { feedbackEl.style.display = 'none'; feedbackEl.textContent = ''; }

    if (!sentenceEl) return;

    // Tokenise the incorrect sentence into clickable word spans
    const words = steCurrentError.incorrect.split(/(\s+)/);
    sentenceEl.innerHTML = words.map((token, i) => {
      if (/^\s+$/.test(token)) return token;
      return `<span class="ste-word" data-index="${i}">${token}</span>`;
    }).join('');

    sentenceEl.querySelectorAll('.ste-word').forEach(span => {
      span.addEventListener('click', () => steGuess(span));
    });
  }

  function steGuess(span) {
    if (steAnswered) return;
    steAnswered = true;
    steTotal++;

    // Determine the "error word(s)" — words in incorrect sentence not in correct sentence
    const incorrectWords = steCurrentError.incorrect.replace(/[.,!?;:]/g, '').toLowerCase().split(/\s+/);
    const correctWords = steCurrentError.correct.replace(/[.,!?;:]/g, '').toLowerCase().split(/\s+/);
    const errorWords = incorrectWords.filter((w, i) => w !== (correctWords[i] || ''));

    const clickedWord = span.textContent.replace(/[.,!?;:]/g, '').toLowerCase();
    const isCorrect = errorWords.includes(clickedWord);

    if (isCorrect) {
      steScore++;
      steStreak++;
      span.classList.add('ste-word-correct');
    } else {
      steStreak = 0;
      span.classList.add('ste-word-wrong');
      // Highlight the actual error word(s)
      document.querySelectorAll('.ste-word').forEach(s => {
        if (errorWords.includes(s.textContent.replace(/[.,!?;:]/g, '').toLowerCase())) {
          s.classList.add('ste-word-correct');
        }
      });
    }

    const feedbackEl = document.getElementById('ste-feedback');
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.className = `kc-feedback ${isCorrect ? 'kc-feedback-correct' : 'kc-feedback-wrong'}`;
      feedbackEl.innerHTML = isCorrect
        ? `<strong>Correct!</strong> "${steCurrentError.correct}" — ${steCurrentError.explanation}`
        : `<strong>Not quite.</strong> "${steCurrentError.correct}" — ${steCurrentError.explanation}`;
    }

    steUpdateScores();
    StorageManager.markActiveToday();
  }

  function steUpdateScores() {
    const streakEl = document.getElementById('ste-streak');
    const scoreEl = document.getElementById('ste-score');
    const totalEl = document.getElementById('ste-total');
    if (streakEl) streakEl.textContent = steStreak;
    if (scoreEl) scoreEl.textContent = steScore;
    if (totalEl) totalEl.textContent = steTotal;
  }

  // ============================================
  // KNOWLEDGE CHECK — FILL IN THE BLANK
  // ============================================

  let fibScore = 0;
  let fibTotal = 0;
  let fibStreak = 0;
  let fibCurrentQ = null;
  let fibAnswered = false;

  function initFillInTheBlank() {
    const newBtn = document.getElementById('fib-new-btn');
    if (newBtn && !newBtn._fibListenerAdded) {
      newBtn.addEventListener('click', fibLoad);
      newBtn._fibListenerAdded = true;
    }
    fibLoad();
  }

  function fibLoad() {
    fibAnswered = false;
    fibCurrentQ = agreementExercises[Math.floor(Math.random() * agreementExercises.length)];

    const sentenceEl = document.getElementById('fib-sentence');
    const optionsEl = document.getElementById('fib-options');
    const feedbackEl = document.getElementById('fib-feedback');

    if (feedbackEl) { feedbackEl.style.display = 'none'; feedbackEl.textContent = ''; }

    if (sentenceEl) {
      sentenceEl.innerHTML = fibCurrentQ.sentence.replace('___', '<span class="fib-blank">___</span>');
    }

    if (optionsEl) {
      optionsEl.innerHTML = fibCurrentQ.options.map(opt => `
        <button class="fib-option-btn btn btn-secondary" data-option="${opt}">${opt}</button>
      `).join('');

      optionsEl.querySelectorAll('.fib-option-btn').forEach(btn => {
        btn.addEventListener('click', () => fibGuess(btn));
      });
    }
  }

  function fibGuess(btn) {
    if (fibAnswered) return;
    fibAnswered = true;
    fibTotal++;

    const selected = btn.dataset.option;
    const isCorrect = selected === fibCurrentQ.correct;

    if (isCorrect) { fibScore++; fibStreak++; }
    else { fibStreak = 0; }

    // Style buttons
    document.querySelectorAll('.fib-option-btn').forEach(b => {
      b.disabled = true;
      if (b.dataset.option === fibCurrentQ.correct) {
        b.classList.add('fib-correct');
      } else if (b === btn && !isCorrect) {
        b.classList.add('fib-wrong');
      }
    });

    // Fill in the blank with answer
    const sentenceEl = document.getElementById('fib-sentence');
    if (sentenceEl) {
      sentenceEl.innerHTML = fibCurrentQ.sentence.replace(
        '___',
        `<span class="fib-filled ${isCorrect ? 'fib-filled-correct' : 'fib-filled-wrong'}">${fibCurrentQ.correct}</span>`
      );
    }

    const feedbackEl = document.getElementById('fib-feedback');
    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.className = `kc-feedback ${isCorrect ? 'kc-feedback-correct' : 'kc-feedback-wrong'}`;
      feedbackEl.innerHTML = isCorrect
        ? `<strong>Correct!</strong> ${fibCurrentQ.explanation}`
        : `<strong>Not quite.</strong> ${fibCurrentQ.explanation}`;
    }

    fibUpdateScores();
    StorageManager.markActiveToday();
  }

  function fibUpdateScores() {
    const streakEl = document.getElementById('fib-streak');
    const scoreEl = document.getElementById('fib-score');
    const totalEl = document.getElementById('fib-total');
    if (streakEl) streakEl.textContent = fibStreak;
    if (scoreEl) scoreEl.textContent = fibScore;
    if (totalEl) totalEl.textContent = fibTotal;
  }

  /**
   * Called by VocabularyModule when user switches to Grammar KC sub-tab
   */
  function initKnowledgeCheck() {
    if (!steInitialized) {
      steInitialized = true;
      initSpotTheError();
      initFillInTheBlank();
    }
  }

  // Public API
  return {
    init: init,
    refresh: refresh,
    checkAgreement: checkAgreement,
    initKnowledgeCheck: initKnowledgeCheck
  };
})();

// Log that GrammarModule is loaded
