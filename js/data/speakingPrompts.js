// ============================================
// SPEAKING PROMPTS DATA
// Themed prompts for Impromptu Speaking — Vocab Mode
// Each prompt has: text, themes[] for word matching
// ============================================

const speakingPrompts = [
  // Personal Growth
  { text: "Describe a moment when you had to push past your comfort zone. What did you learn?", themes: ["personal growth", "resilience", "challenge", "development", "mindset"] },
  { text: "Talk about a habit you've built that has made a real difference in your life.", themes: ["personal growth", "discipline", "routine", "improvement", "mindset"] },
  { text: "Describe someone who changed the way you think about yourself or the world.", themes: ["personal growth", "influence", "inspiration", "perspective", "development"] },
  { text: "What does failure mean to you, and how do you recover from it?", themes: ["personal growth", "resilience", "mindset", "challenge", "courage"] },
  { text: "Talk about a time you had to be patient when everything in you wanted to rush.", themes: ["personal growth", "discipline", "resilience", "mindset", "patience"] },

  // Career & Work
  { text: "Describe the most valuable skill you use at work and how you developed it.", themes: ["career", "work", "skill", "professional", "development"] },
  { text: "What does success look like to you — and has that definition changed over time?", themes: ["career", "ambition", "goals", "professional", "achievement"] },
  { text: "Talk about a time you had to work with someone very different from you.", themes: ["career", "collaboration", "communication", "professional", "teamwork"] },
  { text: "Describe a professional challenge you faced and how you navigated it.", themes: ["career", "challenge", "problem-solving", "professional", "resilience"] },
  { text: "If you could give one piece of advice to someone starting their career, what would it be?", themes: ["career", "professional", "advice", "development", "mentorship"] },

  // Technology & Society
  { text: "How has technology changed the way you connect with people?", themes: ["technology", "communication", "digital", "society", "connection"] },
  { text: "Do you think social media makes us more or less honest? Explain your view.", themes: ["technology", "society", "communication", "digital", "influence"] },
  { text: "Talk about a piece of technology you rely on daily — and what life would look like without it.", themes: ["technology", "digital", "innovation", "dependence", "modern"] },
  { text: "What's one problem you think technology could solve in the next 10 years?", themes: ["technology", "innovation", "future", "society", "solution"] },
  { text: "How do you think AI will change the way people work and communicate?", themes: ["technology", "innovation", "future", "digital", "society"] },

  // Health & Wellness
  { text: "Talk about one thing you do consistently that supports your mental health.", themes: ["health", "wellness", "mindset", "self-care", "routine"] },
  { text: "Describe what a balanced life looks like to you.", themes: ["health", "wellness", "balance", "lifestyle", "priorities"] },
  { text: "How do you recharge when you're mentally or physically exhausted?", themes: ["health", "wellness", "resilience", "self-care", "recovery"] },
  { text: "Talk about the connection between how you speak to yourself and how you feel.", themes: ["health", "mindset", "wellness", "confidence", "self-awareness"] },
  { text: "What does it mean to truly listen to your body?", themes: ["health", "wellness", "awareness", "self-care", "mindfulness"] },

  // Relationships
  { text: "What qualities do you value most in a close friendship?", themes: ["relationships", "communication", "trust", "connection", "loyalty"] },
  { text: "Describe a time a difficult conversation actually strengthened a relationship.", themes: ["relationships", "communication", "conflict", "connection", "honesty"] },
  { text: "What's the most important thing you've learned about listening to other people?", themes: ["relationships", "communication", "empathy", "connection", "listening"] },
  { text: "How do you maintain relationships with people who see the world differently from you?", themes: ["relationships", "communication", "perspective", "empathy", "respect"] },
  { text: "Talk about how trust is built — and what breaks it.", themes: ["relationships", "trust", "communication", "honesty", "connection"] },

  // Nature & Environment
  { text: "Describe a place in nature that has had a meaningful impact on you.", themes: ["nature", "environment", "reflection", "beauty", "awareness"] },
  { text: "What small actions do you think make the biggest difference for the environment?", themes: ["environment", "sustainability", "responsibility", "impact", "awareness"] },
  { text: "Talk about the relationship between humans and the natural world.", themes: ["nature", "environment", "society", "sustainability", "awareness"] },
  { text: "How do you think cities can better integrate nature into daily life?", themes: ["nature", "environment", "innovation", "urban", "sustainability"] },
  { text: "Describe what it feels like to spend time in a natural setting with no distractions.", themes: ["nature", "mindfulness", "reflection", "wellness", "awareness"] },

  // Creativity & Expression
  { text: "How do you express yourself creatively, and what does that outlet mean to you?", themes: ["creativity", "expression", "art", "identity", "passion"] },
  { text: "Describe a creative problem you solved in an unexpected way.", themes: ["creativity", "problem-solving", "innovation", "expression", "thinking"] },
  { text: "What does creativity mean to you — do you think everyone is creative?", themes: ["creativity", "expression", "perspective", "art", "identity"] },
  { text: "Talk about how storytelling shapes the way we understand the world.", themes: ["creativity", "storytelling", "communication", "expression", "perspective"] },
  { text: "Describe a piece of art, music, or writing that has stayed with you.", themes: ["creativity", "expression", "art", "emotion", "inspiration"] },

  // Leadership & Influence
  { text: "Describe a time you took initiative when no one else did.", themes: ["leadership", "courage", "initiative", "influence", "responsibility"] },
  { text: "What's the difference between a manager and a true leader?", themes: ["leadership", "influence", "professional", "communication", "authority"] },
  { text: "Talk about someone whose leadership style you admire and why.", themes: ["leadership", "influence", "inspiration", "character", "authority"] },
  { text: "How do you motivate others without relying on authority?", themes: ["leadership", "influence", "communication", "motivation", "connection"] },
  { text: "Describe a decision you made that required courage. What guided you?", themes: ["leadership", "courage", "character", "decision", "values"] },

  // Learning & Education
  { text: "What's the most important thing school never taught you?", themes: ["learning", "education", "knowledge", "growth", "development"] },
  { text: "Describe how you learn best — and how you discovered that about yourself.", themes: ["learning", "education", "self-awareness", "development", "curiosity"] },
  { text: "Talk about a book, podcast, or conversation that changed how you see something.", themes: ["learning", "knowledge", "perspective", "growth", "curiosity"] },
  { text: "What does lifelong learning mean to you in practice?", themes: ["learning", "education", "growth", "curiosity", "development"] },
  { text: "How do you stay curious about things outside your area of expertise?", themes: ["learning", "curiosity", "knowledge", "growth", "exploration"] },

  // Values & Character
  { text: "Describe a value you hold deeply and how it shows up in your daily life.", themes: ["character", "values", "identity", "integrity", "principles"] },
  { text: "Talk about a time your integrity was tested. How did you respond?", themes: ["character", "integrity", "values", "honesty", "courage"] },
  { text: "What does kindness look like in action — beyond just being nice?", themes: ["character", "empathy", "compassion", "values", "connection"] },
  { text: "Describe what it means to live with intention.", themes: ["character", "values", "mindset", "purpose", "identity"] },
  { text: "Talk about a belief you used to hold that you've since changed your mind about.", themes: ["character", "perspective", "growth", "humility", "learning"] }
];
