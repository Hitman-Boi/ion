import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createModule, createTopic, reorderModules, deleteModule, updateModule } from './course-editor.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        module: { create: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
        topic: { create: vi.fn(), findFirst: vi.fn() }, // Partial mock
        course: { findUnique: vi.fn() },
        enrollment: { findUnique: vi.fn() },
        $transaction: vi.fn(),
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('course-editor.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockSession = { user: { id: 'u1' } };

    describe('createModule', () => {
        it('creates module with correct order', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            // Mock authorization check
            vi.mocked(prisma.course.findUnique).mockResolvedValue({ instructorId: 'u1' } as any);
            // Case: No existing modules
            vi.mocked(prisma.module.findFirst).mockResolvedValue(null);
            vi.mocked(prisma.module.create).mockResolvedValue({ id: 'm1', sortOrder: 1 } as any);

            const result = await createModule('c1', 'New Module');

            expect(result.sortOrder).toBe(1);
            expect(prisma.module.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ sortOrder: 1 })
            }));
        });

        it('increments sort order', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            // Mock authorization check
            vi.mocked(prisma.course.findUnique).mockResolvedValue({ instructorId: 'u1' } as any);
            vi.mocked(prisma.module.findFirst).mockResolvedValue({ sortOrder: 5 } as any);

            await createModule('c1', 'New Module');
            expect(prisma.module.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ sortOrder: 6 })
            }));
        });
    });

    describe('reorderModules', () => {
        it('updates module orders transactionally', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            // Mock authorization check
            vi.mocked(prisma.course.findUnique).mockResolvedValue({ instructorId: 'u1' } as any);
            // Mock module count for verification
            vi.mocked(prisma.module.count).mockResolvedValue(2);

            await reorderModules('c1', [{ id: 'm1', sortOrder: 0 }, { id: 'm2', sortOrder: 1 }]);

            expect(prisma.$transaction).toHaveBeenCalled();
            // We can't easily check the transaction array contents deeply without more complex mocking, 
            // but we verified the function is called.
        });
    });

    describe('updateModule', () => {
        it('updates module title', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            // Mock authorization checks
            vi.mocked(prisma.module.findUnique).mockResolvedValue({ id: 'm1', courseId: 'c1' } as any);
            vi.mocked(prisma.course.findUnique).mockResolvedValue({ instructorId: 'u1' } as any);

            await updateModule('m1', 'c1', 'Updated Title');
            expect(prisma.module.update).toHaveBeenCalledWith({
                where: { id: 'm1' },
                data: { title: 'Updated Title', description: undefined }
            });
        });
    });

    describe('deleteModule', () => {
        it('deletes module', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            // Mock authorization checks
            vi.mocked(prisma.module.findUnique).mockResolvedValue({ id: 'm1', courseId: 'c1' } as any);
            vi.mocked(prisma.course.findUnique).mockResolvedValue({ instructorId: 'u1' } as any);

            await deleteModule('m1', 'c1');
            expect(prisma.module.delete).toHaveBeenCalledWith({ where: { id: 'm1' } });
        });
    });
});
