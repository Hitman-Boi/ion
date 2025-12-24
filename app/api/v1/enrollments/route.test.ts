import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth-utils', () => ({
    withAuth: (handler: any) => handler,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        enrollment: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
        user: {
            findUnique: vi.fn(),
        },
        course: {
            findUnique: vi.fn(),
        },
    },
}));

describe('Enrollments API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/enrollments', () => {
        it('should return a list of enrollments', async () => {
            const mockEnrollments = [{ id: 1, userId: 1, courseId: 1 }];
            (prisma.enrollment.findMany as any).mockResolvedValue(mockEnrollments);

            const request = new NextRequest('http://localhost/api/v1/enrollments');
            const response = await GET(request);
            const data = await response.json();

            expect(data).toEqual(mockEnrollments);
        });
    });

    describe('POST /api/v1/enrollments', () => {
        it('should create an enrollment', async () => {
            const mockEnrollment = { id: 1, userId: 1, courseId: 1 };
            (prisma.user.findUnique as any).mockResolvedValue({ id: 1 });
            (prisma.course.findUnique as any).mockResolvedValue({ id: 1 });
            (prisma.enrollment.create as any).mockResolvedValue(mockEnrollment);

            const request = new NextRequest('http://localhost/api/v1/enrollments', {
                method: 'POST',
                body: JSON.stringify({ userId: 1, courseId: 1 }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockEnrollment);
        });

        it('should return 404 if user or course does not exist', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);

            const request = new NextRequest('http://localhost/api/v1/enrollments', {
                method: 'POST',
                body: JSON.stringify({ userId: 999, courseId: 1 }),
            });

            const response = await POST(request);
            expect(response.status).toBe(404);
        });
    });
});
