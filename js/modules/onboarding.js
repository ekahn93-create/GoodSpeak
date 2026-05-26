// ============================================
// ONBOARDING MODULE
// Word-rating intro: 5 curated words, "Know it" / "New to me"
// ============================================

const OnboardingModule = (function() {

  const STORAGE_KEY = 'onboardingComplete';

  // 5 curated words: 2 beginner, 1 intermediate, 2 advanced — so users feel the full range
  const starterWords = [
    {
      word: 'concise',
      pronunciation: 'kuhn-SISE',
      definition: 'Giving a lot of information clearly and in few words; brief but comprehensive',
      example: 'His explanation was concise yet thorough.',
      difficulty: 'beginner'
    },
    {
      word: 'deliberate',
      pronunciation: 'dih-LIB-er-it',
      definition: 'Done consciously and intentionally; careful and unhurried',
      example: 'She spoke in a deliberate manner to ensure everyone understood.',
      difficulty: 'beginner'
    },
    {
      word: 'tenacious',
      pronunciation: 'tuh-NAY-shuhs',
      definition: 'Not readily relinquishing a position or principle; persistent',
      example: 'She was tenacious in pursuing her goal of better communication.',
      difficulty: 'intermediate'
    },
    {
      word: 'veracity',
      pronunciation: 'vuh-RAS-i-tee',
      definition: 'Conformity to facts; accuracy; truthfulness',
      example: 'The veracity of your statements affects your credibility.',
      difficulty: 'advanced'
    },
    {
      word: 'loquacious',
      pronunciation: 'loh-KWAY-shuhs',
      definition: 'Tending to talk a great deal; talkative',
      example: 'Being loquacious doesn\'t necessarily mean being articulate.',
      difficulty: 'advanced'
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
      // Add to Deploy Words tray so new users see session words immediately
      if (typeof SessionWords !== 'undefined') SessionWords.add(wordObj.word);
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
    let heading, ctaLabel, ctaHref, level;

    if (knownCount === 0) {
      level = 'beginner';
      heading = 'You\'re just getting started — perfect.';
      ctaLabel = 'Learn your first 5 words &rarr;';
      ctaHref = '/learn';
    } else if (knownCount <= 2) {
      level = 'beginner';
      heading = `You know ${knownCount} of ${total} — solid start.`;
      ctaLabel = 'Keep building in Vocabulary Builder &rarr;';
      ctaHref = '/learn';
    } else if (knownCount <= 4) {
      level = 'intermediate';
      heading = `You know ${knownCount} of ${total} — you\'re building well.`;
      ctaLabel = 'Try today\'s Daily Word &rarr;';
      ctaHref = '/learn#word_of_day';
    } else {
      level = 'advanced';
      heading = `You know all ${total} — you\'re ahead of most.`;
      ctaLabel = 'Test yourself in Knowledge Check &rarr;';
      ctaHref = '/learn#kc';
    }

    localStorage.setItem('userLevel', level);

    const goals = [
      { value: 'public_speaking',       label: 'Public speaking',        sub: 'Presentations & talks',     href: '/practice', page: 'Practice' },
      { value: 'job_interviews',         label: 'Job interviews',          sub: 'Confident & clear answers', href: '/practice', page: 'Practice' },
      { value: 'everyday_conversation', label: 'Everyday conversation',   sub: 'Sound more natural',        href: '/learn',    page: 'Learn' },
      { value: 'professional_presence', label: 'Professional presence',   sub: 'Command the room',          href: '/polish',   page: 'Polish' },
      { value: 'general',               label: 'General improvement',     sub: 'All-around growth',         href: '/learn',    page: 'Learn' }
    ];

    const body = document.getElementById('onboarding-body');
    body.innerHTML = `
      <div class="onboarding-result">
        <h3 class="onboarding-result-heading">${heading}</h3>
        <div class="onboarding-actions">
          <a href="${ctaHref}" class="btn btn-primary onboarding-start-btn">${ctaLabel}</a>
        </div>
        <div class="onboarding-or-divider"><span>or choose your goal</span></div>
        <div class="onboarding-goal-grid">
          ${goals.map(g => `
            <button class="onboarding-goal-btn" data-goal="${g.value}" data-href="${g.href}" data-page="${g.page}">
              ${g.label}
              <span class="onboarding-goal-subtext">${g.sub}</span>
            </button>
          `).join('')}
        </div>
        <div class="onboarding-goal-cta" id="onboarding-goal-cta" style="display:none;">
          <a class="btn btn-primary onboarding-goal-go-btn" id="onboarding-goal-go-btn" href="#">Let's go &rarr;</a>
        </div>
        <button class="onboarding-explore-btn" id="onboarding-explore-btn">Explore on my own</button>
      </div>
    `;

    body.querySelector('.onboarding-start-btn').addEventListener('click', close);

    let selectedHref = null;
    body.querySelectorAll('.onboarding-goal-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        body.querySelectorAll('.onboarding-goal-btn').forEach(function(b) { b.classList.remove('selected'); });
        this.classList.add('selected');
        localStorage.setItem('userGoal', this.getAttribute('data-goal'));
        selectedHref = this.getAttribute('data-href');
        var page = this.getAttribute('data-page');
        var cta = document.getElementById('onboarding-goal-cta');
        var goBtn = document.getElementById('onboarding-goal-go-btn');
        goBtn.href = selectedHref;
        goBtn.innerHTML = 'Let\'s go to ' + page + ' &rarr;';
        cta.style.display = 'block';
      });
    });

    document.getElementById('onboarding-goal-go-btn').addEventListener('click', close);
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
