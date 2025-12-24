import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth-utils', () => ({
    withAuth: (handler: any) => handler,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findMany: vi.fn(),
            create: vi.fn(),
            findUnique: vi.fn(),
        },
    },
}));

describe('Users API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/users', () => {
        it('should return a list of users', async () => {
            const mockUsers = [{ id: 1, email: 'test@example.com' }];
            (prisma.user.findMany as any).mockResolvedValue(mockUsers);

            const request = new NextRequest('http://localhost/api/v1/users');
            const response = await GET(request);
            const data = await response.json();

            expect(data).toEqual(mockUsers);
        });
    });

    describe('POST /api/v1/users', () => {
        it('should create a user', async () => {
            const mockUser = { id: 1, email: 'new@example.com', role: 'STUDENT' };
            (prisma.user.findUnique as any).mockResolvedValue(null);
            (prisma.user.create as any).mockResolvedValue(mockUser);

            const request = new NextRequest('http://localhost/api/v1/users', {
                method: 'POST',
                body: JSON.stringify({ email: 'new@example.com', password: 'password123', role: 'STUDENT' }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockUser);
        });

        it('should return 409 if user already exists', async () => {
            (prisma.user.findUnique as any).mockResolvedValue({ id: 1 });

            const request = new NextRequest('http://localhost/api/v1/users', {
                method: 'POST',
                body: JSON.stringify({ email: 'existing@example.com', password: 'password123', role: 'STUDENT' }),
            });

            const response = await POST(request);
            expect(response.status).toBe(409);
        });
    });
});
