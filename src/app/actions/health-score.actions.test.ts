import { describe, expect, it, vi, beforeEach } from 'vitest';
import { calculateHealthScore, updateCourseHealthScore } from './health-score.actions';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        course: { findUnique: vi.fn(), update: vi.fn() }
    }
}));

describe('health-score.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('calculateHealthScore', () => {
        it('calculates score correctly', async () => {
            const today = new Date();
            vi.mocked(prisma.course.findUnique).mockResolvedValue({
                averageRating: 5, // 100 points
                completionRate: 100, // 100 points
                bugReportCount: 0, // 0 penalty
                contentVelocity: 'HIGH',
                lastReviewedAt: today // Freshness 100
            } as any);

            // Formula: (100 * 0.4) + (100 * 0.3) + (100 * 0.3) - 0 = 40 + 30 + 30 = 100
            const score = await calculateHealthScore('c1');
            expect(score).toBe(100);
        });

        it('applies penalties and decay', async () => {
            const oldDate = new Date();
            oldDate.setDate(oldDate.getDate() - 200); // > 180 days TTL for HIGH

            vi.mocked(prisma.course.findUnique).mockResolvedValue({
                averageRating: 2.5, // 50 points
                completionRate: 50, // 50 points
                bugReportCount: 1, // -5 penalty
                contentVelocity: 'HIGH',
                lastReviewedAt: oldDate // Expired -> 0 freshness
            } as any);

            // Formula: (50 * 0.4) + (50 * 0.3) + (0 * 0.3) - 5
            // = 20 + 15 + 0 - 5 = 30
            const score = await calculateHealthScore('c1');
            expect(score).toBe(30);
        });
    });

    describe('updateCourseHealthScore', () => {
        it('updates course with calculated score', async () => {
            vi.mocked(prisma.course.findUnique).mockResolvedValue({
                averageRating: 5,
                completionRate: 100,
                bugReportCount: 0,
                contentVelocity: 'HIGH',
                lastReviewedAt: new Date()
            } as any);

            await updateCourseHealthScore('c1');

            expect(prisma.course.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { healthScore: 100 }
            }));
        });
    });
});
