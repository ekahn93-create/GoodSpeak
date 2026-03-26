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
    { common: "good", sophisticated: ["excellent", "superior", "exceptional", "exemplary"] },
    { common: "bad", sophisticated: ["inferior", "subpar", "deficient", "inadequate"] },
    { common: "big", sophisticated: ["substantial", "considerable", "extensive", "significant"] },
    { common: "small", sophisticated: ["minute", "diminutive", "negligible", "minimal"] },
    { common: "happy", sophisticated: ["elated", "jubilant", "euphoric", "delighted"] },
    { common: "sad", sophisticated: ["melancholy", "despondent", "disheartened", "dejected"] },
    { common: "smart", sophisticated: ["astute", "perspicacious", "sagacious", "shrewd"] },
    { common: "important", sophisticated: ["crucial", "paramount", "pivotal", "vital"] },
    { common: "interesting", sophisticated: ["compelling", "captivating", "intriguing", "engaging"] },
    { common: "show", sophisticated: ["demonstrate", "illustrate", "exhibit", "manifest"] }
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

    if (newPacingPassageBtn) {
      newPacingPassageBtn.addEventListener('click', showNewPacingPassage);
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

  /**
   * Start filler word exercise
   */
  function startFillerExercise() {
    const topics = [
      "your favorite hobby",
      "a recent accomplishment",
      "your ideal vacation",
      "a book or movie you enjoyed",
      "your morning routine",
      "your career goals",
      "a memorable experience",
      "your hometown"
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const fillerPrompt = document.getElementById('filler-prompt');
    if (fillerPrompt) {
      fillerPrompt.innerHTML = `
        <strong>Topic: ${randomTopic}</strong><br>
        Speak for 30 seconds without using filler words. Focus on pausing instead of saying "um" or "uh".
      `;
    }
  }

  /**
   * Show a new pacing passage
   */
  function showNewPacingPassage() {
    if (!pacingPassage) return;

    const randomPassage = pacingPassages[Math.floor(Math.random() * pacingPassages.length)];
    const wordCount = randomPassage.split(' ').length;

    pacingPassage.innerHTML = `
      <p class="exercise-text">${randomPassage}</p>
      <p class="pacing-info"><strong>Word count:</strong> ${wordCount} words | <strong>Target time:</strong> ${Math.round(wordCount / 2.5)} seconds (150 WPM)</p>
    `;
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

    // Pick a random common word
    const randomPair = synonymPairs[Math.floor(Math.random() * synonymPairs.length)];
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
  return {
    init: init,
    refresh: refresh
  };
})();
