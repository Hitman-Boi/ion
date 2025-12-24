import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./jest.setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['lib/**/*', 'app/api/**/*', 'tests/**/*'],
            exclude: ['**/*.d.ts', '**/types/**/*', '**/types.ts', '**/types.js', '**/types/**/*'],
        },
        exclude: ['node_modules', 'e2e/**'],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
});
