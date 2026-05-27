// ============================================
// AUTH MODULE
// Handles Supabase authentication (sign up, login, logout, session restore)
// ============================================

const AuthModule = (function () {

  let supabase = null;
  let currentUser = null;
  let onAuthChangeCallback = null;
  let initialSessionHandled = false;
  let _justSignedIn = false; // true only when user explicitly submitted the login form
  let _subscriptionStatus = null;
  let _subscriptionEnd = null;

  // ── Init ──────────────────────────────────────────────────────────────────

  function init(onAuthChange) {
    onAuthChangeCallback = onAuthChange || null;

    const { url, anonKey } = AppConfig.supabase;
    if (!url || url === 'YOUR_SUPABASE_URL') {
      console.warn('AuthModule: Supabase credentials not configured. Auth disabled.');
      return;
    }

    supabase = window.supabase.createClient(url, anonKey);

    // onAuthStateChange fires for both new logins and existing session restores.
    // INITIAL_SESSION covers the page-load case; SIGNED_IN covers new logins.
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        // Page load — session exists (returning user) or null (not logged in)
        if (session) {
          currentUser = session.user;
          if (onAuthChangeCallback) onAuthChangeCallback('INITIAL_SESSION', session.user);
        }
        _updateUI();
      } else if (event === 'SIGNED_IN') {
        // Only fire callback if this is a different user or first login
        // Ignore token refresh events (same user, already signed in)
        const isNewLogin = !currentUser || currentUser.id !== session.user.id;
        currentUser = session.user;
        _updateUI();
        if (isNewLogin) {
          // Ensure profile row exists in public.profiles for leaderboard
          _upsertProfile(session.user);
          if (onAuthChangeCallback) onAuthChangeCallback('SIGNED_IN', session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        initialSessionHandled = false;
        _onSignedOut();
        _updateUI();
      }
    });

    _bindModalEvents();
  }

  // ── Public auth actions ───────────────────────────────────────────────────

  async function signUp(email, password, firstName, lastName, nickname, goal) {
    if (!supabase) return { error: 'Auth not configured' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          nickname: nickname || '',
          goal: goal || ''
        }
      }
    });
    // If signup succeeded and we have a session, write to public.profiles
    if (!error && data && data.user) {
      await _upsertProfile(data.user, { nickname, first_name: firstName });
    }
    return { data, error };
  }

  // Writes display_name to public.profiles so the leaderboard view can join
  // against public schema instead of auth.users (which would expose PII).
  async function _upsertProfile(user, meta) {
    if (!supabase || !user) return;
    const m = meta || user.user_metadata || {};
    const displayName = m.nickname || m.first_name || user.email.split('@')[0];
    await supabase
      .from('profiles')
      .upsert({ user_id: user.id, display_name: displayName, updated_at: new Date().toISOString() },
               { onConflict: 'user_id' });
  }

  async function signIn(email, password) {
    if (!supabase) return { error: 'Auth not configured' };
    _justSignedIn = true;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) _justSignedIn = false;
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

  function _setCurrentUser(user) {
    currentUser = user;
  }

  function getDisplayName() {
    if (!currentUser) return null;
    const meta = currentUser.user_metadata || {};
    return meta.nickname || meta.first_name || currentUser.email.split('@')[0];
  }

  function isNewUser() {
    if (!currentUser) return false;
    const created = new Date(currentUser.created_at).getTime();
    const now = Date.now();
    // Consider "new" if account created within the last 60 seconds
    return (now - created) < 60000;
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
      label.textContent = getDisplayName();
      btn.classList.add('signed-in');
      btn.title = 'Account / Sign out';
    } else {
      label.textContent = 'Sign In';
      btn.classList.remove('signed-in');
      btn.title = 'Sign in to save progress across devices';
    }

    // Sync mobile tab label
    const mobileLabel = document.getElementById('mobile-auth-label');
    if (mobileLabel) {
      mobileLabel.textContent = currentUser ? getDisplayName() : 'Sign In';
    }
    const mobileTab = document.getElementById('mobile-auth-tab');
    if (mobileTab) {
      mobileTab.classList.toggle('signed-in', !!currentUser);
    }

    _updateWelcomeMessage();
  }

  function _updateWelcomeMessage() {
    const el = document.getElementById('hero-welcome');
    if (!el) return;

    if (currentUser) {
      const name = getDisplayName();
      const greeting = isNewUser() ? 'Welcome' : 'Welcome back';
      el.textContent = greeting + ', ' + name + '!';
    } else {
      el.textContent = 'Welcome to EZSpeaks';
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
    const signupFields = document.getElementById('auth-signup-fields');

    if (mode === 'signup') {
      title.textContent = 'Create Account';
      submitBtn.textContent = 'Create Account';
      submitBtn.style.display = '';
      switchText.textContent = 'Already have an account?';
      switchLink.textContent = 'Sign in';
      submitBtn.dataset.mode = 'signup';
      if (signupFields) signupFields.style.display = '';
    } else {
      title.textContent = 'Sign In';
      submitBtn.textContent = 'Sign In';
      submitBtn.style.display = '';
      switchText.textContent = "Don't have an account?";
      switchLink.textContent = 'Sign up';
      submitBtn.dataset.mode = 'login';
      if (signupFields) signupFields.style.display = 'none';
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
          _showAccountMenu(navBtn);
        } else {
          openModal('login');
        }
      });
    }

    // Mobile bottom tab bar auth button
    const mobileAuthTab = document.getElementById('mobile-auth-tab');
    if (mobileAuthTab) {
      mobileAuthTab.addEventListener('click', () => {
        if (currentUser) {
          _showAccountMenu(mobileAuthTab);
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

    // Password visibility toggle
    const pwToggle = document.getElementById('auth-password-toggle');
    const pwInput = document.getElementById('auth-password');
    if (pwToggle && pwInput) {
      pwToggle.addEventListener('click', () => {
        const isHidden = pwInput.type === 'password';
        pwInput.type = isHidden ? 'text' : 'password';
        const icon = document.getElementById('auth-eye-icon');
        if (icon) {
          icon.innerHTML = isHidden
            ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
        pwToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
      });
    }

    // Enter key in fields
    ['auth-first-name', 'auth-last-name', 'auth-nickname', 'auth-email', 'auth-password'].forEach(id => {
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

    if (mode === 'signup') {
      const firstName = document.getElementById('auth-first-name').value.trim();
      const lastName = document.getElementById('auth-last-name').value.trim();
      const goal = document.getElementById('auth-goal').value;
      if (!firstName || !lastName) {
        _showModalError('Please enter your first and last name.');
        return;
      }
      if (!goal) {
        _showModalError('Please select your main goal.');
        return;
      }
    }

    const submitBtn = document.getElementById('auth-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Please wait...';
    _clearModalError();

    let result;
    if (mode === 'signup') {
      const firstName = document.getElementById('auth-first-name').value.trim();
      const lastName = document.getElementById('auth-last-name').value.trim();
      const nickname = document.getElementById('auth-nickname').value.trim();
      const goal = document.getElementById('auth-goal').value;
      result = await signUp(email, password, firstName, lastName, nickname, goal);
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

  function _showAccountMenu(anchor) {
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

    const btn = anchor || document.getElementById('auth-nav-btn');
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

  function isNewLogin() {
    return _justSignedIn;
  }

  function setSubscriptionStatus(status, end) {
    _subscriptionStatus = status || null;
    _subscriptionEnd = end || null;
  }

  function isPremium() {
    if (!currentUser) return false;
    return _subscriptionStatus === 'active' || _subscriptionStatus === 'trialing';
  }

  function getSubscriptionStatus() {
    return _subscriptionStatus;
  }

  return {
    init,
    signUp,
    signIn,
    signOut,
    getUser,
    isSignedIn,
    isNewLogin,
    getClient,
    getDisplayName,
    openModal,
    closeModal,
    _setCurrentUser,
    setSubscriptionStatus,
    isPremium,
    getSubscriptionStatus
  };

})();

console.log('AuthModule loaded');
