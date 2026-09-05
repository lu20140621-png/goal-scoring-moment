const {defineConfig} = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/browser',
  timeout: 45_000,
  expect: {timeout: 5_000},
  fullyParallel: false,
  forbidOnly: true,
  retries: 1,
  reporter: [['line'], ['html', {outputFolder: 'playwright-report', open: 'never'}]],
  outputDir: 'test-results',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173/strategy-cards.html',
    reuseExistingServer: false,
    timeout: 15_000,
  },
});
