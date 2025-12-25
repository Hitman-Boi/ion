import { describe, expect, it, vi, beforeEach } from 'vitest';
import { markVideoComplete, submitQuiz } from './progress.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        userProgress: { upsert: vi.fn(), update: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
        topicResource: { findMany: vi.fn() },
        topic: { findUnique: vi.fn() },
        course: { findUnique: vi.fn() },
        userSkill: { upsert: vi.fn() }
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('progress.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockSession = { user: { id: 'u1' } };

    describe('markVideoComplete', () => {
        it('updates progress and checks completion', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            // Upsert returns progress
            vi.mocked(prisma.userProgress.upsert).mockResolvedValue({ id: 'prog1', videoCompleted: true } as any);

            // checkTopicCompletion mocks
            vi.mocked(prisma.topicResource.findMany).mockResolvedValue([{ type: 'VIDEO' }] as any); // Only video exists

            await markVideoComplete('t1');

            expect(prisma.userProgress.upsert).toHaveBeenCalled();
            // Should trigger update isTopicComplete = true
            expect(prisma.userProgress.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { isTopicComplete: true }
            }));
        });
    });

    describe('submitQuiz', () => {
        it('updates score and completion', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.userProgress.upsert).mockResolvedValue({ id: 'prog1', quizPassed: true } as any);
            vi.mocked(prisma.userProgress.findUnique).mockResolvedValue({ id: 'prog1', quizPassed: true } as any);
            vi.mocked(prisma.topicResource.findMany).mockResolvedValue([{ type: 'QUIZ' }] as any);

            const result = await submitQuiz('t1', 80);

            expect(result.passed).toBe(true);
            expect(prisma.userProgress.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { isTopicComplete: true }
            }));
        });
    });
});
