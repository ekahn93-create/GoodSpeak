// ============================================
// NUDGE MODULE
// Shows contextual "next step" banners after key user actions
// ============================================

const NudgeModule = (function() {

  const AUTO_DISMISS_MS = 12000;

  /**
   * Show a nudge banner in a container element.
   * @param {string} containerId  - ID of the <div> to inject the nudge into
   * @param {string} message      - Text to display
   * @param {string} linkLabel    - CTA button label (e.g. "Go to Knowledge Check")
   * @param {string} targetView   - Router hash to navigate to (e.g. 'vocabulary')
   * @param {string|null} targetTab - Optional vocab-category or storytelling-category tab name
   */
  function show(containerId, message, linkLabel, targetView, targetTab) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Remove any existing nudge in this container
    dismiss(containerId);

    const nudge = document.createElement('div');
    nudge.className = 'nudge-banner';
    nudge.setAttribute('role', 'status');

    nudge.innerHTML = `
      <span class="nudge-message">${message}</span>
      <a class="nudge-link btn btn-sm btn-primary" href="#">${linkLabel}</a>
      <button class="nudge-close" aria-label="Dismiss">&times;</button>
    `;

    // CTA navigation
    nudge.querySelector('.nudge-link').addEventListener('click', function(e) {
      e.preventDefault();
      Router.goTo(targetView);
      if (targetTab) {
        // Slight delay to let the view render before switching tab
        setTimeout(() => switchTab(targetView, targetTab), 150);
      }
      dismiss(containerId);
    });

    // Close button
    nudge.querySelector('.nudge-close').addEventListener('click', function() {
      dismiss(containerId);
    });

    container.appendChild(nudge);

    // Auto-dismiss
    nudge._timer = setTimeout(() => dismiss(containerId), AUTO_DISMISS_MS);
  }

  /**
   * Remove the nudge from a container.
   */
  function dismiss(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const existing = container.querySelector('.nudge-banner');
    if (existing) {
      if (existing._timer) clearTimeout(existing._timer);
      existing.classList.add('nudge-exit');
      setTimeout(() => existing.remove(), 300);
    }
  }

  /**
   * Switch to the right tab after navigating to a view.
   */
  function switchTab(view, tab) {
    if (view === 'vocabulary') {
      if (typeof VocabularyModule !== 'undefined') {
        VocabularyModule.switchVocabCategory(tab);
      }
    } else if (view === 'storytelling') {
      const btn = document.querySelector(`.storytelling-category-tab[data-story-category="${tab}"]`);
      if (btn) btn.click();
    }
  }

  return { show, dismiss };
})();
