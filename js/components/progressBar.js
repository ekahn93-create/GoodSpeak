// ============================================
// PROGRESS BAR COMPONENT
// Handles progress bar creation and visualization
// ============================================

/**
 * ProgressBar - Component for creating and managing progress bars
 * Provides methods to generate progress bar HTML
 */
const ProgressBar = (function() {

  /**
   * Create a progress bar element
   * @param {Object} options - Configuration object
   * @param {string} options.label - Label text for the progress bar
   * @param {number} options.percentage - Percentage value (0-100)
   * @param {string} options.variant - Color variant (default, success, warning, danger)
   * @param {boolean} options.showPercentage - Whether to show percentage text (default: true)
   * @returns {string} HTML string for the progress bar
   */
  function create(options) {
    const {
      label = 'Progress',
      percentage = 0,
      variant = 'default',
      showPercentage = true
    } = options;

    // Ensure percentage is between 0 and 100
    const safePercentage = Math.min(Math.max(percentage, 0), 100);

    // Determine variant class
    const variantClass = variant !== 'default' ? variant : '';

    return `
      <div class="progress-bar-container">
        <div class="progress-bar-label">
          <span>${label}</span>
          ${showPercentage ? `<span>${safePercentage}%</span>` : ''}
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill ${variantClass}" style="width: ${safePercentage}%">
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create multiple progress bars for vocabulary difficulties
   * @param {Object} data - User progress data
   * @param {Object} vocabularyData - Complete vocabulary dataset
   * @returns {string} HTML string for all progress bars
   */
  function createVocabularyProgress(data, vocabularyData) {
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    let html = '';

    difficulties.forEach(difficulty => {
      // Count total words in this difficulty
      const totalWords = vocabularyData[difficulty] ? vocabularyData[difficulty].length : 0;

      // Count learned words in this difficulty
      const learnedWords = data.vocabulary.learned.filter(wordId => {
        // Find if this word belongs to this difficulty
        const word = vocabularyData[difficulty]?.find(w => w.id === wordId);
        return word !== undefined;
      }).length;

      // Calculate percentage
      const percentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

      // Determine variant based on percentage
      let variant = 'default';
      if (percentage >= 75) variant = 'success';
      else if (percentage >= 50) variant = 'warning';
      else if (percentage > 0) variant = 'danger';

      // Capitalize difficulty for display
      const displayDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

      html += create({
        label: `${displayDifficulty} (${learnedWords}/${totalWords} words)`,
        percentage: percentage,
        variant: variant,
        showPercentage: true
      });
    });

    return html;
  }

  /**
   * Update an existing progress bar's percentage
   * @param {HTMLElement} progressBar - The progress bar container element
   * @param {number} newPercentage - New percentage value
   */
  function update(progressBar, newPercentage) {
    if (!progressBar) {
      console.error('Progress bar element not found');
      return;
    }

    const safePercentage = Math.min(Math.max(newPercentage, 0), 100);

    // Find the fill element
    const fill = progressBar.querySelector('.progress-bar-fill');
    const percentageText = progressBar.querySelector('.progress-bar-label span:last-child');

    if (fill) {
      // Animate the width change
      fill.style.width = `${safePercentage}%`;
    }

    if (percentageText) {
      percentageText.textContent = `${safePercentage}%`;
    }
  }

  /**
   * Create a circular progress indicator (for stats)
   * @param {Object} options - Configuration object
   * @returns {string} HTML string for circular progress
   */
  function createCircular(options) {
    const {
      percentage = 0,
      size = 100,
      strokeWidth = 10,
      color = '#4A90E2'
    } = options;

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return `
      <svg width="${size}" height="${size}" class="circular-progress">
        <circle
          stroke="#e1e8ed"
          fill="transparent"
          stroke-width="${strokeWidth}"
          r="${radius}"
          cx="${size / 2}"
          cy="${size / 2}"
        />
        <circle
          stroke="${color}"
          fill="transparent"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference} ${circumference}"
          stroke-dashoffset="${offset}"
          stroke-linecap="round"
          r="${radius}"
          cx="${size / 2}"
          cy="${size / 2}"
          style="transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dashoffset 0.5s ease;"
        />
        <text
          x="50%"
          y="50%"
          text-anchor="middle"
          dy=".3em"
          font-size="${size / 4}"
          font-weight="bold"
          fill="${color}"
        >
          ${Math.round(percentage)}%
        </text>
      </svg>
    `;
  }

  /**
   * Create a mini progress indicator (for cards)
   * @param {number} percentage - Percentage value
   * @returns {string} HTML string for mini progress
   */
  function createMini(percentage) {
    const safePercentage = Math.min(Math.max(percentage, 0), 100);

    return `
      <div class="progress-mini">
        <div class="progress-mini-bar" style="width: ${safePercentage}%"></div>
      </div>
    `;
  }

  /**
   * Animate a progress bar from 0 to target percentage
   * @param {HTMLElement} progressBar - The progress bar container
   * @param {number} targetPercentage - Target percentage
   * @param {number} duration - Animation duration in ms
   */
  function animateTo(progressBar, targetPercentage, duration = 1000) {
    if (!progressBar) return;

    const fill = progressBar.querySelector('.progress-bar-fill');
    if (!fill) return;

    const startPercentage = 0;
    const startTime = Date.now();

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentPercentage = startPercentage + (targetPercentage - startPercentage) * easeOut;

      update(progressBar, currentPercentage);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  // Public API
  return {
    create: create,
    createVocabularyProgress: createVocabularyProgress,
    createCircular: createCircular,
    createMini: createMini,
    update: update,
    animateTo: animateTo
  };
})();

