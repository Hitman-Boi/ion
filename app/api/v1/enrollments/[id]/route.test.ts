import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, DELETE } from './route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth-utils', () => ({
    withAuth: (handler: any) => handler,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        enrollment: {
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

describe('Enrollments ID API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/enrollments/[id]', () => {
        it('should return an enrollment by id', async () => {
            const mockEnrollment = { id: 1, userId: 1, courseId: 1 };
            (prisma.enrollment.findUnique as any).mockResolvedValue(mockEnrollment);

            const request = new NextRequest('http://localhost/api/v1/enrollments/1');
            const response = await GET(request, { params: { id: '1' } });
            const data = await response.json();

            expect(data).toEqual(mockEnrollment);
        });

        it('should return 404 if enrollment not found', async () => {
            (prisma.enrollment.findUnique as any).mockResolvedValue(null);

            const request = new NextRequest('http://localhost/api/v1/enrollments/999');
            const response = await GET(request, { params: { id: '999' } });

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /api/v1/enrollments/[id]', () => {
        it('should delete an enrollment', async () => {
            (prisma.enrollment.findUnique as any).mockResolvedValue({ id: 1 });
            (prisma.enrollment.delete as any).mockResolvedValue({ id: 1 });

            const request = new NextRequest('http://localhost/api/v1/enrollments/1', {
                method: 'DELETE',
            });

            const response = await DELETE(request, { params: { id: '1' } });
            const data = await response.json();

            expect(data.success).toBe(true);
        });
    });
});
