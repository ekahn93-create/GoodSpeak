// ============================================
// STORYTELLING MODULE
// Handles story-telling practice and prompt management
// ============================================

/**
 * StorytellingModule - Module for story-telling practice feature
 * Uses the Revealing Module Pattern
 */
const StorytellingModule = (function() {
  // Private variables
  let currentTheme = 'all';
  let currentPrompt = null;
  let currentStoryCategory = 'storytelling';
  let userData = null;

  // DOM elements - Category tabs
  let storyCategoryTabs = null;
  let storyCategories = null;

  // DOM elements - Storytelling
  let promptsGrid = null;
  let practiceInterface = null;
  let themeButtons = null;
  let promptTitle = null;
  let promptText = null;
  let guidanceContent = null;
  let guidanceToggle = null;
  let storyTextarea = null;
  let saveDraftBtn = null;
  let completeStoryBtn = null;
  let backToPromptsBtn = null;

  /**
   * Initialize the storytelling module
   */
  function init() {
    console.log('StorytellingModule initializing...');

    // Get DOM elements - Category tabs
    storyCategoryTabs = document.querySelectorAll('.storytelling-category-tab');
    storyCategories = document.querySelectorAll('.storytelling-category');

    // Get DOM elements - Storytelling
    promptsGrid = document.getElementById('prompts-grid');
    practiceInterface = document.getElementById('story-practice-interface');
    themeButtons = document.querySelectorAll('.theme-selector .btn');
    promptTitle = document.getElementById('current-prompt-title');
    promptText = document.getElementById('prompt-text');
    guidanceContent = document.querySelector('.guidance-content');
    guidanceToggle = document.querySelector('.guidance-toggle');
    storyTextarea = document.getElementById('story-textarea');
    saveDraftBtn = document.getElementById('save-draft-btn');
    completeStoryBtn = document.getElementById('complete-story-btn');
    backToPromptsBtn = document.getElementById('back-to-prompts-btn');

    // Load user data
    userData = StorageManager.load();

    if (!userData) {
      console.error('No user data found');
      return;
    }

    // Set up event listeners
    setupEventListeners();
    setupCategoryTabs();

    // Restore saved category from localStorage
    const savedCategory = localStorage.getItem('storytelling_currentCategory');
    if (savedCategory) {
      currentStoryCategory = savedCategory;
      switchStoryCategory(savedCategory);
    } else {
      // Display prompts for default category
      displayPrompts(currentTheme);
    }

    console.log('StorytellingModule initialized successfully');
  }

  /**
   * Set up category tab event listeners
   */
  function setupCategoryTabs() {
    if (storyCategoryTabs) {
      storyCategoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
          switchStoryCategory(this.dataset.storyCategory);
        });
      });
    }
  }

  /**
   * Switch between storytelling categories
   */
  function switchStoryCategory(category) {
    currentStoryCategory = category;

    // Save to localStorage
    localStorage.setItem('storytelling_currentCategory', category);

    // Update tab active states
    if (storyCategoryTabs) {
      storyCategoryTabs.forEach(tab => {
        if (tab.dataset.storyCategory === category) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }

    // Update category visibility
    if (storyCategories) {
      storyCategories.forEach(cat => {
        if (cat.id === `${category}-category`) {
          cat.classList.add('active');
        } else {
          cat.classList.remove('active');
        }
      });
    }

    // Initialize the appropriate category content
    switch(category) {
      case 'storytelling':
        displayPrompts(currentTheme);
        break;
      case 'practical':
        setupPracticalListeners();
        break;
      case 'challenges':
        initializeChallenges();
        break;
      case 'listening':
        initializeListening();
        break;
      case 'webspeech':
        WebSpeechModule.init();
        break;
    }
  }

  /**
   * Initialize interactive challenges
   */
  function initializeChallenges() {
    // Initialize daily prompt
    loadDailySpeakingPrompt();
    // Add event listeners for challenges
    setupChallengesListeners();
  }

  /**
   * Initialize listening & comprehension
   */
  function initializeListening() {
    // Load initial passages
    loadSummarizationPassage();
    loadParaphrasingExercise();
    // Add event listeners
    setupListeningListeners();
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Theme buttons
    if (themeButtons) {
      themeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const theme = this.getAttribute('data-theme');
          changeTheme(theme);
        });
      });
    }

    // Guidance toggle
    if (guidanceToggle) {
      guidanceToggle.addEventListener('click', toggleGuidance);
    }

    // Save draft button
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', saveDraft);
    }

    // Complete story button
    if (completeStoryBtn) {
      completeStoryBtn.addEventListener('click', completeStory);
    }

    // Back to prompts button
    if (backToPromptsBtn) {
      backToPromptsBtn.addEventListener('click', showPromptsView);
    }

    // Story voice feedback panel
    if (document.getElementById('story-speak-controls')) {
      WebSpeechModule.create('story', () => document.getElementById('prompt-text')?.textContent || '').init();
    }

    // Listen for view changes
    document.addEventListener('viewChanged', function(e) {
      if (e.detail.viewName === 'storytelling') {
        refresh();
      }
    });
  }

  /**
   * Display prompts grid
   * @param {string} theme - Theme to filter by or 'all'
   */
  function displayPrompts(theme) {
    if (!promptsGrid) return;

    // Get prompts by theme
    const prompts = getPromptsByTheme(theme);

    if (prompts.length === 0) {
      promptsGrid.innerHTML = '<p class="text-secondary">No prompts available for this theme.</p>';
      return;
    }

    // Create prompt cards
    const html = prompts.map(prompt => {
      const isCompleted = userData.storytelling.completedPrompts.some(cp => cp.promptId === prompt.id);
      const hasDraft = userData.storytelling.drafts && userData.storytelling.drafts[prompt.id];

      return `
        <div class="prompt-card ${isCompleted ? 'completed' : ''}" onclick="StorytellingModule.startPractice(${prompt.id})">
          <div class="prompt-theme">${prompt.theme}</div>
          <h3>${prompt.title}</h3>
          <p>${prompt.prompt}</p>
          <div class="prompt-meta">
            <span class="badge badge-secondary">${prompt.difficulty}</span>
            <span class="badge badge-primary">${prompt.estimatedTime}</span>
          </div>
          ${isCompleted ? '<div class="badge badge-success">✓ Completed</div>' : ''}
          ${hasDraft && !isCompleted ? '<div class="badge badge-warning">Draft Saved</div>' : ''}
        </div>
      `;
    }).join('');

    promptsGrid.innerHTML = html;
  }

  /**
   * Change theme filter
   * @param {string} theme - Theme to filter by
   */
  function changeTheme(theme) {
    currentTheme = theme;

    // Update button states
    if (themeButtons) {
      themeButtons.forEach(btn => {
        const btnTheme = btn.getAttribute('data-theme');
        if (btnTheme === theme) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Display filtered prompts
    displayPrompts(theme);
  }

  /**
   * Start practice with a specific prompt
   * @param {number} promptId - The prompt ID
   */
  function startPractice(promptId) {
    const prompt = getPromptById(promptId);

    if (!prompt) {
      console.error('Prompt not found:', promptId);
      return;
    }

    currentPrompt = prompt;

    // Show practice interface
    showPracticeView();

    // Populate interface
    if (promptTitle) {
      promptTitle.textContent = prompt.title;
    }

    if (promptText) {
      promptText.textContent = prompt.prompt;
    }

    // Populate guidance
    const guidanceBeginning = document.getElementById('guidance-beginning');
    const guidanceMiddle = document.getElementById('guidance-middle');
    const guidanceEnd = document.getElementById('guidance-end');

    if (guidanceBeginning) guidanceBeginning.textContent = prompt.guidance.beginning;
    if (guidanceMiddle) guidanceMiddle.textContent = prompt.guidance.middle;
    if (guidanceEnd) guidanceEnd.textContent = prompt.guidance.end;

    // Load draft if exists
    if (storyTextarea) {
      const draft = userData.storytelling.drafts && userData.storytelling.drafts[promptId];
      storyTextarea.value = draft || '';
      storyTextarea.focus();
    }
  }

  /**
   * Show practice view
   */
  function showPracticeView() {
    if (promptsGrid) {
      promptsGrid.style.display = 'none';
    }

    if (practiceInterface) {
      practiceInterface.style.display = 'block';
    }

    // Hide theme selector
    const themeSelector = document.querySelector('.theme-selector');
    if (themeSelector) {
      themeSelector.style.display = 'none';
    }
  }

  /**
   * Show prompts view
   */
  function showPromptsView() {
    if (promptsGrid) {
      promptsGrid.style.display = 'grid';
    }

    if (practiceInterface) {
      practiceInterface.style.display = 'none';
    }

    // Show theme selector
    const themeSelector = document.querySelector('.theme-selector');
    if (themeSelector) {
      themeSelector.style.display = 'block';
    }

    currentPrompt = null;
  }

  /**
   * Toggle guidance visibility
   */
  function toggleGuidance() {
    if (!guidanceContent || !guidanceToggle) return;

    const isHidden = guidanceContent.style.display === 'none' || guidanceContent.style.display === '';

    if (isHidden) {
      guidanceContent.style.display = 'block';
      guidanceToggle.textContent = 'Hide Structure Guidance ▲';
    } else {
      guidanceContent.style.display = 'none';
      guidanceToggle.textContent = 'Show Structure Guidance ▼';
    }
  }

  /**
   * Save draft
   */
  function saveDraft() {
    if (!currentPrompt || !storyTextarea) return;

    const content = storyTextarea.value.trim();

    if (!content) {
      showToast('Please write something before saving', 'error');
      return;
    }

    // Initialize drafts object if doesn't exist
    if (!userData.storytelling.drafts) {
      userData.storytelling.drafts = {};
    }

    // Save draft
    userData.storytelling.drafts[currentPrompt.id] = content;

    if (StorageManager.save(userData)) {
      showToast('Draft saved successfully!', 'success');
    } else {
      showToast('Failed to save draft', 'error');
    }
  }

  /**
   * Complete story
   */
  function completeStory() {
    if (!currentPrompt || !storyTextarea) return;

    const content = storyTextarea.value.trim();

    // Optional notes
    Modal.showForm({
      title: 'Complete Story',
      fields: [
        {
          id: 'notes',
          label: 'Reflection Notes (optional)',
          type: 'textarea',
          placeholder: 'What did you learn? How did it go?',
          rows: 4,
          help: 'Optional notes about your practice session'
        }
      ],
      onSubmit: function(formData) {
        completeStoryWithNotes(currentPrompt.id, formData.notes);
      },
      onCancel: function() {
        // Just close modal, don't complete
      }
    });
  }

  /**
   * Complete story with notes
   * @param {number} promptId - The prompt ID
   * @param {string} notes - Optional reflection notes
   */
  function completeStoryWithNotes(promptId, notes) {
    // Check if already completed
    const alreadyCompleted = userData.storytelling.completedPrompts.some(cp => cp.promptId === promptId);

    if (!alreadyCompleted) {
      // Add to completed prompts
      userData.storytelling.completedPrompts.push({
        promptId: promptId,
        completedAt: new Date().toISOString(),
        notes: notes || ''
      });

      // Increment total stories
      userData.storytelling.totalStories = userData.storytelling.completedPrompts.length;

      // Update favorite theme
      const prompt = getPromptById(promptId);
      if (prompt) {
        updateFavoriteTheme(prompt.theme);
      }
    }

    // Remove draft if exists
    if (userData.storytelling.drafts && userData.storytelling.drafts[promptId]) {
      delete userData.storytelling.drafts[promptId];
    }

    // Save to storage
    if (StorageManager.save(userData)) {
      showToast('Story completed! Great job!', 'success');

      // Clear textarea
      if (storyTextarea) {
        storyTextarea.value = '';
      }

      // Show congratulations modal
      setTimeout(() => {
        Modal.alert({
          title: '🎉 Story Completed!',
          message: `Excellent work! You've completed "${currentPrompt.title}". Keep practicing to improve your storytelling skills.`,
          type: 'success',
          onClose: function() {
            showPromptsView();
            displayPrompts(currentTheme);
          }
        });
      }, 500);
    } else {
      showToast('Failed to save completion', 'error');
    }
  }

  /**
   * Update favorite theme based on most completed
   * @param {string} theme - Theme to count
   */
  function updateFavoriteTheme(theme) {
    const themeCounts = {};

    userData.storytelling.completedPrompts.forEach(cp => {
      const prompt = getPromptById(cp.promptId);
      if (prompt) {
        themeCounts[prompt.theme] = (themeCounts[prompt.theme] || 0) + 1;
      }
    });

    // Find theme with most completions
    let maxCount = 0;
    let favoriteTheme = null;

    for (const [theme, count] of Object.entries(themeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteTheme = theme;
      }
    }

    if (favoriteTheme) {
      userData.storytelling.favoriteTheme = favoriteTheme;
    }
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to show
   * @param {string} type - The type of toast (success, error, info)
   */
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, 3000);
  }

  // ========== Practical Speaking Skills & Challenges Functions ==========

  /**
   * Set up event listeners for practical skills
   */
  function setupPracticalListeners() {
    // Impromptu Speaking - New Topic buttons
    const newImpromptuBtn = document.getElementById('new-impromptu-btn');
    const newImpromptuTypeBtnEl = document.getElementById('new-impromptu-type-btn');

    if (newImpromptuBtn) {
      newImpromptuBtn.addEventListener('click', loadImpromptuTopic);
    }
    if (newImpromptuTypeBtnEl) {
      newImpromptuTypeBtnEl.addEventListener('click', loadImpromptuTopic);
    }

    // Topic Builder
    const frameworkButtons = document.querySelectorAll('.framework-btn');
    const newTopicBuilderBtn = document.getElementById('new-topic-builder-btn');

    if (frameworkButtons) {
      frameworkButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          frameworkButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          loadTopicFramework(this.dataset.framework);
        });
      });
    }

    if (newTopicBuilderBtn) {
      newTopicBuilderBtn.addEventListener('click', () => {
        const activeFramework = document.querySelector('.framework-btn.active');
        if (activeFramework) {
          loadTopicFramework(activeFramework.dataset.framework);
        }
      });
    }

    // Conversation Starters
    const situationButtons = document.querySelectorAll('.situation-btn');
    const newConversationStartersBtn = document.getElementById('new-conversation-starters-btn');

    if (situationButtons) {
      situationButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          situationButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          loadConversationStarters(this.dataset.situation);
        });
      });
    }

    if (newConversationStartersBtn) {
      newConversationStartersBtn.addEventListener('click', () => {
        const activeSituation = document.querySelector('.situation-btn.active');
        if (activeSituation) {
          loadConversationStarters(activeSituation.dataset.situation);
        }
      });
    }

    // Impromptu Speaking voice feedback panel
    if (document.getElementById('impromptu-speak-controls')) {
      WebSpeechModule.create('impromptu', () => document.getElementById('impromptu-prompt')?.textContent || '').init();
    }

    // Elevator Pitch voice feedback panel
    if (document.getElementById('pitch-speak-controls')) {
      WebSpeechModule.create('pitch', () => 'Elevator pitch: who you are, what you do, why it matters, call to action').init();
    }

    // Load initial content
    loadImpromptuTopic();
    loadTopicFramework('pee');
    loadConversationStarters('networking');
  }

  /**
   * Set up event listeners for challenges category
   */
  function setupChallengesListeners() {
    // Word Association
    const startAssociationBtn = document.getElementById('start-association-btn');
    const submitAssociationBtn = document.getElementById('submit-association-btn');
    const resetAssociationBtn = document.getElementById('reset-association-btn');
    const associationInput = document.getElementById('association-text');
    const associationTimeButtons = document.querySelectorAll('.association-time-btn');

    if (startAssociationBtn) {
      startAssociationBtn.addEventListener('click', startWordAssociation);
    }

    if (submitAssociationBtn) {
      submitAssociationBtn.addEventListener('click', submitWordAssociation);
    }

    if (resetAssociationBtn) {
      resetAssociationBtn.addEventListener('click', resetWordAssociation);
    }

    // Allow Enter key to submit word
    if (associationInput) {
      associationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          submitWordAssociation();
        }
      });
    }

    // Time selection buttons
    if (associationTimeButtons) {
      associationTimeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          if (associationTimer) {
            // Don't allow changing time while game is active
            return;
          }
          associationTimeButtons.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
        });
      });
    }

    // Description Challenge
    const newDescriptionBtn = document.getElementById('new-description-btn');
    if (newDescriptionBtn) {
      newDescriptionBtn.addEventListener('click', loadDescriptionChallenge);
    }

    // Speak for X Minutes - New Topic buttons
    const newEnduranceBtn = document.getElementById('new-endurance-btn');
    const newEnduranceTypeBtnEl = document.getElementById('new-endurance-type-btn');

    if (newEnduranceBtn) {
      newEnduranceBtn.addEventListener('click', loadEnduranceTopic);
    }
    if (newEnduranceTypeBtnEl) {
      newEnduranceTypeBtnEl.addEventListener('click', loadEnduranceTopic);
    }

    // Speak for X Minutes voice feedback panel
    if (document.getElementById('endurance-speak-controls')) {
      WebSpeechModule.create('endurance', () => document.getElementById('endurance-topic')?.textContent || '').init();
    }

    // Load initial content
    loadDescriptionChallenge();
    loadEnduranceTopic();
  }

  /**
   * Load daily speaking prompt
   */
  function loadDailySpeakingPrompt() {
    const dailyPrompts = [
      { topic: "Personal Growth", description: "Describe a recent challenge you overcame and what you learned from it.", vocab: ["resilience", "perspective", "achievement", "obstacle", "determination"] },
      { topic: "Technology Impact", description: "How has technology changed the way we communicate?", vocab: ["digital", "connectivity", "evolution", "innovation", "transformation"] },
      { topic: "Work-Life Balance", description: "What strategies help maintain a healthy balance between work and personal life?", vocab: ["boundaries", "prioritize", "wellness", "productivity", "fulfillment"] },
      { topic: "Environmental Awareness", description: "What small actions can individuals take to help the environment?", vocab: ["sustainable", "conservation", "impact", "responsibility", "initiative"] },
      { topic: "Learning & Education", description: "What's the most valuable skill you've learned, and how do you continue learning?", vocab: ["curiosity", "mastery", "development", "knowledge", "growth"] }
    ];

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const todaysPrompt = dailyPrompts[dayOfYear % dailyPrompts.length];

    const topicElement = document.getElementById('daily-prompt-topic');
    const descElement = document.getElementById('daily-prompt-description');
    const vocabTags = document.getElementById('vocab-tags');

    if (topicElement) topicElement.textContent = todaysPrompt.topic;
    if (descElement) descElement.textContent = todaysPrompt.description;
    if (vocabTags) {
      vocabTags.innerHTML = todaysPrompt.vocab.map(word =>
        `<span class="filler-tag">${word}</span>`
      ).join('');
    }
  }

  /**
   * Set up event listeners for listening category
   */
  function setupListeningListeners() {
    const newSummarizationBtn = document.getElementById('new-summarization-btn');
    const newSummarizationTypeBtnEl = document.getElementById('new-summarization-type-btn');
    const newParaphrasingBtn = document.getElementById('new-paraphrasing-btn');
    const newParaphrasingTypeBtnEl = document.getElementById('new-paraphrasing-type-btn');

    if (newSummarizationBtn) {
      newSummarizationBtn.addEventListener('click', loadSummarizationPassage);
    }
    if (newSummarizationTypeBtnEl) {
      newSummarizationTypeBtnEl.addEventListener('click', loadSummarizationPassage);
    }

    if (newParaphrasingBtn) {
      newParaphrasingBtn.addEventListener('click', loadParaphrasingExercise);
    }
    if (newParaphrasingTypeBtnEl) {
      newParaphrasingTypeBtnEl.addEventListener('click', loadParaphrasingExercise);
    }

    // Summarization voice feedback panel
    if (document.getElementById('summarization-speak-controls')) {
      WebSpeechModule.create('summarization', () => document.getElementById('passage-to-summarize')?.textContent || '').init();
    }

    // Paraphrasing voice feedback panel
    if (document.getElementById('paraphrasing-speak-controls')) {
      WebSpeechModule.create('paraphrasing', () => document.getElementById('original-sentence')?.textContent || '').init();
    }
  }

  /**
   * Load summarization passage
   */
  function loadSummarizationPassage() {
    const passages = [
      "Public speaking is one of the most common fears, yet it's an essential skill in both personal and professional contexts. The key to becoming a better speaker is consistent practice and exposure. Start by speaking in low-pressure environments and gradually work your way up to larger audiences. Remember that even experienced speakers feel nervous—the difference is they've learned to channel that energy into enthusiasm and engagement.",
      "Effective communication involves not just speaking clearly, but also listening actively. When engaged in conversation, focus on understanding the other person's perspective rather than simply waiting for your turn to speak. Ask clarifying questions, paraphrase what you've heard, and provide thoughtful responses. This creates a genuine dialogue rather than two people taking turns delivering monologues.",
      "Body language plays a crucial role in how your message is received. Maintain good posture, make appropriate eye contact, and use natural gestures to emphasize your points. Your physical presence should support and enhance your words, not distract from them. Being aware of your non-verbal communication helps you appear more confident and makes your message more memorable.",
      "The art of storytelling is a powerful tool for effective communication. Stories make abstract concepts concrete, create emotional connections, and make information more memorable. When presenting ideas, consider how you can frame them as narratives with a beginning, middle, and end. Include specific details, real examples, and personal experiences to bring your message to life."
    ];

    const randomPassage = passages[Math.floor(Math.random() * passages.length)];
    const passageElement = document.getElementById('passage-to-summarize');

    if (passageElement) {
      passageElement.textContent = randomPassage;
    }

    const summaryTextarea = document.getElementById('summary-textarea');
    if (summaryTextarea) summaryTextarea.value = '';
  }

  /**
   * Load paraphrasing exercise
   */
  function loadParaphrasingExercise() {
    const sentences = [
      "Regular practice is the key to improving your communication skills.",
      "Effective speakers know how to adapt their message to different audiences.",
      "Confidence in public speaking comes from preparation and experience.",
      "Active listening is just as important as speaking clearly.",
      "Body language can reinforce or undermine your verbal message.",
      "The best communicators are those who can simplify complex ideas.",
      "Pausing strategically can make your speech more impactful.",
      "Authentic communication builds trust and credibility with your audience."
    ];

    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    const sentenceElement = document.getElementById('original-sentence');

    if (sentenceElement) {
      sentenceElement.textContent = randomSentence;
    }

    for (let i = 1; i <= 3; i++) {
      const textarea = document.getElementById(`paraphrase-${i}`);
      if (textarea) textarea.value = '';
    }
  }

  // ========== Practical Skills Implementation ==========

  let associationTimer = null;
  let wordChain = [];
  let isAssociationTimerActive = false;
  let associationRemainingSeconds = 0;

  /**
   * Load impromptu speaking topic
   */
  function loadImpromptuTopic() {
    const topics = [
      "If you could have dinner with anyone from history, who would it be and why?",
      "What's the most important lesson you've learned in life?",
      "Describe your perfect day from start to finish.",
      "If you could solve one world problem, what would it be?",
      "What technology do you think will change the world in the next 10 years?",
      "Tell us about a time you failed and what you learned.",
      "What advice would you give your younger self?",
      "If you could learn any skill instantly, what would it be?",
      "What does success mean to you?",
      "Describe a place that has special meaning to you."
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const promptElement = document.getElementById('impromptu-prompt');
    if (promptElement) {
      promptElement.textContent = randomTopic;
    }
  }


  /**
   * Load topic framework
   */
  function loadTopicFramework(framework) {
    const frameworks = {
      pee: {
        title: "Point-Evidence-Explanation",
        structure: [
          { label: "Point", desc: "Make your main argument or claim", example: "\"Renewable energy is essential for our future\"" },
          { label: "Evidence", desc: "Provide facts, data, or examples", example: "\"Solar power costs have dropped 90% in the past decade\"" },
          { label: "Explanation", desc: "Explain why this matters", example: "\"This makes clean energy accessible and economically viable\"" }
        ]
      },
      ps: {
        title: "Problem-Solution",
        structure: [
          { label: "Problem", desc: "Identify and describe the issue", example: "\"Many people struggle with public speaking anxiety\"" },
          { label: "Impact", desc: "Explain why this matters", example: "\"This limits career opportunities and personal growth\"" },
          { label: "Solution", desc: "Present your proposed solution", example: "\"Regular practice and preparation can build confidence\"" }
        ]
      },
      star: {
        title: "STAR Method (Situation-Task-Action-Result)",
        structure: [
          { label: "Situation", desc: "Set the context", example: "\"During my internship, our team faced a tight deadline\"" },
          { label: "Task", desc: "Describe your responsibility", example: "\"I was asked to coordinate team communications\"" },
          { label: "Action", desc: "Explain what you did", example: "\"I created a shared doc and daily check-ins\"" },
          { label: "Result", desc: "Share the outcome", example: "\"We delivered on time with improved collaboration\"" }
        ]
      }
    };

    const frameworkData = frameworks[framework];
    const displayElement = document.getElementById('framework-structure');

    if (displayElement && frameworkData) {
      displayElement.innerHTML = `
        <h4 style="color: var(--primary-color); margin-bottom: var(--spacing-lg);">${frameworkData.title}</h4>
        ${frameworkData.structure.map((step, index) => `
          <div style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md); background: var(--bg-card); border-radius: var(--border-radius-sm); border-left: 4px solid var(--primary-color);">
            <strong>${index + 1}. ${step.label}:</strong> ${step.desc}
            <p style="font-style: italic; color: var(--text-secondary); margin: var(--spacing-xs) 0 0 0;">Example: ${step.example}</p>
          </div>
        `).join('')}
      `;
    }
  }

  /**
   * Load conversation starters
   */
  function loadConversationStarters(situation) {
    const starters = {
      networking: [
        "What brings you to this event today?",
        "I'd love to hear more about what you do.",
        "Have you attended events like this before?",
        "What projects are you working on currently?",
        "How did you get started in your field?",
        "What's the most exciting part of your work?"
      ],
      casual: [
        "How has your week been going?",
        "Have you seen any good movies lately?",
        "What do you like to do in your free time?",
        "Any plans for the weekend?",
        "Have you tried any new restaurants recently?",
        "What's been the highlight of your day?"
      ],
      professional: [
        "Could you tell me more about your role here?",
        "What challenges is your team currently facing?",
        "How do you see the industry evolving?",
        "What skills do you think are most valuable in this field?",
        "What advice would you give someone entering this profession?",
        "What aspects of your work do you find most rewarding?"
      ]
    };

    const situationStarters = starters[situation];
    const displayElement = document.getElementById('conversation-starters-list');

    if (displayElement && situationStarters) {
      displayElement.innerHTML = `
        <div style="display: grid; gap: var(--spacing-md);">
          ${situationStarters.map((starter, index) => `
            <div style="padding: var(--spacing-md); background: var(--bg-card); border-radius: var(--border-radius-sm); border-left: 3px solid var(--secondary-color);">
              <strong style="color: var(--text-secondary);">#${index + 1}</strong> "${starter}"
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  // ========== Interactive Challenges Implementation ==========

  /**
   * Start word association game
   */
  function startWordAssociation() {
    const startWords = ["success", "travel", "music", "innovation", "friendship", "challenge", "creativity", "nature", "happiness", "courage", "wisdom", "adventure"];
    const randomWord = startWords[Math.floor(Math.random() * startWords.length)];

    wordChain = [randomWord];

    const wordElement = document.getElementById('association-word');
    const chainElement = document.getElementById('association-chain');
    const inputElement = document.getElementById('association-input');
    const inputField = document.getElementById('association-text');
    const startBtn = document.getElementById('start-association-btn');
    const submitBtn = document.getElementById('submit-association-btn');
    const resetBtn = document.getElementById('reset-association-btn');
    const timerDisplay = document.getElementById('association-timer');

    // Get selected time option
    const activeTimeBtn = document.querySelector('.association-time-btn.active');
    const selectedTime = activeTimeBtn ? activeTimeBtn.dataset.time : 'none';

    // Reset chain and display
    if (wordElement) wordElement.textContent = randomWord;
    if (chainElement) {
      chainElement.style.display = 'block';
      chainElement.innerHTML = `<p style="color: var(--text-secondary); margin-bottom: var(--spacing-sm);"><strong>Chain length:</strong> ${wordChain.length} word(s)</p><p style="color: var(--text-primary); font-size: var(--font-size-lg);"><strong>${wordChain.join(' → ')}</strong></p>`;
    }
    if (inputElement) inputElement.style.display = 'block';
    if (inputField) {
      inputField.value = '';
      inputField.focus();
    }
    if (startBtn) startBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'inline-block';
    if (resetBtn) resetBtn.style.display = 'inline-block';

    // Start timer if a time limit was selected
    if (selectedTime !== 'none') {
      const seconds = parseInt(selectedTime);
      associationRemainingSeconds = seconds;
      isAssociationTimerActive = true;

      if (timerDisplay) timerDisplay.style.display = 'block';

      const timerDisplayElement = document.getElementById('association-timer-display');

      const updateDisplay = () => {
        const mins = Math.floor(associationRemainingSeconds / 60);
        const secs = associationRemainingSeconds % 60;
        if (timerDisplayElement) {
          timerDisplayElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        }
      };

      updateDisplay();

      associationTimer = setInterval(() => {
        associationRemainingSeconds--;
        updateDisplay();

        if (associationRemainingSeconds <= 0) {
          clearInterval(associationTimer);
          associationTimer = null;
          isAssociationTimerActive = false;
          endWordAssociation();
        }
      }, 1000);
    } else {
      if (timerDisplay) timerDisplay.style.display = 'none';
    }
  }

  /**
   * Submit current word in association
   */
  function submitWordAssociation() {
    const inputField = document.getElementById('association-text');
    const userWord = inputField ? inputField.value.trim() : '';

    if (!userWord) {
      // Show inline message instead of alert
      if (inputField) {
        inputField.placeholder = 'Please type a word first!';
        inputField.style.borderColor = '#FF6B6B';
        setTimeout(() => {
          inputField.placeholder = 'Type an associated word and press Enter or click Submit...';
          inputField.style.borderColor = '';
        }, 2000);
      }
      return;
    }

    wordChain.push(userWord);

    const wordElement = document.getElementById('association-word');
    const chainElement = document.getElementById('association-chain');

    if (wordElement) wordElement.textContent = userWord;
    if (chainElement) {
      chainElement.innerHTML = `<p style="color: var(--text-secondary); margin-bottom: var(--spacing-sm);"><strong>Chain length:</strong> ${wordChain.length} word(s)</p><p style="color: var(--text-primary); font-size: var(--font-size-lg);"><strong>${wordChain.join(' → ')}</strong></p>`;
    }

    if (inputField) {
      inputField.value = '';
      inputField.focus();
    }
  }

  /**
   * Reset word association game
   */
  function resetWordAssociation() {
    // Clear timer if active
    if (associationTimer) {
      clearInterval(associationTimer);
      associationTimer = null;
      isAssociationTimerActive = false;
    }

    // Reset UI
    const wordElement = document.getElementById('association-word');
    const chainElement = document.getElementById('association-chain');
    const inputElement = document.getElementById('association-input');
    const inputField = document.getElementById('association-text');
    const startBtn = document.getElementById('start-association-btn');
    const submitBtn = document.getElementById('submit-association-btn');
    const resetBtn = document.getElementById('reset-association-btn');
    const timerDisplay = document.getElementById('association-timer');

    wordChain = [];

    if (wordElement) wordElement.textContent = 'Click "Start Round" to begin';
    if (chainElement) chainElement.style.display = 'none';
    if (inputElement) inputElement.style.display = 'none';
    if (inputField) inputField.value = '';
    if (startBtn) startBtn.style.display = 'inline-block';
    if (submitBtn) submitBtn.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
    if (timerDisplay) timerDisplay.style.display = 'none';
  }

  /**
   * End word association game (when timer runs out)
   */
  function endWordAssociation() {
    const inputField = document.getElementById('association-text');
    const submitBtn = document.getElementById('submit-association-btn');
    const wordElement = document.getElementById('association-word');

    if (inputField) {
      inputField.disabled = true;
      inputField.placeholder = 'Time\'s up!';
    }
    if (submitBtn) submitBtn.disabled = true;
    if (wordElement) {
      wordElement.textContent = `Time's up! You created a chain of ${wordChain.length} words!`;
    }

    // Show completion message
    setTimeout(() => {
      alert(`Great job! You created a word chain with ${wordChain.length} words:\n\n${wordChain.join(' → ')}`);

      // Re-enable for next round
      if (inputField) {
        inputField.disabled = false;
        inputField.placeholder = 'Type an associated word and press Enter or click Submit...';
      }
      if (submitBtn) submitBtn.disabled = false;
    }, 100);
  }

  /**
   * Load description challenge
   */
  function loadDescriptionChallenge() {
    const challenges = [
      { object: "Coffee", forbidden: ["drink", "hot", "caffeine", "cup", "morning"] },
      { object: "Smartphone", forbidden: ["phone", "mobile", "screen", "apps", "call"] },
      { object: "Book", forbidden: ["read", "pages", "story", "novel", "words"] },
      { object: "Bicycle", forbidden: ["bike", "ride", "wheels", "pedal", "cycle"] },
      { object: "Pizza", forbidden: ["food", "cheese", "Italian", "slice", "eat"] },
      { object: "Music", forbidden: ["sound", "song", "listen", "melody", "hear"] },
      { object: "Ocean", forbidden: ["water", "sea", "blue", "waves", "beach"] },
      { object: "Computer", forbidden: ["laptop", "keyboard", "screen", "type", "internet"] }
    ];

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

    const objectElement = document.getElementById('description-object');
    const forbiddenList = document.getElementById('forbidden-words-list');

    if (objectElement) objectElement.textContent = randomChallenge.object;
    if (forbiddenList) {
      forbiddenList.innerHTML = randomChallenge.forbidden.map(word =>
        `<span style="display: inline-block; margin: var(--spacing-xs); padding: var(--spacing-xs) var(--spacing-sm); background: rgba(255,255,255,0.2); border-radius: 4px;">${word}</span>`
      ).join('');
    }
  }

  /**
   * Load endurance topic
   */
  function loadEnduranceTopic() {
    const topics = [
      "The importance of lifelong learning",
      "How social media has changed society",
      "The role of creativity in problem-solving",
      "Why building good habits matters",
      "The impact of artificial intelligence on jobs",
      "The value of stepping out of your comfort zone",
      "How travel broadens perspectives",
      "The importance of work-life balance",
      "Why effective communication is crucial",
      "The future of education"
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const topicElement = document.getElementById('endurance-topic');

    if (topicElement) {
      topicElement.textContent = randomTopic;
    }
  }


  /**
   * Refresh the module (reload data)
   */
  function refresh() {
    userData = StorageManager.load();
    if (userData) {
      // If in prompts view, refresh display
      if (promptsGrid && promptsGrid.style.display !== 'none') {
        displayPrompts(currentTheme);
      }
    }
  }

  /**
   * Get user progress data
   * @returns {Object} Storytelling progress data
   */
  function getProgress() {
    return userData ? userData.storytelling : null;
  }

  // Public API
  return {
    init: init,
    startPractice: startPractice,
    refresh: refresh,
    getProgress: getProgress
  };
})();

// Log that StorytellingModule is loaded
console.log('StorytellingModule loaded successfully');
