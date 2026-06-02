// ============================================
// SPACED REPETITION MODULE (SRS)
// SM-2 inspired review scheduling
// ============================================

const SRSModule = (function() {

  const STORAGE_KEY = 'srsData';
  // Intervals in days per quality rating: [forgot, hard, got-it, easy]
  const INTERVALS = [0, 1, 3, 7];
  const INTERVAL_MULTIPLIERS = [1, 1, 2, 2.5];

  let queue = [];
  let currentIndex = 0;
  let currentWord = null;
  let sessionStats = { reviewed: 0, correct: 0 };

  // ---- Storage helpers ----

  function getData() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch(e) { return {}; }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  // ---- Word enrollment ----
  // Call this whenever a word is learned to enroll it in SRS

  function enrollWord(wordId) {
    const data = getData();
    if (!data[wordId]) {
      data[wordId] = {
        interval: 1,      // days until next review
        nextReview: getTodayKey(),
        repetitions: 0,
        easeFactor: 2.5
      };
      saveData(data);
    }
  }

  // Enroll all already-learned words that aren't tracked yet
  function enrollAllLearned() {
    if (typeof StorageManager === 'undefined') return;
    const userData = StorageManager.load();
    if (!userData) return;

    const learned = userData.vocabulary.learned || [];
    const data = getData();
    let changed = false;
    learned.forEach(id => {
      if (!data[id]) {
        data[id] = { interval: 1, nextReview: getTodayKey(), repetitions: 0, easeFactor: 2.5 };
        changed = true;
      }
    });
    if (changed) saveData(data);
  }

  // ---- Due words ----

  function getDueWords() {
    const today = getTodayKey();
    enrollAllLearned();
    const updatedData = getData();

    // SRS data keys are word strings (may also include legacy integer IDs)
    // Build a lookup of all known word objects from vocabularyDatabase + VocabularyModule cache
    const wordLookup = new Map();

    if (typeof vocabularyDatabase !== 'undefined') {
      const allHardcoded = [
        ...vocabularyDatabase.beginner,
        ...vocabularyDatabase.intermediate,
        ...vocabularyDatabase.advanced
      ];
      allHardcoded.forEach(w => {
        wordLookup.set(String(w.id), w);
        wordLookup.set(w.word, w);
      });
    }

    // Return due word objects; for unknown keys synthesize a minimal object
    return Object.keys(updatedData)
      .filter(key => updatedData[key].nextReview <= today)
      .map(key => {
        if (wordLookup.has(key)) return wordLookup.get(key);
        // Dynamic word — create a minimal stub; SRS card will show what it has
        return { id: key, word: key, definition: '', exampleSentence: '', synonyms: [] };
      });
  }

  // ---- Rating & scheduling ----

  function rate(quality) {
    // quality: 1=forgot, 2=hard, 3=got-it, 4=easy
    if (!currentWord) return;

    const data = getData();
    const srsKey = currentWord.id !== undefined ? String(currentWord.id) : currentWord.word;
    const entry = data[srsKey] || { interval: 1, repetitions: 0, easeFactor: 2.5 };

    sessionStats.reviewed++;
    if (quality >= 3) sessionStats.correct++;

    if (quality === 1) {
      // Forgot — reset
      entry.interval = 1;
      entry.repetitions = 0;
    } else {
      entry.repetitions++;
      if (entry.repetitions === 1) {
        entry.interval = 1;
      } else if (entry.repetitions === 2) {
        entry.interval = 3;
      } else {
        entry.interval = Math.round(entry.interval * entry.easeFactor);
      }
    }

    // Adjust ease factor (stays between 1.3 and 2.5)
    entry.easeFactor = Math.max(1.3, Math.min(2.5,
      entry.easeFactor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02))
    ));

    const next = new Date();
    next.setDate(next.getDate() + entry.interval);
    entry.nextReview = next.toISOString().split('T')[0];

    data[srsKey] = entry;
    saveData(data);

    // Move to next
    currentIndex++;
    if (currentIndex < queue.length) {
      showCard(currentIndex);
    } else {
      showDone();
    }
  }

  // ---- UI ----

  function init() {
    enrollAllLearned();
    renderIdle();

    const startBtn = document.getElementById('srs-start-btn');
    if (startBtn) startBtn.addEventListener('click', startSession);

    // Also hook into vocabulary mark-as-learned to auto-enroll
    document.addEventListener('wordLearned', function(e) {
      if (e.detail && e.detail.wordId) enrollWord(e.detail.wordId);
    });
  }

  function renderIdle() {
    const due = getDueWords();
    const badge = document.getElementById('srs-due-badge');
    const idleMsg = document.getElementById('srs-idle-message');
    const startBtn = document.getElementById('srs-start-btn');

    if (!badge) return;

    badge.textContent = `${due.length} due`;
    badge.style.background = due.length > 0 ? 'var(--accent-color)' : 'var(--secondary-color)';

    if (idleMsg) {
      if (due.length === 0) {
        idleMsg.textContent = 'All caught up! No words due for review right now. Check back later.';
      } else {
        idleMsg.textContent = `You have ${due.length} word${due.length > 1 ? 's' : ''} scheduled for review today.`;
      }
    }

    if (startBtn) startBtn.disabled = due.length === 0;

    // Show/hide sections
    showSection('srs-idle');
  }

  function startSession() {
    queue = getDueWords();
    if (queue.length === 0) return;
    currentIndex = 0;
    sessionStats = { reviewed: 0, correct: 0 };
    showSection('srs-active');
    showCard(0);
  }

  function showCard(index) {
    currentWord = queue[index];
    if (!currentWord) return;

    const wordEl = document.getElementById('srs-card-word');
    const defEl = document.getElementById('srs-card-definition');
    const exEl = document.getElementById('srs-card-example');
    const progressEl = document.getElementById('srs-progress-text');
    const revealWrap = document.getElementById('srs-reveal-btn-wrap');
    const revealContent = document.getElementById('srs-card-reveal');

    if (wordEl) wordEl.textContent = currentWord.word;
    if (defEl) defEl.innerHTML = `<strong>Definition:</strong> ${currentWord.definition}`;
    if (exEl) exEl.innerHTML = `<strong>Example:</strong> <em>"${currentWord.exampleSentence}"</em>`;
    if (progressEl) progressEl.textContent = `Word ${index + 1} of ${queue.length}`;

    // Reset reveal state
    if (revealWrap) revealWrap.style.display = '';
    if (revealContent) revealContent.style.display = 'none';

    // Add click-to-reveal on card
    const card = document.getElementById('srs-card');
    if (card) {
      card.onclick = revealCard;
      card.style.cursor = 'pointer';
    }
  }

  function revealCard() {
    const revealWrap = document.getElementById('srs-reveal-btn-wrap');
    const revealContent = document.getElementById('srs-card-reveal');
    const card = document.getElementById('srs-card');
    if (revealWrap) revealWrap.style.display = 'none';
    if (revealContent) revealContent.style.display = '';
    if (card) { card.onclick = null; card.style.cursor = 'default'; }
  }

  function showDone() {
    if (typeof App !== 'undefined' && App.markTPTaskDone) App.markTPTaskDone('srs');

    const pct = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;
    const msgEl = document.getElementById('srs-done-msg');
    if (msgEl) {
      msgEl.innerHTML = `
        <div style="text-align:center; padding: var(--spacing-md) 0;">
          <div style="font-size: var(--font-size-lg); font-weight:600; color: var(--secondary-color); margin-bottom: var(--spacing-sm);">${pct >= 70 ? 'Well done!' : 'Keep going!'}</div>
          <div style="font-size: var(--font-size-xxl); font-weight:700; color: var(--primary-color);">${pct}%</div>
          <div style="color: var(--text-secondary); margin-top: var(--spacing-xs);">
            ${sessionStats.correct} of ${sessionStats.reviewed} words recalled correctly
          </div>
          <div style="margin-top: var(--spacing-md); color: var(--text-secondary); font-size: var(--font-size-sm);">
            Your next review has been scheduled automatically.
          </div>
        </div>
      `;
    }
    showSection('srs-done');
  }

  function showSection(sectionId) {
    ['srs-idle','srs-active','srs-done'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = id === sectionId ? '' : 'none';
    });
  }

  function resetToIdle() {
    renderIdle();
  }

  function speakCurrent() {
    if (!currentWord) return;
    TTSHelper.speak(currentWord.word, 0.88, 1.1);
  }

  function refresh() {
    enrollAllLearned();
    renderIdle();
  }

  return {
    init: init,
    refresh: refresh,
    rate: rate,
    revealCard: revealCard,
    resetToIdle: resetToIdle,
    speakCurrent: speakCurrent,
    enrollWord: enrollWord,
    getDueCount: () => getDueWords().length
  };
})();

