import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createRole, updateRole, deleteRole, updateRoleLinkPath, getRoles } from './roles.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Mock auth & prisma
vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        jobRole: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('roles.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockAdminSession = { user: { id: 'admin-1', role: 'ADMIN' } };

    it('createRole creates a new role', async () => {
        vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
        vi.mocked(prisma.jobRole.create).mockResolvedValue({ id: 'r1' } as any);

        const result = await createRole({ title: 'New Role', skillIds: ['s1'] });

        expect(result).toEqual({ id: 'r1' });
        expect(prisma.jobRole.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ title: 'New Role' })
        }));
    });

    it('updateRole updates existing role', async () => {
        vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
        vi.mocked(prisma.jobRole.update).mockResolvedValue({ id: 'r1' } as any);

        await updateRole('r1', { title: 'Updated Role' });

        expect(prisma.jobRole.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'r1' },
            data: expect.objectContaining({ title: 'Updated Role' })
        }));
    });

    it('deleteRole deletes role', async () => {
        vi.mocked(auth).mockResolvedValue(mockAdminSession as any);

        await deleteRole('r1');

        expect(prisma.jobRole.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
    });

    it('updateRoleLinkPath updates role paths', async () => {
        vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
        vi.mocked(prisma.jobRole.findUnique).mockResolvedValue({
            id: 'r1',
            learningPaths: [{ id: 'old-p1', level: 'BEGINNER' }]
        } as any);

        await updateRoleLinkPath('r1', 'BEGINNER', 'new-p1');

        expect(prisma.jobRole.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'r1' },
            data: {
                learningPaths: {
                    disconnect: [{ id: 'old-p1' }],
                    connect: { id: 'new-p1' }
                }
            }
        }));
    });

    it('getRoles fetches all roles', async () => {
        vi.mocked(prisma.jobRole.findMany).mockResolvedValue([]);
        await getRoles();
        expect(prisma.jobRole.findMany).toHaveBeenCalled();
    });
});
