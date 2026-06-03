// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'https://ezspeaks.com';

module.exports = defineConfig({
  testDir: '.',
  timeout: 30_000,
  retries: 1,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'tests/report' }]],

  use: {
    baseURL: BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
