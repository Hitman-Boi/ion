import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Mock auth middleware to pass through
vi.mock('@/lib/auth-utils', () => ({
    withAuth: (handler: any) => handler,
}));

vi.mock('@/lib/prisma', () => ({
    prisma: {
        course: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
    },
}));

describe('Courses API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('GET /api/v1/courses', () => {
        it('should return a list of courses', async () => {
            const mockCourses = [{ id: 1, title: 'Course 1' }];
            (prisma.course.findMany as any).mockResolvedValue(mockCourses);

            const request = new NextRequest('http://localhost/api/v1/courses');
            const response = await GET(request);
            const data = await response.json();

            expect(data).toEqual(mockCourses);
        });
    });

    describe('POST /api/v1/courses', () => {
        it('should create a course', async () => {
            const mockCourse = { id: 1, title: 'New Course', instructorId: 1 };
            (prisma.course.create as any).mockResolvedValue(mockCourse);

            const request = new NextRequest('http://localhost/api/v1/courses', {
                method: 'POST',
                body: JSON.stringify({ title: 'New Course' }),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual(mockCourse);
        });
    });
});
