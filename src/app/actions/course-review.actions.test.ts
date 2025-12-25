import { describe, expect, it, vi, beforeEach } from 'vitest';
import { submitCourseReview } from './course-review.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        courseReview: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), aggregate: vi.fn() },
        course: { update: vi.fn() }
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('./health-score.actions', () => ({
    updateCourseHealthScore: vi.fn()
}));

describe('course-review.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockSession = { user: { id: 'u1' } };

    describe('submitCourseReview', () => {
        it('creates new review', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.courseReview.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.courseReview.aggregate).mockResolvedValue({
                _avg: { rating: 4.5 },
                _count: { rating: 10 }
            } as any);

            const result = await submitCourseReview('c1', 5, 'Great!');

            expect(result.success).toBe(true);
            expect(result.isNew).toBe(true);
            expect(prisma.courseReview.create).toHaveBeenCalled();
            expect(prisma.course.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { averageRating: 4.5, reviewCount: 10 }
            }));
        });

        it('updates existing review', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.courseReview.findUnique).mockResolvedValue({ id: 'r1' } as any);
            vi.mocked(prisma.courseReview.aggregate).mockResolvedValue({
                _avg: { rating: 4.5 },
                _count: { rating: 10 }
            } as any);

            const result = await submitCourseReview('c1', 4);

            expect(result.isNew).toBe(false);
            expect(prisma.courseReview.update).toHaveBeenCalled();
        });
    });
});
