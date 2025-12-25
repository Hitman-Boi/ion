import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getInstructorCourses, isUserInstructor } from './instructor.actions';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        course: { findMany: vi.fn(), count: vi.fn() }
    }
}));

describe('instructor.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getInstructorCourses', () => {
        it('fetches courses where user is instructor', async () => {
            const userId = 'u1';
            await getInstructorCourses(userId);

            expect(prisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: expect.arrayContaining([
                        { instructorId: userId },
                        { enrollments: expect.anything() }
                    ])
                })
            }));
        });
    });

    describe('isUserInstructor', () => {
        it('returns true if user teaches any course', async () => {
            vi.mocked(prisma.course.count).mockResolvedValue(1);
            const result = await isUserInstructor('u1');
            expect(result).toBe(true);
        });

        it('returns false if user teaches no courses', async () => {
            vi.mocked(prisma.course.count).mockResolvedValue(0);
            const result = await isUserInstructor('u1');
            expect(result).toBe(false);
        });
    });
});
