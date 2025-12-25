import { describe, expect, it, vi, beforeEach } from 'vitest';
import { enrollUser, completeCourse } from './enrollment.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        enrollment: { create: vi.fn() },
        course: { findUnique: vi.fn() },
        userSkill: { create: vi.fn() }
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('enrollment.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockSession = { user: { id: 'u1' } };

    describe('enrollUser', () => {
        it('creates enrollment', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            await enrollUser('c1');
            expect(prisma.enrollment.create).toHaveBeenCalledWith({
                data: { userId: 'u1', courseId: 'c1' }
            });
        });
    });

    describe('completeCourse', () => {
        it('grants skills upon completion', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.course.findUnique).mockResolvedValue({
                id: 'c1',
                skills: [{ id: 's1', name: 'Skill 1' }]
            } as any);

            await completeCourse('c1');

            expect(prisma.userSkill.create).toHaveBeenCalledWith({
                data: { userId: 'u1', skillId: 's1' }
            });
        });
    });
});
