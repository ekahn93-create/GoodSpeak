// ============================================
// STORY PROMPTS DATABASE
// Contains 30 story prompts for practicing narrative skills
// ============================================

/**
 * Story Prompts Database
 * Organized by theme: personal, fictional, descriptive
 * Total: 30 prompts
 */
const storyPromptsDatabase = {
  personal: [
    {
      id: 1,
      title: "A Memorable Day",
      prompt: "Describe a day that changed your perspective on something important in your life.",
      guidance: {
        beginning: "Set the scene - what day was it? Where were you? What was the context?",
        middle: "What happened? What did you experience or learn? How did events unfold?",
        end: "How did this change you? What do you think about it now with hindsight?"
      },
      difficulty: "beginner",
      theme: "personal"
    },
    {
      id: 2,
      title: "Learning a Difficult Lesson",
      prompt: "Tell the story of a time when you learned something important through a challenging experience.",
      guidance: {
        beginning: "What was the situation? What did you think you knew at the start?",
        middle: "What challenges did you face? How did you react? What mistakes did you make?",
        end: "What did you ultimately learn? How has this lesson affected you since?"
      },
      difficulty: "beginner",
      theme: "personal"
    },
    {
      id: 3,
      title: "A Time You Surprised Yourself",
      prompt: "Recount an experience where you surprised yourself with your own capabilities or reactions.",
      guidance: {
        beginning: "Describe the initial situation. What were your expectations of yourself?",
        middle: "What happened that challenged you? How did you respond differently than expected?",
        end: "How did this experience change your self-perception?"
      },
      difficulty: "intermediate",
      theme: "personal"
    },
    {
      id: 4,
      title: "An Unexpected Friendship",
      prompt: "Share the story of how you formed an unexpected or unlikely friendship.",
      guidance: {
        beginning: "How did you first meet this person? What were your initial impressions?",
        middle: "What brought you together? What did you discover about each other?",
        end: "How has this friendship impacted your life? What makes it meaningful?"
      },
      difficulty: "beginner",
      theme: "personal"
    },
    {
      id: 5,
      title: "Overcoming a Fear",
      prompt: "Tell about a time when you confronted and overcame a significant fear or anxiety.",
      guidance: {
        beginning: "What was the fear? How long had it affected you?",
        middle: "What prompted you to face it? Describe the experience of confronting it.",
        end: "How do you feel about that fear now? What did overcoming it teach you?"
      },
      difficulty: "intermediate",
      theme: "personal"
    },
    {
      id: 6,
      title: "A Conversation That Mattered",
      prompt: "Describe a conversation that had a significant impact on your life or thinking.",
      guidance: {
        beginning: "Who were you speaking with? What was the context?",
        middle: "What was discussed? What insights or perspectives were shared?",
        end: "How did this conversation change you? What actions did you take afterward?"
      },
      difficulty: "intermediate",
      theme: "personal"
    },
    {
      id: 7,
      title: "A Mistake You're Grateful For",
      prompt: "Share a story about a mistake that, in retrospect, you're grateful you made.",
      guidance: {
        beginning: "What was the situation? What mistake did you make?",
        middle: "What were the immediate consequences? How did you feel at the time?",
        end: "Why are you grateful for this mistake now? What unexpected benefits resulted?"
      },
      difficulty: "intermediate",
      theme: "personal"
    },
    {
      id: 8,
      title: "Finding Your Voice",
      prompt: "Tell the story of a time when you found the courage to speak up or express yourself authentically.",
      guidance: {
        beginning: "What situation had you been holding back in? Why were you hesitant?",
        middle: "What motivated you to finally speak up? How did you do it?",
        end: "What was the outcome? How did it affect your confidence going forward?"
      },
      difficulty: "advanced",
      theme: "personal"
    },
    {
      id: 9,
      title: "A Place That Shaped You",
      prompt: "Describe a place from your past that significantly influenced who you are today.",
      guidance: {
        beginning: "Describe the place in vivid detail. When did you spend time there?",
        middle: "What experiences did you have there? Who else was involved?",
        end: "How did this place shape your values, interests, or personality?"
      },
      difficulty: "intermediate",
      theme: "personal"
    },
    {
      id: 10,
      title: "A Moment of Clarity",
      prompt: "Recount a moment when something suddenly made sense or when you had a significant realization.",
      guidance: {
        beginning: "What had you been struggling with or pondering? What was your mindset?",
        middle: "Describe the moment of realization. What triggered it?",
        end: "How did this clarity change your understanding or approach to something?"
      },
      difficulty: "advanced",
      theme: "personal"
    }
  ],

  fictional: [
    {
      id: 11,
      title: "The Last Door",
      prompt: "Tell a story about a character who discovers a door that wasn't there yesterday.",
      guidance: {
        beginning: "Who is your character? Where is the door? How do they discover it?",
        middle: "What do they find when they open it? What challenges or choices do they face?",
        end: "How does this discovery change them or their world?"
      },
      difficulty: "intermediate",
      theme: "fictional"
    },
    {
      id: 12,
      title: "The Perfect Day Repeated",
      prompt: "Create a story about someone who wakes up to find they're reliving the same day, but it's not quite perfect.",
      guidance: {
        beginning: "Establish the day and the character. What's their initial reaction?",
        middle: "How do they try to change things? What do they discover?",
        end: "How do they finally break the cycle, or do they? What do they learn?"
      },
      difficulty: "advanced",
      theme: "fictional"
    },
    {
      id: 13,
      title: "The Conversation",
      prompt: "Write a story told entirely through a meaningful conversation between two people meeting for the first time.",
      guidance: {
        beginning: "Where are they? Why are they meeting? Set the scene through dialogue.",
        middle: "What do they discuss? What do they reveal about themselves?",
        end: "How does the conversation resolve? What impact does it have on both?"
      },
      difficulty: "advanced",
      theme: "fictional"
    },
    {
      id: 14,
      title: "A World Without Words",
      prompt: "Imagine a society where people suddenly lose the ability to speak. Tell a story set in this world.",
      guidance: {
        beginning: "Describe when and how this happened. Introduce your character.",
        middle: "How does your character communicate? What conflict do they face?",
        end: "How do they resolve the conflict? What does this reveal about communication?"
      },
      difficulty: "advanced",
      theme: "fictional"
    },
    {
      id: 15,
      title: "The Message",
      prompt: "Tell a story about a character who receives a cryptic message from their future self.",
      guidance: {
        beginning: "How does the message arrive? What does it say? How does the character react?",
        middle: "What actions does the character take based on the message? What happens?",
        end: "Does the message prove true? What does the character learn from the experience?"
      },
      difficulty: "intermediate",
      theme: "fictional"
    },
    {
      id: 16,
      title: "The Ordinary Object",
      prompt: "Create a story where an ordinary object (a book, a key, a photograph) triggers an extraordinary journey.",
      guidance: {
        beginning: "Describe the object and how your character finds or notices it.",
        middle: "What mystery or adventure does the object lead to? What obstacles arise?",
        end: "How is the journey resolved? What was significant about this particular object?"
      },
      difficulty: "intermediate",
      theme: "fictional"
    },
    {
      id: 17,
      title: "Two Perspectives",
      prompt: "Tell the same event from two completely different perspectives, showing how interpretation changes the story.",
      guidance: {
        beginning: "Set up the event. Introduce both characters.",
        middle: "Show the first perspective, then the second. Highlight the differences.",
        end: "Reveal any truth or resolution. What does this say about perspective?"
      },
      difficulty: "advanced",
      theme: "fictional"
    },
    {
      id: 18,
      title: "The Misunderstanding",
      prompt: "Write a story where a simple misunderstanding leads to increasingly complex consequences.",
      guidance: {
        beginning: "Establish the characters and the initial misunderstanding.",
        middle: "Show how the misunderstanding compounds. What attempts to clarify fail?",
        end: "How is it finally resolved? What could have prevented it?"
      },
      difficulty: "intermediate",
      theme: "fictional"
    },
    {
      id: 19,
      title: "The Exchange",
      prompt: "Tell a story about two strangers who accidentally swap something important and must find each other.",
      guidance: {
        beginning: "How do they swap? What is exchanged? When do they realize?",
        middle: "How do they search for each other? What obstacles do they face?",
        end: "Do they find each other? What unexpected connection results from this exchange?"
      },
      difficulty: "intermediate",
      theme: "fictional"
    },
    {
      id: 20,
      title: "The Choice",
      prompt: "Create a story about a character facing a difficult choice where neither option is clearly right or wrong.",
      guidance: {
        beginning: "Present the dilemma. What factors make this choice difficult?",
        middle: "Show the character weighing options. What influences their thinking?",
        end: "What do they choose? What are the consequences? Do they have regrets?"
      },
      difficulty: "advanced",
      theme: "fictional"
    }
  ],

  descriptive: [
    {
      id: 21,
      title: "A Place Without Naming It",
      prompt: "Describe a specific location in such vivid detail that listeners can picture it, without ever naming where it is.",
      guidance: {
        beginning: "What do you see first when you arrive? What catches the eye?",
        middle: "Describe sounds, smells, textures. How does it feel to be there?",
        end: "What emotion or atmosphere defines this place? What makes it unique?"
      },
      difficulty: "intermediate",
      theme: "descriptive"
    },
    {
      id: 22,
      title: "The Morning Ritual",
      prompt: "Describe a morning routine in rich sensory detail, making the ordinary seem fascinating.",
      guidance: {
        beginning: "The first moment of waking - what's the first sensation?",
        middle: "Walk through each action slowly, noting every sensory detail.",
        end: "How does this routine prepare someone for the day? What makes it meaningful?"
      },
      difficulty: "beginner",
      theme: "descriptive"
    },
    {
      id: 23,
      title: "A Face in the Crowd",
      prompt: "Describe a person you noticed briefly in public, capturing what made them memorable without judging them.",
      guidance: {
        beginning: "Where did you see them? What first drew your attention?",
        middle: "Describe their appearance, mannerisms, expressions in detail.",
        end: "What did you imagine about their story? Why did they stay in your memory?"
      },
      difficulty: "intermediate",
      theme: "descriptive"
    },
    {
      id: 24,
      title: "Seasons Changing",
      prompt: "Describe the transition between two seasons, capturing the exact moment when you notice the change.",
      guidance: {
        beginning: "What signs of the old season are still present?",
        middle: "What new elements appear? How do they coexist?",
        end: "What feelings does this transition evoke? What does it symbolize?"
      },
      difficulty: "intermediate",
      theme: "descriptive"
    },
    {
      id: 25,
      title: "The Emotion Through Objects",
      prompt: "Describe an emotion (joy, grief, anxiety, peace) entirely through describing physical objects and environments, never naming the emotion.",
      guidance: {
        beginning: "Choose your emotion. What objects or settings represent it?",
        middle: "Build the description layer by layer, using all senses.",
        end: "How do all these elements combine to evoke the unnamed emotion?"
      },
      difficulty: "advanced",
      theme: "descriptive"
    },
    {
      id: 26,
      title: "A Childhood Memory",
      prompt: "Describe a specific memory from childhood with such sensory detail that listeners feel transported there.",
      guidance: {
        beginning: "Set the scene - how old were you? What did the space look like?",
        middle: "What were you doing? Engage all five senses in your description.",
        end: "What feeling or realization does this memory hold? Why does it persist?"
      },
      difficulty: "intermediate",
      theme: "descriptive"
    },
    {
      id: 27,
      title: "The Sound That Defines It",
      prompt: "Describe a place, time of day, or event primarily through the sounds that define it.",
      guidance: {
        beginning: "What's the first sound you notice? How does it set the tone?",
        middle: "Layer in other sounds. How do they interact or contrast?",
        end: "What do these sounds mean? What story do they tell together?"
      },
      difficulty: "intermediate",
      theme: "descriptive"
    },
    {
      id: 28,
      title: "Before and After",
      prompt: "Describe the same space at two different times, showing how it has changed and what has remained.",
      guidance: {
        beginning: "Describe the space as it was before. Be specific and detailed.",
        middle: "Now describe it after. What's different? What's stayed the same?",
        end: "What do these changes or consistencies reveal about time's passage?"
      },
      difficulty: "advanced",
      theme: "descriptive"
    },
    {
      id: 29,
      title: "The Weather as Character",
      prompt: "Describe weather conditions as if they were a character with intentions and personality.",
      guidance: {
        beginning: "What type of weather? Give it personality traits through description.",
        middle: "How does this 'character' interact with the environment and people?",
        end: "What mood or meaning does this weather-character create?"
      },
      difficulty: "intermediate",
      theme: "descriptive"
    },
    {
      id: 30,
      title: "The Texture of Time",
      prompt: "Describe how a particular time period (an hour, a day, a season of life) felt, focusing on texture and sensation rather than events.",
      guidance: {
        beginning: "What time period? How did time itself feel during this period?",
        middle: "What physical and emotional sensations characterized it?",
        end: "Looking back, how do you understand this period now? What quality defined it?"
      },
      difficulty: "advanced",
      theme: "descriptive"
    }
  ]
};

