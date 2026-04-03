// ============================================
// DAILY DRILL MODULE
// Curated 5-minute daily practice routine
// ============================================

const DailyDrillModule = (function() {

  const STORAGE_KEY = 'dailyDrill';

  // Tongue twisters for step 2 (pulled from a small inline set so no dependency needed)
  const tongueTwisters = [
    'She sells seashells by the seashore.',
    'Peter Piper picked a peck of pickled peppers.',
    'How much wood would a woodchuck chuck if a woodchuck could chuck wood?',
    'Red lorry, yellow lorry.',
    'Unique New York, unique New York, you know you need unique New York.',
    'The thirty-three thieves thought that they thrilled the throne throughout Thursday.',
    'Six slippery snails slid slowly seaward.',
    'Fuzzy Wuzzy was a bear, Fuzzy Wuzzy had no hair, Fuzzy Wuzzy wasn\'t very fuzzy, was he?'
  ];

  // Impromptu prompts for step 3
  const impromptuPrompts = [
    'Describe a skill you wish you had learned earlier.',
    'What does success mean to you in three sentences?',
    'Explain your favorite hobby as if to someone who has never heard of it.',
    'What is one habit that has changed your life?',
    'If you could give one piece of advice to your younger self, what would it be?',
    'Describe the most interesting person you have ever met.',
    'What does a perfect Saturday morning look like for you?',
    'If you had unlimited resources, what problem would you solve first?',
    'What makes a great leader?',
    'Describe something beautiful you saw recently.',
    'What is one thing most people get wrong about you?',
    'Talk about a moment when you surprised yourself.',
    'What is the best piece of advice you have ever received?',
    'Describe your hometown to someone who has never been there.'
  ];

  function getTodayKey() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  }

  function getDrillData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) {
      return null;
    }
  }

  function saveDrillData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Use a date-seeded pseudo-random to pick the same items all day
  function seededRandom(seed) {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  }

  function getDailyItems() {
    const today = getTodayKey();
    const seed = today.split('-').reduce((acc, n) => acc + parseInt(n), 0);

    const allWords = [
      ...(typeof vocabularyDatabase !== 'undefined' ? vocabularyDatabase.beginner : []),
      ...(typeof vocabularyDatabase !== 'undefined' ? vocabularyDatabase.intermediate : [])
    ];

    const wordIndex = Math.floor(seededRandom(seed) * (allWords.length || 1));
    const twisterIndex = Math.floor(seededRandom(seed + 7) * tongueTwisters.length);
    const promptIndex = Math.floor(seededRandom(seed + 13) * impromptuPrompts.length);

    return {
      word: allWords[wordIndex] || null,
      twister: tongueTwisters[twisterIndex],
      prompt: impromptuPrompts[promptIndex]
    };
  }

  function init() {
    renderDrill();
  }

  function renderDrill() {
    const stepsEl = document.getElementById('drill-steps');
    const banner = document.getElementById('drill-complete-banner');
    if (!stepsEl) return;

    const today = getTodayKey();
    let drillData = getDrillData();

    // Reset if it's a new day
    if (!drillData || drillData.date !== today) {
      drillData = { date: today, completed: [] };
      saveDrillData(drillData);
    }

    const items = getDailyItems();
    const steps = [
      {
        id: 'vocab',
        icon: '📚',
        label: 'Vocabulary Word',
        detail: items.word
          ? `<strong>${items.word.word}</strong> <em>(${items.word.pronunciation})</em> — ${items.word.definition}`
          : 'Open the Learn tab and study one new word.',
        action: items.word ? `<a href="#vocabulary" class="btn btn-sm btn-primary drill-action-link">Go to Learn</a>
          <button class="btn btn-sm btn-secondary drill-speak-btn" onclick="DailyDrillModule.speakWord('${(items.word.word || '').replace(/'/g, "\\'")}')">🔊 Hear it</button>` : ''
      },
      {
        id: 'twister',
        icon: '👅',
        label: 'Tongue Twister',
        detail: `Say this 3 times fast: <em>"${items.twister}"</em>`,
        action: ''
      },
      {
        id: 'prompt',
        icon: '🎤',
        label: 'Speak for 60 Seconds',
        detail: `Topic: <strong>"${items.prompt}"</strong>`,
        action: `<a href="#storytelling" class="btn btn-sm btn-primary drill-action-link">Go to Practice</a>`
      }
    ];

    const allDone = steps.every(s => drillData.completed.includes(s.id));

    if (allDone) {
      stepsEl.style.display = 'none';
      if (banner) banner.style.display = 'block';
      return;
    }

    stepsEl.style.display = '';
    if (banner) banner.style.display = 'none';

    stepsEl.innerHTML = steps.map(step => {
      const done = drillData.completed.includes(step.id);
      return `
        <div class="drill-step ${done ? 'drill-step-done' : ''}" data-step="${step.id}">
          <div class="drill-step-check">
            <button class="drill-check-btn ${done ? 'checked' : ''}"
              onclick="DailyDrillModule.toggleStep('${step.id}')"
              title="${done ? 'Mark incomplete' : 'Mark complete'}">
              ${done ? '✓' : ''}
            </button>
          </div>
          <div class="drill-step-icon">${step.icon}</div>
          <div class="drill-step-body">
            <div class="drill-step-label">${step.label}</div>
            <div class="drill-step-detail">${step.detail}</div>
            ${step.action ? `<div class="drill-step-actions">${step.action}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Prevent nav links inside drill from triggering before marking done
    stepsEl.querySelectorAll('.drill-action-link').forEach(link => {
      link.addEventListener('click', function() {
        // Just navigate; user marks done manually
      });
    });
  }

  function toggleStep(stepId) {
    const today = getTodayKey();
    let drillData = getDrillData();
    if (!drillData || drillData.date !== today) {
      drillData = { date: today, completed: [] };
    }

    const idx = drillData.completed.indexOf(stepId);
    if (idx > -1) {
      drillData.completed.splice(idx, 1);
    } else {
      drillData.completed.push(stepId);
    }
    saveDrillData(drillData);
    renderDrill();
  }

  function speakWord(word) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }

  function refresh() {
    renderDrill();
  }

  return {
    init: init,
    refresh: refresh,
    toggleStep: toggleStep,
    speakWord: speakWord
  };
})();

console.log('DailyDrillModule loaded');
