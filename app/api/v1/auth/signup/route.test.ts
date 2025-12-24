import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

describe('POST /api/v1/auth/signup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a new user successfully', async () => {
        (prisma.user.findUnique as any).mockResolvedValue(null);
        const mockNewUser = { id: 2, email: 'new@example.com', role: 'STUDENT' };
        (prisma.user.create as any).mockResolvedValue(mockNewUser);

        const request = new Request('http://localhost/api/v1/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email: 'new@example.com', password: 'password123' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(data.success).toBe(true);
        expect(data.user).toEqual(mockNewUser);
    });

    it('should return 409 if user already exists', async () => {
        (prisma.user.findUnique as any).mockResolvedValue({ id: 1, email: 'existing@example.com' });

        const request = new Request('http://localhost/api/v1/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ email: 'existing@example.com', password: 'password123' }),
        });

        const response = await POST(request);
        expect(response.status).toBe(409);
    });
});
