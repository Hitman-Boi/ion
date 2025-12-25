import { describe, expect, it, vi, beforeEach } from 'vitest';
import { submitContentFlag, resolveContentFlag, dismissContentFlag } from './content-flag.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        contentFlag: { create: vi.fn(), count: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
        course: { update: vi.fn(), findUnique: vi.fn() },
        user: { findUnique: vi.fn() }
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
// Mock health score action to avoid circular dependencies in tests or deep mocking
vi.mock('./health-score.actions', () => ({
    updateCourseHealthScore: vi.fn()
}));

describe('content-flag.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockSession = { user: { id: 'u1' } };

    describe('submitContentFlag', () => {
        it('creates flag and updates course', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.contentFlag.create).mockResolvedValue({ id: 'f1' } as any);
            vi.mocked(prisma.contentFlag.count).mockResolvedValue(1);

            await submitContentFlag('c1', 'OUTDATED', 'Old content');

            expect(prisma.contentFlag.create).toHaveBeenCalled();
            expect(prisma.course.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { bugReportCount: 1 }
            }));
        });
    });

    describe('resolveContentFlag', () => {
        it('resolves flag if owner', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.contentFlag.findUnique).mockResolvedValue({
                id: 'f1',
                courseId: 'c1',
                course: { instructorId: 'u1' } // Owner
            } as any);

            await resolveContentFlag('f1');

            expect(prisma.contentFlag.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'f1' },
                data: expect.objectContaining({
                    status: 'RESOLVED',
                    resolvedAt: expect.any(Date)
                })
            }));
        });

        it('throws if not owner/admin', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.contentFlag.findUnique).mockResolvedValue({
                id: 'f1',
                courseId: 'c1',
                course: { instructorId: 'other' }
            } as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'STUDENT' } as any);

            await expect(resolveContentFlag('f1')).rejects.toThrow();
        });
    });

    describe('dismissContentFlag', () => {
        it('dismisses flag if admin', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: 'ADMIN' } as any);
            vi.mocked(prisma.contentFlag.findUnique).mockResolvedValue({ id: 'f1', courseId: 'c1' } as any);

            await dismissContentFlag('f1');

            expect(prisma.contentFlag.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    status: 'DISMISSED',
                    resolvedAt: expect.any(Date)
                })
            }));
        });
    });
});
