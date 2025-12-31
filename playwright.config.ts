import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/',
  timeout: 60000,
  globalSetup: './tests/utils/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    testIdAttribute: 'data-testid',
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
    // Use standalone output for E2E tests (required since next.config.js uses output: 'standalone')
    command: 'node .next/standalone/server.js',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 60000, // 1 minute to allow for server to start
    env: {
      PORT: '3002',
      AUTH_SECRET: process.env.AUTH_SECRET || 'e2e-test-secret-do-not-use-in-production',
      AUTH_TRUST_HOST: 'true',
    },
  },
});