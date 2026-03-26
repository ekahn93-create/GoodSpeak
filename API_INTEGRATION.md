# API Integration Documentation

## Overview

This articulation training app now integrates with **free, open-source friendly APIs** to provide unlimited content for vocabulary and fluency exercises.

## Integrated APIs

### 1. **Datamuse API**
- **URL:** https://api.datamuse.com
- **License:** Completely free, no API key required
- **Usage:** Unlimited for reasonable use
- **Purpose:**
  - Synonym generation
  - Related words
  - Rhyming words
  - Sound-alike words (for minimal pairs)

### 2. **Free Dictionary API**
- **URL:** https://api.dictionaryapi.dev
- **License:** Completely free, no API key required
- **Purpose:**
  - Word definitions
  - Pronunciations
  - Parts of speech
  - Example sentences
  - Synonyms and antonyms

## Features Enhanced by API Integration

### Fluency Module ([fluency.js](js/modules/fluency.js))

#### Synonym Pairs
- Now fetches sophisticated synonyms dynamically from Datamuse API
- Falls back to static examples if API is unavailable
- Provides much more variety than the original 10 hardcoded pairs

**How it works:**
```javascript
// Fetches sophisticated synonyms for common words
const synonyms = await APIService.getSophisticatedSynonyms('good');
// Returns: ['excellent', 'superior', 'exceptional', 'exemplary']
```

#### Expanded Static Content
- **Tongue Twisters:** Expanded from 18 to 36 examples (12 per difficulty level)
- **Minimal Pairs:** Expanded from 10 to 20 examples
- **Idioms:** Expanded from 8 to 23 examples

### Word Bank Module ([wordBank.js](js/modules/wordBank.js))

#### Dictionary Lookup
- "Look Up" button now uses APIService with caching
- Auto-fills word information when adding custom words
- Provides definitions, pronunciations, examples, and synonyms
- Works offline with cached data

**User benefit:** Users can add ANY word to their vocabulary bank, not just the 100 curated ones.

## Caching System

The APIService includes built-in caching to:
- Reduce API calls
- Work partially offline
- Improve performance
- Respect API fair use

**Cache Details:**
- **Expiry:** 1 hour
- **Storage:** In-memory (resets on page reload)
- **Fallback:** Uses expired cache if API fails

```javascript
// Check cache statistics
const stats = APIService.getCacheStats();
console.log(stats);
// { synonyms: 15, definitions: 8, rhymes: 0, relatedWords: 5, total: 28 }

// Clear cache if needed
APIService.clearCache();
```

## API Service Methods

### Synonyms
```javascript
// Get synonyms (default: 10)
const synonyms = await APIService.getSynonyms('happy', 10);
// Returns: ['joyful', 'cheerful', 'content', ...]

// Get sophisticated synonyms (longer, more formal words)
const fancy = await APIService.getSophisticatedSynonyms('good');
// Returns: ['excellent', 'exceptional', 'superior', ...]
```

### Definitions
```javascript
const wordData = await APIService.getWordDefinition('eloquent');
// Returns: {
//   word: 'eloquent',
//   phonetic: '/ˈɛləkwənt/',
//   partOfSpeech: 'adjective',
//   definition: 'Fluent or persuasive in speaking or writing',
//   example: 'An eloquent speech',
//   synonyms: ['articulate', 'fluent', ...],
//   antonyms: [...]
// }
```

### Related Words
```javascript
// Words commonly used in similar contexts
const related = await APIService.getRelatedWords('speech', 15);
// Returns: ['presentation', 'talk', 'lecture', ...]
```

### Rhymes
```javascript
const rhymes = await APIService.getRhymes('cat', 10);
// Returns: ['bat', 'hat', 'mat', 'sat', ...]
```

### Sound-Alike Words
```javascript
// For minimal pairs practice
const similar = await APIService.getSoundAlike('ship', 10);
// Returns: ['chip', 'sheep', 'shape', ...]
```

### Topic Search
```javascript
// Find words related to a topic/meaning
const words = await APIService.searchByTopic('happiness', 20);
// Returns: [
//   { word: 'joy', score: 98234 },
//   { word: 'bliss', score: 92145 },
//   ...
// ]
```

## Benefits for Open Source

### ✅ No API Keys Required
- Users don't need to sign up for anything
- No configuration needed
- Works immediately after downloading

### ✅ No Usage Limits
- Datamuse: Unlimited reasonable use
- Free Dictionary: Unlimited

### ✅ Privacy-Friendly
- No tracking
- No user accounts
- No data collection

### ✅ Offline Capabilities
- Caching provides partial offline functionality
- Falls back to static content gracefully

## Error Handling

The app gracefully handles API failures:

1. **API Unavailable:** Falls back to static content
2. **Word Not Found:** Shows user-friendly message
3. **Network Error:** Uses cached data if available
4. **Rate Limiting:** Caching prevents hitting limits

## Future Enhancements

Potential additions using these APIs:

1. **Random Word Generator** - Generate practice vocabulary from topics
2. **Word of the Day** - Fetch daily words from Datamuse
3. **Alliteration Generator** - Find words that start with same sound
4. **Custom Tongue Twisters** - Generate based on difficult sounds
5. **Vocabulary Quizzes** - Dynamic quiz generation from API

## Testing the Integration

### Test Synonym API:
1. Open the app
2. Navigate to **Fluency → Eloquence & Expression**
3. Click on **Sophisticated Synonyms** section
4. Click **"Show New Word"** multiple times
5. Notice variety beyond original 10 pairs

### Test Dictionary API:
1. Navigate to **Vocabulary → Word Bank**
2. Type any word (e.g., "serendipity")
3. Click **"Look Up"**
4. Form should auto-fill with definition, pronunciation, etc.

### Check Caching:
```javascript
// Open browser console (F12)
console.log(APIService.getCacheStats());
// Shows number of cached items

// Test repeated lookups (should be instant from cache)
await APIService.getWordDefinition('test');
await APIService.getWordDefinition('test'); // Cached, instant!
```

## Conclusion

The API integration provides:
- **Unlimited content** instead of limited static examples
- **No cost or configuration** for users
- **Respects open-source principles**
- **Graceful fallbacks** for reliability

Perfect for a public, open-source educational tool!
