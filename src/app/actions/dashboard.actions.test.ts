import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getLearnerDashboardData, getInstructorDashboardData, getAdminDashboardData, getAdminRolesPageData } from './dashboard.actions';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: { findUnique: vi.fn(), findMany: vi.fn() },
        jobRole: { findMany: vi.fn() },
        userProgress: { findMany: vi.fn() },
        userLearningPath: { findMany: vi.fn() },
        enrollment: { findMany: vi.fn() },
        course: { findMany: vi.fn() },
        learningPath: { findMany: vi.fn() },
    }
}));

describe('dashboard.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getLearnerDashboardData', () => {
        it('fetches all required data for learner', async () => {
            const userId = 'user-1';
            const mockUser = { id: userId, targetRoles: [], skills: [] };
            const mockRoles = [{ id: 'role-1' }];
            const mockProgress = [{ topicId: 'topic-1' }];
            const mockPaths = [{ learningPath: { id: 'path-1' } }];
            const mockEnrollments = [{ course: { id: 'course-1' } }];

            vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
            vi.mocked(prisma.jobRole.findMany).mockResolvedValue(mockRoles as any);
            vi.mocked(prisma.userProgress.findMany).mockResolvedValue(mockProgress as any);
            vi.mocked(prisma.userLearningPath.findMany).mockResolvedValue(mockPaths as any);
            vi.mocked(prisma.enrollment.findMany).mockResolvedValue(mockEnrollments as any);

            const result = await getLearnerDashboardData(userId);

            expect(result).toEqual({
                user: mockUser,
                allRoles: mockRoles,
                userProgress: mockProgress,
                subscribedPaths: mockPaths,
                enrollments: mockEnrollments
            });

            expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: userId } }));
            expect(prisma.jobRole.findMany).toHaveBeenCalled();
            expect(prisma.userProgress.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId }) }));
            expect(prisma.userLearningPath.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId }) }));
            expect(prisma.enrollment.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId }) }));
        });
    });

    describe('getInstructorDashboardData', () => {
        it('fetches teaching courses', async () => {
            const userId = 'inst-1';
            const mockCourses = [{ id: 'c1', title: 'Course 1' }];

            vi.mocked(prisma.course.findMany).mockResolvedValue(mockCourses as any);

            const result = await getInstructorDashboardData(userId);

            expect(result).toEqual({ teachingCourses: mockCourses });
            expect(prisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: [
                        { instructorId: userId },
                        { enrollments: { some: { userId, role: "INSTRUCTOR" } } }
                    ]
                })
            }));
        });
    });

    describe('getAdminDashboardData', () => {
        it('fetches admin users and courses', async () => {
            const mockAdmins = [{ id: 'admin-1' }];
            const mockCourses = [{ id: 'c1' }];

            vi.mocked(prisma.user.findMany).mockResolvedValue(mockAdmins as any);
            vi.mocked(prisma.course.findMany).mockResolvedValue(mockCourses as any);

            const result = await getAdminDashboardData();

            expect(result).toEqual({ adminUsers: mockAdmins, courses: mockCourses });
            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { role: 'ADMIN' } }));
        });
    });

    describe('getAdminRolesPageData', () => {
        it('fetches roles, paths and courses', async () => {
            const mockRoles = [{ id: 'r1' }];
            const mockPaths = [{ id: 'p1' }];
            const mockCourses = [{ id: 'c1' }];

            vi.mocked(prisma.jobRole.findMany).mockResolvedValue(mockRoles as any);
            vi.mocked(prisma.learningPath.findMany).mockResolvedValue(mockPaths as any);
            vi.mocked(prisma.course.findMany).mockResolvedValue(mockCourses as any);

            const result = await getAdminRolesPageData();

            expect(result).toEqual({ roles: mockRoles, learningPaths: mockPaths, allCourses: mockCourses });
        });
    });
});
