// ============================================
// AUTH MODULE
// Handles Supabase authentication (sign up, login, logout, session restore)
// ============================================

const AuthModule = (function () {

  let supabase = null;
  let currentUser = null;
  let onAuthChangeCallback = null;

  // ── Init ──────────────────────────────────────────────────────────────────

  function init(onAuthChange) {
    onAuthChangeCallback = onAuthChange || null;

    const { url, anonKey } = AppConfig.supabase;
    if (!url || url === 'YOUR_SUPABASE_URL') {
      console.warn('AuthModule: Supabase credentials not configured. Auth disabled.');
      return;
    }

    supabase = window.supabase.createClient(url, anonKey);

    // Restore existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        currentUser = session.user;
        _onSignedIn(session.user);
      }
      _updateUI();
    });

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        currentUser = session.user;
        _onSignedIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        _onSignedOut();
      }
      _updateUI();
    });

    _bindModalEvents();
  }

  // ── Public auth actions ───────────────────────────────────────────────────

  async function signUp(email, password) {
    if (!supabase) return { error: 'Auth not configured' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }

  async function signIn(email, password) {
    if (!supabase) return { error: 'Auth not configured' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  function getUser() {
    return currentUser;
  }

  function isSignedIn() {
    return !!currentUser;
  }

  function getClient() {
    return supabase;
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  function _onSignedIn(user) {
    console.log('AuthModule: signed in as', user.email);
    if (onAuthChangeCallback) onAuthChangeCallback('SIGNED_IN', user);
  }

  function _onSignedOut() {
    console.log('AuthModule: signed out');
    if (onAuthChangeCallback) onAuthChangeCallback('SIGNED_OUT', null);
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  function _updateUI() {
    const btn = document.getElementById('auth-nav-btn');
    const label = document.getElementById('auth-nav-label');
    if (!btn || !label) return;

    if (currentUser) {
      label.textContent = currentUser.email.split('@')[0];
      btn.classList.add('signed-in');
      btn.title = 'Account / Sign out';
    } else {
      label.textContent = 'Sign In';
      btn.classList.remove('signed-in');
      btn.title = 'Sign in to save progress across devices';
    }
  }

  function openModal(mode) {
    // mode: 'login' | 'signup'
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    _setModalMode(mode || 'login');
    modal.classList.add('active');
    document.getElementById('auth-email').focus();
  }

  function closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
    _clearModalError();
  }

  function _setModalMode(mode) {
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const switchLink = document.getElementById('auth-switch-link');
    const switchText = document.getElementById('auth-switch-text');

    if (mode === 'signup') {
      title.textContent = 'Create Account';
      submitBtn.textContent = 'Create Account';
      switchText.textContent = 'Already have an account?';
      switchLink.textContent = 'Sign in';
      submitBtn.dataset.mode = 'signup';
    } else {
      title.textContent = 'Sign In';
      submitBtn.textContent = 'Sign In';
      switchText.textContent = "Don't have an account?";
      switchLink.textContent = 'Sign up';
      submitBtn.dataset.mode = 'login';
    }
    _clearModalError();
  }

  function _clearModalError() {
    const err = document.getElementById('auth-error');
    if (err) err.textContent = '';
  }

  function _showModalError(msg) {
    const err = document.getElementById('auth-error');
    if (err) err.textContent = msg;
  }

  function _bindModalEvents() {
    // Nav button
    const navBtn = document.getElementById('auth-nav-btn');
    if (navBtn) {
      navBtn.addEventListener('click', () => {
        if (currentUser) {
          _showAccountMenu();
        } else {
          openModal('login');
        }
      });
    }

    // Close button
    const closeBtn = document.getElementById('auth-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Backdrop click
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }

    // Switch mode link
    const switchLink = document.getElementById('auth-switch-link');
    if (switchLink) {
      switchLink.addEventListener('click', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('auth-submit-btn');
        const currentMode = submitBtn ? submitBtn.dataset.mode : 'login';
        _setModalMode(currentMode === 'login' ? 'signup' : 'login');
      });
    }

    // Submit
    const submitBtn = document.getElementById('auth-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', _handleSubmit);
    }

    // Enter key in fields
    ['auth-email', 'auth-password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('keydown', (e) => { if (e.key === 'Enter') _handleSubmit(); });
    });
  }

  async function _handleSubmit() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const mode = document.getElementById('auth-submit-btn').dataset.mode;

    if (!email || !password) {
      _showModalError('Please enter your email and password.');
      return;
    }

    const submitBtn = document.getElementById('auth-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Please wait...';
    _clearModalError();

    let result;
    if (mode === 'signup') {
      result = await signUp(email, password);
    } else {
      result = await signIn(email, password);
    }

    submitBtn.disabled = false;
    _setModalMode(mode); // restore button text

    if (result.error) {
      _showModalError(result.error.message || 'Something went wrong. Please try again.');
    } else {
      if (mode === 'signup' && result.data && !result.data.session) {
        // Email confirmation required
        _showModalError('');
        document.getElementById('auth-modal-title').textContent = 'Check your email';
        submitBtn.style.display = 'none';
        document.getElementById('auth-error').style.color = 'var(--success, #22c55e)';
        _showModalError('We sent a confirmation link to ' + email + '. Click it to activate your account.');
      } else {
        closeModal();
      }
    }
  }

  function _showAccountMenu() {
    // Simple inline dropdown — sign out option
    const existing = document.getElementById('auth-account-menu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.id = 'auth-account-menu';
    menu.className = 'auth-account-menu';
    menu.innerHTML = `
      <div class="auth-account-email">${currentUser.email}</div>
      <button id="auth-signout-btn" class="auth-signout-btn">Sign Out</button>
    `;

    const btn = document.getElementById('auth-nav-btn');
    btn.parentElement.appendChild(menu);

    document.getElementById('auth-signout-btn').addEventListener('click', () => {
      menu.remove();
      signOut();
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        if (!menu.contains(e.target) && e.target !== btn) {
          menu.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 0);
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    init,
    signUp,
    signIn,
    signOut,
    getUser,
    isSignedIn,
    getClient,
    openModal,
    closeModal
  };

})();

console.log('AuthModule loaded');
