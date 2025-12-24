import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*', 'app/api/**/*'],
      exclude: ['**/*.d.ts', '**/types/**/*', '**/types.ts', '**/types.js', '**/types/**/*'],
    },
  },
});