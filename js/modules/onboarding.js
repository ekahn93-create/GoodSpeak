// ============================================
// ONBOARDING MODULE
// Word-rating intro: 5 curated words, "Know it" / "New to me"
// ============================================

const OnboardingModule = (function() {

  const STORAGE_KEY = 'onboardingComplete';

  // 5 curated words spanning beginner → advanced so users feel the range
  const starterWords = [
    {
      word: 'articulate',
      pronunciation: 'ar-TIK-yuh-layt',
      definition: 'Expressing oneself clearly and effectively in speech',
      example: 'She is very articulate when explaining complex topics.',
      difficulty: 'beginner'
    },
    {
      word: 'convey',
      pronunciation: 'kuhn-VAY',
      definition: 'To communicate or make known; to express a thought or feeling',
      example: 'He struggled to convey his emotions during the conversation.',
      difficulty: 'beginner'
    },
    {
      word: 'nuance',
      pronunciation: 'NOO-ahns',
      definition: 'A subtle difference in meaning, expression, or tone',
      example: 'The nuance in her voice made all the difference.',
      difficulty: 'intermediate'
    },
    {
      word: 'rhetoric',
      pronunciation: 'RET-er-ik',
      definition: 'The art of effective or persuasive speaking or writing',
      example: 'His powerful rhetoric moved the entire audience.',
      difficulty: 'intermediate'
    },
    {
      word: 'eloquent',
      pronunciation: 'EL-uh-kwent',
      definition: 'Fluent and persuasive in speaking or writing',
      example: 'Her eloquent speech left the crowd speechless.',
      difficulty: 'intermediate'
    }
  ];

  let currentIndex = 0;
  let knownCount = 0;
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
          <div class="onboarding-logo">
            <svg width="56" height="52" viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="200" height="150" rx="28" ry="28" fill="#4F46E5"/>
              <polygon points="60,155 30,190 100,155" fill="#4F46E5"/>
              <polygon points="130,30 85,100 115,100 90,165 155,85 120,85 148,30" fill="white" opacity="0.95"/>
            </svg>
          </div>
          <h2>Welcome to EZSpeaks</h2>
          <p>Let's see where you're starting. Rate 5 words — be honest!</p>
        </div>
        <div id="onboarding-body"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    renderWord(0);
  }

  function renderWord(index) {
    const w = starterWords[index];
    const body = document.getElementById('onboarding-body');
    const progress = (index / starterWords.length) * 100;

    body.innerHTML = `
      <div class="onboarding-progress-bar">
        <div class="onboarding-progress-fill" style="width: ${progress}%"></div>
      </div>
      <div class="onboarding-step">${index + 1} of ${starterWords.length}</div>
      <div class="onboarding-word-card">
        <div class="onboarding-word-main">${w.word}</div>
        <div class="onboarding-word-pronunciation">${w.pronunciation}</div>
        <div class="onboarding-word-definition">${w.definition}</div>
        <div class="onboarding-word-example">"${w.example}"</div>
      </div>
      <div class="onboarding-rating-btns">
        <button class="onboarding-rating-btn onboarding-rating-new" data-rating="new">
          New to me
        </button>
        <button class="onboarding-rating-btn onboarding-rating-know" data-rating="know">
          Know it
        </button>
      </div>
    `;

    body.querySelector('[data-rating="know"]').addEventListener('click', () => rateWord('know', w));
    body.querySelector('[data-rating="new"]').addEventListener('click', () => rateWord('new', w));
  }

  function rateWord(rating, wordObj) {
    if (rating === 'know') {
      knownCount++;
      // Mark as learned in app data so it shows up in their word bank immediately
      const userData = StorageManager.load();
      if (userData && !userData.vocabulary.learned.includes(wordObj.word)) {
        userData.vocabulary.learned.push(wordObj.word);
        userData.vocabulary.totalWordsLearned = userData.vocabulary.learned.length;
        StorageManager.save(userData);
      }
    } else {
      // Mark as still learning
      const userData = StorageManager.load();
      if (userData && !userData.vocabulary.stillLearning.includes(wordObj.word) && !userData.vocabulary.learned.includes(wordObj.word)) {
        userData.vocabulary.stillLearning.push(wordObj.word);
        StorageManager.save(userData);
      }
    }

    currentIndex++;
    if (currentIndex < starterWords.length) {
      renderWord(currentIndex);
    } else {
      showResult();
    }
  }

  function showResult() {
    const total = starterWords.length;
    let heading, message, level;

    if (knownCount === 0) {
      level = 'beginner';
      heading = 'You\'re just getting started — perfect.';
      message = 'EZSpeaks is built for this. Head to <strong>Vocabulary Builder</strong> to start adding words you own.';
    } else if (knownCount <= 2) {
      level = 'beginner';
      heading = `You know ${knownCount} of ${total} — solid start.`;
      message = 'You\'ve got a foundation. The <strong>Vocabulary Builder</strong> will help you fill in the gaps fast.';
    } else if (knownCount <= 4) {
      level = 'intermediate';
      heading = `You know ${knownCount} of ${total} — you\'re building well.`;
      message = 'Nice range. Try the <strong>Daily Word</strong> tab to sharpen the words you use every day.';
    } else {
      level = 'advanced';
      heading = `You know all ${total} — you\'re ahead of most.`;
      message = 'Impressive. Head to <strong>Knowledge Check</strong> to put your vocabulary to the test.';
    }

    localStorage.setItem('userLevel', level);

    const body = document.getElementById('onboarding-body');
    body.innerHTML = `
      <div class="onboarding-result">
        <h3 class="onboarding-result-heading">${heading}</h3>
        <p class="onboarding-rec">${message}</p>
        <div class="onboarding-actions">
          <a href="/learn" class="btn btn-primary onboarding-start-btn">Start Learning</a>
          <button class="btn btn-secondary" id="onboarding-explore-btn">Explore on My Own</button>
        </div>
      </div>
    `;

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

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    currentIndex = 0;
    knownCount = 0;
    showOnboarding();
  }

  return {
    init: init,
    reset: reset
  };
})();

console.log('OnboardingModule loaded');
