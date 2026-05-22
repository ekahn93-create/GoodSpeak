// ============================================
// SESSION WORDS MODULE
// Tracks words learned in the current day's session.
// Used to carry learned words into Polish and Practice.
// ============================================

const SessionWords = (function() {
  const STORAGE_KEY = 'sessionWords';
  const MAX_WORDS = 5;

  function _getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { date: _getTodayString(), words: [] };
      const data = JSON.parse(raw);
      // Reset if it's a new day
      if (data.date !== _getTodayString()) {
        return { date: _getTodayString(), words: [] };
      }
      return data;
    } catch(e) {
      return { date: _getTodayString(), words: [] };
    }
  }

  function _save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Add a word to the session list (max MAX_WORDS, no duplicates).
   * New words push to the front; oldest drop off the end.
   */
  function add(word) {
    if (!word) return;
    const data = _load();
    const lower = word.toLowerCase();
    // Remove if already present (move to front)
    data.words = data.words.filter(w => w.toLowerCase() !== lower);
    data.words.unshift(word);
    if (data.words.length > MAX_WORDS) data.words = data.words.slice(0, MAX_WORDS);
    _save(data);
    _notifyChange();
  }

  /**
   * Get the current session word list.
   */
  function get() {
    return _load().words;
  }

  /**
   * Replace the current session words with a random sample from the user's
   * learned + stillLearning vocabulary (up to MAX_WORDS).
   */
  function shuffle() {
    const userData = typeof StorageManager !== 'undefined' ? StorageManager.load() : null;
    if (!userData) return;

    const pool = [
      ...(userData.vocabulary.learned || []),
      ...(userData.vocabulary.stillLearning || []),
    ].map(w => (typeof w === 'string' ? w : w.word)).filter(Boolean);

    if (pool.length === 0) return;

    // Fisher-Yates shuffle, take first MAX_WORDS
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const data = { date: _getTodayString(), words: pool.slice(0, MAX_WORDS) };
    _save(data);
    _notifyChange();
  }

  /**
   * Clear all session words (force reset).
   */
  function clear() {
    _save({ date: _getTodayString(), words: [] });
    _notifyChange();
  }

  // Dispatch a custom event so any listener can react to changes
  function _notifyChange() {
    document.dispatchEvent(new CustomEvent('sessionWordsChanged', { detail: { words: get() } }));
  }

  return { add, get, shuffle, clear };
})();
