// ============================================
// ROUTER
// Handles single-page application navigation using hash-based routing
// ============================================

/**
 * Router - Module for handling navigation in the SPA
 * Uses hash-based routing (e.g., #vocabulary, #storytelling)
 */
const Router = (function() {
  // Private variables
  let currentRoute = '';

  /**
   * Route mapping - maps hash to view ID
   * The key is what appears after the # in the URL
   * The value is the ID of the view section to show
   */
  const routes = {
    '': 'home',                     // Default route (no hash)
    'home': 'home',
    'vocabulary': 'vocabulary',
    'storytelling': 'storytelling',
    'fluency': 'fluency',
    'progress': 'progress'
  };

  /**
   * Initialize the router
   * Sets up event listeners for navigation
   */
  function init() {
    console.log('Router initializing...');

    // Listen for hash changes (when user clicks navigation links)
    window.addEventListener('hashchange', handleRouteChange);

    // Listen for clicks on navigation links
    setupNavLinks();

    // Load the initial route
    handleRouteChange();

    console.log('Router initialized successfully');
  }

  /**
   * Set up click handlers for navigation links
   */
  function setupNavLinks() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));

        // Add active class to clicked link
        this.classList.add('active');
      });
    });
  }

  /**
   * Handle route changes
   * Called when the hash in the URL changes
   */
  function handleRouteChange() {
    // Get the hash from the URL (remove the # symbol)
    const hash = window.location.hash.slice(1);

    // Find the corresponding route
    const route = routes[hash] || routes[''];

    // Navigate to that route
    navigateTo(route);
  }

  /**
   * Navigate to a specific view
   * @param {string} viewName - The name of the view to show
   */
  function navigateTo(viewName) {
    console.log(`Navigating to: ${viewName}`);

    // Hide all views
    const allViews = document.querySelectorAll('.view');
    allViews.forEach(view => {
      view.classList.remove('active');
    });

    // Show the requested view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
      targetView.classList.add('active');
      currentRoute = viewName;

      // Sync the URL hash so nav tab clicks always fire hashchange
      if (window.location.hash.slice(1) !== viewName) {
        history.replaceState(null, '', `#${viewName}`);
      }

      // Update navigation links to reflect current view
      updateNavLinks(viewName);

      // Scroll to top when changing views
      window.scrollTo(0, 0);

      // Trigger a custom event that modules can listen to
      const event = new CustomEvent('viewChanged', {
        detail: { viewName: viewName }
      });
      document.dispatchEvent(event);
    } else {
      console.error(`View not found: ${viewName}-view`);
    }
  }

  /**
   * Programmatically navigate to a route
   * @param {string} hash - The hash to navigate to (without #)
   */
  function goTo(hash) {
    window.location.hash = hash;
  }

  /**
   * Get the current route
   * @returns {string} Current route name
   */
  function getCurrentRoute() {
    return currentRoute;
  }

  /**
   * Navigate back to the previous page
   * (Uses browser history)
   */
  function goBack() {
    window.history.back();
  }

  /**
   * Update navigation link active states
   * @param {string} viewName - The currently active view
   */
  function updateNavLinks(viewName) {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const linkView = link.getAttribute('data-view');

      if (linkView === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Public API
  return {
    init: init,
    navigateTo: navigateTo,
    goTo: goTo,
    getCurrentRoute: getCurrentRoute,
    goBack: goBack,
    updateNavLinks: updateNavLinks
  };
})();

// Log that Router is loaded
console.log('Router module loaded successfully');
