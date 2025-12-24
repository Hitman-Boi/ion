import { beforeAll, afterEach, afterAll, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);
import { server } from './mocks/server';

// Start the mock server before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may have overridden during a test
afterEach(() => server.resetHandlers());

// Stop the mock server after all tests
afterAll(() => server.close());