/**
 * Helper function to get all prompts as a flat array
 * @returns {Array} All prompts
 */
function getAllPrompts() {
  return [
    ...storyPromptsDatabase.personal,
    ...storyPromptsDatabase.fictional,
    ...storyPromptsDatabase.descriptive
  ];
}

/**
 * Helper function to get prompts by theme
 * @param {string} theme - Theme name or 'all'
 * @returns {Array} Filtered prompts
 */
function getPromptsByTheme(theme) {
  if (theme === 'all') {
    return getAllPrompts();
  }
  return storyPromptsDatabase[theme] || [];
}

/**
 * Helper function to get a prompt by ID
 * @param {number} promptId - The prompt ID
 * @returns {Object|null} The prompt object or null
 */
function getPromptById(promptId) {
  const allPrompts = getAllPrompts();
  return allPrompts.find(prompt => prompt.id === promptId) || null;
}

/**
 * Time ranges and timer defaults by difficulty
 * label: shown on card badge and in practice interface
 * seconds: countdown timer default (upper bound of range)
 */
const DIFFICULTY_TIME = {
  beginner:     { label: '2-5 minutes',   seconds: 300  },
  intermediate: { label: '5-10 minutes',  seconds: 600  },
  advanced:     { label: '10-15 minutes', seconds: 900  }
};

