// ============================================
// DAILY WORDS DATABASE
// Contains 60 daily words for conscious word selection practice
// ============================================

/**
 * Daily Words Database
 * Focuses on replacing weak/overused words with precise alternatives
 * Each entry includes the target word and exercise for practice
 */
const dailyWordsDatabase = [
  {
    id: 1,
    word: "good",
    commonAlternative: "excellent, remarkable, beneficial, superior",
    definition: "Having desirable or positive qualities; to be approved of or commended",
    whenToUse: "When you want to express positive qualities with more specificity",
    examples: [
      { weak: "That's a good idea.", strong: "That's an excellent idea." },
      { weak: "She did a good job.", strong: "She did a remarkable job." },
      { weak: "This is good for you.", strong: "This is beneficial for your health." }
    ],
    synonyms: ["excellent", "outstanding", "remarkable", "beneficial", "superior", "admirable"],
    exercise: "Replace 'good' with more precise words in your next three sentences."
  },
  {
    id: 2,
    word: "bad",
    commonAlternative: "detrimental, inadequate, problematic, harmful",
    definition: "Of poor quality or a low standard; unpleasant or unwelcome",
    whenToUse: "When you want to specifically describe what type of negative quality something has",
    examples: [
      { weak: "That's a bad decision.", strong: "That's a detrimental decision." },
      { weak: "The service was bad.", strong: "The service was inadequate." },
      { weak: "This is bad for your health.", strong: "This is harmful to your health." }
    ],
    synonyms: ["detrimental", "inadequate", "problematic", "harmful", "inferior", "deficient"],
    exercise: "Specify what makes something 'bad' rather than using the generic term."
  },
  {
    id: 3,
    word: "very",
    commonAlternative: "exceptionally, remarkably, considerably, extremely",
    definition: "Used to emphasize an adjective or adverb",
    whenToUse: "When you want to emphasize something - but consider if a stronger adjective would work better",
    examples: [
      { weak: "She's very smart.", strong: "She's exceptionally intelligent." },
      { weak: "It's very hot.", strong: "It's sweltering." },
      { weak: "This is very important.", strong: "This is crucial." }
    ],
    synonyms: ["exceptionally", "remarkably", "considerably", "extremely", "tremendously"],
    exercise: "Try replacing 'very + adjective' with a single, more powerful adjective."
  },
  {
    id: 4,
    word: "nice",
    commonAlternative: "pleasant, delightful, agreeable, appealing",
    definition: "Pleasant; enjoyable; satisfactory",
    whenToUse: "When you want to be more specific about what makes something pleasant",
    examples: [
      { weak: "That's a nice gesture.", strong: "That's a thoughtful gesture." },
      { weak: "She's a nice person.", strong: "She's a compassionate person." },
      { weak: "We had a nice time.", strong: "We had a delightful time." }
    ],
    synonyms: ["pleasant", "delightful", "agreeable", "appealing", "charming", "gracious"],
    exercise: "Describe what specifically makes something 'nice' with a more precise word."
  },
  {
    id: 5,
    word: "thing",
    commonAlternative: "aspect, element, component, factor, matter",
    definition: "An object, fact, affair, circumstance, or concept",
    whenToUse: "When you want to be more specific about what you're referring to",
    examples: [
      { weak: "That's an important thing to consider.", strong: "That's an important factor to consider." },
      { weak: "This thing doesn't work.", strong: "This component doesn't function properly." },
      { weak: "Let's discuss this thing.", strong: "Let's discuss this matter." }
    ],
    synonyms: ["aspect", "element", "component", "factor", "matter", "feature"],
    exercise: "Replace 'thing' with specific nouns that describe what you mean."
  },
  {
    id: 6,
    word: "stuff",
    commonAlternative: "materials, belongings, items, equipment, content",
    definition: "Matter, material, articles, or activities of a specified or indeterminate kind",
    whenToUse: "When you want to be more specific about what collection of items you mean",
    examples: [
      { weak: "I need to get my stuff.", strong: "I need to gather my belongings." },
      { weak: "This stuff is important.", strong: "This content is important." },
      { weak: "We need more stuff.", strong: "We need more equipment." }
    ],
    synonyms: ["materials", "belongings", "items", "equipment", "content", "supplies"],
    exercise: "Identify what 'stuff' actually refers to and name it specifically."
  },
  {
    id: 7,
    word: "a lot",
    commonAlternative: "numerous, substantial, considerable, abundant",
    definition: "A large number or amount; a great deal",
    whenToUse: "When you want to quantify or be more precise about quantity",
    examples: [
      { weak: "There are a lot of people.", strong: "There are numerous people." },
      { weak: "I have a lot of work.", strong: "I have substantial work." },
      { weak: "She has a lot of experience.", strong: "She has considerable experience." }
    ],
    synonyms: ["numerous", "substantial", "considerable", "abundant", "extensive", "ample"],
    exercise: "Replace 'a lot' with words that better indicate the quantity or significance."
  },
  {
    id: 8,
    word: "really",
    commonAlternative: "genuinely, truly, authentically, profoundly",
    definition: "In actual fact; used to emphasize a statement or response",
    whenToUse: "When you want to emphasize truth or intensity - but consider stronger alternatives",
    examples: [
      { weak: "I'm really happy.", strong: "I'm genuinely delighted." },
      { weak: "This is really important.", strong: "This is profoundly significant." },
      { weak: "She's really talented.", strong: "She's extraordinarily talented." }
    ],
    synonyms: ["genuinely", "truly", "authentically", "profoundly", "decidedly"],
    exercise: "Remove 'really' and use a more powerful adjective or adverb instead."
  },
  {
    id: 9,
    word: "get",
    commonAlternative: "obtain, acquire, receive, achieve, secure",
    definition: "To come to have or hold; to obtain; to receive",
    whenToUse: "When you want to be more specific about how something is obtained",
    examples: [
      { weak: "I need to get approval.", strong: "I need to obtain approval." },
      { weak: "She got the award.", strong: "She received the award." },
      { weak: "Let's get results.", strong: "Let's achieve results." }
    ],
    synonyms: ["obtain", "acquire", "receive", "achieve", "secure", "procure"],
    exercise: "Specify how something is 'gotten' with a more precise verb."
  },
  {
    id: 10,
    word: "make",
    commonAlternative: "create, produce, construct, generate, formulate",
    definition: "To form by putting parts together or combining substances; to cause to exist",
    whenToUse: "When you want to specify the type of creation or causation",
    examples: [
      { weak: "Let's make a plan.", strong: "Let's formulate a plan." },
      { weak: "This will make problems.", strong: "This will generate problems." },
      { weak: "She made a strong argument.", strong: "She constructed a compelling argument." }
    ],
    synonyms: ["create", "produce", "construct", "generate", "formulate", "establish"],
    exercise: "Replace 'make' with verbs that specify the type of action involved."
  },
  {
    id: 11,
    word: "important",
    commonAlternative: "crucial, vital, essential, significant, pivotal",
    definition: "Of great significance or value; likely to have a profound effect",
    whenToUse: "When you want to emphasize the degree or type of importance",
    examples: [
      { weak: "This is an important decision.", strong: "This is a crucial decision." },
      { weak: "Communication is important.", strong: "Communication is essential." },
      { weak: "This is an important moment.", strong: "This is a pivotal moment." }
    ],
    synonyms: ["crucial", "vital", "essential", "significant", "pivotal", "critical"],
    exercise: "Specify why something is important by using a more precise term."
  },
  {
    id: 12,
    word: "interesting",
    commonAlternative: "fascinating, intriguing, compelling, captivating",
    definition: "Arousing curiosity or interest; holding or catching the attention",
    whenToUse: "When you want to specify what type of interest something generates",
    examples: [
      { weak: "That's an interesting idea.", strong: "That's an intriguing idea." },
      { weak: "She made an interesting point.", strong: "She made a compelling point." },
      { weak: "This is interesting research.", strong: "This is fascinating research." }
    ],
    synonyms: ["fascinating", "intriguing", "compelling", "captivating", "engaging", "absorbing"],
    exercise: "Describe what specifically makes something interesting with a more vivid word."
  },
  {
    id: 13,
    word: "happy",
    commonAlternative: "delighted, content, elated, fulfilled, gratified",
    definition: "Feeling or showing pleasure or contentment",
    whenToUse: "When you want to specify the type or intensity of positive emotion",
    examples: [
      { weak: "I'm happy with the results.", strong: "I'm gratified by the results." },
      { weak: "She's happy about the news.", strong: "She's elated about the news." },
      { weak: "They seem happy.", strong: "They seem content." }
    ],
    synonyms: ["delighted", "content", "elated", "fulfilled", "gratified", "pleased"],
    exercise: "Specify the type of happiness you're describing with a more precise emotion word."
  },
  {
    id: 14,
    word: "sad",
    commonAlternative: "disappointed, melancholy, disheartened, sorrowful",
    definition: "Feeling or showing sorrow; unhappy",
    whenToUse: "When you want to convey the specific nature of the negative emotion",
    examples: [
      { weak: "I'm sad about the outcome.", strong: "I'm disappointed with the outcome." },
      { weak: "She felt sad.", strong: "She felt melancholy." },
      { weak: "This is a sad situation.", strong: "This is a disheartening situation." }
    ],
    synonyms: ["disappointed", "melancholy", "disheartened", "sorrowful", "dejected", "downcast"],
    exercise: "Choose a word that better captures the specific type of sadness you mean."
  },
  {
    id: 15,
    word: "big",
    commonAlternative: "substantial, considerable, significant, extensive",
    definition: "Of considerable size, extent, or intensity",
    whenToUse: "When you want to specify what dimension of 'bigness' you mean",
    examples: [
      { weak: "This is a big problem.", strong: "This is a substantial problem." },
      { weak: "She made a big impact.", strong: "She made a significant impact." },
      { weak: "That's a big change.", strong: "That's an extensive change." }
    ],
    synonyms: ["substantial", "considerable", "significant", "extensive", "sizeable", "major"],
    exercise: "Specify whether you mean size, importance, or impact with a more precise word."
  },
  {
    id: 16,
    word: "small",
    commonAlternative: "minor, modest, subtle, negligible, minute",
    definition: "Of limited size; not large or extensive",
    whenToUse: "When you want to specify the degree or type of smallness",
    examples: [
      { weak: "It's a small issue.", strong: "It's a minor issue." },
      { weak: "We made a small change.", strong: "We made a subtle adjustment." },
      { weak: "There's a small difference.", strong: "There's a negligible difference." }
    ],
    synonyms: ["minor", "modest", "subtle", "negligible", "minute", "slight"],
    exercise: "Clarify whether something is physically small or of small importance."
  },
  {
    id: 17,
    word: "amazing",
    commonAlternative: "remarkable, extraordinary, impressive, astonishing",
    definition: "Causing great surprise or wonder; inspiring amazement",
    whenToUse: "When you want to specify what type of amazement something causes",
    examples: [
      { weak: "That's amazing work.", strong: "That's exceptional work." },
      { weak: "She's an amazing speaker.", strong: "She's an extraordinary speaker." },
      { weak: "This is amazing progress.", strong: "This is remarkable progress." }
    ],
    synonyms: ["remarkable", "extraordinary", "impressive", "astonishing", "exceptional", "phenomenal"],
    exercise: "Be specific about what makes something worthy of amazement."
  },
  {
    id: 18,
    word: "awful",
    commonAlternative: "dreadful, atrocious, abysmal, deplorable",
    definition: "Extremely bad or unpleasant; terrible",
    whenToUse: "When you want to specify the type of badness with more precision",
    examples: [
      { weak: "That's an awful idea.", strong: "That's a misguided approach." },
      { weak: "The service was awful.", strong: "The service was abysmal." },
      { weak: "I feel awful.", strong: "I feel dreadful." }
    ],
    synonyms: ["dreadful", "atrocious", "abysmal", "deplorable", "terrible", "appalling"],
    exercise: "Describe specifically what makes something awful rather than using the generic term."
  },
  {
    id: 19,
    word: "great",
    commonAlternative: "outstanding, superb, magnificent, exemplary",
    definition: "Of an extent, amount, or intensity considerably above average",
    whenToUse: "When you want to specify the excellence or magnitude more precisely",
    examples: [
      { weak: "That's a great solution.", strong: "That's an ingenious solution." },
      { weak: "She's a great leader.", strong: "She's an exemplary leader." },
      { weak: "This is great news.", strong: "This is wonderful news." }
    ],
    synonyms: ["outstanding", "superb", "magnificent", "exemplary", "exceptional", "splendid"],
    exercise: "Replace 'great' with a word that specifies the type of excellence."
  },
  {
    id: 20,
    word: "fun",
    commonAlternative: "enjoyable, entertaining, engaging, amusing",
    definition: "Providing enjoyment, amusement, or light-hearted pleasure",
    whenToUse: "When you want to describe the specific type of enjoyment something provides",
    examples: [
      { weak: "That was fun.", strong: "That was entertaining." },
      { weak: "This is a fun activity.", strong: "This is an engaging activity." },
      { weak: "She's fun to talk to.", strong: "She's delightful to converse with." }
    ],
    synonyms: ["enjoyable", "entertaining", "engaging", "amusing", "pleasurable", "diverting"],
    exercise: "Specify what type of enjoyment or pleasure something provides."
  },
  {
    id: 21,
    word: "hard",
    commonAlternative: "challenging, difficult, demanding, arduous, complex",
    definition: "Requiring a great deal of effort; difficult",
    whenToUse: "When you want to specify why something is difficult",
    examples: [
      { weak: "This is hard work.", strong: "This is demanding work." },
      { weak: "It's a hard problem.", strong: "It's a complex problem." },
      { weak: "That was hard to understand.", strong: "That was difficult to comprehend." }
    ],
    synonyms: ["challenging", "difficult", "demanding", "arduous", "complex", "formidable"],
    exercise: "Specify whether something is physically, mentally, or emotionally difficult."
  },
  {
    id: 22,
    word: "easy",
    commonAlternative: "simple, straightforward, effortless, manageable",
    definition: "Achieved without great effort; not difficult",
    whenToUse: "When you want to clarify what makes something easy",
    examples: [
      { weak: "This is easy to use.", strong: "This is intuitive to use." },
      { weak: "It's an easy task.", strong: "It's a straightforward task." },
      { weak: "She made it look easy.", strong: "She made it look effortless." }
    ],
    synonyms: ["simple", "straightforward", "effortless", "manageable", "uncomplicated", "elementary"],
    exercise: "Describe what aspect makes something easy rather than just calling it easy."
  },
  {
    id: 23,
    word: "fast",
    commonAlternative: "rapid, swift, prompt, expeditious, brisk",
    definition: "Moving or capable of moving at high speed; quick",
    whenToUse: "When you want to specify the type or context of speed",
    examples: [
      { weak: "We need a fast response.", strong: "We need a prompt response." },
      { weak: "She's a fast learner.", strong: "She's a quick learner." },
      { weak: "This is fast service.", strong: "This is expeditious service." }
    ],
    synonyms: ["rapid", "swift", "prompt", "expeditious", "brisk", "speedy"],
    exercise: "Choose a word that better captures the specific type of quickness."
  },
  {
    id: 24,
    word: "slow",
    commonAlternative: "gradual, unhurried, deliberate, measured, leisurely",
    definition: "Moving or operating at a low speed; not quick",
    whenToUse: "When you want to describe the nature or cause of slowness",
    examples: [
      { weak: "This is a slow process.", strong: "This is a gradual process." },
      { weak: "He's a slow speaker.", strong: "He's a deliberate speaker." },
      { weak: "We took a slow approach.", strong: "We took a measured approach." }
    ],
    synonyms: ["gradual", "unhurried", "deliberate", "measured", "leisurely", "methodical"],
    exercise: "Specify whether slowness is intentional or problematic with your word choice."
  },
  {
    id: 25,
    word: "new",
    commonAlternative: "novel, innovative, fresh, original, contemporary",
    definition: "Not existing before; recently created or developed",
    whenToUse: "When you want to emphasize what aspect of newness is important",
    examples: [
      { weak: "That's a new idea.", strong: "That's a novel concept." },
      { weak: "We need new approaches.", strong: "We need innovative strategies." },
      { weak: "This is new thinking.", strong: "This is progressive thinking." }
    ],
    synonyms: ["novel", "innovative", "fresh", "original", "contemporary", "modern"],
    exercise: "Describe what makes something new - is it innovative, recent, or unused?"
  },
  {
    id: 26,
    word: "old",
    commonAlternative: "established, traditional, longstanding, enduring",
    definition: "Having lived for a long time; no longer young",
    whenToUse: "When you want to specify the positive or neutral aspects of age",
    examples: [
      { weak: "That's an old method.", strong: "That's a traditional approach." },
      { weak: "This is old wisdom.", strong: "This is timeless wisdom." },
      { weak: "It's an old company.", strong: "It's an established company." }
    ],
    synonyms: ["established", "traditional", "longstanding", "enduring", "time-honored", "classic"],
    exercise: "Choose words that convey age without negative connotations when appropriate."
  },
  {
    id: 27,
    word: "different",
    commonAlternative: "distinct, unique, diverse, varied, distinctive",
    definition: "Not the same as another; unlike in nature or quality",
    whenToUse: "When you want to specify how something differs",
    examples: [
      { weak: "This is different from that.", strong: "This is distinct from that." },
      { weak: "We need different perspectives.", strong: "We need diverse perspectives." },
      { weak: "She has a different style.", strong: "She has a distinctive style." }
    ],
    synonyms: ["distinct", "unique", "diverse", "varied", "distinctive", "dissimilar"],
    exercise: "Specify what type of difference you're describing."
  },
  {
    id: 28,
    word: "same",
    commonAlternative: "identical, equivalent, consistent, uniform, parallel",
    definition: "Identical; not different; unchanged",
    whenToUse: "When you want to specify the nature of similarity",
    examples: [
      { weak: "They have the same opinion.", strong: "They share an identical viewpoint." },
      { weak: "It's the same quality.", strong: "It's equivalent quality." },
      { weak: "We want the same results.", strong: "We want consistent results." }
    ],
    synonyms: ["identical", "equivalent", "consistent", "uniform", "parallel", "matching"],
    exercise: "Clarify whether things are exactly the same or similar in some aspect."
  },
  {
    id: 29,
    word: "feel",
    commonAlternative: "sense, perceive, experience, believe, consider",
    definition: "To experience a particular physical or emotional sensation",
    whenToUse: "When you want to be more specific about the type of feeling",
    examples: [
      { weak: "I feel this is right.", strong: "I believe this is correct." },
      { weak: "She feels strongly about it.", strong: "She's passionate about it." },
      { weak: "I feel tired.", strong: "I'm exhausted." }
    ],
    synonyms: ["sense", "perceive", "experience", "believe", "consider", "detect"],
    exercise: "Replace 'feel' with more specific verbs about sensation or opinion."
  },
  {
    id: 30,
    word: "think",
    commonAlternative: "believe, consider, conclude, reason, contemplate",
    definition: "To have a particular opinion, belief, or idea about something",
    whenToUse: "When you want to convey the process or certainty of your thinking",
    examples: [
      { weak: "I think this is important.", strong: "I believe this is crucial." },
      { weak: "Let me think about it.", strong: "Let me contemplate the matter." },
      { weak: "I think we should proceed.", strong: "I recommend we proceed." }
    ],
    synonyms: ["believe", "consider", "conclude", "reason", "contemplate", "surmise"],
    exercise: "Be more decisive or specific about your thought process."
  },
  {
    id: 31,
    word: "know",
    commonAlternative: "understand, comprehend, recognize, discern, realize",
    definition: "To be aware of through observation, inquiry, or information",
    whenToUse: "When you want to specify the type or depth of knowledge",
    examples: [
      { weak: "I know what you mean.", strong: "I comprehend your perspective." },
      { weak: "She knows the answer.", strong: "She understands the solution." },
      { weak: "We know the risks.", strong: "We recognize the risks." }
    ],
    synonyms: ["understand", "comprehend", "recognize", "discern", "realize", "grasp"],
    exercise: "Specify the depth or type of knowledge you're describing."
  },
  {
    id: 32,
    word: "need",
    commonAlternative: "require, necessitate, demand, call for, warrant",
    definition: "To require something because it is essential or very important",
    whenToUse: "When you want to emphasize the degree or reason for necessity",
    examples: [
      { weak: "We need better communication.", strong: "We require more effective communication." },
      { weak: "This needs attention.", strong: "This warrants immediate attention." },
      { weak: "You need to be clear.", strong: "Clarity is essential." }
    ],
    synonyms: ["require", "necessitate", "demand", "call for", "warrant", "mandate"],
    exercise: "Express necessity with words that convey urgency or importance."
  },
  {
    id: 33,
    word: "want",
    commonAlternative: "desire, prefer, seek, aspire, intend",
    definition: "To have a desire to possess or do something; wish for",
    whenToUse: "When you want to express your desires more formally or strongly",
    examples: [
      { weak: "I want to improve.", strong: "I aspire to improve." },
      { weak: "We want better results.", strong: "We seek superior outcomes." },
      { weak: "She wants to speak well.", strong: "She intends to communicate effectively." }
    ],
    synonyms: ["desire", "prefer", "seek", "aspire", "intend", "aim"],
    exercise: "Choose words that better express the strength or nature of your desire."
  },
  {
    id: 34,
    word: "try",
    commonAlternative: "attempt, endeavor, strive, undertake, pursue",
    definition: "To make an attempt or effort to do something",
    whenToUse: "When you want to convey the seriousness or commitment of the effort",
    examples: [
      { weak: "I'll try to be clearer.", strong: "I'll strive for greater clarity." },
      { weak: "Let's try this approach.", strong: "Let's undertake this strategy." },
      { weak: "She tried to explain.", strong: "She endeavored to elucidate." }
    ],
    synonyms: ["attempt", "endeavor", "strive", "undertake", "pursue", "seek"],
    exercise: "Replace 'try' with words that show more commitment or determination."
  },
  {
    id: 35,
    word: "do",
    commonAlternative: "execute, perform, accomplish, implement, conduct",
    definition: "To carry out an action; to perform or execute",
    whenToUse: "When you want to specify the nature of the action being performed",
    examples: [
      { weak: "Let's do this project.", strong: "Let's execute this initiative." },
      { weak: "She did well.", strong: "She performed admirably." },
      { weak: "We need to do something.", strong: "We need to take action." }
    ],
    synonyms: ["execute", "perform", "accomplish", "implement", "conduct", "carry out"],
    exercise: "Replace 'do' with verbs that specify the type of action."
  },
  {
    id: 36,
    word: "use",
    commonAlternative: "utilize, employ, apply, leverage, implement",
    definition: "To take, hold, or deploy something as a means of accomplishing a purpose",
    whenToUse: "When you want to sound more formal or emphasize strategic application",
    examples: [
      { weak: "Use these techniques.", strong: "Apply these methods." },
      { weak: "We should use this opportunity.", strong: "We should leverage this opportunity." },
      { weak: "She used her skills well.", strong: "She employed her abilities effectively." }
    ],
    synonyms: ["utilize", "employ", "apply", "leverage", "implement", "deploy"],
    exercise: "Choose words that better express how something is being used."
  },
  {
    id: 37,
    word: "show",
    commonAlternative: "demonstrate, illustrate, reveal, display, exhibit",
    definition: "To make visible or noticeable; to display",
    whenToUse: "When you want to specify the manner or purpose of showing",
    examples: [
      { weak: "This shows the problem.", strong: "This illustrates the issue." },
      { weak: "Let me show you.", strong: "Let me demonstrate." },
      { weak: "The data shows improvement.", strong: "The data reveals progress." }
    ],
    synonyms: ["demonstrate", "illustrate", "reveal", "display", "exhibit", "present"],
    exercise: "Specify whether you're demonstrating, revealing, or displaying something."
  },
  {
    id: 38,
    word: "tell",
    commonAlternative: "inform, explain, convey, articulate, communicate",
    definition: "To communicate information to someone in spoken or written words",
    whenToUse: "When you want to specify the nature of the communication",
    examples: [
      { weak: "Let me tell you about it.", strong: "Let me explain the situation." },
      { weak: "She told her opinion.", strong: "She articulated her viewpoint." },
      { weak: "I'll tell them the plan.", strong: "I'll communicate the strategy." }
    ],
    synonyms: ["inform", "explain", "convey", "articulate", "communicate", "relate"],
    exercise: "Choose words that better describe the type of telling you're doing."
  },
  {
    id: 39,
    word: "seem",
    commonAlternative: "appear, suggest, indicate, imply, convey",
    definition: "To give the impression of being something or having a quality",
    whenToUse: "When you want to be more assertive about your observations",
    examples: [
      { weak: "It seems like a good idea.", strong: "It appears to be sound reasoning." },
      { weak: "She seems confident.", strong: "She projects confidence." },
      { weak: "This seems important.", strong: "This indicates significance." }
    ],
    synonyms: ["appear", "suggest", "indicate", "imply", "convey", "project"],
    exercise: "Replace tentative 'seems' with more confident observation verbs."
  },
  {
    id: 40,
    word: "look",
    commonAlternative: "appear, examine, observe, consider, review",
    definition: "To direct one's gaze in a specified direction; to have the appearance of",
    whenToUse: "When you want to specify the type of looking or appearance",
    examples: [
      { weak: "Look at this data.", strong: "Examine these findings." },
      { weak: "It looks good.", strong: "It appears promising." },
      { weak: "Let's look at the options.", strong: "Let's review the alternatives." }
    ],
    synonyms: ["appear", "examine", "observe", "consider", "review", "scrutinize"],
    exercise: "Specify whether you mean physical looking or evaluating something."
  },
  {
    id: 41,
    word: "help",
    commonAlternative: "assist, facilitate, support, aid, enable",
    definition: "To make it easier for someone to do something; to provide assistance",
    whenToUse: "When you want to specify the type of help being provided",
    examples: [
      { weak: "This will help you speak better.", strong: "This will enhance your speaking ability." },
      { weak: "Can you help me?", strong: "Could you assist me?" },
      { weak: "It helps to practice.", strong: "Practice facilitates improvement." }
    ],
    synonyms: ["assist", "facilitate", "support", "aid", "enable", "benefit"],
    exercise: "Choose words that specify how something helps."
  },
  {
    id: 42,
    word: "work",
    commonAlternative: "function, operate, succeed, prove effective",
    definition: "To be effective; to have the desired result",
    whenToUse: "When you want to be more specific about functionality or success",
    examples: [
      { weak: "This method works.", strong: "This approach proves effective." },
      { weak: "The plan worked.", strong: "The strategy succeeded." },
      { weak: "It doesn't work.", strong: "It fails to function properly." }
    ],
    synonyms: ["function", "operate", "succeed", "prove effective", "perform", "deliver results"],
    exercise: "Replace 'work' with words that specify success or functionality."
  },
  {
    id: 43,
    word: "find",
    commonAlternative: "discover, locate, identify, uncover, determine",
    definition: "To discover or perceive by chance or intentionally",
    whenToUse: "When you want to emphasize the process or significance of discovery",
    examples: [
      { weak: "I found a solution.", strong: "I discovered an innovative solution." },
      { weak: "We need to find answers.", strong: "We need to identify solutions." },
      { weak: "She found the error.", strong: "She detected the discrepancy." }
    ],
    synonyms: ["discover", "locate", "identify", "uncover", "determine", "detect"],
    exercise: "Specify whether you're discovering, locating, or identifying something."
  },
  {
    id: 44,
    word: "give",
    commonAlternative: "provide, offer, present, deliver, contribute",
    definition: "To freely transfer the possession of something to someone",
    whenToUse: "When you want to specify the nature or manner of giving",
    examples: [
      { weak: "Give me your opinion.", strong: "Share your perspective." },
      { weak: "This gives results.", strong: "This yields outcomes." },
      { weak: "He gave a speech.", strong: "He delivered an address." }
    ],
    synonyms: ["provide", "offer", "present", "deliver", "contribute", "supply"],
    exercise: "Choose words that better describe the type of giving or providing."
  },
  {
    id: 45,
    word: "take",
    commonAlternative: "seize, adopt, assume, undertake, embrace",
    definition: "To lay hold of something; to remove or use",
    whenToUse: "When you want to specify the type of taking or adoption",
    examples: [
      { weak: "Take this approach.", strong: "Adopt this methodology." },
      { weak: "He took the lead.", strong: "He assumed leadership." },
      { weak: "Let's take action.", strong: "Let's undertake decisive measures." }
    ],
    synonyms: ["seize", "adopt", "assume", "undertake", "embrace", "capture"],
    exercise: "Replace 'take' with more specific verbs about action or adoption."
  },
  {
    id: 46,
    word: "go",
    commonAlternative: "proceed, advance, progress, move, transition",
    definition: "To move from one place to another; to travel",
    whenToUse: "When you want to sound more formal or specific about movement",
    examples: [
      { weak: "Let's go forward.", strong: "Let's proceed with the plan." },
      { weak: "Things are going well.", strong: "Matters are progressing smoothly." },
      { weak: "We should go ahead.", strong: "We should advance the initiative." }
    ],
    synonyms: ["proceed", "advance", "progress", "move", "transition", "continue"],
    exercise: "Choose words that better specify direction or progress."
  },
  {
    id: 47,
    word: "come",
    commonAlternative: "arrive, emerge, materialize, approach, develop",
    definition: "To move or travel toward or into a place",
    whenToUse: "When you want to be more specific about arrival or emergence",
    examples: [
      { weak: "A solution will come.", strong: "A solution will emerge." },
      { weak: "Let's come to an agreement.", strong: "Let's reach a consensus." },
      { weak: "Ideas come naturally.", strong: "Ideas develop organically." }
    ],
    synonyms: ["arrive", "emerge", "materialize", "approach", "develop", "appear"],
    exercise: "Specify whether something is arriving, emerging, or developing."
  },
  {
    id: 48,
    word: "put",
    commonAlternative: "place, position, situate, insert, establish",
    definition: "To move to or place in a particular position",
    whenToUse: "When you want to be more precise about placement or positioning",
    examples: [
      { weak: "Put this in context.", strong: "Place this in perspective." },
      { weak: "Let's put it another way.", strong: "Let's phrase it differently." },
      { weak: "She put forth an idea.", strong: "She proposed a concept." }
    ],
    synonyms: ["place", "position", "situate", "insert", "establish", "set"],
    exercise: "Replace 'put' with more specific placement verbs."
  },
  {
    id: 49,
    word: "keep",
    commonAlternative: "maintain, preserve, retain, sustain, continue",
    definition: "To have or retain possession of; to continue to have",
    whenToUse: "When you want to emphasize preservation or continuation",
    examples: [
      { weak: "Keep practicing.", strong: "Maintain consistent practice." },
      { weak: "Keep this in mind.", strong: "Retain this perspective." },
      { weak: "Let's keep going.", strong: "Let's continue progressing." }
    ],
    synonyms: ["maintain", "preserve", "retain", "sustain", "continue", "uphold"],
    exercise: "Specify whether you're maintaining, preserving, or continuing something."
  },
  {
    id: 50,
    word: "start",
    commonAlternative: "begin, initiate, commence, launch, embark",
    definition: "To begin or cause something to begin",
    whenToUse: "When you want to sound more formal or emphasize the beginning",
    examples: [
      { weak: "Let's start the project.", strong: "Let's initiate the endeavor." },
      { weak: "I'll start tomorrow.", strong: "I'll commence tomorrow." },
      { weak: "Start with the basics.", strong: "Begin with fundamental principles." }
    ],
    synonyms: ["begin", "initiate", "commence", "launch", "embark", "inaugurate"],
    exercise: "Choose words that better express the formality or significance of beginning."
  },
  {
    id: 51,
    word: "end",
    commonAlternative: "conclude, complete, finish, terminate, finalize",
    definition: "To come or bring to a final point; to finish",
    whenToUse: "When you want to specify the nature or manner of ending",
    examples: [
      { weak: "Let's end here.", strong: "Let's conclude our discussion." },
      { weak: "The meeting ended.", strong: "The session adjourned." },
      { weak: "End your speech strongly.", strong: "Conclude your address powerfully." }
    ],
    synonyms: ["conclude", "complete", "finish", "terminate", "finalize", "close"],
    exercise: "Specify whether something is concluding, completing, or terminating."
  },
  {
    id: 52,
    word: "turn",
    commonAlternative: "transform, convert, transition, evolve, shift",
    definition: "To move in a circular direction; to change in nature or form",
    whenToUse: "When you want to emphasize transformation or change",
    examples: [
      { weak: "This can turn things around.", strong: "This can transform the situation." },
      { weak: "Turn your attention to this.", strong: "Direct your focus to this." },
      { weak: "Ideas turned into action.", strong: "Concepts evolved into initiatives." }
    ],
    synonyms: ["transform", "convert", "transition", "evolve", "shift", "change"],
    exercise: "Choose words that better describe the type of turning or change."
  },
  {
    id: 53,
    word: "change",
    commonAlternative: "modify, alter, transform, revise, adapt",
    definition: "To make or become different; to transform",
    whenToUse: "When you want to specify the type or extent of change",
    examples: [
      { weak: "We need to change our approach.", strong: "We need to revise our strategy." },
      { weak: "This changed everything.", strong: "This transformed the entire paradigm." },
      { weak: "Change your words.", strong: "Refine your language." }
    ],
    synonyms: ["modify", "alter", "transform", "revise", "adapt", "adjust"],
    exercise: "Specify whether you're modifying, transforming, or adapting something."
  },
  {
    id: 54,
    word: "move",
    commonAlternative: "progress, advance, transition, shift, proceed",
    definition: "To go in a specified direction or manner; to change position",
    whenToUse: "When you want to emphasize progress or transition",
    examples: [
      { weak: "Let's move forward.", strong: "Let's advance the initiative." },
      { weak: "Move to the next topic.", strong: "Transition to the subsequent point." },
      { weak: "Things are moving fast.", strong: "Developments are accelerating." }
    ],
    synonyms: ["progress", "advance", "transition", "shift", "proceed", "evolve"],
    exercise: "Specify the direction or nature of movement with more precise words."
  },
  {
    id: 55,
    word: "play",
    commonAlternative: "perform, execute, enact, fulfill, serve",
    definition: "To engage in activity for enjoyment; to perform a role",
    whenToUse: "When you want to emphasize role, function, or performance",
    examples: [
      { weak: "This plays an important role.", strong: "This serves a crucial function." },
      { weak: "Play your part well.", strong: "Fulfill your role effectively." },
      { weak: "Let's play it safe.", strong: "Let's adopt a cautious approach." }
    ],
    synonyms: ["perform", "execute", "enact", "fulfill", "serve", "function"],
    exercise: "Replace 'play' with words that better describe roles or functions."
  },
  {
    id: 56,
    word: "live",
    commonAlternative: "experience, practice, embody, demonstrate, exemplify",
    definition: "To remain alive; to have an exciting or fulfilling life",
    whenToUse: "When you want to emphasize active engagement or embodiment",
    examples: [
      { weak: "Live your values.", strong: "Embody your principles." },
      { weak: "Live the experience.", strong: "Embrace the opportunity fully." },
      { weak: "She lives what she teaches.", strong: "She exemplifies her teachings." }
    ],
    synonyms: ["experience", "practice", "embody", "demonstrate", "exemplify", "manifest"],
    exercise: "Choose words that better express active engagement or embodiment."
  },
  {
    id: 57,
    word: "believe",
    commonAlternative: "maintain, contend, assert, hold, advocate",
    definition: "To accept something as true; to have faith in",
    whenToUse: "When you want to express conviction more strongly or formally",
    examples: [
      { weak: "I believe this is important.", strong: "I maintain this is essential." },
      { weak: "We believe in this approach.", strong: "We advocate for this methodology." },
      { weak: "Many believe that...", strong: "Many contend that..." }
    ],
    synonyms: ["maintain", "contend", "assert", "hold", "advocate", "posit"],
    exercise: "Express beliefs with more conviction using stronger verbs."
  },
  {
    id: 58,
    word: "bring",
    commonAlternative: "introduce, present, contribute, deliver, provide",
    definition: "To take or go with someone or something to a place",
    whenToUse: "When you want to specify what is being brought or contributed",
    examples: [
      { weak: "Bring your ideas.", strong: "Contribute your insights." },
      { weak: "This brings clarity.", strong: "This introduces clarity." },
      { weak: "Bring your best effort.", strong: "Deliver your optimal performance." }
    ],
    synonyms: ["introduce", "present", "contribute", "deliver", "provide", "offer"],
    exercise: "Specify what type of bringing or contributing you mean."
  },
  {
    id: 59,
    word: "happen",
    commonAlternative: "occur, transpire, materialize, develop, emerge",
    definition: "To take place; to occur by chance",
    whenToUse: "When you want to sound more formal or specific about events",
    examples: [
      { weak: "This will happen soon.", strong: "This will transpire shortly." },
      { weak: "Change happens gradually.", strong: "Transformation develops incrementally." },
      { weak: "Let's make it happen.", strong: "Let's bring it to fruition." }
    ],
    synonyms: ["occur", "transpire", "materialize", "develop", "emerge", "unfold"],
    exercise: "Replace 'happen' with more sophisticated verbs about events."
  },
  {
    id: 60,
    word: "mean",
    commonAlternative: "signify, indicate, imply, denote, suggest",
    definition: "To intend to convey or refer to; to have as a consequence",
    whenToUse: "When you want to be more precise about significance or intention",
    examples: [
      { weak: "This means we're making progress.", strong: "This indicates we're advancing." },
      { weak: "What do you mean?", strong: "What are you implying?" },
      { weak: "This means a lot.", strong: "This holds great significance." }
    ],
    synonyms: ["signify", "indicate", "imply", "denote", "suggest", "represent"],
    exercise: "Choose words that better express meaning, significance, or intention."
  }
];

/**
 * Get today's word based on the current date
 * Words rotate through the database cyclically
 * @returns {Object} Today's word object
 */
function getTodaysWord() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % dailyWordsDatabase.length;
  return dailyWordsDatabase[index];
}

/**
 * Get a word by ID
 * @param {number} wordId - The word ID
 * @returns {Object|null} The word object or null
 */
function getDailyWordById(wordId) {
  return dailyWordsDatabase.find(word => word.id === wordId) || null;
}

// Log that daily words database is loaded
console.log(`Daily words database loaded: ${dailyWordsDatabase.length} words total`);
