import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    testIdAttribute: 'data-test',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  reporter: 'html',
  workers: process.env.CI ? 1 : undefined,
  webServer: {
    command: 'PORT=3002 npm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  },
});