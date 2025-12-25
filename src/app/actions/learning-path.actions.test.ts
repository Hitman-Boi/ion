import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getLearningPath } from './learning-path.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
    prisma: {
        jobRole: { findUnique: vi.fn() },
        userSkill: { findMany: vi.fn() },
        course: { findMany: vi.fn() }
    }
}));

describe('learning-path.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockSession = { user: { id: 'u1' } };

    describe('getLearningPath', () => {
        it('calculates missing skills and recommends courses', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);

            // 1. Target Role with 2 skills
            vi.mocked(prisma.jobRole.findUnique).mockResolvedValue({
                id: 'r1',
                skills: [{ id: 's1' }, { id: 's2' }]
            } as any);

            // 2. User has s1 only
            vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
                { skillId: 's1' }
            ] as any);

            // 3. Courses available for s2
            const mockCourses = [
                { id: 'c1', skills: [{ id: 's2' }] }, // Covers s2
                { id: 'c2', skills: [{ id: 's3' }] }  // Irrelevant
            ];
            vi.mocked(prisma.course.findMany).mockResolvedValue(mockCourses as any);

            const result = await getLearningPath('r1');

            expect(result.status).toBe('IN_PROGRESS');
            expect(result.missingSkills).toHaveLength(1);
            expect(result.missingSkills[0].id).toBe('s2');
            expect(result.courses).toHaveLength(2); // Mock returns both, filtering logic is inside action before query? No, query uses 'in'.
            // Actually, prisma.course.findMany call inside action has WHERE clause. 
            // Since we mocked findMany to return mockCourses, the action receives them.
            // The action then sorts them.
        });

        it('returns COMPLETED if no missing skills', async () => {
            vi.mocked(auth).mockResolvedValue(mockSession as any);
            vi.mocked(prisma.jobRole.findUnique).mockResolvedValue({
                id: 'r1',
                skills: [{ id: 's1' }]
            } as any);

            vi.mocked(prisma.userSkill.findMany).mockResolvedValue([
                { skillId: 's1' }
            ] as any);

            const result = await getLearningPath('r1');
            expect(result.status).toBe('COMPLETED');
            expect(result.courses).toEqual([]);
        });
    });
});
