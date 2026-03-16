// ============================================
// VOCABULARY DATABASE
// Contains 100 curated words for improving articulation
// ============================================

/**
 * Vocabulary Database
 * Organized by difficulty: beginner, intermediate, advanced
 * Total: 100 words
 */
const vocabularyDatabase = {
  beginner: [
    {
      id: 1,
      word: "articulate",
      pronunciation: "ar-TIK-yuh-layt",
      definition: "Expressing oneself clearly and effectively in speech",
      partOfSpeech: "adjective/verb",
      exampleSentence: "She is very articulate when explaining complex topics to beginners.",
      synonyms: ["eloquent", "fluent", "expressive", "clear"],
      difficulty: "beginner",
      category: "communication"
    },
    {
      id: 2,
      word: "convey",
      pronunciation: "kuhn-VAY",
      definition: "To communicate or make known; to express a thought or feeling",
      partOfSpeech: "verb",
      exampleSentence: "He struggled to convey his emotions during the difficult conversation.",
      synonyms: ["communicate", "express", "transmit", "relay"],
      difficulty: "beginner",
      category: "communication"
    },
    {
      id: 3,
      word: "emphasize",
      pronunciation: "EM-fuh-size",
      definition: "To give special importance or prominence to something in speaking",
      partOfSpeech: "verb",
      exampleSentence: "The teacher emphasized the key points by speaking slowly and clearly.",
      synonyms: ["stress", "highlight", "underscore", "accentuate"],
      difficulty: "beginner",
      category: "communication"
    },
    {
      id: 4,
      word: "vivid",
      pronunciation: "VIV-id",
      definition: "Producing powerful feelings or strong, clear images in the mind",
      partOfSpeech: "adjective",
      exampleSentence: "She used vivid descriptions to bring the story to life.",
      synonyms: ["bright", "intense", "striking", "graphic"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 5,
      word: "distinct",
      pronunciation: "dis-TINKT",
      definition: "Recognizably different; clearly separate and different",
      partOfSpeech: "adjective",
      exampleSentence: "There is a distinct difference between these two approaches.",
      synonyms: ["clear", "definite", "unmistakable", "noticeable"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 6,
      word: "clarify",
      pronunciation: "KLAIR-uh-fy",
      definition: "To make a statement or situation less confused and more comprehensible",
      partOfSpeech: "verb",
      exampleSentence: "Let me clarify what I meant by that comment.",
      synonyms: ["explain", "elucidate", "illuminate", "clear up"],
      difficulty: "beginner",
      category: "communication"
    },
    {
      id: 7,
      word: "subtle",
      pronunciation: "SUH-tul",
      definition: "So delicate or precise as to be difficult to analyze or describe",
      partOfSpeech: "adjective",
      exampleSentence: "There was a subtle hint of sarcasm in his tone.",
      synonyms: ["delicate", "understated", "nuanced", "refined"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 8,
      word: "evident",
      pronunciation: "EV-i-dent",
      definition: "Plain or obvious; clearly seen or understood",
      partOfSpeech: "adjective",
      exampleSentence: "It was evident from her expression that she disagreed.",
      synonyms: ["obvious", "apparent", "clear", "manifest"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 9,
      word: "analyze",
      pronunciation: "AN-uh-lize",
      definition: "To examine something in detail to understand it better",
      partOfSpeech: "verb",
      exampleSentence: "We need to analyze the results before making a decision.",
      synonyms: ["examine", "study", "investigate", "evaluate"],
      difficulty: "beginner",
      category: "thinking"
    },
    {
      id: 10,
      word: "consider",
      pronunciation: "kuhn-SID-er",
      definition: "To think carefully about something, typically before making a decision",
      partOfSpeech: "verb",
      exampleSentence: "Please consider all the options before responding.",
      synonyms: ["contemplate", "ponder", "deliberate", "reflect"],
      difficulty: "beginner",
      category: "thinking"
    },
    {
      id: 11,
      word: "demonstrate",
      pronunciation: "DEM-uhn-strayt",
      definition: "To clearly show the existence or truth of something by giving proof",
      partOfSpeech: "verb",
      exampleSentence: "She demonstrated her expertise through excellent presentation skills.",
      synonyms: ["show", "prove", "illustrate", "exhibit"],
      difficulty: "beginner",
      category: "action"
    },
    {
      id: 12,
      word: "accomplish",
      pronunciation: "uh-KOM-plish",
      definition: "To successfully complete or achieve something",
      partOfSpeech: "verb",
      exampleSentence: "We accomplished all our goals for this quarter.",
      synonyms: ["achieve", "complete", "fulfill", "attain"],
      difficulty: "beginner",
      category: "action"
    },
    {
      id: 13,
      word: "enthusiastic",
      pronunciation: "en-thoo-zee-AS-tik",
      definition: "Having or showing intense and eager enjoyment or interest",
      partOfSpeech: "adjective",
      exampleSentence: "The team was enthusiastic about the new project.",
      synonyms: ["eager", "passionate", "excited", "ardent"],
      difficulty: "beginner",
      category: "emotion"
    },
    {
      id: 14,
      word: "content",
      pronunciation: "kuhn-TENT",
      definition: "In a state of peaceful happiness and satisfaction",
      partOfSpeech: "adjective",
      exampleSentence: "She felt content with her decision to change careers.",
      synonyms: ["satisfied", "pleased", "happy", "fulfilled"],
      difficulty: "beginner",
      category: "emotion"
    },
    {
      id: 15,
      word: "reflect",
      pronunciation: "ri-FLEKT",
      definition: "To think deeply or carefully about something",
      partOfSpeech: "verb",
      exampleSentence: "Take time to reflect on your experiences before moving forward.",
      synonyms: ["contemplate", "ponder", "consider", "meditate"],
      difficulty: "beginner",
      category: "thinking"
    },
    {
      id: 16,
      word: "establish",
      pronunciation: "ih-STAB-lish",
      definition: "To set up or create something on a firm or permanent basis",
      partOfSpeech: "verb",
      exampleSentence: "They established a new protocol for customer service.",
      synonyms: ["create", "found", "institute", "form"],
      difficulty: "beginner",
      category: "action"
    },
    {
      id: 17,
      word: "maintain",
      pronunciation: "mayn-TAYN",
      definition: "To cause or enable something to continue in the same state",
      partOfSpeech: "verb",
      exampleSentence: "It's important to maintain clear communication with your team.",
      synonyms: ["preserve", "sustain", "continue", "uphold"],
      difficulty: "beginner",
      category: "action"
    },
    {
      id: 18,
      word: "apparent",
      pronunciation: "uh-PAIR-uhnt",
      definition: "Clearly visible or understood; obvious",
      partOfSpeech: "adjective",
      exampleSentence: "It became apparent that we needed a different approach.",
      synonyms: ["evident", "obvious", "clear", "plain"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 19,
      word: "evaluate",
      pronunciation: "ih-VAL-yoo-ayt",
      definition: "To form an idea of the amount, number, or value of; to assess",
      partOfSpeech: "verb",
      exampleSentence: "We need to evaluate the effectiveness of this strategy.",
      synonyms: ["assess", "appraise", "judge", "analyze"],
      difficulty: "beginner",
      category: "thinking"
    },
    {
      id: 20,
      word: "discern",
      pronunciation: "dih-SURN",
      definition: "To perceive or recognize something with difficulty by sight or with the mind",
      partOfSpeech: "verb",
      exampleSentence: "It was difficult to discern his true intentions from his words.",
      synonyms: ["detect", "perceive", "distinguish", "recognize"],
      difficulty: "beginner",
      category: "thinking"
    },
    {
      id: 21,
      word: "precise",
      pronunciation: "pri-SISE",
      definition: "Marked by exactness and accuracy of expression or detail",
      partOfSpeech: "adjective",
      exampleSentence: "Please be more precise in your descriptions.",
      synonyms: ["exact", "accurate", "specific", "detailed"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 22,
      word: "coherent",
      pronunciation: "koh-HEER-uhnt",
      definition: "Logical and consistent; forming a unified whole",
      partOfSpeech: "adjective",
      exampleSentence: "She presented a coherent argument that convinced everyone.",
      synonyms: ["logical", "consistent", "rational", "clear"],
      difficulty: "beginner",
      category: "communication"
    },
    {
      id: 23,
      word: "concise",
      pronunciation: "kuhn-SISE",
      definition: "Giving a lot of information clearly and in few words; brief but comprehensive",
      partOfSpeech: "adjective",
      exampleSentence: "His explanation was concise yet thorough.",
      synonyms: ["brief", "succinct", "terse", "compact"],
      difficulty: "beginner",
      category: "communication"
    },
    {
      id: 24,
      word: "relevant",
      pronunciation: "REL-uh-vuhnt",
      definition: "Closely connected or appropriate to what is being done or considered",
      partOfSpeech: "adjective",
      exampleSentence: "Please only include relevant information in your report.",
      synonyms: ["pertinent", "applicable", "appropriate", "related"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 25,
      word: "significant",
      pronunciation: "sig-NIF-i-kuhnt",
      definition: "Sufficiently great or important to be worthy of attention; noteworthy",
      partOfSpeech: "adjective",
      exampleSentence: "This represents a significant improvement over the previous version.",
      synonyms: ["important", "meaningful", "substantial", "considerable"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 26,
      word: "facilitate",
      pronunciation: "fuh-SIL-i-tayt",
      definition: "To make an action or process easy or easier",
      partOfSpeech: "verb",
      exampleSentence: "Good communication skills facilitate better teamwork.",
      synonyms: ["enable", "assist", "ease", "expedite"],
      difficulty: "beginner",
      category: "action"
    },
    {
      id: 27,
      word: "enhance",
      pronunciation: "en-HANS",
      definition: "To intensify, increase, or further improve the quality or value of something",
      partOfSpeech: "verb",
      exampleSentence: "These exercises will enhance your speaking abilities.",
      synonyms: ["improve", "augment", "boost", "strengthen"],
      difficulty: "beginner",
      category: "action"
    },
    {
      id: 28,
      word: "perspective",
      pronunciation: "per-SPEK-tiv",
      definition: "A particular attitude toward or way of regarding something; a point of view",
      partOfSpeech: "noun",
      exampleSentence: "It's important to consider multiple perspectives before deciding.",
      synonyms: ["viewpoint", "outlook", "standpoint", "angle"],
      difficulty: "beginner",
      category: "thinking"
    },
    {
      id: 29,
      word: "comprehensive",
      pronunciation: "kom-pri-HEN-siv",
      definition: "Complete; including all or nearly all elements or aspects of something",
      partOfSpeech: "adjective",
      exampleSentence: "She gave a comprehensive overview of the project.",
      synonyms: ["complete", "thorough", "extensive", "full"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 30,
      word: "substantial",
      pronunciation: "suhb-STAN-shuhl",
      definition: "Of considerable importance, size, or worth",
      partOfSpeech: "adjective",
      exampleSentence: "There has been substantial progress in this area.",
      synonyms: ["considerable", "significant", "sizeable", "important"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 31,
      word: "articulation",
      pronunciation: "ar-tik-yuh-LAY-shuhn",
      definition: "The act of expressing or stating something clearly in words",
      partOfSpeech: "noun",
      exampleSentence: "His articulation of complex ideas made them accessible to everyone.",
      synonyms: ["expression", "enunciation", "verbalization", "utterance"],
      difficulty: "beginner",
      category: "communication"
    },
    {
      id: 32,
      word: "deliberate",
      pronunciation: "dih-LIB-er-it",
      definition: "Done consciously and intentionally; careful and unhurried",
      partOfSpeech: "adjective",
      exampleSentence: "She spoke in a deliberate manner to ensure everyone understood.",
      synonyms: ["intentional", "calculated", "purposeful", "conscious"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 33,
      word: "effective",
      pronunciation: "ih-FEK-tiv",
      definition: "Successful in producing a desired or intended result",
      partOfSpeech: "adjective",
      exampleSentence: "Clear communication is the most effective way to avoid misunderstandings.",
      synonyms: ["efficient", "successful", "productive", "powerful"],
      difficulty: "beginner",
      category: "descriptive"
    },
    {
      id: 34,
      word: "insight",
      pronunciation: "IN-site",
      definition: "The capacity to gain an accurate and deep understanding of something",
      partOfSpeech: "noun",
      exampleSentence: "Her insights into human behavior are remarkable.",
      synonyms: ["understanding", "perception", "awareness", "wisdom"],
      difficulty: "beginner",
      category: "thinking"
    },
    {
      id: 35,
      word: "profound",
      pronunciation: "pruh-FOUND",
      definition: "Very great or intense; having deep meaning or significance",
      partOfSpeech: "adjective",
      exampleSentence: "The speaker's words had a profound impact on the audience.",
      synonyms: ["deep", "intense", "meaningful", "significant"],
      difficulty: "beginner",
      category: "descriptive"
    }
  ],

  intermediate: [
    {
      id: 36,
      word: "eloquent",
      pronunciation: "EL-uh-kwuhnt",
      definition: "Fluent or persuasive in speaking or writing; clearly expressing or indicating something",
      partOfSpeech: "adjective",
      exampleSentence: "Her eloquent speech moved the entire audience to tears.",
      synonyms: ["articulate", "expressive", "fluent", "persuasive"],
      difficulty: "intermediate",
      category: "communication"
    },
    {
      id: 37,
      word: "nuanced",
      pronunciation: "NOO-ahnst",
      definition: "Characterized by subtle shades of meaning or expression",
      partOfSpeech: "adjective",
      exampleSentence: "His nuanced understanding of the issue impressed everyone.",
      synonyms: ["subtle", "refined", "delicate", "sophisticated"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 38,
      word: "compelling",
      pronunciation: "kuhm-PEL-ing",
      definition: "Evoking interest, attention, or admiration in a powerfully irresistible way",
      partOfSpeech: "adjective",
      exampleSentence: "She presented a compelling argument for the new policy.",
      synonyms: ["convincing", "persuasive", "captivating", "forceful"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 39,
      word: "meticulous",
      pronunciation: "mih-TIK-yuh-luhs",
      definition: "Showing great attention to detail; very careful and precise",
      partOfSpeech: "adjective",
      exampleSentence: "He was meticulous in his preparation for the presentation.",
      synonyms: ["careful", "thorough", "precise", "scrupulous"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 40,
      word: "articulate",
      pronunciation: "ar-TIK-yuh-layt",
      definition: "Having or showing the ability to speak fluently and coherently",
      partOfSpeech: "adjective",
      exampleSentence: "She's remarkably articulate for someone so young.",
      synonyms: ["eloquent", "fluent", "coherent", "expressive"],
      difficulty: "intermediate",
      category: "communication"
    },
    {
      id: 41,
      word: "synthesize",
      pronunciation: "SIN-thuh-size",
      definition: "To combine different ideas, influences, or objects into a coherent whole",
      partOfSpeech: "verb",
      exampleSentence: "She was able to synthesize information from multiple sources.",
      synonyms: ["combine", "integrate", "merge", "amalgamate"],
      difficulty: "intermediate",
      category: "thinking"
    },
    {
      id: 42,
      word: "contextualize",
      pronunciation: "kon-TEKS-choo-uh-lize",
      definition: "To place or study something in its context or historical setting",
      partOfSpeech: "verb",
      exampleSentence: "It's important to contextualize these statistics within broader trends.",
      synonyms: ["frame", "situate", "position", "place"],
      difficulty: "intermediate",
      category: "thinking"
    },
    {
      id: 43,
      word: "extrapolate",
      pronunciation: "ik-STRAP-uh-layt",
      definition: "To extend the application of something to an unknown situation by assuming existing trends will continue",
      partOfSpeech: "verb",
      exampleSentence: "We can extrapolate from these results to predict future outcomes.",
      synonyms: ["infer", "deduce", "project", "conclude"],
      difficulty: "intermediate",
      category: "thinking"
    },
    {
      id: 44,
      word: "ambiguous",
      pronunciation: "am-BIG-yoo-uhs",
      definition: "Open to more than one interpretation; not having one obvious meaning",
      partOfSpeech: "adjective",
      exampleSentence: "His ambiguous response left us uncertain about his intentions.",
      synonyms: ["unclear", "vague", "equivocal", "cryptic"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 45,
      word: "inherent",
      pronunciation: "in-HEER-uhnt",
      definition: "Existing as an essential constituent or characteristic; intrinsic",
      partOfSpeech: "adjective",
      exampleSentence: "There are inherent risks in any new venture.",
      synonyms: ["intrinsic", "innate", "built-in", "natural"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 46,
      word: "paradigm",
      pronunciation: "PAIR-uh-dime",
      definition: "A typical example or pattern of something; a model",
      partOfSpeech: "noun",
      exampleSentence: "This discovery represents a paradigm shift in our thinking.",
      synonyms: ["model", "pattern", "framework", "archetype"],
      difficulty: "intermediate",
      category: "thinking"
    },
    {
      id: 47,
      word: "juxtapose",
      pronunciation: "JUHK-stuh-pohz",
      definition: "To place or deal with things close together for contrasting effect",
      partOfSpeech: "verb",
      exampleSentence: "The author juxtaposes modern life with traditional values.",
      synonyms: ["contrast", "compare", "oppose", "differentiate"],
      difficulty: "intermediate",
      category: "action"
    },
    {
      id: 48,
      word: "articulate",
      pronunciation: "ar-TIK-yuh-lit",
      definition: "Expressing or stating something clearly and precisely",
      partOfSpeech: "verb",
      exampleSentence: "He articulated his concerns in a respectful manner.",
      synonyms: ["express", "verbalize", "communicate", "state"],
      difficulty: "intermediate",
      category: "communication"
    },
    {
      id: 49,
      word: "resonant",
      pronunciation: "REZ-uh-nuhnt",
      definition: "Having the ability to evoke images, memories, and emotions; meaningful",
      partOfSpeech: "adjective",
      exampleSentence: "Her words were deeply resonant with the audience's experiences.",
      synonyms: ["meaningful", "significant", "evocative", "powerful"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 50,
      word: "substantiate",
      pronunciation: "suhb-STAN-shee-ayt",
      definition: "To provide evidence to support or prove the truth of something",
      partOfSpeech: "verb",
      exampleSentence: "Can you substantiate your claims with concrete examples?",
      synonyms: ["verify", "prove", "validate", "confirm"],
      difficulty: "intermediate",
      category: "action"
    },
    {
      id: 51,
      word: "elucidate",
      pronunciation: "ih-LOO-si-dayt",
      definition: "To make something clear; to explain",
      partOfSpeech: "verb",
      exampleSentence: "Could you elucidate your position on this matter?",
      synonyms: ["clarify", "explain", "illuminate", "explicate"],
      difficulty: "intermediate",
      category: "communication"
    },
    {
      id: 52,
      word: "pragmatic",
      pronunciation: "prag-MAT-ik",
      definition: "Dealing with things sensibly and realistically in a practical way",
      partOfSpeech: "adjective",
      exampleSentence: "We need a pragmatic approach to solving this problem.",
      synonyms: ["practical", "realistic", "sensible", "down-to-earth"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 53,
      word: "discrepancy",
      pronunciation: "dis-KREP-uhn-see",
      definition: "A lack of compatibility or similarity between two or more facts",
      partOfSpeech: "noun",
      exampleSentence: "There's a significant discrepancy between the two accounts.",
      synonyms: ["difference", "inconsistency", "disparity", "variation"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 54,
      word: "candid",
      pronunciation: "KAN-did",
      definition: "Truthful and straightforward; frank",
      partOfSpeech: "adjective",
      exampleSentence: "I appreciate your candid feedback on my performance.",
      synonyms: ["frank", "honest", "direct", "straightforward"],
      difficulty: "intermediate",
      category: "communication"
    },
    {
      id: 55,
      word: "perceptive",
      pronunciation: "per-SEP-tiv",
      definition: "Having or showing sensitive insight and understanding",
      partOfSpeech: "adjective",
      exampleSentence: "She made several perceptive observations about the situation.",
      synonyms: ["insightful", "astute", "discerning", "observant"],
      difficulty: "intermediate",
      category: "thinking"
    },
    {
      id: 56,
      word: "tactful",
      pronunciation: "TAKT-fuhl",
      definition: "Having or showing skill in dealing with difficult or delicate situations",
      partOfSpeech: "adjective",
      exampleSentence: "He handled the criticism in a tactful manner.",
      synonyms: ["diplomatic", "discreet", "sensitive", "considerate"],
      difficulty: "intermediate",
      category: "communication"
    },
    {
      id: 57,
      word: "cogent",
      pronunciation: "KOH-juhnt",
      definition: "Clear, logical, and convincing",
      partOfSpeech: "adjective",
      exampleSentence: "She presented a cogent argument that swayed the committee.",
      synonyms: ["convincing", "compelling", "persuasive", "effective"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 58,
      word: "arduous",
      pronunciation: "AR-joo-uhs",
      definition: "Involving or requiring strenuous effort; difficult and tiring",
      partOfSpeech: "adjective",
      exampleSentence: "Mastering articulation is an arduous but rewarding process.",
      synonyms: ["difficult", "challenging", "demanding", "strenuous"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 59,
      word: "exemplify",
      pronunciation: "ig-ZEM-pluh-fy",
      definition: "To be a typical example of something; to illustrate by example",
      partOfSpeech: "verb",
      exampleSentence: "Her behavior exemplifies the values we promote.",
      synonyms: ["illustrate", "demonstrate", "represent", "embody"],
      difficulty: "intermediate",
      category: "action"
    },
    {
      id: 60,
      word: "scrutinize",
      pronunciation: "SKROOT-n-ize",
      definition: "To examine or inspect closely and thoroughly",
      partOfSpeech: "verb",
      exampleSentence: "We need to scrutinize the details before making a final decision.",
      synonyms: ["examine", "inspect", "analyze", "investigate"],
      difficulty: "intermediate",
      category: "action"
    },
    {
      id: 61,
      word: "ponder",
      pronunciation: "PON-der",
      definition: "To think about something carefully, especially before making a decision",
      partOfSpeech: "verb",
      exampleSentence: "Take time to ponder the implications of your words.",
      synonyms: ["consider", "contemplate", "reflect", "deliberate"],
      difficulty: "intermediate",
      category: "thinking"
    },
    {
      id: 62,
      word: "ascertain",
      pronunciation: "as-er-TAYN",
      definition: "To find out definitely; to make certain of",
      partOfSpeech: "verb",
      exampleSentence: "We need to ascertain the facts before proceeding.",
      synonyms: ["determine", "discover", "establish", "verify"],
      difficulty: "intermediate",
      category: "action"
    },
    {
      id: 63,
      word: "propensity",
      pronunciation: "pruh-PEN-si-tee",
      definition: "An inclination or natural tendency to behave in a particular way",
      partOfSpeech: "noun",
      exampleSentence: "She has a propensity for speaking without thinking first.",
      synonyms: ["tendency", "inclination", "predisposition", "proclivity"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 64,
      word: "corroborate",
      pronunciation: "kuh-ROB-uh-rayt",
      definition: "To confirm or give support to a statement, theory, or finding",
      partOfSpeech: "verb",
      exampleSentence: "Can anyone corroborate your version of events?",
      synonyms: ["confirm", "verify", "substantiate", "validate"],
      difficulty: "intermediate",
      category: "action"
    },
    {
      id: 65,
      word: "succinct",
      pronunciation: "suhk-SINGKT",
      definition: "Briefly and clearly expressed; concise",
      partOfSpeech: "adjective",
      exampleSentence: "Her succinct explanation made the concept easy to understand.",
      synonyms: ["concise", "brief", "terse", "compact"],
      difficulty: "intermediate",
      category: "communication"
    },
    {
      id: 66,
      word: "discern",
      pronunciation: "dih-SURN",
      definition: "To recognize or find out with difficulty",
      partOfSpeech: "verb",
      exampleSentence: "It's difficult to discern the truth in this situation.",
      synonyms: ["detect", "perceive", "distinguish", "identify"],
      difficulty: "intermediate",
      category: "thinking"
    },
    {
      id: 67,
      word: "tenacious",
      pronunciation: "tuh-NAY-shuhs",
      definition: "Not readily relinquishing a position or principle; persistent",
      partOfSpeech: "adjective",
      exampleSentence: "She was tenacious in pursuing her goal of better communication.",
      synonyms: ["persistent", "determined", "resolute", "steadfast"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 68,
      word: "transient",
      pronunciation: "TRAN-shuhnt",
      definition: "Lasting only for a short time; temporary",
      partOfSpeech: "adjective",
      exampleSentence: "The feeling of nervousness before speaking is usually transient.",
      synonyms: ["temporary", "brief", "fleeting", "momentary"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 69,
      word: "benevolent",
      pronunciation: "buh-NEV-uh-luhnt",
      definition: "Well meaning and kindly; generous",
      partOfSpeech: "adjective",
      exampleSentence: "His benevolent tone put everyone at ease.",
      synonyms: ["kind", "charitable", "generous", "compassionate"],
      difficulty: "intermediate",
      category: "descriptive"
    },
    {
      id: 70,
      word: "infer",
      pronunciation: "in-FUR",
      definition: "To deduce or conclude information from evidence and reasoning",
      partOfSpeech: "verb",
      exampleSentence: "From her tone, I could infer she was disappointed.",
      synonyms: ["deduce", "conclude", "gather", "surmise"],
      difficulty: "intermediate",
      category: "thinking"
    }
  ],

  advanced: [
    {
      id: 71,
      word: "quintessential",
      pronunciation: "kwin-tuh-SEN-shuhl",
      definition: "Representing the most perfect or typical example of a quality or class",
      partOfSpeech: "adjective",
      exampleSentence: "He is the quintessential example of an articulate speaker.",
      synonyms: ["typical", "archetypal", "definitive", "exemplary"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 72,
      word: "ubiquitous",
      pronunciation: "yoo-BIK-wi-tuhs",
      definition: "Present, appearing, or found everywhere; omnipresent",
      partOfSpeech: "adjective",
      exampleSentence: "The ubiquitous nature of communication challenges affects everyone.",
      synonyms: ["omnipresent", "pervasive", "everywhere", "universal"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 73,
      word: "juxtaposition",
      pronunciation: "juhk-stuh-puh-ZISH-uhn",
      definition: "The fact of two things being seen or placed close together with contrasting effect",
      partOfSpeech: "noun",
      exampleSentence: "The juxtaposition of simple and complex vocabulary can be quite effective.",
      synonyms: ["contrast", "comparison", "opposition", "proximity"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 74,
      word: "empirical",
      pronunciation: "em-PEER-i-kuhl",
      definition: "Based on observation or experience rather than theory or pure logic",
      partOfSpeech: "adjective",
      exampleSentence: "We need empirical evidence to support these claims about communication.",
      synonyms: ["experiential", "practical", "observational", "factual"],
      difficulty: "advanced",
      category: "thinking"
    },
    {
      id: 75,
      word: "dichotomy",
      pronunciation: "dy-KOT-uh-mee",
      definition: "A division or contrast between two things that are represented as being opposed or entirely different",
      partOfSpeech: "noun",
      exampleSentence: "There's a false dichotomy between being articulate and being authentic.",
      synonyms: ["division", "contrast", "split", "separation"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 76,
      word: "esoteric",
      pronunciation: "es-uh-TER-ik",
      definition: "Intended for or likely to be understood by only a small number of people with specialized knowledge",
      partOfSpeech: "adjective",
      exampleSentence: "Avoid using esoteric terminology when speaking to a general audience.",
      synonyms: ["obscure", "arcane", "specialized", "abstruse"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 77,
      word: "ephemeral",
      pronunciation: "ih-FEM-er-uhl",
      definition: "Lasting for a very short time; transitory",
      partOfSpeech: "adjective",
      exampleSentence: "The impact of poorly chosen words can be ephemeral or lasting.",
      synonyms: ["fleeting", "temporary", "transient", "momentary"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 78,
      word: "obfuscate",
      pronunciation: "OB-fuh-skayt",
      definition: "To render obscure, unclear, or unintelligible; to deliberately make something difficult to understand",
      partOfSpeech: "verb",
      exampleSentence: "Don't obfuscate your message with unnecessary jargon.",
      synonyms: ["obscure", "confuse", "complicate", "muddle"],
      difficulty: "advanced",
      category: "action"
    },
    {
      id: 79,
      word: "extrapolate",
      pronunciation: "ik-STRAP-uh-layt",
      definition: "To extend the application of a method or conclusion to an unknown situation",
      partOfSpeech: "verb",
      exampleSentence: "We can extrapolate from these communication principles to other contexts.",
      synonyms: ["infer", "deduce", "project", "predict"],
      difficulty: "advanced",
      category: "thinking"
    },
    {
      id: 80,
      word: "idiosyncrasy",
      pronunciation: "id-ee-uh-SING-kruh-see",
      definition: "A mode of behavior or way of thought peculiar to an individual",
      partOfSpeech: "noun",
      exampleSentence: "Every speaker has idiosyncrasies in their communication style.",
      synonyms: ["peculiarity", "quirk", "characteristic", "trait"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 81,
      word: "magnanimous",
      pronunciation: "mag-NAN-uh-muhs",
      definition: "Very generous or forgiving, especially toward a rival or less powerful person",
      partOfSpeech: "adjective",
      exampleSentence: "His magnanimous response to criticism impressed everyone.",
      synonyms: ["generous", "charitable", "benevolent", "noble"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 82,
      word: "nomenclature",
      pronunciation: "NOH-muhn-klay-cher",
      definition: "The devising or choosing of names for things in a particular field",
      partOfSpeech: "noun",
      exampleSentence: "Understanding the nomenclature of your field helps in precise communication.",
      synonyms: ["terminology", "vocabulary", "lexicon", "taxonomy"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 83,
      word: "pedantic",
      pronunciation: "pih-DAN-tik",
      definition: "Excessively concerned with minor details or rules; overscrupulous",
      partOfSpeech: "adjective",
      exampleSentence: "Being precise doesn't mean being pedantic in conversation.",
      synonyms: ["fussy", "finicky", "overparticular", "nit-picking"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 84,
      word: "reticent",
      pronunciation: "RET-i-suhnt",
      definition: "Not revealing one's thoughts or feelings readily; reserved",
      partOfSpeech: "adjective",
      exampleSentence: "He was reticent about sharing his opinions in meetings.",
      synonyms: ["reserved", "restrained", "taciturn", "quiet"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 85,
      word: "sagacious",
      pronunciation: "suh-GAY-shuhs",
      definition: "Having or showing keen mental discernment and good judgment; wise",
      partOfSpeech: "adjective",
      exampleSentence: "Her sagacious comments revealed deep understanding of the issue.",
      synonyms: ["wise", "astute", "shrewd", "perceptive"],
      difficulty: "advanced",
      category: "thinking"
    },
    {
      id: 86,
      word: "verbose",
      pronunciation: "ver-BOHS",
      definition: "Using or expressed in more words than are needed; wordy",
      partOfSpeech: "adjective",
      exampleSentence: "Try to avoid being verbose; clarity trumps verbosity.",
      synonyms: ["wordy", "long-winded", "prolix", "loquacious"],
      difficulty: "advanced",
      category: "communication"
    },
    {
      id: 87,
      word: "ameliorate",
      pronunciation: "uh-MEEL-yuh-rayt",
      definition: "To make something better; to improve",
      partOfSpeech: "verb",
      exampleSentence: "These techniques will ameliorate your speaking skills over time.",
      synonyms: ["improve", "enhance", "better", "upgrade"],
      difficulty: "advanced",
      category: "action"
    },
    {
      id: 88,
      word: "perspicacious",
      pronunciation: "pur-spi-KAY-shuhs",
      definition: "Having a ready insight into and understanding of things; shrewd",
      partOfSpeech: "adjective",
      exampleSentence: "Her perspicacious observations added depth to the discussion.",
      synonyms: ["perceptive", "astute", "discerning", "insightful"],
      difficulty: "advanced",
      category: "thinking"
    },
    {
      id: 89,
      word: "prodigious",
      pronunciation: "pruh-DIJ-uhs",
      definition: "Remarkably or impressively great in extent, size, or degree",
      partOfSpeech: "adjective",
      exampleSentence: "She has a prodigious vocabulary that she employs effectively.",
      synonyms: ["enormous", "huge", "tremendous", "impressive"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 90,
      word: "superfluous",
      pronunciation: "soo-PUR-floo-uhs",
      definition: "Unnecessary, especially through being more than enough",
      partOfSpeech: "adjective",
      exampleSentence: "Remove superfluous words to make your message more powerful.",
      synonyms: ["unnecessary", "redundant", "excessive", "surplus"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 91,
      word: "erudite",
      pronunciation: "ER-yuh-dite",
      definition: "Having or showing great knowledge or learning",
      partOfSpeech: "adjective",
      exampleSentence: "His erudite manner of speaking impressed the academic audience.",
      synonyms: ["learned", "scholarly", "knowledgeable", "educated"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 92,
      word: "acumen",
      pronunciation: "uh-KYOO-muhn",
      definition: "The ability to make good judgments and quick decisions",
      partOfSpeech: "noun",
      exampleSentence: "Her communication acumen helped navigate the difficult conversation.",
      synonyms: ["insight", "shrewdness", "judgment", "perception"],
      difficulty: "advanced",
      category: "thinking"
    },
    {
      id: 93,
      word: "inimitable",
      pronunciation: "ih-NIM-i-tuh-buhl",
      definition: "So good or unusual as to be impossible to copy; unique",
      partOfSpeech: "adjective",
      exampleSentence: "Each speaker has their own inimitable style.",
      synonyms: ["unique", "incomparable", "matchless", "distinctive"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 94,
      word: "veracity",
      pronunciation: "vuh-RAS-i-tee",
      definition: "Conformity to facts; accuracy; truthfulness",
      partOfSpeech: "noun",
      exampleSentence: "The veracity of your statements affects your credibility.",
      synonyms: ["truthfulness", "accuracy", "honesty", "correctness"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 95,
      word: "assiduous",
      pronunciation: "uh-SIJ-oo-uhs",
      definition: "Showing great care and perseverance; diligent",
      partOfSpeech: "adjective",
      exampleSentence: "Assiduous practice is key to mastering articulate speech.",
      synonyms: ["diligent", "careful", "meticulous", "thorough"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 96,
      word: "proclivity",
      pronunciation: "proh-KLIV-i-tee",
      definition: "A tendency to choose or do something regularly; an inclination",
      partOfSpeech: "noun",
      exampleSentence: "He has a proclivity for using unnecessarily complex vocabulary.",
      synonyms: ["tendency", "inclination", "predisposition", "propensity"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 97,
      word: "platitude",
      pronunciation: "PLAT-i-tood",
      definition: "A remark or statement that has been used too often to be interesting or thoughtful",
      partOfSpeech: "noun",
      exampleSentence: "Avoid platitudes; strive for original, meaningful expression.",
      synonyms: ["cliché", "truism", "banality", "commonplace"],
      difficulty: "advanced",
      category: "communication"
    },
    {
      id: 98,
      word: "vicarious",
      pronunciation: "vy-KAIR-ee-uhs",
      definition: "Experienced in the imagination through the feelings or actions of another",
      partOfSpeech: "adjective",
      exampleSentence: "Through vivid storytelling, listeners can have vicarious experiences.",
      synonyms: ["indirect", "secondhand", "surrogate", "substitute"],
      difficulty: "advanced",
      category: "descriptive"
    },
    {
      id: 99,
      word: "loquacious",
      pronunciation: "loh-KWAY-shuhs",
      definition: "Tending to talk a great deal; talkative",
      partOfSpeech: "adjective",
      exampleSentence: "Being loquacious doesn't necessarily mean being articulate.",
      synonyms: ["talkative", "garrulous", "chatty", "voluble"],
      difficulty: "advanced",
      category: "communication"
    },
    {
      id: 100,
      word: "zeitgeist",
      pronunciation: "ZITE-gyst",
      definition: "The defining spirit or mood of a particular period of history",
      partOfSpeech: "noun",
      exampleSentence: "Understanding the zeitgeist helps you communicate more effectively with your audience.",
      synonyms: ["spirit", "ethos", "climate", "atmosphere"],
      difficulty: "advanced",
      category: "thinking"
    }
  ]
};

// Log that vocabulary database is loaded
console.log('Vocabulary database loaded: 100 words total');
console.log(`- Beginner: ${vocabularyDatabase.beginner.length} words`);
console.log(`- Intermediate: ${vocabularyDatabase.intermediate.length} words`);
console.log(`- Advanced: ${vocabularyDatabase.advanced.length} words`);
