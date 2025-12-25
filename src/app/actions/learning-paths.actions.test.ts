import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createLearningPath, subscribeToLearningPath, unsubscribeFromLearningPath, isSubscribedToLearningPath } from './learning-paths.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        learningPath: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
        userLearningPath: { create: vi.fn(), deleteMany: vi.fn(), findUnique: vi.fn() }
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('learning-paths.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockAdminSession = { user: { id: 'admin1', role: 'ADMIN' } };
    const mockUserSession = { user: { id: 'u1', role: 'STUDENT' } };

    describe('createLearningPath', () => {
        it('creates path if admin', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
            await createLearningPath({ title: 'New Path' });
            expect(prisma.learningPath.create).toHaveBeenCalled();
        });

        it('throws if unauthorized', async () => {
            vi.mocked(auth).mockResolvedValue(mockUserSession as any);
            await expect(createLearningPath({ title: 'New Path' })).rejects.toThrow('Unauthorized');
        });
    });

    describe('subscribeToLearningPath', () => {
        it('subscribes user', async () => {
            vi.mocked(auth).mockResolvedValue(mockUserSession as any);
            vi.mocked(prisma.learningPath.findUnique).mockResolvedValue({ id: 'p1' } as any);
            vi.mocked(prisma.userLearningPath.findUnique).mockResolvedValue(null); // Not yet subscribed

            await subscribeToLearningPath('p1');

            expect(prisma.userLearningPath.create).toHaveBeenCalledWith({
                data: { userId: 'u1', learningPathId: 'p1' }
            });
        });
    });

    describe('unsubscribeFromLearningPath', () => {
        it('unsubscribes user', async () => {
            vi.mocked(auth).mockResolvedValue(mockUserSession as any);
            await unsubscribeFromLearningPath('p1');
            expect(prisma.userLearningPath.deleteMany).toHaveBeenCalled();
        });
    });

    describe('isSubscribedToLearningPath', () => {
        it('returns subscription status', async () => {
            vi.mocked(auth).mockResolvedValue(mockUserSession as any);
            vi.mocked(prisma.userLearningPath.findUnique).mockResolvedValue({ id: 'sub1' } as any);

            const result = await isSubscribedToLearningPath('p1');
            expect(result).toBe(true);
        });
    });
});
