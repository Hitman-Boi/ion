import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
        },
    },
}));

vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

describe('POST /api/v1/auth/signin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return success for valid credentials', async () => {
        const mockUser = { id: 1, email: 'test@example.com', role: 'STUDENT' };
        (prisma.user.findUnique as any).mockResolvedValue(mockUser);

        const request = new Request('http://localhost/api/v1/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.user).toEqual(mockUser);
    });

    it('should return 404 if user not found', async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);

        const request = new Request('http://localhost/api/v1/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email: 'notfound@example.com', password: 'password123' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(404);
    });

    it('should return 400 for invalid payload', async () => {
        const request = new Request('http://localhost/api/v1/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email: 'invalid-email', password: 'short' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(400);
    });
});
