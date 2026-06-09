// ============================================
// PROFILE MODULE
// Renders and manages the profile page
// ============================================

const ProfileModule = (function () {

  const GOAL_LABELS = {
    public_speaking:      'Public speaking',
    job_interviews:       'Job interviews',
    everyday_conversation:'Everyday conversation',
    professional_presence:'Professional presence',
    general:              'General improvement'
  };

  const STRIPE_PORTAL = 'https://billing.stripe.com/p/login/28E9AV5O54TA14vf3vdUY00';

  const TIER_COLORS = {
    Beginner:     { bg: '#f1f5f9', color: '#475569' },
    Building:     { bg: '#ede9fe', color: '#4f46e5' },
    Intermediate: { bg: '#e0f2fe', color: '#0369a1' },
    Advanced:     { bg: '#d1fae5', color: '#065f46' }
  };

  function init() {
    // Only run on the profile page
    if (!document.getElementById('profile-view')) return;

    _render();

    // Re-render if auth state changes (e.g. user just signed in)
    document.addEventListener('syncComplete', _render);
  }

  // ── Main render ──────────────────────────────────────────────────────────

  function _render() {
    const user = AuthModule.getUser();
    const signedOutEl = document.getElementById('profile-signed-out');
    const signedInEl  = document.getElementById('profile-signed-in');
    if (!signedOutEl || !signedInEl) return;

    if (!user) {
      signedOutEl.style.display = '';
      signedInEl.style.display  = 'none';
      _bindSignedOutButtons();
      return;
    }

    signedOutEl.style.display = 'none';
    signedInEl.style.display  = '';

    _renderIdentity(user);
    _renderStats();
    _renderPlan();
    _bindActions(user);
  }

  // ── Identity ─────────────────────────────────────────────────────────────

  function _renderIdentity(user) {
    const meta        = user.user_metadata || {};
    const displayName = AuthModule.getDisplayName();
    const initials    = displayName ? displayName.charAt(0).toUpperCase() : '?';

    _set('profile-avatar',       initials);
    _set('profile-display-name', displayName || '—');
    _set('profile-email',        user.email || '—');

    if (meta.first_name) {
      _set('profile-first-name-display', meta.first_name);
    }

    // Tier badge
    const tierBadge = document.getElementById('profile-tier-badge');
    if (tierBadge) {
      const tierName = _getTierName();
      const colors   = TIER_COLORS[tierName] || TIER_COLORS.Beginner;
      tierBadge.textContent = tierName;
      tierBadge.style.background = colors.bg;
      tierBadge.style.color      = colors.color;
    }

    // Pre-fill edit form
    const nickInput = document.getElementById('profile-edit-nickname');
    const goalSel   = document.getElementById('profile-edit-goal');
    if (nickInput) nickInput.value = meta.nickname || '';
    if (goalSel && meta.goal) goalSel.value = meta.goal;
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  function _renderStats() {
    const data = StorageManager.load();
    if (!data) return;

    const words         = (data.vocabulary.learned || []).length;
    const stories       = data.storytelling.totalStories || 0;
    const sessions      = data.stats.totalSessions || 0;
    const streak        = data.stats.practiceStreak || data.dailyWord.currentStreak || 0;
    const longestStreak = Math.max(
      data.stats.longestPracticeStreak || 0,
      data.dailyWord.longestStreak || 0
    );
    const days          = (data.stats.activeDates || []).length;

    _set('pstat-words',          words);
    _set('pstat-stories',        stories);
    _set('pstat-sessions',       sessions);
    _set('pstat-streak',         streak);
    _set('pstat-longest-streak', longestStreak);
    _set('pstat-days',           days);
  }

  // ── Plan ─────────────────────────────────────────────────────────────────

  function _renderPlan() {
    const badge  = document.getElementById('profile-plan-badge');
    const detail = document.getElementById('profile-plan-detail');
    const cta    = document.getElementById('profile-plan-cta');
    if (!badge || !detail || !cta) return;

    const status = AuthModule.getSubscriptionStatus();  // 'trialing' | 'active' | 'canceled' | null
    const endRaw = AuthModule.getSubscriptionEnd();
    const endDate = endRaw ? new Date(endRaw) : null;

    const fmt = (d) => d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    if (status === 'trialing') {
      badge.textContent = 'Free Trial';
      badge.className = 'profile-plan-badge free';
      const daysLeft = endDate ? Math.max(0, Math.ceil((endDate - Date.now()) / 86400000)) : null;
      detail.textContent = daysLeft !== null ? daysLeft + ' day' + (daysLeft === 1 ? '' : 's') + ' remaining' : '';
      cta.innerHTML = '<a href="' + STRIPE_PORTAL + '" target="_blank" class="profile-plan-cta-btn primary">Subscribe Now</a>';

    } else if (status === 'active') {
      badge.textContent = 'Premium';
      badge.className = 'profile-plan-badge premium';
      detail.textContent = endDate ? 'Renews ' + fmt(endDate) : '';
      cta.innerHTML = '<a href="' + STRIPE_PORTAL + '" target="_blank" class="profile-plan-cta-btn secondary">Manage Subscription</a>';

    } else if (status === 'canceled') {
      badge.textContent = 'Expired';
      badge.className = 'profile-plan-badge profile-plan-expired-badge';
      detail.textContent = endDate ? 'Ended ' + fmt(endDate) : '';
      cta.innerHTML = '<a href="' + STRIPE_PORTAL + '" target="_blank" class="profile-plan-cta-btn primary">Resubscribe</a>';

    } else {
      // No subscription record — never started a trial
      badge.textContent = 'No Plan';
      badge.className = 'profile-plan-badge free';
      detail.textContent = '';
      cta.innerHTML = '<a href="' + STRIPE_PORTAL + '" target="_blank" class="profile-plan-cta-btn primary">Start Free Trial</a>';
    }
  }

  // ── Tier helper (mirrors App.getTier logic without importing it) ──────────

  function _getTierName() {
    const data = StorageManager.load();
    if (!data) return 'Beginner';

    const words   = (data.vocabulary.learned || []).length;
    const stories = data.storytelling.totalStories || 0;
    const days    = (data.stats.activeDates || []).length;

    if (words >= 50 && stories >= 15 && days >= 30) return 'Advanced';
    if (words >= 20 && stories >= 5  && days >= 14) return 'Intermediate';
    if (words >= 5  && stories >= 1  && days >= 3)  return 'Building';
    return 'Beginner';
  }

  // ── Button bindings ───────────────────────────────────────────────────────

  function _bindSignedOutButtons() {
    const signinBtn  = document.getElementById('profile-signin-btn');
    const signupBtn  = document.getElementById('profile-signup-btn');
    if (signinBtn)  signinBtn.onclick  = () => AuthModule.openModal('login');
    if (signupBtn)  signupBtn.onclick  = () => AuthModule.openModal('signup');
  }

  function _bindActions(user) {
    // ── Edit toggle ──
    const editToggle = document.getElementById('profile-edit-toggle');
    const editForm   = document.getElementById('profile-edit-form');
    if (editToggle && editForm) {
      editToggle.onclick = () => {
        const open = editForm.classList.toggle('active');
        editToggle.textContent = open ? 'Cancel' : 'Edit';
        _set('profile-edit-msg', '');
      };
    }

    // ── Cancel edit ──
    const cancelBtn = document.getElementById('profile-cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        if (editForm) editForm.classList.remove('active');
        if (editToggle) editToggle.textContent = 'Edit';
        _set('profile-edit-msg', '');
      };
    }

    // ── Save edit ──
    const saveBtn = document.getElementById('profile-save-btn');
    if (saveBtn) {
      saveBtn.onclick = () => _saveProfile(user);
    }

    // ── Password reset ──
    const pwBtn = document.getElementById('profile-reset-pw-btn');
    if (pwBtn) {
      pwBtn.onclick = async () => {
        pwBtn.disabled = true;
        pwBtn.textContent = 'Sending...';
        const client = AuthModule.getClient();
        if (client) {
          await client.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/app'
          });
        }
        pwBtn.textContent = 'Sent';
        const fb = document.getElementById('profile-pw-feedback');
        if (fb) fb.classList.add('visible');
        setTimeout(() => {
          pwBtn.disabled = false;
          pwBtn.textContent = 'Send Reset Email';
          if (fb) fb.classList.remove('visible');
        }, 4000);
      };
    }

    // ── Sign out ──
    const signoutBtn = document.getElementById('profile-signout-btn');
    if (signoutBtn) {
      signoutBtn.onclick = () => AuthModule.signOut();
    }

    // ── Reset progress ──
    const resetBtn    = document.getElementById('profile-reset-progress-btn');
    const resetConfirm= document.getElementById('profile-reset-confirm');
    const resetYes    = document.getElementById('profile-reset-yes-btn');
    const resetNo     = document.getElementById('profile-reset-no-btn');

    if (resetBtn && resetConfirm) {
      resetBtn.onclick = () => resetConfirm.classList.add('active');
    }
    if (resetNo && resetConfirm) {
      resetNo.onclick = () => resetConfirm.classList.remove('active');
    }
    if (resetYes) {
      resetYes.onclick = () => {
        StorageManager.save(StorageManager.getDefaultProgress());
        window.location.href = '/app';
      };
    }
  }

  // ── Save profile metadata to Supabase ────────────────────────────────────

  async function _saveProfile(user) {
    const saveBtn  = document.getElementById('profile-save-btn');
    const msgEl    = document.getElementById('profile-edit-msg');
    const nickname = (document.getElementById('profile-edit-nickname') || {}).value || '';
    const goal     = (document.getElementById('profile-edit-goal')     || {}).value || '';

    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }
    if (msgEl)   { msgEl.textContent = ''; msgEl.className = 'profile-edit-msg'; }

    const client = AuthModule.getClient();
    if (!client) {
      _showEditMsg('Auth not available.', 'error');
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save'; }
      return;
    }

    const existingMeta = user.user_metadata || {};
    const { error } = await client.auth.updateUser({
      data: {
        ...existingMeta,
        nickname: nickname,
        goal:     goal
      }
    });

    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save'; }

    if (error) {
      _showEditMsg(error.message || 'Something went wrong.', 'error');
      return;
    }

    // Update display name in nav
    const updatedUser = AuthModule.getUser();
    if (updatedUser) {
      updatedUser.user_metadata = { ...existingMeta, nickname, goal };
    }

    // Re-render identity with new values
    const displayName = nickname || (existingMeta.first_name) || user.email.split('@')[0];
    _set('profile-display-name', displayName);
    _set('profile-avatar', displayName.charAt(0).toUpperCase());

    // Update nav label
    const navLabel    = document.getElementById('auth-nav-label');
    const mobileLabel = document.getElementById('mobile-auth-label');
    if (navLabel)    navLabel.textContent    = displayName;
    if (mobileLabel) mobileLabel.textContent = displayName;

    _showEditMsg('Saved!', 'success');

    // Also upsert public.profiles for leaderboard display name
    await client
      .from('profiles')
      .upsert({ user_id: user.id, display_name: displayName, updated_at: new Date().toISOString() },
               { onConflict: 'user_id' });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function _set(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function _showEditMsg(msg, type) {
    const el = document.getElementById('profile-edit-msg');
    if (!el) return;
    el.textContent = msg;
    el.className = 'profile-edit-msg ' + (type || '');
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return { init };

})();
