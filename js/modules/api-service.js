// ============================================
// API SERVICE MODULE
// Handles integration with free, open-source friendly APIs
// ============================================

/**
 * APIService - Module for fetching data from external APIs
 * Uses Datamuse API and Free Dictionary API (both free, no keys required)
 */
const APIService = (function() {
  // API endpoints
  const DATAMUSE_API = 'https://api.datamuse.com';
  const FREE_DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

  // Cache to reduce API calls
  const cache = {
    synonyms: new Map(),
    definitions: new Map(),
    rhymes: new Map(),
    relatedWords: new Map()
  };

  // Cache expiry time (1 hour in milliseconds)
  const CACHE_EXPIRY = 60 * 60 * 1000;

  /**
   * Generic cache handler
   * @param {Map} cacheMap - The cache map to use
   * @param {string} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not cached
   * @returns {Promise} Cached or fresh data
   */
  async function getCached(cacheMap, key, fetchFn) {
    const cached = cacheMap.get(key);

    if (cached && (Date.now() - cached.timestamp < CACHE_EXPIRY)) {
      return cached.data;
    }

    try {
      const data = await fetchFn();
      cacheMap.set(key, {
        data: data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      console.error('API fetch error:', error);
      // Return cached data even if expired, or null
      return cached ? cached.data : null;
    }
  }

  /**
   * Fetch synonyms for a word using Datamuse API
   * @param {string} word - The word to find synonyms for
   * @param {number} limit - Maximum number of synonyms (default: 10)
   * @returns {Promise<Array>} Array of synonym words
   */
  async function getSynonyms(word, limit = 10) {
    const cacheKey = `${word}_${limit}`;

    return getCached(cache.synonyms, cacheKey, async () => {
      const response = await fetch(`${DATAMUSE_API}/words?rel_syn=${encodeURIComponent(word)}&max=${limit}`);

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map(item => item.word);
    });
  }

  /**
   * Fetch words that rhyme with the given word
   * @param {string} word - The word to find rhymes for
   * @param {number} limit - Maximum number of rhymes (default: 10)
   * @returns {Promise<Array>} Array of rhyming words
   */
  async function getRhymes(word, limit = 10) {
    const cacheKey = `${word}_${limit}`;

    return getCached(cache.rhymes, cacheKey, async () => {
      const response = await fetch(`${DATAMUSE_API}/words?rel_rhy=${encodeURIComponent(word)}&max=${limit}`);

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map(item => item.word);
    });
  }

  /**
   * Fetch related words (triggers, associations)
   * @param {string} word - The word to find related words for
   * @param {number} limit - Maximum number of related words (default: 10)
   * @returns {Promise<Array>} Array of related words
   */
  async function getRelatedWords(word, limit = 10) {
    const cacheKey = `${word}_${limit}`;

    return getCached(cache.relatedWords, cacheKey, async () => {
      const response = await fetch(`${DATAMUSE_API}/words?rel_trg=${encodeURIComponent(word)}&max=${limit}`);

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map(item => item.word);
    });
  }

  /**
   * Fetch word definition from Free Dictionary API
   * @param {string} word - The word to get definition for
   * @returns {Promise<Object>} Word data object
   */
  async function getWordDefinition(word) {
    return getCached(cache.definitions, word, async () => {
      const response = await fetch(`${FREE_DICTIONARY_API}/${encodeURIComponent(word)}`);

      if (!response.ok) {
        throw new Error(`Free Dictionary API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse and structure the response
      if (data && data.length > 0) {
        const wordData = data[0];
        const firstMeaning = wordData.meanings && wordData.meanings[0];
        const firstDefinition = firstMeaning && firstMeaning.definitions && firstMeaning.definitions[0];

        return {
          word: wordData.word,
          phonetic: wordData.phonetic || wordData.phonetics?.[0]?.text || '',
          partOfSpeech: firstMeaning?.partOfSpeech || 'unknown',
          definition: firstDefinition?.definition || 'No definition available',
          example: firstDefinition?.example || '',
          synonyms: firstDefinition?.synonyms || firstMeaning?.synonyms || [],
          antonyms: firstDefinition?.antonyms || firstMeaning?.antonyms || []
        };
      }

      return null;
    });
  }

  /**
   * Get sophisticated synonyms for common words
   * @param {string} commonWord - A common word
   * @returns {Promise<Array>} Array of more sophisticated synonyms
   */
  async function getSophisticatedSynonyms(commonWord) {
    try {
      const synonyms = await getSynonyms(commonWord, 20);

      // Filter for longer, more sophisticated words
      const sophisticated = synonyms.filter(word =>
        word.length > 6 && !word.includes('-') && !word.includes(' ')
      ).slice(0, 4);

      // If we don't have enough sophisticated synonyms, just return what we have
      return sophisticated.length >= 2 ? sophisticated : synonyms.slice(0, 4);
    } catch (error) {
      console.error('Error fetching sophisticated synonyms:', error);
      return [];
    }
  }

  /**
   * Search for words by topic/meaning
   * @param {string} topic - The topic or meaning to search for
   * @param {number} limit - Maximum results (default: 20)
   * @returns {Promise<Array>} Array of related words
   */
  async function searchByTopic(topic, limit = 20) {
    try {
      const response = await fetch(`${DATAMUSE_API}/words?ml=${encodeURIComponent(topic)}&max=${limit}`);

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map(item => ({
        word: item.word,
        score: item.score
      }));
    } catch (error) {
      console.error('Error searching by topic:', error);
      return [];
    }
  }

  /**
   * Get words that sound similar (for minimal pairs practice)
   * @param {string} word - The word to find sound-alikes for
   * @param {number} limit - Maximum results (default: 10)
   * @returns {Promise<Array>} Array of similar-sounding words
   */
  async function getSoundAlike(word, limit = 10) {
    try {
      const response = await fetch(`${DATAMUSE_API}/words?sl=${encodeURIComponent(word)}&max=${limit}`);

      if (!response.ok) {
        throw new Error(`Datamuse API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map(item => item.word);
    } catch (error) {
      console.error('Error fetching sound-alike words:', error);
      return [];
    }
  }

  /**
   * Clear all caches
   */
  function clearCache() {
    cache.synonyms.clear();
    cache.definitions.clear();
    cache.rhymes.clear();
    cache.relatedWords.clear();
    console.log('API cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  function getCacheStats() {
    return {
      synonyms: cache.synonyms.size,
      definitions: cache.definitions.size,
      rhymes: cache.rhymes.size,
      relatedWords: cache.relatedWords.size,
      total: cache.synonyms.size + cache.definitions.size + cache.rhymes.size + cache.relatedWords.size
    };
  }

  // Public API
  return {
    getSynonyms,
    getRhymes,
    getRelatedWords,
    getWordDefinition,
    getSophisticatedSynonyms,
    searchByTopic,
    getSoundAlike,
    clearCache,
    getCacheStats
  };
})();

// Log that APIService is loaded
console.log('APIService loaded successfully');
