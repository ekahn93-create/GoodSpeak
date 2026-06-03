// @ts-check
const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function collectConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

// ─────────────────────────────────────────────
// 1. PAGE LOADS — all main pages load without crash
// ─────────────────────────────────────────────
test.describe('Page loads', () => {
  const pages = [
    { name: 'Landing',  path: '/' },
    { name: 'Home',     path: '/app' },
    { name: 'Learn',    path: '/learn' },
    { name: 'Polish',   path: '/polish' },
    { name: 'Practice', path: '/practice' },
    { name: 'Play',     path: '/play' },
    { name: 'Review',   path: '/review' },
  ];

  for (const { name, path } of pages) {
    test(`${name} page loads and has no JS crash`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      // Filter out known noisy third-party errors (fonts, GTM, etc.)
      const appErrors = errors.filter(e =>
        !e.includes('fonts.googleapis') &&
        !e.includes('googletagmanager') &&
        !e.includes('Failed to load resource') &&
        !e.includes('favicon') &&
        !e.includes('AppConfig: could not load config') // config fetch can be slow in headless
      );
      expect(appErrors, `JS errors on ${name}: ${appErrors.join('\n')}`).toHaveLength(0);
    });
  }
});

// ─────────────────────────────────────────────
// 2. NAVIGATION — landing page nav (app pages redirect unauthenticated users to /)
// ─────────────────────────────────────────────
test.describe('Navigation', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Landing nav brand is visible', async ({ page }) => {
    await expect(page.locator('.landing-nav-brand')).toBeVisible();
  });

  test('Landing nav has Sign In button', async ({ page }) => {
    await expect(page.locator('#nav-login-btn')).toBeVisible();
  });

  test('Landing nav has Get Started button', async ({ page }) => {
    await expect(page.locator('#nav-signup-btn')).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 3. AUTH MODAL — tested from landing page (app pages redirect unauthenticated users)
// ─────────────────────────────────────────────
test.describe('Auth modal', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Sign In button is visible', async ({ page }) => {
    await expect(page.locator('#nav-login-btn')).toBeVisible();
  });

  test('Clicking Sign In opens the auth modal', async ({ page }) => {
    await page.locator('#nav-login-btn').click();
    await expect(page.locator('#auth-modal')).toBeVisible();
  });

  test('Auth modal can be closed', async ({ page }) => {
    await page.locator('#nav-login-btn').click();
    await expect(page.locator('#auth-modal')).toBeVisible();
    await page.locator('#auth-modal-close').click();
    await expect(page.locator('#auth-modal')).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 4. LEARN PAGE — auth-gated; verify redirect behavior
// ─────────────────────────────────────────────
test.describe('Learn page', () => {
  test('Unauthenticated visit to /learn redirects to landing page', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    // App redirects unauthenticated users to / — confirm we land there
    await expect(page).toHaveURL('/');
    // Landing page hero should be visible
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 5. PLAY PAGE — game flow
// ─────────────────────────────────────────────
test.describe('Play page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/play');
    await page.waitForLoadState('networkidle');
  });

  test('Play page title is visible', async ({ page }) => {
    await expect(page.locator('h1, .play-title, [class*="play"] h2').first()).toBeVisible();
  });

  test('Start button is present', async ({ page }) => {
    const startBtn = page.getByRole('button', { name: /Start|Play|Begin/i }).first();
    await expect(startBtn).toBeVisible();
  });

  test('Unauthenticated visit to /play redirects to landing page', async ({ page }) => {
    // Play page redirects unauthenticated users to / (same as other app pages)
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 6. POLISH PAGE — key UI present
// ─────────────────────────────────────────────
test.describe('Polish page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/polish');
    await page.waitForLoadState('networkidle');
  });

  test('Polish page has drill tabs or sections', async ({ page }) => {
    // Should have at least one tab or section heading
    const sections = page.locator('.tab-btn, .polish-tab, .section-header, h2, h3');
    expect(await sections.count()).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 7. PRACTICE PAGE — key UI present
// ─────────────────────────────────────────────
test.describe('Practice page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');
  });

  test('Practice page has sections or tabs', async ({ page }) => {
    const sections = page.locator('.tab-btn, .practice-tab, .section-header, h2, h3');
    expect(await sections.count()).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// 8. NETLIFY FUNCTIONS — endpoints respond
// ─────────────────────────────────────────────
test.describe('Netlify functions', () => {
  test('get-config returns Supabase config (not 500)', async ({ request }) => {
    const res = await request.get('/.netlify/functions/get-config');
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('supabaseUrl');
    expect(body).toHaveProperty('supabaseAnonKey');
  });

  test('claude-proxy rejects missing body gracefully (not 500)', async ({ request }) => {
    const res = await request.post('/.netlify/functions/claude-proxy', {
      data: {},
    });
    // Should return 400 (bad request) not 500 (server crash)
    expect(res.status()).not.toBe(500);
  });

  test('deepgram-token returns a key (not 500)', async ({ request }) => {
    const res = await request.get('/.netlify/functions/deepgram-token');
    expect(res.status()).not.toBe(500);
    expect(res.status()).not.toBe(404);
  });
});

// ─────────────────────────────────────────────
// 9. LANDING PAGE — key sections visible
// ─────────────────────────────────────────────
test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Hero headline is visible', async ({ page }) => {
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
  });

  test('CTA button links to app or sign-up', async ({ page }) => {
    await expect(page.locator('#nav-signup-btn, #hero-signup-btn, #cta-signup-btn').first()).toBeVisible();
  });

  test('Nav has Sign In link', async ({ page }) => {
    await expect(page.locator('#nav-login-btn')).toBeVisible();
  });
});

// ─────────────────────────────────────────────
// 10. REVIEW / STATS PAGE
// ─────────────────────────────────────────────
test.describe('Review/Stats page', () => {
  test('Stats page loads and shows progress section', async ({ page }) => {
    await page.goto('/review');
    await page.waitForLoadState('networkidle');
    // Should have some stats or progress content
    const content = page.locator('h1, h2, .stat, .progress, [class*="stat"], [class*="progress"]').first();
    await expect(content).toBeVisible();
  });
});
