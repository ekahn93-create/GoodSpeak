// ============================================
// ONBOARDING MODULE
// First-visit level assessment quiz
// ============================================

const OnboardingModule = (function() {

  const STORAGE_KEY = 'onboardingComplete';

  const questions = [
    {
      id: 1,
      question: 'How would you describe your current vocabulary?',
      options: [
        { text: 'I often struggle to find the right word', score: 1 },
        { text: 'I know common words but want more range', score: 2 },
        { text: 'I have a solid vocabulary but want to refine it', score: 3 }
      ]
    },
    {
      id: 2,
      question: 'When speaking, do you use filler words like "um," "uh," or "like"?',
      options: [
        { text: 'Yes, quite frequently', score: 1 },
        { text: 'Sometimes, especially under pressure', score: 2 },
        { text: 'Rarely — I speak pretty fluidly', score: 3 }
      ]
    },
    {
      id: 3,
      question: 'How comfortable are you speaking in front of others?',
      options: [
        { text: 'Nervous — I avoid it when I can', score: 1 },
        { text: 'I can do it but I feel awkward', score: 2 },
        { text: 'Fairly confident, just want to polish', score: 3 }
      ]
    },
    {
      id: 4,
      question: 'How would you rate your grammar and sentence structure?',
      options: [
        { text: 'I make frequent mistakes', score: 1 },
        { text: 'Decent, but I want to sound more sophisticated', score: 2 },
        { text: 'Strong — I just want more expressive range', score: 3 }
      ]
    },
    {
      id: 5,
      question: 'What is your main goal?',
      options: [
        { text: 'Build a foundation — I\'m starting from scratch', score: 1 },
        { text: 'Improve everyday conversations and presentations', score: 2 },
        { text: 'Master eloquence and advanced expression', score: 3 }
      ]
    }
  ];

  let currentQuestion = 0;
  let scores = [];
  let overlay = null;

  function isComplete() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  }

  function markComplete() {
    localStorage.setItem(STORAGE_KEY, 'true');
  }

  function init() {
    if (isComplete()) return;
    showOnboarding();
  }

  function showOnboarding() {
    overlay = document.createElement('div');
    overlay.id = 'onboarding-overlay';
    overlay.innerHTML = `
      <div class="onboarding-modal">
        <div class="onboarding-header">
          <div class="onboarding-logo">💬</div>
          <h2>Welcome to Articulation Trainer</h2>
          <p>Answer 5 quick questions so we can recommend the best place to start.</p>
        </div>
        <div id="onboarding-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    renderQuestion(0);
  }

  function renderQuestion(index) {
    const q = questions[index];
    const body = document.getElementById('onboarding-body');
    const progress = ((index) / questions.length) * 100;

    body.innerHTML = `
      <div class="onboarding-progress-bar">
        <div class="onboarding-progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="onboarding-step">Question ${index + 1} of ${questions.length}</div>
      <div class="onboarding-question">${q.question}</div>
      <div class="onboarding-options">
        ${q.options.map((opt, i) => `
          <button class="onboarding-option" data-score="${opt.score}" data-index="${i}">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    `;

    body.querySelectorAll('.onboarding-option').forEach(btn => {
      btn.addEventListener('click', function() {
        scores.push(parseInt(this.dataset.score));
        currentQuestion++;
        if (currentQuestion < questions.length) {
          renderQuestion(currentQuestion);
        } else {
          showResult();
        }
      });
    });
  }

  function showResult() {
    const total = scores.reduce((a, b) => a + b, 0);
    const max = questions.length * 3;
    const pct = total / max;

    let level, recommendation, startLink, startLabel, color;

    if (pct <= 0.45) {
      level = 'Beginner';
      color = '#50C878';
      recommendation = 'Start with the <strong>Vocabulary Builder</strong> on Beginner difficulty, then move to <strong>Daily Word</strong> to build a habit. The <strong>Tongue Twisters</strong> in Polish are great for building confidence.';
      startLink = '#vocabulary';
      startLabel = 'Go to Learn';
    } else if (pct <= 0.75) {
      level = 'Intermediate';
      color = '#4A90E2';
      recommendation = 'Head to <strong>Polish</strong> to sharpen your fluency and reduce filler words. Try the <strong>Filler Word Reducer</strong> and <strong>Pacing Practice</strong> to smooth out your delivery.';
      startLink = '#fluency';
      startLabel = 'Go to Polish';
    } else {
      level = 'Advanced';
      color = '#9B59B6';
      recommendation = 'Jump into <strong>Practice</strong> for real speaking challenges. Try <strong>Impromptu Speaking</strong>, <strong>Rhetorical Devices</strong>, and the <strong>Web Speech Test</strong> for live analytics.';
      startLink = '#storytelling';
      startLabel = 'Go to Practice';
    }

    const body = document.getElementById('onboarding-body');
    body.innerHTML = `
      <div class="onboarding-result">
        <div class="onboarding-level-badge" style="background: ${color};">${level}</div>
        <h3>Your recommended starting point:</h3>
        <p class="onboarding-rec">${recommendation}</p>
        <div class="onboarding-actions">
          <a href="${startLink}" class="btn btn-primary onboarding-start-btn">${startLabel}</a>
          <button class="btn btn-secondary" id="onboarding-explore-btn">Explore on My Own</button>
        </div>
      </div>
    `;

    // Save level to localStorage for dashboard
    localStorage.setItem('userLevel', level.toLowerCase());

    document.querySelector('.onboarding-start-btn').addEventListener('click', close);
    document.getElementById('onboarding-explore-btn').addEventListener('click', close);
  }

  function close() {
    markComplete();
    if (overlay) {
      overlay.classList.add('onboarding-fade-out');
      setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        overlay = null;
      }, 300);
    }
  }

  // Allow re-triggering from settings if needed
  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    currentQuestion = 0;
    scores = [];
    showOnboarding();
  }

  return {
    init: init,
    reset: reset
  };
})();

console.log('OnboardingModule loaded');
