// ============================================
// SYNC MODULE
// Syncs localStorage progress to/from Supabase
// so users can access their data on any device.
// ============================================

const SyncModule = (function () {

  const TABLE = 'user_progress';
  let _saveTimer = null;
  const DEBOUNCE_MS = 3000;

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Called when the user signs in.
   * Pulls cloud data and merges with local, keeping the newer copy.
   */
  async function onSignIn() {
    const client = AuthModule.getClient();
    const user = AuthModule.getUser();
    if (!client || !user) return;

    try {
      const { data, error } = await client
        .from(TABLE)
        .select('data, updated_at, subscription_status, subscription_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('SyncModule: error fetching cloud data', error);
        return;
      }

      const localData = StorageManager.load();

      if (!data) {
        // No cloud record yet — push current local data up
        console.log('SyncModule: no cloud record, uploading local data');
        await _pushToCloud(user.id, localData || StorageManager.getDefaultProgress());
        return;
      }

      // Always trust cloud data — it is the source of truth on login
      console.log('SyncModule: loading cloud data');
      StorageManager.save(data.data);

      // Cache subscription status so AuthModule.isPremium() works offline
      AuthModule.setSubscriptionStatus(data.subscription_status, data.subscription_end);

      // Notify app to re-render with updated data
      document.dispatchEvent(new CustomEvent('syncComplete'));
    } catch (err) {
      console.error('SyncModule: unexpected error during sign-in sync', err);
    }
  }

  /**
   * Called when the user signs out.
   * Nothing to do — localStorage stays intact for offline use.
   */
  function onSignOut() {
    if (_saveTimer) clearTimeout(_saveTimer);
  }

  /**
   * Debounced save — call this after any meaningful state change.
   * Multiple rapid calls collapse into one save after DEBOUNCE_MS.
   */
  function scheduleSave() {
    if (!AuthModule.isSignedIn()) return;
    if (_saveTimer) clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      saveNow();
    }, DEBOUNCE_MS);
  }

  /**
   * Immediately push current localStorage state to Supabase.
   */
  async function saveNow() {
    const client = AuthModule.getClient();
    const user = AuthModule.getUser();
    if (!client || !user) return;

    const localData = StorageManager.load();
    if (!localData) return;

    await _pushToCloud(user.id, localData);
  }

  // ── Internal ──────────────────────────────────────────────────────────────

  async function _pushToCloud(userId, data) {
    const client = AuthModule.getClient();
    if (!client) return;

    const { error } = await client
      .from(TABLE)
      .upsert(
        { user_id: userId, data: data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('SyncModule: error saving to cloud', error);
    } else {
      console.log('SyncModule: saved to cloud');
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    onSignIn,
    onSignOut,
    scheduleSave,
    saveNow
  };

})();

console.log('SyncModule loaded');
