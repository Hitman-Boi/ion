import { defineConfig } from 'vitest/config';
import next from 'vite-plugin-next';

export default defineConfig({
  plugins: [next()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./prisma/seed.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
  },
});