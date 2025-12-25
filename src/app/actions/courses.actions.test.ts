import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getCourses, getCourseById } from './courses.actions';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        course: { findMany: vi.fn(), findUnique: vi.fn() }
    }
}));

describe('courses.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getCourses', () => {
        it('fetches public active courses', async () => {
            const mockCourses = [{ id: 'c1', title: 'Start' }];
            vi.mocked(prisma.course.findMany).mockResolvedValue(mockCourses as any);

            const result = await getCourses();

            expect(result).toEqual(mockCourses);
            expect(prisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    isPublic: true,
                    deletedAt: null
                })
            }));
        });

        it('filters by search term', async () => {
            await getCourses({ term: 'React' });
            expect(prisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    AND: expect.arrayContaining([
                        expect.objectContaining({
                            OR: expect.arrayContaining([
                                { title: { contains: 'React', mode: 'insensitive' } },
                                { description: { contains: 'React', mode: 'insensitive' } }
                            ])
                        })
                    ])
                })
            }));
        });
    });

    describe('getCourseById', () => {
        it('returns course if public', async () => {
            vi.mocked(prisma.course.findUnique).mockResolvedValue({
                id: 'c1',
                isPublic: true,
                instructorId: 'i1',
                enrollments: []
            } as any);

            const result = await getCourseById('c1');
            expect(result).toBeDefined();
        });

        it('returns null if private and user not enrolled/instructor', async () => {
            vi.mocked(prisma.course.findUnique).mockResolvedValue({
                id: 'c1',
                isPublic: false,
                instructorId: 'i1',
                enrollments: []
            } as any);

            const result = await getCourseById('c1', 'user2'); // user2 != i1
            expect(result).toBeNull();
        });

        it('returns course if private but user is instructor', async () => {
            vi.mocked(prisma.course.findUnique).mockResolvedValue({
                id: 'c1',
                isPublic: false,
                instructorId: 'i1',
                enrollments: []
            } as any);

            const result = await getCourseById('c1', 'i1');
            expect(result).toBeDefined();
        });

        it('returns course if private but user is enrolled', async () => {
            vi.mocked(prisma.course.findUnique).mockResolvedValue({
                id: 'c1',
                isPublic: false,
                instructorId: 'i1',
                enrollments: [{ id: 'e1' }] // User has enrollment
            } as any);

            const result = await getCourseById('c1', 'user2');
            expect(result).toBeDefined();
        });
    });
});
