import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from './route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock auth middleware to pass through
vi.mock('@/lib/auth-utils', () => ({
    withAuth: (handler: any) => handler,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        course: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

describe('Courses ID API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/courses/[id]', () => {
        it('should return a course by id', async () => {
            const mockCourse = { id: 1, title: 'Course 1' };
            (prisma.course.findUnique as any).mockResolvedValue(mockCourse);

            const request = new NextRequest('http://localhost/api/v1/courses/1');
            const response = await GET(request, { params: { id: '1' } });
            const data = await response.json();

            expect(data).toEqual(mockCourse);
        });

        it('should return 404 if course not found', async () => {
            (prisma.course.findUnique as any).mockResolvedValue(null);

            const request = new NextRequest('http://localhost/api/v1/courses/999');
            const response = await GET(request, { params: { id: '999' } });

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /api/v1/courses/[id]', () => {
        it('should update a course', async () => {
            const mockCourse = { id: 1, title: 'Updated Course' };
            (prisma.course.findUnique as any).mockResolvedValue({ id: 1, title: 'Old' });
            (prisma.course.update as any).mockResolvedValue(mockCourse);

            const request = new NextRequest('http://localhost/api/v1/courses/1', {
                method: 'PUT',
                body: JSON.stringify({ title: 'Updated Course' }),
            });

            const response = await PUT(request, { params: { id: '1' } });
            const data = await response.json();

            expect(data).toEqual(mockCourse);
        });
    });

    describe('DELETE /api/v1/courses/[id]', () => {
        it('should delete a course', async () => {
            (prisma.course.delete as any).mockResolvedValue({ id: 1 });

            const request = new NextRequest('http://localhost/api/v1/courses/1', {
                method: 'DELETE',
            });

            const response = await DELETE(request, { params: { id: '1' } });
            const data = await response.json();

            expect(data.success).toBe(true);
        });
    });
});
