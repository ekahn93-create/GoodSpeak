// ============================================
// WORD TOPICS
// Topic seeds used to fetch vocabulary words from Datamuse API
// Organized by difficulty tier
// ============================================

const wordTopics = {
  beginner: [
    'communication', 'emotion', 'description', 'thinking', 'speaking',
    'listening', 'expression', 'clarity', 'understanding', 'conversation',
    'feeling', 'response', 'opinion', 'simple', 'basic'
  ],
  intermediate: [
    'persuasion', 'argument', 'nuance', 'rhetoric', 'debate',
    'analysis', 'critique', 'narrative', 'perspective', 'reasoning',
    'influence', 'interpretation', 'assertion', 'implication', 'context'
  ],
  advanced: [
    'epistemology', 'cognition', 'linguistics', 'discourse', 'dialectic',
    'philosophy', 'abstraction', 'paradox', 'semantics', 'pragmatics',
    'eloquence', 'articulation', 'sophistry', 'axiom', 'polemic'
  ]
};

// Minimum word length to filter out junk short words from Datamuse
const MIN_WORD_LENGTH = 4;

// Max words to keep in the dynamic pool per difficulty (in localStorage)
const POOL_MAX_SIZE = 200;

// Refill the pool when it drops below this count
const POOL_REFILL_THRESHOLD = 20;
