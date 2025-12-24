// Mock MSW server for testing
// This file is needed for jest.setup.ts

// Simple no-op mock server
export const server = {
    listen: () => { },
    resetHandlers: () => { },
    close: () => { }
};
