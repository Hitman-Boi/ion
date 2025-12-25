import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createSkill, searchSkills, createSkillTarget, getSkillGapData, getSkills } from './skills.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        skill: { create: vi.fn(), findFirst: vi.fn(), findMany: vi.fn(), findUnique: vi.fn() },
        skillTarget: { create: vi.fn(), findMany: vi.fn() }
    }
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('skills.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockAdminSession = { user: { role: 'ADMIN' } };
    const mockInstructorSession = { user: { role: 'INSTRUCTOR' } };

    describe('createSkill', () => {
        it('allows admin to create skill', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
            vi.mocked(prisma.skill.create).mockResolvedValue({ id: 's1' } as any);

            await createSkill({ name: 'React' });
            expect(prisma.skill.create).toHaveBeenCalled();
        });

        it('allows instructor to create skill', async () => {
            vi.mocked(auth).mockResolvedValue(mockInstructorSession as any);
            vi.mocked(prisma.skill.create).mockResolvedValue({ id: 's1' } as any);

            await createSkill({ name: 'React' });
            expect(prisma.skill.create).toHaveBeenCalled();
        });

        it('returns existing skill if found', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
            vi.mocked(prisma.skill.findFirst).mockResolvedValue({ id: 's1', name: 'React' } as any);

            const result = await createSkill({ name: 'React' });
            expect(result).toEqual({ id: 's1', name: 'React' });
            expect(prisma.skill.create).not.toHaveBeenCalled();
        });
    });

    describe('searchSkills', () => {
        it('returns all skills if query is empty', async () => {
            await searchSkills('');
            expect(prisma.skill.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
        });

        it('searches skills by name', async () => {
            await searchSkills('Re');
            expect(prisma.skill.findMany).toHaveBeenCalledWith({
                where: { name: { contains: 'Re', mode: 'insensitive' } },
                orderBy: { name: 'asc' }
            });
        });
    });

    describe('createSkillTarget', () => {
        it('creates skill target', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
            await createSkillTarget({ skillName: 'React', targetCount: 10 });
            expect(prisma.skillTarget.create).toHaveBeenCalled();
        });
    });

    describe('getSkillGapData', () => {
        it('calculates skill gap', async () => {
            vi.mocked(prisma.skillTarget.findMany).mockResolvedValue([
                { skillName: 'React', targetCount: 10 }
            ] as any);

            vi.mocked(prisma.skill.findUnique).mockResolvedValue({
                userSkills: [1, 2, 3] // 3 users have this skill
            } as any);

            const result = await getSkillGapData();
            // Gap should be 10 - 3 = 7
            expect(result[0].gap).toBe(7);
            expect(result[0].currentCount).toBe(3);
        });
    });
});
