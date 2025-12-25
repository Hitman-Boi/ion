import { describe, expect, it, vi, beforeEach } from 'vitest';
import { addTargetRole, removeTargetRole } from './user-goals.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: { update: vi.fn() }
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('user-goals.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockSession = { user: { id: 'u1' } };

    describe('addTargetRole', () => {
        it('connects role to user', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            const result = await addTargetRole('r1');
            expect(result.success).toBe(true);
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: {
                    targetRoles: { connect: { id: 'r1' } }
                }
            }));
        });
    });

    describe('removeTargetRole', () => {
        it('disconnects role from user', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            const result = await removeTargetRole('r1');
            expect(result.success).toBe(true);
            expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
                data: {
                    targetRoles: { disconnect: { id: 'r1' } }
                }
            }));
        });
    });
});
