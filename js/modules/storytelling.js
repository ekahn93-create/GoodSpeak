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
  let userData = null;

  // DOM elements
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

    // Get DOM elements
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

    // Display prompts
    displayPrompts(currentTheme);

    console.log('StorytellingModule initialized successfully');
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
