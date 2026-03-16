// ============================================
// WORD OF THE DAY LIST
// Curated list of interesting words that rotate daily
// ============================================

/**
 * Word of the Day Database
 * Contains interesting, sophisticated words to learn
 * Rotates through the list based on the day of the year
 */
const wordOfTheDayList = [
  "serendipity",
  "ephemeral",
  "eloquent",
  "mellifluous",
  "ethereal",
  "quintessential",
  "luminous",
  "resilient",
  "perspicacious",
  "ubiquitous",
  "paradigm",
  "innovative",
  "benevolent",
  "enigmatic",
  "pragmatic",
  "verbose",
  "meticulous",
  "tenacious",
  "audacious",
  "candid",
  "diligent",
  "eloquence",
  "fastidious",
  "gregarious",
  "indigenous",
  "juxtapose",
  "labyrinth",
  "nostalgia",
  "obsolete",
  "paradox",
  "querulous",
  "resilience",
  "sagacity",
  "tangible",
  "ubiquity",
  "vicarious",
  "wanderlust",
  "zealous",
  "aesthetic",
  "cathartic",
  "ephemera",
  "halcyon",
  "idyllic",
  "juxtaposition",
  "loquacious",
  "magnanimous",
  "nuance",
  "opulent",
  "panacea",
  "quixotic",
  "reciprocate",
  "succinct",
  "transient",
  "vernacular",
  "whimsical",
  "zenith",
  "acquiesce",
  "brevity",
  "conundrum",
  "dichotomy",
  "exemplary",
  "formidable",
  "gratitude",
  "harbinger",
  "ineffable",
  "judicious",
  "kindle",
  "lucid",
  "mitigate",
  "nefarious",
  "ostentatious",
  "penchant",
  "quandary",
  "reticent",
  "superfluous",
  "taciturn",
  "urbane",
  "vehement",
  "wistful",
  "aberration",
  "beguile",
  "cacophony",
  "debacle",
  "egregious",
  "facetious",
  "galvanize",
  "hapless",
  "incandescent",
  "jocular",
  "kinetic",
  "languish",
  "malleable",
  "nebulous",
  "ominous",
  "plethora",
  "quaint",
  "rambunctious",
  "serene",
  "trepidation",
  "unorthodox",
  "vivacious",
  "wary"
];

/**
 * Get today's word based on the current date
 * Words rotate through the list cyclically
 * @returns {string} Today's word
 */
function getTodaysWordOfTheDay() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % wordOfTheDayList.length;
  return wordOfTheDayList[index];
}

// Log that word of the day list is loaded
console.log(`Word of the Day list loaded: ${wordOfTheDayList.length} words available`);
