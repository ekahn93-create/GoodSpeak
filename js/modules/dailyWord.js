// ============================================
// DAILY WORD MODULE
// Handles daily word practice and streak tracking
// ============================================

/**
 * DailyWordModule - Module for daily word practice feature
 * Uses the Revealing Module Pattern
 */
const DailyWordModule = (function() {
  // Private variables
  let userData = null;
  let todaysWord = null;
  let initialized = false;

  // DOM elements
  let dailyWordContent = null;
  let exerciseContent = null;
  let currentStreakElement = null;

  /**
   * Initialize the daily word module
   */
  function init() {
    console.log('DailyWordModule initializing...');

    // Get DOM elements
    dailyWordContent = document.getElementById('daily-word-content');
    exerciseContent = document.getElementById('exercise-content');
    currentStreakElement = document.getElementById('current-streak');

    // Load user data
    userData = StorageManager.load();

    if (!userData) {
      console.error('No user data found');
      return;
    }

    // Get today's word
    todaysWord = getTodaysWord();

    // Update streak
    updateStreak();

    // Display today's word
    displayTodaysWord();

    // Display exercise
    displayExercise();

    // Update streak display
    updateStreakDisplay();

    // Init speaking prompt
    initSpeakingPrompt();

    // Listen for view changes
    document.addEventListener('viewChanged', function(e) {
      // No longer auto-refresh on view changes
      // Now controlled by vocabulary category switching
    });

    initialized = true;
    console.log('DailyWordModule initialized successfully');
  }

  /**
   * Update streak tracking
   */
  function updateStreak() {
    const today = StorageManager.getTodayString();
    const lastCompleted = userData.dailyWord.lastCompletedDate;

    if (lastCompleted === today) {
      // Already completed today
      return;
    }

    if (!lastCompleted) {
      // First time - don't break streak
      return;
    }

    // Check if we need to break the streak
    const yesterday = getYesterdayString();

    if (lastCompleted !== yesterday) {
      // Streak broken - didn't visit yesterday
      userData.dailyWord.currentStreak = 0;
      StorageManager.save(userData);
    }
  }

  /**
   * Mark today as completed
   */
  function markTodayCompleted() {
    const today = StorageManager.getTodayString();

    // Check if already completed today
    if (userData.dailyWord.lastCompletedDate === today) {
      return;
    }

    // Increment streak
    userData.dailyWord.currentStreak += 1;

    // Update longest streak if needed
    if (userData.dailyWord.currentStreak > userData.dailyWord.longestStreak) {
      userData.dailyWord.longestStreak = userData.dailyWord.currentStreak;
    }

    // Add to completed dates
    if (!userData.dailyWord.completedDates.includes(today)) {
      userData.dailyWord.completedDates.push(today);
    }

    // Add word to reviewed
    if (!userData.dailyWord.wordsReviewed.includes(todaysWord.id)) {
      userData.dailyWord.wordsReviewed.push(todaysWord.id);
    }

    // Update last completed date
    userData.dailyWord.lastCompletedDate = today;

    // Save
    if (StorageManager.save(userData)) {
      StorageManager.markActiveToday();
      updateStreakDisplay();
      showToast(`${userData.dailyWord.currentStreak} day streak!`, 'success');
    }
  }

  /**
   * Display today's word
   */
  function displayTodaysWord() {
    if (!dailyWordContent || !todaysWord) return;

    const html = `
      <div class="word-main">${todaysWord.word}</div>
      <div class="word-meta">
        <span class="badge badge-danger">Weak Word</span>
      </div>

      <div class="word-definition">
        <strong>Common Usage:</strong> "${todaysWord.word}" is overused and vague
      </div>

      <div class="word-definition">
        <strong>Better Alternatives:</strong> ${todaysWord.commonAlternative}
      </div>

      <div class="word-definition">
        <strong>When to Use Alternatives:</strong> ${todaysWord.whenToUse}
      </div>

      <button class="dw-accordion-toggle" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">
        See examples &amp; alternatives <span class="dw-accordion-arrow">&#8964;</span>
      </button>
      <div class="dw-accordion-body">
        <div class="word-examples">
          <h4>Examples:</h4>
          ${todaysWord.examples.map(ex => `
            <div class="example-comparison">
              <div class="weak-example">❌ Weak: ${ex.weak}</div>
              <div class="strong-example">✅ Strong: ${ex.strong}</div>
            </div>
          `).join('')}
        </div>
        <div class="word-synonyms">
          <strong>Full List of Alternatives:</strong><br>
          ${todaysWord.synonyms.join(', ')}
        </div>
        <div class="dw-common-words">
          <strong>Other Common Words to Replace:</strong>
          <div class="weak-words-grid" style="margin-top:var(--spacing-sm);">
            <div class="weak-word-card"><div class="weak">good</div><div class="arrow">→</div><div class="strong">excellent, remarkable, beneficial</div></div>
            <div class="weak-word-card"><div class="weak">bad</div><div class="arrow">→</div><div class="strong">detrimental, inadequate, problematic</div></div>
            <div class="weak-word-card"><div class="weak">very</div><div class="arrow">→</div><div class="strong">exceptionally, remarkably, considerably</div></div>
            <div class="weak-word-card"><div class="weak">nice</div><div class="arrow">→</div><div class="strong">pleasant, delightful, agreeable</div></div>
          </div>
        </div>
      </div>
    `;

    dailyWordContent.innerHTML = html;
  }

  /**
   * Display practice exercise
   */
  function displayExercise() {
    if (!exerciseContent || !todaysWord) return;

    // Generate a random exercise from today's word examples
    const example = todaysWord.examples[Math.floor(Math.random() * todaysWord.examples.length)];

    // Create options: correct synonym + 3 random wrong options
    const correctAnswer = todaysWord.synonyms[0];
    const allWords = dailyWordsDatabase.filter(w => w.id !== todaysWord.id);
    const wrongWords = [];

    while (wrongWords.length < 3 && allWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * allWords.length);
      const randomWord = allWords[randomIndex];

      if (randomWord.synonyms && randomWord.synonyms.length > 0) {
        wrongWords.push(randomWord.synonyms[0]);
      }

      allWords.splice(randomIndex, 1);
    }

    // Create options array
    const options = [
      { text: correctAnswer, correct: true },
      ...wrongWords.map(w => ({ text: w, correct: false }))
    ];

    // Shuffle options
    options.sort(() => 0.5 - Math.random());

    const html = `
      <div class="exercise-question">
        Replace "<strong>${todaysWord.word}</strong>" in this sentence with a more precise word:
        <br><br>
        "${example.weak}"
      </div>
      <div class="exercise-options" id="daily-exercise-options">
        ${options.map((opt, index) => `
          <div class="exercise-option" data-correct="${opt.correct}" data-index="${index}">
            ${opt.text}
          </div>
        `).join('')}
      </div>
      <div id="daily-exercise-feedback"></div>
    `;

    exerciseContent.innerHTML = html;

    // Add click handlers
    const optionElements = document.querySelectorAll('#daily-exercise-options .exercise-option');
    optionElements.forEach(option => {
      option.addEventListener('click', function() {
        handleExerciseAnswer(this, example.strong);
      });
    });
  }

  /**
   * Handle exercise answer
   * @param {HTMLElement} optionElement - The clicked option
   * @param {string} correctSentence - The correct sentence
   */
  function handleExerciseAnswer(optionElement, correctSentence) {
    const isCorrect = optionElement.getAttribute('data-correct') === 'true';
    const allOptions = document.querySelectorAll('#daily-exercise-options .exercise-option');
    const feedbackElement = document.getElementById('daily-exercise-feedback');

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
          ✓ Excellent! The improved sentence is:<br>
          <em>"${correctSentence}"</em>
          <div style="margin-top: 1rem;">
            <button class="btn btn-primary" onclick="DailyWordModule.completeToday()">
              Complete Today's Practice
            </button>
          </div>
        </div>
      `;
    } else {
      feedbackElement.innerHTML = `
        <div class="exercise-feedback incorrect">
          Not quite. The correct answer is highlighted above. The improved sentence is:<br>
          <em>"${correctSentence}"</em>
          <div style="margin-top: 1rem;">
            <button class="btn btn-secondary" onclick="DailyWordModule.retryExercise()">
              Try Another Exercise
            </button>
          </div>
        </div>
      `;
    }
  }

  /**
   * Complete today's practice
   */
  function completeToday() {
    markTodayCompleted();

    if (typeof App !== 'undefined' && App.markTPTaskDone) App.markTPTaskDone('precision');

    Modal.alert({
      title: 'Daily Practice Complete!',
      message: `Great work! You've completed today's word practice. Your current streak is ${userData.dailyWord.currentStreak} days. Keep it up!`,
      type: 'success'
    });
  }

  /**
   * Retry the exercise
   */
  function retryExercise() {
    displayExercise();
  }

  // ============================================
  // DAILY SPEAKING PROMPT
  // ============================================

  let dspRecognition = null;
  let dspTranscript = '';
  let dspSetup = false;

  const DSP_PROMPTS = [
    'Describe a situation where using the word "{word}" would make your speech more precise.',
    'Tell a short story — real or imagined — where the word "{word}" plays a role.',
    'Explain what "{word}" means in your own words, then use it in a sentence.',
    'Describe someone you know whose behavior could be described as "{word}".',
    'Give an example from your own life where you could have used the word "{word}".'
  ];

  function initSpeakingPrompt() {
    if (dspSetup) return;
    dspSetup = true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    const promptText = document.getElementById('dsp-prompt-text');
    const micBtn = document.getElementById('dsp-mic-btn');
    const stopBtn = document.getElementById('dsp-stop-btn');
    const tryAgainBtn = document.getElementById('dsp-try-again-btn');
    const noSpeechMsg = document.getElementById('dsp-no-speech-msg');

    if (!SpeechRecognition) {
      if (noSpeechMsg) noSpeechMsg.style.display = 'block';
      if (micBtn) micBtn.style.display = 'none';
      return;
    }

    // Set prompt text
    if (promptText && todaysWord) {
      const template = DSP_PROMPTS[Math.floor(Math.random() * DSP_PROMPTS.length)];
      promptText.textContent = template.replace('{word}', todaysWord.word);
    }

    if (micBtn) micBtn.addEventListener('click', dspStartRecording);
    if (stopBtn) stopBtn.addEventListener('click', dspStopRecording);
    if (tryAgainBtn) tryAgainBtn.addEventListener('click', dspReset);
  }

  function dspStartRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    dspTranscript = '';
    dspRecognition = new SpeechRecognition();
    dspRecognition.continuous = true;
    dspRecognition.interimResults = true;
    dspRecognition.lang = 'en-US';

    const liveEl = document.getElementById('dsp-transcript-live');
    const recordingPrompt = document.getElementById('dsp-recording-prompt');
    const promptText = document.getElementById('dsp-prompt-text');

    if (recordingPrompt && promptText) {
      recordingPrompt.textContent = promptText.textContent;
    }

    dspRecognition.onresult = function(e) {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          final += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      dspTranscript += final;
      if (liveEl) liveEl.textContent = (dspTranscript + interim).trim();
    };

    dspRecognition.onerror = function(e) {
      console.error('DSP speech error:', e.error);
      dspSetState('idle');
      showToast('Recording error. Please try again.', 'error');
    };

    dspRecognition.start();
    dspSetState('recording');
  }

  function dspStopRecording() {
    if (dspRecognition) {
      dspRecognition.stop();
      dspRecognition = null;
    }

    const transcript = dspTranscript.trim();
    if (!transcript) {
      dspSetState('idle');
      showToast('No speech detected. Try again.', 'error');
      return;
    }

    dspSubmitFeedback(transcript);
  }

  async function dspSubmitFeedback(transcript) {
    if (!todaysWord) return;
    dspSetState('loading');

    try {
      const response = await fetch('/.netlify/functions/claude-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'daily_speaking_feedback',
          payload: {
            word: todaysWord.word,
            partOfSpeech: 'word',
            definition: todaysWord.commonAlternative
              ? `A weak word to replace with: ${todaysWord.commonAlternative}`
              : todaysWord.word,
            transcript: transcript
          }
        })
      });

      if (!response.ok) throw new Error(`Server error ${response.status}`);
      const result = await response.json();
      if (!result.tip) throw new Error('Bad response shape');

      dspShowFeedback(transcript, result);
      markTodayCompleted();
      StorageManager.markActiveToday();
    } catch (err) {
      console.error('DSP fetch error:', err);
      dspSetState('idle');
      showToast('Could not get feedback. Try again.', 'error');
    }
  }

  function dspShowFeedback(transcript, result) {
    if (typeof App !== 'undefined' && App.markTPTaskDone) App.markTPTaskDone('speaking');
    const transcriptEl = document.getElementById('dsp-transcript-display');
    const gridEl = document.getElementById('dsp-feedback-grid');

    if (transcriptEl) {
      transcriptEl.innerHTML = `<strong>You said:</strong> <em>"${transcript}"</em>`;
    }

    if (gridEl) {
      gridEl.innerHTML = `
        <div class="dsp-feedback-item">
          <div class="dsp-feedback-label">Word Usage</div>
          <div class="dsp-feedback-text">${result.word_usage}</div>
        </div>
        <div class="dsp-feedback-item">
          <div class="dsp-feedback-label">Clarity</div>
          <div class="dsp-feedback-text">${result.clarity}</div>
        </div>
        <div class="dsp-feedback-item">
          <div class="dsp-feedback-label">Vocabulary</div>
          <div class="dsp-feedback-text">${result.vocabulary}</div>
        </div>
        <div class="dsp-feedback-item dsp-feedback-tip">
          <div class="dsp-feedback-label">Tip</div>
          <div class="dsp-feedback-text">${result.tip}</div>
        </div>
      `;
    }

    dspSetState('feedback');
  }

  function dspReset() {
    dspTranscript = '';
    const liveEl = document.getElementById('dsp-transcript-live');
    if (liveEl) liveEl.textContent = '';
    dspSetState('idle');
  }

  function dspSetState(state) {
    const idle = document.getElementById('dsp-idle');
    const recording = document.getElementById('dsp-recording');
    const loading = document.getElementById('dsp-loading');
    const feedback = document.getElementById('dsp-feedback');
    if (idle) idle.style.display = state === 'idle' ? 'block' : 'none';
    if (recording) recording.style.display = state === 'recording' ? 'block' : 'none';
    if (loading) loading.style.display = state === 'loading' ? 'block' : 'none';
    if (feedback) feedback.style.display = state === 'feedback' ? 'block' : 'none';
  }

  /**
   * Update streak display
   */
  function updateStreakDisplay() {
    if (currentStreakElement && userData) {
      currentStreakElement.textContent = userData.dailyWord.currentStreak;
    }
  }

  /**
   * Get yesterday's date string
   * @returns {string} Yesterday's date in YYYY-MM-DD format
   */
  function getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
   * Refresh the module (reload data)
   */
  function refresh() {
    if (!initialized) {
      init();
      return;
    }
    userData = StorageManager.load();
    if (userData) {
      todaysWord = getTodaysWord();
      updateStreak();
      displayTodaysWord();
      displayExercise();
      updateStreakDisplay();
    }
  }

  /**
   * Get user progress data
   * @returns {Object} Daily word progress data
   */
  function getProgress() {
    return userData ? userData.dailyWord : null;
  }

  // Public API
  return {
    init: init,
    completeToday: completeToday,
    retryExercise: retryExercise,
    refresh: refresh,
    getProgress: getProgress,
    stopSpeaking: dspStopRecording
  };
})();

// Log that DailyWordModule is loaded
console.log('DailyWordModule loaded successfully');
