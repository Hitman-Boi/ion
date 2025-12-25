import { describe, expect, it, vi, beforeEach } from 'vitest';
import { logout } from './auth.actions';
import { signOut } from '@/auth';

// Mock auth
vi.mock('@/auth', () => ({
    signOut: vi.fn(),
}));

describe('auth.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('logout calls signOut with redirect', async () => {
        await logout();
        expect(signOut).toHaveBeenCalledWith({ redirectTo: '/' });
    });
});
