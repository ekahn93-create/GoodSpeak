// ============================================
// FLUENCY & ARTICULATION MODULE
// Handles pronunciation, fluency, and eloquence exercises
// ============================================

/**
 * FluencyModule - Module for fluency and articulation training
 * Uses the Revealing Module Pattern
 */
const FluencyModule = (function() {
  // Private variables
  let userData = null;
  let currentCategory = 'fluency';
  let currentDifficulty = 'easy';
  let currentRhetoricalType = 'metaphor';
  let currentPowerCategory = 'persuasive';

  // Track current examples for each rhetorical type
  let currentRhetoricalExamples = {
    metaphor: null,
    simile: null,
    analogy: null,
    alliteration: null
  };

  // DOM elements - Category tabs
  let categoryTabs = null;
  let categories = null;

  // DOM elements - Pronunciation & Articulation
  let tongueTwisterDisplay = null;
  let newTongueTwisterBtn = null;
  let difficultyButtons = null;
  let minimalPairWords = null;
  let newMinimalPairBtn = null;
  let stressWordDisplay = null;
  let newStressWordBtn = null;

  // DOM elements - Fluency Building
  let fillerStartBtn = null;
  let pacingPassage = null;
  let newPacingPassageBtn = null;
  let pacingStartBtn = null;
  let pacingDoneBtn = null;
  let pacingTimer = null;
  let pacingStartTime = null;
  let pacingWordCount = 0;
  let pacingRecognition = null;
  let pacingSpokenWords = 0;
  let pacingUsingSpeech = false;
  let transitionExerciseContent = null;
  let newTransitionExerciseBtn = null;
  let simpleSentences = null;
  let fluencyCombiningHint = null;
  let fluencyCombiningHintSection = null;
  let fluencyCombiningExampleSection = null;
  let fluencyCombiningExample = null;
  let showFluencyCombiningHintBtn = null;
  let showFluencyCombiningExampleBtn = null;
  let newFluencyCombiningExerciseBtn = null;
  let combiningAnswerInput = null;
  let currentCombiningExercise = null;

  // DOM elements - Eloquence & Expression
  let synonymWordDisplay = null;
  let newSynonymBtn = null;
  let idiomContentDisplay = null;
  let newIdiomBtn = null;
  let rhetoricalButtons = null;
  let rhetoricalContentDisplay = null;
  let newRhetoricalBtn = null;
  let powerCategoryButtons = null;
  let powerWordsDisplay = null;

  // Data collections
  const tongueTwisters = {
    easy: [
      "She sells seashells by the seashore.",
      "Peter Piper picked a peck of pickled peppers.",
      "How can a clam cram in a clean cream can?",
      "Fred fed Ted bread and Ted fed Fred bread.",
      "Betty bought butter but the butter was bitter.",
      "I scream, you scream, we all scream for ice cream.",
      "Red lorry, yellow lorry.",
      "Eleven benevolent elephants.",
      "A big black bear sat on a big black rug.",
      "How much wood would a woodchuck chuck?",
      "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.",
      "Toy boat, toy boat, toy boat."
    ],
    medium: [
      "Six thick thistle sticks.",
      "The sixth sick sheik's sixth sheep's sick.",
      "Which wristwatches are Swiss wristwatches?",
      "A proper copper coffee pot.",
      "Lesser leather never weathered wetter weather better.",
      "Truly rural, truly plural.",
      "I saw Susie sitting in a shoe shine shop.",
      "She sees cheese, she sees seas.",
      "Greek grapes, Greek grapes, Greek grapes.",
      "Fresh fried fish, fish fresh fried.",
      "Three free throws.",
      "Rubber baby buggy bumpers."
    ],
    hard: [
      "Pad kid poured curd pulled cod.",
      "The seething sea ceaseth and thus the seething sea sufficeth us.",
      "Brisk brave brigadiers brandished broad bright blades.",
      "Imagine an imaginary menagerie manager managing an imaginary menagerie.",
      "She stood on the balcony, inexplicably mimicking him hiccuping while amicably welcoming him in.",
      "Six sleek swans swam swiftly southwards.",
      "The thirty-three thieves thought that they thrilled the throne throughout Thursday.",
      "Can you can a can as a canner can can a can?",
      "I wish to wish the wish you wish to wish, but if you wish the wish the witch wishes, I won't wish the wish you wish to wish.",
      "If a dog chews shoes, whose shoes does he choose?",
      "Rory the warrior and Roger the worrier were reared wrongly in a rural brewery.",
      "Six sick hicks nick six slick bricks with picks and sticks."
    ]
  };

  const minimalPairs = [
    { word1: "ship", word2: "chip" },
    { word1: "bit", word2: "beat" },
    { word1: "pen", word2: "pan" },
    { word1: "cop", word2: "cup" },
    { word1: "thin", word2: "tin" },
    { word1: "sink", word2: "think" },
    { word1: "berry", word2: "very" },
    { word1: "bat", word2: "pat" },
    { word1: "light", word2: "right" },
    { word1: "feel", word2: "fill" },
    { word1: "seat", word2: "sit" },
    { word1: "fail", word2: "fell" },
    { word1: "pool", word2: "pull" },
    { word1: "heat", word2: "hit" },
    { word1: "leave", word2: "live" },
    { word1: "reach", word2: "rich" },
    { word1: "pear", word2: "pair" },
    { word1: "write", word2: "right" },
    { word1: "three", word2: "free" },
    { word1: "wet", word2: "vet" }
  ];

  const stressPatterns = [
    { word: "present", syllables: ["PRE", "sent"], stressed: 0, note: "As a noun (a gift)" },
    { word: "present", syllables: ["pre", "SENT"], stressed: 1, note: "As a verb (to show)" },
    { word: "record", syllables: ["RE", "cord"], stressed: 0, note: "As a noun (a disc)" },
    { word: "record", syllables: ["re", "CORD"], stressed: 1, note: "As a verb (to capture)" },
    { word: "important", syllables: ["im", "POR", "tant"], stressed: 1, note: "Stress on second syllable" },
    { word: "communicate", syllables: ["com", "MU", "ni", "cate"], stressed: 1, note: "Stress on second syllable" },
    { word: "photography", syllables: ["pho", "TO", "gra", "phy"], stressed: 1, note: "Stress on second syllable" },
    { word: "understanding", syllables: ["un", "der", "STAN", "ding"], stressed: 2, note: "Stress on third syllable" }
  ];

  const pacingPassages = [
    "Effective communication requires clarity and precision. When speaking, it's important to articulate each word distinctly while maintaining a natural flow. Practice speaking at a moderate pace, allowing your audience to absorb your message without feeling rushed.",
    "Public speaking is an art that combines preparation, confidence, and delivery. The most engaging speakers know how to vary their pace, emphasize key points, and use strategic pauses to create impact. Remember, it's not just what you say, but how you say it.",
    "Articulation is the physical production of speech sounds. Clear articulation helps ensure your message is understood by your audience. Focus on enunciating consonants clearly, opening your mouth adequately, and using proper breath support.",
    "The power of eloquent speech lies in choosing the right words and delivering them with conviction. Practice helps you develop fluency, reduce filler words, and speak with greater confidence. Consistent practice transforms awkward speech into articulate expression."
  ];

  const transitionExercises = [
    {
      sentence1: "The project was challenging.",
      sentence2: "We completed it successfully.",
      hint: "Use a contrast transition like 'however' or 'nevertheless'"
    },
    {
      sentence1: "The presentation was well-researched.",
      sentence2: "It included comprehensive data analysis.",
      hint: "Use an addition transition like 'furthermore' or 'moreover'"
    },
    {
      sentence1: "The deadline was approaching quickly.",
      sentence2: "The team worked overtime to finish.",
      hint: "Use a cause/effect transition like 'therefore' or 'consequently'"
    },
    {
      sentence1: "The initial proposal was rejected.",
      sentence2: "We submitted a revised version.",
      hint: "Use a time transition like 'subsequently' or 'afterward'"
    }
  ];

  const combiningExercises = [
    {
      sentences: [
        "The sky was dark.",
        "The clouds were heavy.",
        "Rain was imminent."
      ],
      hint: "Combine these using descriptive language and conjunctions",
      example: "With dark skies and heavy clouds looming overhead, rain was imminent."
    },
    {
      sentences: [
        "She practiced daily.",
        "Her skills improved.",
        "She won the competition."
      ],
      hint: "Show the progression using cause and effect relationships",
      example: "Through daily practice, she improved her skills and ultimately won the competition."
    },
    {
      sentences: [
        "The restaurant was busy.",
        "The service was slow.",
        "The food was excellent."
      ],
      hint: "Use contrast to connect these observations",
      example: "Although the restaurant was busy and the service was slow, the food was excellent."
    },
    {
      sentences: [
        "The presentation was informative.",
        "The speaker was engaging.",
        "The audience was attentive."
      ],
      hint: "Use parallel structure to emphasize all three positive aspects",
      example: "The presentation was informative, the speaker was engaging, and the audience remained attentive throughout."
    },
    {
      sentences: [
        "The deadline was tight.",
        "The team worked efficiently.",
        "They delivered on time."
      ],
      hint: "Show how the team responded to the challenge",
      example: "Despite the tight deadline, the team worked efficiently and delivered on time."
    },
    {
      sentences: [
        "The book was long.",
        "The plot was complex.",
        "I couldn't put it down."
      ],
      hint: "Use contrast to show unexpected engagement",
      example: "Even though the book was long and the plot was complex, I couldn't put it down."
    }
  ];

  const synonymPairs = [
    // Quality
    { common: "good", sophisticated: ["excellent", "superior", "exceptional", "exemplary"] },
    { common: "bad", sophisticated: ["inferior", "subpar", "deficient", "inadequate"] },
    { common: "great", sophisticated: ["extraordinary", "magnificent", "phenomenal", "outstanding"] },
    { common: "nice", sophisticated: ["pleasant", "agreeable", "delightful", "charming"] },
    { common: "amazing", sophisticated: ["astounding", "remarkable", "breathtaking", "staggering"] },
    { common: "awful", sophisticated: ["atrocious", "deplorable", "appalling", "grievous"] },
    { common: "perfect", sophisticated: ["flawless", "impeccable", "exemplary", "immaculate"] },
    // Size & degree
    { common: "big", sophisticated: ["substantial", "considerable", "extensive", "significant"] },
    { common: "small", sophisticated: ["minute", "diminutive", "negligible", "minimal"] },
    { common: "very", sophisticated: ["exceptionally", "remarkably", "profoundly", "extraordinarily"] },
    { common: "a lot", sophisticated: ["considerably", "substantially", "abundantly", "extensively"] },
    // Emotions
    { common: "happy", sophisticated: ["elated", "jubilant", "euphoric", "delighted"] },
    { common: "sad", sophisticated: ["melancholy", "despondent", "disheartened", "dejected"] },
    { common: "angry", sophisticated: ["incensed", "indignant", "exasperated", "irate"] },
    { common: "scared", sophisticated: ["apprehensive", "trepidatious", "unnerved", "alarmed"] },
    { common: "excited", sophisticated: ["exhilarated", "enthusiastic", "animated", "invigorated"] },
    { common: "surprised", sophisticated: ["astonished", "astounded", "flabbergasted", "dumbfounded"] },
    { common: "worried", sophisticated: ["apprehensive", "disconcerted", "perturbed", "unsettled"] },
    { common: "tired", sophisticated: ["exhausted", "fatigued", "depleted", "enervated"] },
    // Intelligence & character
    { common: "smart", sophisticated: ["astute", "perspicacious", "sagacious", "shrewd"] },
    { common: "funny", sophisticated: ["witty", "hilarious", "facetious", "comical"] },
    { common: "brave", sophisticated: ["courageous", "intrepid", "valiant", "undaunted"] },
    { common: "shy", sophisticated: ["reticent", "diffident", "reserved", "unassuming"] },
    { common: "mean", sophisticated: ["malicious", "contemptible", "vindictive", "spiteful"] },
    { common: "kind", sophisticated: ["benevolent", "magnanimous", "compassionate", "gracious"] },
    { common: "lazy", sophisticated: ["indolent", "lethargic", "inert", "apathetic"] },
    { common: "stubborn", sophisticated: ["obstinate", "intractable", "tenacious", "resolute"] },
    // Communication & thought
    { common: "say", sophisticated: ["articulate", "assert", "convey", "proclaim"] },
    { common: "show", sophisticated: ["demonstrate", "illustrate", "exhibit", "manifest"] },
    { common: "think", sophisticated: ["contemplate", "deliberate", "ponder", "surmise"] },
    { common: "understand", sophisticated: ["comprehend", "discern", "grasp", "perceive"] },
    { common: "explain", sophisticated: ["elucidate", "articulate", "clarify", "expound"] },
    { common: "important", sophisticated: ["crucial", "paramount", "pivotal", "vital"] },
    { common: "interesting", sophisticated: ["compelling", "captivating", "intriguing", "engaging"] },
    { common: "confusing", sophisticated: ["perplexing", "bewildering", "convoluted", "ambiguous"] },
    { common: "obvious", sophisticated: ["evident", "conspicuous", "unambiguous", "manifest"] },
    // Action
    { common: "help", sophisticated: ["facilitate", "bolster", "advocate", "champion"] },
    { common: "change", sophisticated: ["transform", "revolutionize", "alter", "reconfigure"] },
    { common: "make", sophisticated: ["construct", "fabricate", "devise", "formulate"] },
    { common: "use", sophisticated: ["utilize", "employ", "leverage", "deploy"] },
    { common: "need", sophisticated: ["require", "necessitate", "demand", "warrant"] },
    { common: "try", sophisticated: ["endeavor", "attempt", "undertake", "pursue"] },
    { common: "get", sophisticated: ["acquire", "obtain", "attain", "procure"] },
    { common: "give", sophisticated: ["bestow", "confer", "impart", "furnish"] },
    { common: "stop", sophisticated: ["cease", "halt", "discontinue", "terminate"] },
    { common: "start", sophisticated: ["initiate", "commence", "inaugurate", "embark"] },
    // Descriptive
    { common: "old", sophisticated: ["antiquated", "archaic", "obsolete", "venerable"] },
    { common: "new", sophisticated: ["innovative", "novel", "contemporary", "pioneering"] },
    { common: "fast", sophisticated: ["expeditious", "swift", "brisk", "agile"] },
    { common: "slow", sophisticated: ["deliberate", "unhurried", "gradual", "methodical"] },
    { common: "hard", sophisticated: ["arduous", "formidable", "strenuous", "rigorous"] },
    { common: "easy", sophisticated: ["effortless", "straightforward", "uncomplicated", "seamless"] },
    { common: "strange", sophisticated: ["peculiar", "anomalous", "aberrant", "idiosyncratic"] },
    { common: "clear", sophisticated: ["lucid", "transparent", "unequivocal", "coherent"] },
    { common: "strong", sophisticated: ["robust", "formidable", "resolute", "tenacious"] },
    { common: "weak", sophisticated: ["feeble", "ineffectual", "fragile", "inadequate"] }
  ];

  const idioms = [
    { phrase: "Break the ice", meaning: "To initiate conversation in a social setting", example: "She told a joke to break the ice at the meeting." },
    { phrase: "Hit the nail on the head", meaning: "To describe exactly what is causing a situation or problem", example: "You hit the nail on the head with that analysis." },
    { phrase: "Think outside the box", meaning: "To think creatively or unconventionally", example: "We need to think outside the box to solve this challenge." },
    { phrase: "The ball is in your court", meaning: "It's your turn to take action or make a decision", example: "I've given you my proposal, now the ball is in your court." },
    { phrase: "Cut to the chase", meaning: "Get to the point without wasting time", example: "Let's cut to the chase and discuss the main issue." },
    { phrase: "Devil's advocate", meaning: "Someone who argues against something to provoke debate", example: "Let me play devil's advocate and challenge that assumption." },
    { phrase: "Elephant in the room", meaning: "An obvious problem that people avoid discussing", example: "We need to address the elephant in the room." },
    { phrase: "See eye to eye", meaning: "To agree with someone", example: "We don't always see eye to eye, but we respect each other's opinions." }
  ];

  const rhetoricalDevices = {
    metaphor: [
      { text: "Time is money", explanation: "Compares time to money to emphasize its value" },
      { text: "The world is a stage", explanation: "Life is compared to a theatrical performance" },
      { text: "Her voice is music to my ears", explanation: "A pleasant voice is compared to music" },
      { text: "He has a heart of stone", explanation: "Describes someone as emotionally cold or unfeeling" }
    ],
    simile: [
      { text: "As brave as a lion", explanation: "Comparing courage to a lion's bravery" },
      { text: "The assignment was as easy as pie", explanation: "Using comparison to describe simplicity" },
      { text: "She runs like the wind", explanation: "Comparing speed to wind" },
      { text: "His explanation was as clear as mud", explanation: "Ironic comparison showing lack of clarity" }
    ],
    analogy: [
      { text: "Life is like a box of chocolates; you never know what you're going to get", explanation: "Extended comparison showing life's unpredictability" },
      { text: "Just as a sword is the weapon of a warrior, a pen is the weapon of a writer", explanation: "Comparing relationships between different elements" },
      { text: "Finding that file is like finding a needle in a haystack", explanation: "Comparing difficulty levels of two tasks" },
      { text: "Teaching is like gardening - you plant seeds of knowledge and nurture growth", explanation: "Comparing the process of teaching to gardening" }
    ],
    alliteration: [
      { text: "Peter Piper picked a peck of pickled peppers", explanation: "Repetition of 'p' sound creates rhythm and memorability" },
      { text: "She sells seashells by the seashore", explanation: "Repetition of 's' sound creates flow" },
      { text: "Big, bold, and beautiful", explanation: "Repetition of 'b' sound adds emphasis" },
      { text: "Whisper words of wisdom", explanation: "Repetition of 'w' sound creates soft, flowing effect" }
    ]
  };

  const powerWords = {
    persuasive: [
      { word: "Proven", definition: "Demonstrates reliability and evidence" },
      { word: "Revolutionary", definition: "Suggests groundbreaking innovation" },
      { word: "Exclusive", definition: "Creates sense of privilege and scarcity" },
      { word: "Guarantee", definition: "Provides assurance and confidence" },
      { word: "Essential", definition: "Emphasizes necessity and importance" },
      { word: "Transform", definition: "Promises significant positive change" }
    ],
    emotional: [
      { word: "Heartfelt", definition: "Conveys genuine emotion and sincerity" },
      { word: "Inspiring", definition: "Motivates and uplifts the audience" },
      { word: "Devastating", definition: "Expresses profound negative impact" },
      { word: "Breathtaking", definition: "Conveys awe and wonder" },
      { word: "Overwhelming", definition: "Expresses intensity of feeling" },
      { word: "Touching", definition: "Evokes emotional response" }
    ],
    confident: [
      { word: "Definitive", definition: "Shows absolute certainty" },
      { word: "Unquestionable", definition: "Beyond doubt or dispute" },
      { word: "Commanding", definition: "Projects authority and control" },
      { word: "Decisive", definition: "Shows clear determination" },
      { word: "Assertive", definition: "Expresses confidence without aggression" },
      { word: "Empowered", definition: "Suggests strength and capability" }
    ],
    descriptive: [
      { word: "Vivid", definition: "Creates strong, clear mental images" },
      { word: "Pristine", definition: "Perfectly clean and unspoiled" },
      { word: "Luminous", definition: "Bright and radiant" },
      { word: "Intricate", definition: "Detailed and complex" },
      { word: "Sublime", definition: "Of supreme excellence or beauty" },
      { word: "Resplendent", definition: "Dazzling and magnificent" }
    ]
  };

  /**
   * Initialize the fluency module
   */
  function init() {
    console.log('FluencyModule initializing...');

    // Load user data
    userData = StorageManager.load();

    if (!userData) {
      console.error('No user data found');
      return;
    }

    // Get DOM elements
    initializeDOM();

    // Set up event listeners
    setupEventListeners();

    // Load initial content
    loadInitialContent();

    // Add AI generate buttons next to existing "New" buttons
    initAIGenerateButtons();

    console.log('FluencyModule initialized successfully');
  }

  /**
   * Initialize all DOM elements
   */
  function initializeDOM() {
    // Category tabs
    categoryTabs = document.querySelectorAll('.category-tab');
    categories = document.querySelectorAll('.fluency-category');

    // Pronunciation & Articulation
    tongueTwisterDisplay = document.getElementById('tongue-twister-display');
    newTongueTwisterBtn = document.getElementById('new-tongue-twister-btn');
    difficultyButtons = document.querySelectorAll('.difficulty-btn');
    minimalPairWords = document.getElementById('minimal-pair-words');
    newMinimalPairBtn = document.getElementById('new-minimal-pair-btn');
    stressWordDisplay = document.getElementById('stress-word-display');
    newStressWordBtn = document.getElementById('new-stress-word-btn');

    // Fluency Building
    fillerStartBtn = document.getElementById('filler-start-btn');
    pacingPassage = document.getElementById('pacing-passage');
    newPacingPassageBtn = document.getElementById('new-pacing-passage-btn');
    transitionExerciseContent = document.getElementById('transition-exercise-content');
    newTransitionExerciseBtn = document.getElementById('new-transition-exercise-btn');
    simpleSentences = document.getElementById('simple-sentences');
    fluencyCombiningHint = document.getElementById('fluency-combining-hint');
    fluencyCombiningHintSection = document.getElementById('fluency-combining-hint-section');
    fluencyCombiningExampleSection = document.getElementById('fluency-combining-example-section');
    fluencyCombiningExample = document.getElementById('fluency-combining-example');
    showFluencyCombiningHintBtn = document.getElementById('show-fluency-combining-hint-btn');
    showFluencyCombiningExampleBtn = document.getElementById('show-fluency-combining-example-btn');
    newFluencyCombiningExerciseBtn = document.getElementById('new-fluency-combining-exercise-btn');
    combiningAnswerInput = document.getElementById('combining-answer-input');

    // Eloquence & Expression
    synonymWordDisplay = document.getElementById('synonym-word-display');
    newSynonymBtn = document.getElementById('new-synonym-btn');
    idiomContentDisplay = document.getElementById('idiom-content-display');
    newIdiomBtn = document.getElementById('new-idiom-btn');
    rhetoricalButtons = document.querySelectorAll('.rhetorical-btn');
    rhetoricalContentDisplay = document.getElementById('rhetorical-content-display');
    newRhetoricalBtn = document.getElementById('new-rhetorical-btn');
    powerCategoryButtons = document.querySelectorAll('.power-category-btn');
    powerWordsDisplay = document.getElementById('power-words-display');
  }

  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Category tabs
    if (categoryTabs) {
      categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          switchCategory(this.dataset.category);
        });
      });
    }

    // Pronunciation & Articulation
    if (newTongueTwisterBtn) {
      newTongueTwisterBtn.addEventListener('click', showNewTongueTwister);
    }

    if (difficultyButtons) {
      difficultyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          setDifficulty(this.dataset.difficulty);
        });
      });
    }

    if (newMinimalPairBtn) {
      newMinimalPairBtn.addEventListener('click', showNewMinimalPair);
    }

    if (newStressWordBtn) {
      newStressWordBtn.addEventListener('click', showNewStressWord);
    }

    // Fluency Building
    if (fillerStartBtn) {
      fillerStartBtn.addEventListener('click', startFillerExercise);
    }

    const fillerDurationGroup = document.getElementById('filler-duration-group');
    if (fillerDurationGroup) {
      fillerDurationGroup.addEventListener('click', function(e) {
        const btn = e.target.closest('[data-seconds]');
        if (!btn) return;
        fillerDurationGroup.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    }

    const fillerStopBtn = document.getElementById('filler-stop-btn');
    if (fillerStopBtn) {
      fillerStopBtn.addEventListener('click', () => stopFillerExercise(false));
    }

    const fillerTryAgainBtn = document.getElementById('filler-try-again-btn');
    if (fillerTryAgainBtn) {
      fillerTryAgainBtn.addEventListener('click', () => startFillerExercise(true));
    }

    const fillerNewTopicBtn = document.getElementById('filler-new-topic-btn');
    if (fillerNewTopicBtn) {
      fillerNewTopicBtn.addEventListener('click', () => startFillerExercise(false));
    }

    if (newPacingPassageBtn) {
      newPacingPassageBtn.addEventListener('click', showNewPacingPassage);
    }

    pacingStartBtn = document.getElementById('pacing-start-btn');
    pacingDoneBtn = document.getElementById('pacing-done-btn');

    if (pacingStartBtn) {
      pacingStartBtn.addEventListener('click', startPacingTimer);
    }
    if (pacingDoneBtn) {
      pacingDoneBtn.addEventListener('click', stopPacingTimer);
    }

    if (newTransitionExerciseBtn) {
      newTransitionExerciseBtn.addEventListener('click', showNewTransitionExercise);
    }

    if (newFluencyCombiningExerciseBtn) {
      newFluencyCombiningExerciseBtn.addEventListener('click', showNewCombiningExercise);
    }

    if (showFluencyCombiningHintBtn) {
      showFluencyCombiningHintBtn.addEventListener('click', showCombiningHint);
    }

    if (showFluencyCombiningExampleBtn) {
      showFluencyCombiningExampleBtn.addEventListener('click', showCombiningExampleSolution);
    }

    // Eloquence & Expression
    if (newSynonymBtn) {
      newSynonymBtn.addEventListener('click', showNewSynonym);
    }

    if (newIdiomBtn) {
      newIdiomBtn.addEventListener('click', showNewIdiom);
    }

    if (rhetoricalButtons) {
      rhetoricalButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          setRhetoricalType(this.dataset.type);
        });
      });
    }

    if (newRhetoricalBtn) {
      newRhetoricalBtn.addEventListener('click', showNewRhetoricalExample);
    }

    if (powerCategoryButtons) {
      powerCategoryButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          setPowerCategory(this.dataset.category);
        });
      });
    }
  }

  /**
   * Load initial content for each category
   */
  function loadInitialContent() {
    // Load initial pronunciation content
    showNewTongueTwister();
    showNewMinimalPair();
    showNewStressWord();

    // Load initial fluency content
    showNewPacingPassage();
    showNewTransitionExercise();
    showNewCombiningExercise();

    // Load initial eloquence content
    showNewSynonym();
    showNewIdiom();
    showNewRhetoricalExample();
    showPowerWords();

    // Restore saved category from localStorage
    const savedCategory = localStorage.getItem('fluency_currentCategory');
    if (savedCategory) {
      currentCategory = savedCategory;
      switchCategory(savedCategory);
    }
  }

  /**
   * Switch between categories
   */
  function switchCategory(category) {
    currentCategory = category;

    // Save to localStorage
    localStorage.setItem('fluency_currentCategory', category);

    // Update tab active states
    if (categoryTabs) {
      categoryTabs.forEach(tab => {
        if (tab.dataset.category === category) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }

    // Update category visibility
    if (categories) {
      categories.forEach(cat => {
        if (cat.id === `${category}-category`) {
          cat.classList.add('active');
        } else {
          cat.classList.remove('active');
        }
      });
    }

    // Initialize new modules when their tab is selected
    if (category === 'readaloud' && typeof ReadAloudModule !== 'undefined') {
      ReadAloudModule.refresh();
    }
    if (category === 'shadowing' && typeof ShadowingModule !== 'undefined') {
      ShadowingModule.refresh();
    }
  }

  // ========== Pronunciation & Articulation Functions ==========

  /**
   * Show a new tongue twister
   */
  function showNewTongueTwister() {
    if (!tongueTwisterDisplay) return;

    const twisters = tongueTwisters[currentDifficulty];
    const randomTwister = twisters[Math.floor(Math.random() * twisters.length)];

    tongueTwisterDisplay.innerHTML = `
      <p class="exercise-text">"${randomTwister}"</p>
    `;
  }

  /**
   * Set difficulty level
   */
  function setDifficulty(difficulty) {
    currentDifficulty = difficulty;

    // Update button states
    if (difficultyButtons) {
      difficultyButtons.forEach(btn => {
        if (btn.dataset.difficulty === difficulty) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Show new twister with new difficulty
    showNewTongueTwister();
  }

  /**
   * Show a new minimal pair
   */
  function showNewMinimalPair() {
    if (!minimalPairWords) return;

    const randomPair = minimalPairs[Math.floor(Math.random() * minimalPairs.length)];

    minimalPairWords.innerHTML = `
      <div class="minimal-pair-word">${randomPair.word1}</div>
      <div class="vs-divider">vs</div>
      <div class="minimal-pair-word">${randomPair.word2}</div>
    `;
  }

  /**
   * Show a new stress pattern word
   */
  function showNewStressWord() {
    if (!stressWordDisplay) return;

    const randomWord = stressPatterns[Math.floor(Math.random() * stressPatterns.length)];

    const syllablesHTML = randomWord.syllables.map((syllable, index) => {
      const isStressed = index === randomWord.stressed;
      return `<span class="stress-syllable ${isStressed ? 'stressed' : ''}">${syllable}</span>`;
    }).join('');

    stressWordDisplay.innerHTML = `
      <div class="stress-word">${syllablesHTML}</div>
      <p class="stress-explanation">${randomWord.note}</p>
    `;
  }

  // ========== Fluency Building Functions ==========

  // Filler exercise state
  let fillerTimer = null;
  let fillerRecognition = null;
  let fillerSecondsLeft = 30;
  let fillerTotalDuration = 30;
  let fillerCount = 0;
  let fillerBreakdown = {};
  let fillerCurrentTopic = '';

  const FILLER_WORDS_LIST = [
    'you know', 'i mean', 'okay so', 'so basically', 'you see',
    'sort of', 'kind of', 'um', 'uh', 'er', 'like', 'basically',
    'literally', 'actually', 'right', 'well'
  ];

  const fillerTopics = [
    "your favorite hobby and why you enjoy it",
    "a recent accomplishment you're proud of",
    "your ideal vacation destination",
    "a book, film, or show that stuck with you",
    "your morning routine and how it sets your day",
    "your career goals for the next five years",
    "a place that has special meaning to you",
    "one skill everyone should learn",
    "a challenge you faced and how you got through it",
    "what success means to you personally",
    "a person who has influenced your life",
    "something small that brings you a lot of joy",
    "if you could change one thing about your city",
    "what being a good communicator looks like",
    "your ideal workday from start to finish",
    "a time things didn't go as planned",
    "what you would do with an extra hour every day",
    "something you wish more people understood"
  ];

  const fillerTips = {
    perfect: [
      "Outstanding! Zero fillers detected. Deliberate pauses are your secret weapon — keep using them.",
      "Flawless run. Your silence spoke louder than any filler ever could.",
      "Perfect score. You're building a habit that will set you apart as a speaker."
    ],
    good: [
      "Great job. To go from good to excellent, notice the moment before a filler appears — that moment of searching is your cue to pause.",
      "Very clean speech. Try recording yourself to spot patterns you might not notice in the moment.",
      "Strong result. Next step: slow down slightly before transitions between ideas — that's when fillers tend to sneak in."
    ],
    fair: [
      "Solid effort. A useful trick: before you start, rehearse your first sentence out loud so you don't need a filler to buy time at the start.",
      "Getting there. Try thinking in full sentences before speaking rather than thinking out loud.",
      "Fair result. Focus on one filler at a time — pick your most-used one and make eliminating it your only goal next round."
    ],
    needs_work: [
      "Don't worry — awareness is step one. Try pausing for 1–2 seconds when you feel a filler coming. Silence feels longer to you than it does to your listeners.",
      "Keep practicing. Filler words often appear when we lose track of our next point — try structuring your answer with: situation, what you did, the result.",
      "The key insight: fillers happen when your mouth moves before your brain is ready. Slow your pace slightly and give your thoughts time to form."
    ]
  };

  function getFillerTip(count, duration) {
    const rate = count / (duration / 60); // fillers per minute
    if (count === 0) return fillerTips.perfect[Math.floor(Math.random() * fillerTips.perfect.length)];
    if (rate < 3)    return fillerTips.good[Math.floor(Math.random() * fillerTips.good.length)];
    if (rate < 6)    return fillerTips.fair[Math.floor(Math.random() * fillerTips.fair.length)];
    return fillerTips.needs_work[Math.floor(Math.random() * fillerTips.needs_work.length)];
  }

  function detectFillers(transcript) {
    const lower = transcript.toLowerCase();
    const sorted = [...FILLER_WORDS_LIST].sort((a, b) => b.split(' ').length - a.split(' ').length);
    let found = [];
    sorted.forEach(filler => {
      const regex = new RegExp('\\b' + filler.replace(/\s+/g, '\\s+') + '\\b', 'gi');
      const matches = lower.match(regex);
      if (matches) {
        matches.forEach(() => found.push(filler));
        fillerBreakdown[filler] = (fillerBreakdown[filler] || 0) + matches.length;
      }
    });
    return found;
  }

  function showFillerSetup() {
    document.getElementById('filler-setup').style.display = 'block';
    document.getElementById('filler-active').style.display = 'none';
    document.getElementById('filler-results').style.display = 'none';
  }

  function showFillerResults() {
    document.getElementById('filler-setup').style.display = 'none';
    document.getElementById('filler-active').style.display = 'none';
    document.getElementById('filler-results').style.display = 'block';

    const rate = fillerCount / (fillerTotalDuration / 60);
    let emoji, label, sub, bannerColor;
    if (fillerCount === 0) {
      emoji = ''; label = 'Perfect — Zero Fillers!';
      sub = `You spoke for ${fillerTotalDuration} seconds with no filler words detected.`;
      bannerColor = '#d4edda';
    } else if (rate < 3) {
      emoji = ''; label = `Very Clean — ${fillerCount} filler${fillerCount > 1 ? 's' : ''}`;
      sub = `Only ${fillerCount} filler${fillerCount > 1 ? 's' : ''} in ${fillerTotalDuration} seconds. That's excellent.`;
      bannerColor = '#d4edda';
    } else if (rate < 6) {
      emoji = ''; label = `Good — ${fillerCount} fillers detected`;
      sub = `About ${rate.toFixed(1)} fillers per minute. A bit more practice and you'll be clean.`;
      bannerColor = '#fff3cd';
    } else {
      emoji = ''; label = `${fillerCount} fillers — keep practicing`;
      sub = `${rate.toFixed(1)} fillers per minute. Every attempt builds the habit.`;
      bannerColor = '#f8d7da';
    }

    const banner = document.getElementById('filler-score-banner');
    banner.style.background = bannerColor;
    document.getElementById('filler-score-emoji').textContent = emoji;
    document.getElementById('filler-score-label').textContent = label;
    document.getElementById('filler-score-sub').textContent = sub;

    const breakdown = document.getElementById('filler-breakdown');
    if (Object.keys(fillerBreakdown).length > 0) {
      const rows = Object.entries(fillerBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([word, count]) => `
          <div style="display:flex; justify-content:space-between; align-items:center;
               padding: var(--spacing-sm) var(--spacing-md); background: var(--bg-hover);
               border-radius: var(--border-radius-sm); margin-bottom: var(--spacing-xs);">
            <span style="font-weight:600;">"${word}"</span>
            <span style="background: var(--accent-color); color: white; border-radius: 12px;
                  padding: 2px 10px; font-size: var(--font-size-sm); font-weight:700;">×${count}</span>
          </div>`).join('');
      breakdown.innerHTML = `<div style="font-weight:600; margin-bottom: var(--spacing-sm);">Filler Breakdown:</div>${rows}`;
    } else {
      breakdown.innerHTML = '';
    }

    document.getElementById('filler-tip-box').innerHTML =
      `<strong>Tip:</strong> ${getFillerTip(fillerCount, fillerTotalDuration)}`;
  }

  function stopFillerExercise(finished) {
    if (fillerTimer) { clearInterval(fillerTimer); fillerTimer = null; }
    if (fillerRecognition) {
      try { fillerRecognition.stop(); } catch(e) {}
      fillerRecognition = null;
    }
    if (finished || fillerSecondsLeft <= 0) {
      showFillerResults();
    } else {
      showFillerSetup();
    }
  }

  function startFillerExercise(sameTopic) {
    // Pick a topic (avoid repeating last one unless sameTopic is true)
    let topic;
    if (sameTopic && fillerCurrentTopic) {
      topic = fillerCurrentTopic;
    } else {
      do {
        topic = fillerTopics[Math.floor(Math.random() * fillerTopics.length)];
      } while (topic === fillerCurrentTopic && fillerTopics.length > 1);
      fillerCurrentTopic = topic;
    }

    // Get selected duration
    const activeBtn = document.querySelector('#filler-duration-group .btn.active');
    fillerTotalDuration = activeBtn ? parseInt(activeBtn.dataset.seconds, 10) : 30;
    fillerSecondsLeft = fillerTotalDuration;
    fillerCount = 0;
    fillerBreakdown = {};

    // Switch screens
    document.getElementById('filler-setup').style.display = 'none';
    document.getElementById('filler-active').style.display = 'block';
    document.getElementById('filler-results').style.display = 'none';

    document.getElementById('filler-topic-text').textContent = topic;
    document.getElementById('filler-countdown').textContent = fillerSecondsLeft;
    document.getElementById('filler-live-count').textContent = '0';
    document.getElementById('filler-last-detected').textContent = '—';

    // Countdown timer
    fillerTimer = setInterval(() => {
      fillerSecondsLeft--;
      const countEl = document.getElementById('filler-countdown');
      if (countEl) countEl.textContent = fillerSecondsLeft;
      if (fillerSecondsLeft <= 0) {
        stopFillerExercise(true);
      }
    }, 1000);

    // Speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      fillerRecognition = new SpeechRecognition();
      fillerRecognition.continuous = true;
      fillerRecognition.interimResults = true;
      fillerRecognition.lang = 'en-US';

      let processedLength = 0;

      fillerRecognition.onresult = function(event) {
        let interimText = '';
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }
        if (finalText) {
          const newChunk = finalText.slice(processedLength);
          processedLength = finalText.length;
          const found = detectFillers(newChunk);
          if (found.length > 0) {
            fillerCount += found.length;
            const liveEl = document.getElementById('filler-live-count');
            const lastEl = document.getElementById('filler-last-detected');
            if (liveEl) liveEl.textContent = fillerCount;
            if (lastEl) lastEl.textContent = '"' + found[found.length - 1] + '"';
            if (liveEl) liveEl.style.color = fillerCount > 5 ? '#e74c3c' : 'var(--accent-color)';
          }
        }
      };

      fillerRecognition.onerror = function(event) {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          const micEl = document.getElementById('filler-mic-status');
          if (micEl) micEl.textContent = 'Microphone access denied — exercise continues without detection';
        }
      };

      fillerRecognition.onend = function() {
        // Restart if timer is still running
        if (fillerTimer && fillerSecondsLeft > 0) {
          try { fillerRecognition.start(); } catch(e) {}
        }
      };

      try {
        fillerRecognition.start();
      } catch(e) {
        const micEl = document.getElementById('filler-mic-status');
        if (micEl) micEl.textContent = 'Speech recognition not available — exercise continues without detection';
      }
    } else {
      const micEl = document.getElementById('filler-mic-status');
      if (micEl) micEl.textContent = 'Speech recognition not supported in this browser';
    }
  }

  /**
   * Show a new pacing passage
   */
  function showNewPacingPassage() {
    if (!pacingPassage) return;

    // Reset timer state on new passage
    if (pacingTimer) { clearInterval(pacingTimer); pacingTimer = null; }
    document.getElementById('pacing-timer-display').style.display = 'none';
    document.getElementById('pacing-results').style.display = 'none';
    if (pacingStartBtn) { pacingStartBtn.style.display = ''; pacingStartBtn.textContent = 'Start Timer'; pacingStartBtn.disabled = false; }
    if (pacingDoneBtn) { pacingDoneBtn.style.display = 'none'; }

    const randomPassage = pacingPassages[Math.floor(Math.random() * pacingPassages.length)];
    pacingWordCount = randomPassage.split(/\s+/).length;
    const targetSecs = Math.round(pacingWordCount / 2.5); // 150 WPM

    pacingPassage.innerHTML = `
      <p class="exercise-text">${randomPassage}</p>
      <p class="pacing-info" style="margin-top: var(--spacing-sm);"><strong>${pacingWordCount} words</strong> &mdash; target: ~${targetSecs}s at 150 WPM</p>
    `;
  }

  function startPacingTimer() {
    if (pacingTimer) return;
    if (pacingStartBtn) pacingStartBtn.disabled = true;
    pacingStartTime = Date.now();
    pacingSpokenWords = 0;
    pacingUsingSpeech = false;
    document.getElementById('pacing-results').style.display = 'none';
    document.getElementById('pacing-timer-display').style.display = 'block';
    document.getElementById('pacing-live-words').textContent = '0';
    document.getElementById('pacing-mic-status').textContent = 'Listening...';
    if (pacingStartBtn) pacingStartBtn.style.display = 'none';
    if (pacingDoneBtn) { pacingDoneBtn.style.display = ''; pacingDoneBtn.disabled = false; }

    pacingTimer = setInterval(() => {
      const elapsed = (Date.now() - pacingStartTime) / 1000;
      const el = document.getElementById('pacing-elapsed');
      if (el) el.textContent = elapsed.toFixed(1) + 's';
    }, 100);

    // Speech recognition to count spoken words
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      pacingRecognition = new SpeechRecognition();
      pacingRecognition.continuous = true;
      pacingRecognition.interimResults = true;
      pacingRecognition.lang = 'en-US';
      pacingUsingSpeech = true;

      let finalTranscript = '';

      pacingRecognition.onresult = function(event) {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        // Count words from final transcript + current interim
        const allText = (finalTranscript + interim).trim();
        pacingSpokenWords = allText ? allText.split(/\s+/).length : 0;
        const liveEl = document.getElementById('pacing-live-words');
        if (liveEl) liveEl.textContent = pacingSpokenWords;
      };

      pacingRecognition.onerror = function(event) {
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          pacingUsingSpeech = false;
          const micEl = document.getElementById('pacing-mic-status');
          if (micEl) micEl.textContent = 'Mic access denied — stop timer when done reading';
        }
      };

      pacingRecognition.onend = function() {
        if (pacingTimer) {
          try { pacingRecognition.start(); } catch(e) {}
        }
      };

      try {
        pacingRecognition.start();
      } catch(e) {
        pacingUsingSpeech = false;
        const micEl = document.getElementById('pacing-mic-status');
        if (micEl) micEl.textContent = 'Speech recognition unavailable — stop timer when done reading';
      }
    } else {
      const micEl = document.getElementById('pacing-mic-status');
      if (micEl) micEl.textContent = 'Speech recognition not supported — stop timer when done reading';
    }
  }

  function stopPacingTimer() {
    if (!pacingTimer) return;
    clearInterval(pacingTimer);
    pacingTimer = null;

    if (pacingRecognition) {
      try { pacingRecognition.stop(); } catch(e) {}
      pacingRecognition = null;
    }

    const elapsedSecs = (Date.now() - pacingStartTime) / 1000;
    // Use spoken word count if speech was active and heard something, else fall back to passage word count
    const wordsForCalc = (pacingUsingSpeech && pacingSpokenWords > 5) ? pacingSpokenWords : pacingWordCount;
    const wpm = Math.round((wordsForCalc / elapsedSecs) * 60);

    document.getElementById('pacing-timer-display').style.display = 'none';
    if (pacingDoneBtn) pacingDoneBtn.style.display = 'none';
    if (pacingStartBtn) { pacingStartBtn.style.display = ''; pacingStartBtn.textContent = 'Try Again'; pacingStartBtn.disabled = false; }

    // Determine feedback
    let bannerColor, label, sub;
    if (wpm < 100) {
      bannerColor = '#f8d7da';
      label = 'Too slow';
      sub = 'Try to speak more naturally — aim for 120+ WPM.';
    } else if (wpm < 120) {
      bannerColor = '#fff3cd';
      label = 'A bit slow';
      sub = 'Good for a deliberate presentation pace. Push slightly faster for conversational flow.';
    } else if (wpm <= 160) {
      bannerColor = '#d4edda';
      label = 'Right on target';
      sub = wpm <= 150 ? 'Solid presentation pace — clear and authoritative.' : 'Natural conversational pace — well done.';
    } else if (wpm <= 180) {
      bannerColor = '#fff3cd';
      label = 'A bit fast';
      sub = 'Slightly above conversational range. Try slowing down to let ideas land.';
    } else {
      bannerColor = '#f8d7da';
      label = 'Too fast';
      sub = 'Slow down — your audience needs time to absorb what you\'re saying.';
    }

    const banner = document.getElementById('pacing-result-banner');
    banner.style.background = bannerColor;
    document.getElementById('pacing-result-wpm').textContent = wpm + ' WPM';
    document.getElementById('pacing-result-label').textContent = label;
    document.getElementById('pacing-result-sub').textContent = sub;
    document.getElementById('pacing-results').style.display = 'block';
  }

  /**
   * Show a new transition exercise
   */
  function showNewTransitionExercise() {
    if (!transitionExerciseContent) return;

    const randomExercise = transitionExercises[Math.floor(Math.random() * transitionExercises.length)];

    transitionExerciseContent.innerHTML = `
      <div style="margin-bottom: var(--spacing-md);">
        <p style="margin: var(--spacing-sm) 0;"><strong>Sentence 1:</strong> "${randomExercise.sentence1}"</p>
        <p style="margin: var(--spacing-sm) 0;"><strong>Sentence 2:</strong> "${randomExercise.sentence2}"</p>
      </div>
      <div class="hint-text">${randomExercise.hint}</div>
    `;
  }

  /**
   * Show a new combining exercise
   */
  function showNewCombiningExercise() {
    if (!simpleSentences) return;

    // Pick a random exercise
    currentCombiningExercise = combiningExercises[Math.floor(Math.random() * combiningExercises.length)];

    // Display the simple sentences
    simpleSentences.innerHTML = `
      <div style="background: var(--bg-card); padding: var(--spacing-md); border-radius: var(--border-radius-sm);">
        ${currentCombiningExercise.sentences.map((s, i) => `<p style="margin: var(--spacing-xs) 0; font-size: var(--font-size-lg);"><strong>${i + 1}.</strong> ${s}</p>`).join('')}
      </div>
    `;

    // Clear the textarea
    if (combiningAnswerInput) {
      combiningAnswerInput.value = '';
    }

    // Hide hint and example sections
    if (fluencyCombiningHintSection) fluencyCombiningHintSection.style.display = 'none';
    if (fluencyCombiningExampleSection) fluencyCombiningExampleSection.style.display = 'none';

    // Reset button states
    if (showFluencyCombiningHintBtn) {
      showFluencyCombiningHintBtn.disabled = false;
      showFluencyCombiningHintBtn.textContent = 'Show Hint';
    }
    if (showFluencyCombiningExampleBtn) {
      showFluencyCombiningExampleBtn.disabled = false;
      showFluencyCombiningExampleBtn.textContent = 'Show Example';
    }
  }

  /**
   * Show hint for combining exercise
   */
  function showCombiningHint() {
    if (!currentCombiningExercise || !fluencyCombiningHintSection || !fluencyCombiningHint) return;

    // Toggle hint visibility
    const isHidden = fluencyCombiningHintSection.style.display === 'none' || fluencyCombiningHintSection.style.display === '';

    if (isHidden) {
      fluencyCombiningHint.textContent = currentCombiningExercise.hint;
      fluencyCombiningHintSection.style.display = 'block';
      if (showFluencyCombiningHintBtn) showFluencyCombiningHintBtn.textContent = 'Hide Hint';
    } else {
      fluencyCombiningHintSection.style.display = 'none';
      if (showFluencyCombiningHintBtn) showFluencyCombiningHintBtn.textContent = 'Show Hint';
    }
  }

  /**
   * Show example solution for combining exercise
   */
  function showCombiningExampleSolution() {
    if (!currentCombiningExercise || !fluencyCombiningExampleSection || !fluencyCombiningExample) return;

    // Toggle example visibility
    const isHidden = fluencyCombiningExampleSection.style.display === 'none' || fluencyCombiningExampleSection.style.display === '';

    if (isHidden) {
      fluencyCombiningExample.textContent = currentCombiningExercise.example;
      fluencyCombiningExampleSection.style.display = 'block';
      if (showFluencyCombiningExampleBtn) showFluencyCombiningExampleBtn.textContent = 'Hide Example';
    } else {
      fluencyCombiningExampleSection.style.display = 'none';
      if (showFluencyCombiningExampleBtn) showFluencyCombiningExampleBtn.textContent = 'Show Example';
    }
  }

  // ========== Eloquence & Expression Functions ==========

  /**
   * Show a new synonym pair
   */
  async function showNewSynonym() {
    if (!synonymWordDisplay) return;

    // Show loading state
    synonymWordDisplay.innerHTML = `
      <div style="text-align: center; padding: var(--spacing-xl);">
        <p style="color: var(--text-secondary);">Loading synonyms...</p>
      </div>
    `;

    // Pick a random common word (avoid immediate repeat)
    let randomPair;
    do {
      randomPair = synonymPairs[Math.floor(Math.random() * synonymPairs.length)];
    } while (randomPair.common === showNewSynonym._lastWord && synonymPairs.length > 1);
    showNewSynonym._lastWord = randomPair.common;
    const commonWord = randomPair.common;

    try {
      // Try to fetch from API first
      if (typeof APIService !== 'undefined') {
        const apiSynonyms = await APIService.getSophisticatedSynonyms(commonWord);

        // Use API synonyms if we got good results
        if (apiSynonyms && apiSynonyms.length >= 3) {
          displaySynonymPair(commonWord, apiSynonyms.slice(0, 4));
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch synonyms from API, using fallback:', error);
    }

    // Fallback to static data
    displaySynonymPair(commonWord, randomPair.sophisticated);
  }

  /**
   * Display a synonym pair
   * @param {string} commonWord - The common word
   * @param {Array} synonyms - Array of sophisticated synonyms
   */
  function displaySynonymPair(commonWord, synonyms) {
    if (!synonymWordDisplay) return;

    synonymWordDisplay.innerHTML = `
      <div style="text-align: center;">
        <div style="background: var(--bg-card); padding: var(--spacing-lg); border-radius: var(--border-radius); margin-bottom: var(--spacing-lg); box-shadow: var(--shadow-sm);">
          <p style="font-size: var(--font-size-lg); color: var(--text-secondary); margin-bottom: var(--spacing-sm);">Instead of:</p>
          <p style="font-size: var(--font-size-xxl); font-weight: 700; color: var(--accent-color); margin: 0;">${commonWord}</p>
        </div>
        <p style="font-size: var(--font-size-lg); color: var(--text-secondary); margin-bottom: var(--spacing-md);">Try these alternatives:</p>
        <div style="display: flex; gap: var(--spacing-md); flex-wrap: wrap; justify-content: center;">
          ${synonyms.map(word => `
            <div style="background: var(--primary-color); color: var(--text-white); padding: var(--spacing-md) var(--spacing-lg); border-radius: var(--border-radius-sm); font-size: var(--font-size-lg); font-weight: 600;">
              ${word}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Show a new idiom
   */
  function showNewIdiom() {
    if (!idiomContentDisplay) return;

    // Expanded static idioms array for more variety
    const expandedIdioms = [
      ...idioms,
      { phrase: "Actions speak louder than words", meaning: "What you do is more important than what you say", example: "Don't just promise to help—actions speak louder than words." },
      { phrase: "Back to the drawing board", meaning: "Start over with a new plan", example: "The proposal was rejected, so it's back to the drawing board." },
      { phrase: "Bite off more than you can chew", meaning: "Take on more than you can handle", example: "I bit off more than I could chew by accepting three projects at once." },
      { phrase: "Burn bridges", meaning: "Damage relationships in a way that cannot be repaired", example: "Don't burn bridges—you never know when you'll need those connections again." },
      { phrase: "Costs an arm and a leg", meaning: "Very expensive", example: "That new car costs an arm and a leg!" },
      { phrase: "Get the ball rolling", meaning: "Start something", example: "Let's get the ball rolling on this project today." },
      { phrase: "In the same boat", meaning: "In the same difficult situation", example: "We're all in the same boat when it comes to meeting this deadline." },
      { phrase: "Keep your chin up", meaning: "Stay positive in difficult times", example: "Keep your chin up—things will get better." },
      { phrase: "Let the cat out of the bag", meaning: "Reveal a secret accidentally", example: "I accidentally let the cat out of the bag about the surprise party." },
      { phrase: "Miss the boat", meaning: "Miss an opportunity", example: "If you don't apply now, you'll miss the boat." },
      { phrase: "On the fence", meaning: "Undecided", example: "I'm still on the fence about which job offer to accept." },
      { phrase: "Pull someone's leg", meaning: "Joke with someone", example: "I was just pulling your leg—I didn't really win the lottery!" },
      { phrase: "Speak of the devil", meaning: "The person we were talking about just appeared", example: "Speak of the devil! We were just talking about you." },
      { phrase: "Spill the beans", meaning: "Reveal a secret", example: "Don't spill the beans about the merger until it's official." },
      { phrase: "Under the weather", meaning: "Feeling ill", example: "I'm feeling a bit under the weather today." }
    ];

    const randomIdiom = expandedIdioms[Math.floor(Math.random() * expandedIdioms.length)];

    idiomContentDisplay.innerHTML = `
      <div style="text-align: center;">
        <p style="font-size: var(--font-size-xxl); font-weight: 700; color: var(--primary-color); margin-bottom: var(--spacing-lg);">"${randomIdiom.phrase}"</p>
        <div style="background: var(--bg-card); padding: var(--spacing-lg); border-radius: var(--border-radius-sm); margin-bottom: var(--spacing-md);">
          <p style="font-size: var(--font-size-base); color: var(--text-secondary); margin-bottom: var(--spacing-sm);"><strong>Meaning:</strong></p>
          <p style="font-size: var(--font-size-lg); color: var(--text-primary); margin: 0;">${randomIdiom.meaning}</p>
        </div>
        <div style="background: var(--bg-hover); padding: var(--spacing-md); border-radius: var(--border-radius-sm); font-style: italic;">
          <p style="margin: 0; color: var(--text-secondary);">"${randomIdiom.example}"</p>
        </div>
      </div>
    `;
  }

  /**
   * Set rhetorical device type
   */
  function setRhetoricalType(type) {
    currentRhetoricalType = type;

    // Update button states
    if (rhetoricalButtons) {
      rhetoricalButtons.forEach(btn => {
        if (btn.dataset.type === type) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Display the current example for this type (or initialize one if needed)
    displayCurrentRhetoricalExample();
  }

  /**
   * Display the current rhetorical example for the selected type
   */
  function displayCurrentRhetoricalExample() {
    if (!rhetoricalContentDisplay) return;

    // If no example exists for this type yet, pick one
    if (!currentRhetoricalExamples[currentRhetoricalType]) {
      const examples = rhetoricalDevices[currentRhetoricalType];
      currentRhetoricalExamples[currentRhetoricalType] = examples[Math.floor(Math.random() * examples.length)];
    }

    const example = currentRhetoricalExamples[currentRhetoricalType];

    rhetoricalContentDisplay.innerHTML = `
      <div style="text-align: center;">
        <p style="font-size: var(--font-size-xxl); font-weight: 700; color: var(--secondary-color); margin-bottom: var(--spacing-lg);">"${example.text}"</p>
        <div style="background: var(--bg-card); padding: var(--spacing-lg); border-radius: var(--border-radius-sm);">
          <p style="font-size: var(--font-size-lg); color: var(--text-primary); margin: 0;">${example.explanation}</p>
        </div>
      </div>
    `;
  }

  /**
   * Show a new rhetorical device example
   */
  function showNewRhetoricalExample() {
    if (!rhetoricalContentDisplay) return;

    const examples = rhetoricalDevices[currentRhetoricalType];
    // Pick a new random example
    const randomExample = examples[Math.floor(Math.random() * examples.length)];

    // Store it for this type
    currentRhetoricalExamples[currentRhetoricalType] = randomExample;

    // Display it
    displayCurrentRhetoricalExample();
  }

  /**
   * Set power word category
   */
  function setPowerCategory(category) {
    currentPowerCategory = category;

    // Update button states
    if (powerCategoryButtons) {
      powerCategoryButtons.forEach(btn => {
        if (btn.dataset.category === category) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Show power words
    showPowerWords();
  }

  /**
   * Show power words for current category
   */
  function showPowerWords() {
    if (!powerWordsDisplay) return;

    const words = powerWords[currentPowerCategory];

    powerWordsDisplay.innerHTML = words.map(word => `
      <div class="power-word-card">
        <div class="word">${word.word}</div>
        <div class="definition">${word.definition}</div>
      </div>
    `).join('');
  }

  /**
   * Refresh the view (called when navigating to this view)
   */
  function refresh() {
    console.log('Refreshing FluencyModule...');
    userData = StorageManager.load();
  }

  // Public API
  // ── AI Exercise Generation ────────────────────────────────────────────────

  async function generateFluencyExercise(exerciseType, displayFn, btn) {
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Generating...';

    try {
      const res = await fetch('/.netlify/functions/claude-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate_exercise',
          payload: { exerciseType, topic: 'general' }
        })
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      displayFn(data);
    } catch {
      // Silently fall back — user still has the regular "New" button
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  function addAIGenerateButton(siblingId, exerciseType, displayFn) {
    const sibling = document.getElementById(siblingId);
    if (!sibling || !sibling.parentNode) return;
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary btn-sm';
    btn.textContent = 'Generate with AI';
    btn.style.cssText = 'margin-left: var(--spacing-sm);';
    btn.addEventListener('click', () => generateFluencyExercise(exerciseType, displayFn, btn));
    sibling.parentNode.insertBefore(btn, sibling.nextSibling);
  }

  function initAIGenerateButtons() {
    // Tongue twister
    addAIGenerateButton('new-tongue-twister-btn', 'tongue_twister', function(data) {
      if (tongueTwisterDisplay && data.content) {
        tongueTwisterDisplay.innerHTML = `<p class="exercise-text">"${data.content}"</p>`;
      }
    });

    // Pacing passage
    addAIGenerateButton('new-pacing-passage-btn', 'pacing_passage', function(data) {
      if (pacingPassage && data.content) {
        const wordCount = data.content.split(' ').length;
        pacingPassage.innerHTML = `
          <p class="exercise-text">${data.content}</p>
          <p class="pacing-info"><strong>Word count:</strong> ${wordCount} words | <strong>Target time:</strong> ${Math.round(wordCount / 2.5)} seconds (150 WPM)</p>
          ${data.label ? `<p style="font-size:var(--font-size-sm); color:var(--text-secondary); margin-top:var(--spacing-sm);">${data.label}</p>` : ''}
        `;
      }
    });

    // Rhetorical device (metaphor/simile — whichever is active)
    addAIGenerateButton('new-rhetorical-btn', 'metaphor', function(data) {
      const type = currentRhetoricalType === 'simile' ? 'simile' : 'metaphor';
      if (rhetoricalContentDisplay && data.content) {
        rhetoricalContentDisplay.innerHTML = `
          <div style="text-align:center;">
            <p style="font-size:var(--font-size-xxl); font-weight:700; color:var(--secondary-color); margin-bottom:var(--spacing-lg);">"${data.content}"</p>
            ${data.label ? `<div style="background:var(--bg-card); padding:var(--spacing-lg); border-radius:var(--border-radius-sm);"><p style="font-size:var(--font-size-lg); color:var(--text-primary); margin:0;">${data.label}</p></div>` : ''}
          </div>`;
      }
    });
  }

  return {
    init: init,
    refresh: refresh,
    switchCategory: switchCategory
  };
})();
