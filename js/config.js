// ============================================
// APP CONFIG
// Credentials are loaded at runtime from /.netlify/functions/get-config
// so they are never stored in the repository.
// ============================================

const AppConfig = {
  supabase: {
    url: null,
    anonKey: null
  },

  // Call once at app startup before AuthModule.init()
  async load() {
    try {
      const res = await fetch('/.netlify/functions/get-config');
      if (!res.ok) throw new Error('Config fetch failed');
      const cfg = await res.json();
      this.supabase.url = cfg.supabaseUrl;
      this.supabase.anonKey = cfg.supabaseAnonKey;
    } catch (err) {
      console.error('AppConfig: could not load config', err);
    }
  }
};
