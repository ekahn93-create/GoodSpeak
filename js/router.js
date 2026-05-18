// ============================================
// ROUTER
// Top-level navigation = full page loads (multi-page).
// Within a page, sub-tab navigation is still SPA (hash/JS).
// ============================================

const Router = (function() {
  // The view shown on this page — set by the HTML via <body data-page="...">
  let currentRoute = '';

  // Maps view name to page URL (for navigateTo cross-page)
  const viewToPage = {
    'home':        '/',
    'vocabulary':  '/learn',
    'fluency':     '/polish',
    'storytelling':'/practice',
    'play':        '/play',
    'progress':    '/review'
  };

  function init() {
    console.log('Router initializing...');

    // Determine current page from body data-page attribute
    const page = document.body.getAttribute('data-page') || 'home';
    currentRoute = page;

    // Activate the view for this page
    const targetView = document.getElementById(page + '-view');
    if (targetView) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      targetView.classList.add('active');
    }

    // Mark the correct nav link as active
    updateNavLinks(page);

    // Fire viewChanged so modules can initialize for this page
    document.dispatchEvent(new CustomEvent('viewChanged', { detail: { viewName: page } }));

    console.log('Router initialized for page:', page);
  }

  // navigateTo: if the target view is on this page, show it (sub-tab use).
  // If it's a different page, do a full page load.
  function navigateTo(viewName) {
    const targetPage = viewToPage[viewName];
    const thisPage   = document.body.getAttribute('data-page') || 'home';

    if (viewName === thisPage) {
      // Already on this page — no-op (or could scroll to top)
      window.scrollTo(0, 0);
      return;
    }

    // Different page — full navigation
    if (targetPage) {
      window.location.href = targetPage;
    }
  }

  function goTo(viewName) {
    navigateTo(viewName);
  }

  function getCurrentRoute() {
    return currentRoute;
  }

  function goBack() {
    window.history.back();
  }

  function updateNavLinks(viewName) {
    document.querySelectorAll('.nav-link, .mobile-tab').forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

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
