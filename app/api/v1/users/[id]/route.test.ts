import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth-utils', () => ({
    withAuth: (handler: any) => handler,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

describe('Users ID API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/users/[id]', () => {
        it('should return a user by id', async () => {
            const mockUser = { id: 1, email: 'test@example.com' };
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);

            const request = new NextRequest('http://localhost/api/v1/users/1');
            const response = await GET(request, { params: { id: '1' } });
            const data = await response.json();

            expect(data).toEqual(mockUser);
        });

        it('should return 404 if user not found', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);

            const request = new NextRequest('http://localhost/api/v1/users/999');
            const response = await GET(request, { params: { id: '999' } });

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/v1/users/[id]', () => {
        it('should update a user', async () => {
            const mockUser = { id: 1, email: 'updated@example.com' };
            (prisma.user.update as any).mockResolvedValue(mockUser);

            const request = new NextRequest('http://localhost/api/v1/users/1', {
                method: 'PUT',
                body: JSON.stringify({ email: 'updated@example.com' }),
            });

            const response = await PUT(request, { params: { id: '1' } });
            const data = await response.json();

            expect(data).toEqual(mockUser);
        });
    });

    describe('DELETE /api/v1/users/[id]', () => {
        it('should delete a user', async () => {
            (prisma.user.delete as any).mockResolvedValue({ id: 1 });

            const request = new NextRequest('http://localhost/api/v1/users/1', {
                method: 'DELETE',
            });

            const response = await DELETE(request, { params: { id: '1' } });
            const data = await response.json();

            expect(data.success).toBe(true);
        });
    });
});
