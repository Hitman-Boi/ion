import { describe, expect, it, vi, beforeEach } from 'vitest';
import { updateUserGlobalRole, createCourse, promoteToAdmin, getNonAdminUsers, toggleCourseVisibility, deleteCourse } from './admin.actions';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// Mock auth
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: { update: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
        enrollment: { update: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
        course: { create: vi.fn(), update: vi.fn(), findMany: vi.fn() },
    }
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('admin.actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockAdminSession = { user: { id: 'admin-1', role: 'ADMIN' } };
    const mockUserSession = { user: { id: 'user-1', role: 'STUDENT' } };

    describe('authorization', () => {
        it('throws error if not admin', async () => {
            vi.mocked(auth).mockResolvedValue(mockUserSession as any);
            await expect(promoteToAdmin('test@test.com')).rejects.toThrow('Unauthorized');
        });

        it('throws error if no session', async () => {
            vi.mocked(auth).mockResolvedValue(null);
            await expect(promoteToAdmin('test@test.com')).rejects.toThrow('Unauthorized');
        });
    });

    describe('updateUserGlobalRole', () => {
        it('updates user role', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);

            await updateUserGlobalRole('u1', 'INSTRUCTOR');

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { id: 'u1' },
                data: { role: 'INSTRUCTOR' }
            });
        });
    });

    describe('createCourse', () => {
        it('creates a course', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
            vi.mocked(prisma.course.create).mockResolvedValue({ id: 'c1', title: 'New Course' } as any);

            const result = await createCourse('New Course', ['s1']);

            expect(result).toBe('c1');
            expect(prisma.course.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    title: 'New Course',
                    instructorId: 'admin-1',
                })
            }));
        });
    });

    describe('promoteToAdmin', () => {
        it('promotes user to admin', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'u1' } as any);

            await promoteToAdmin('test@email.com');

            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { email: 'test@email.com' },
                data: { role: 'ADMIN' }
            });
        });

        it('throws if user not found', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
            vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

            await expect(promoteToAdmin('test@email.com')).rejects.toThrow('User not found');
        });
    });

    describe('getNonAdminUsers', () => {
        it('fetches non-admin users', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);
            const mockUsers = [{ id: 'u1' }];
            vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as any);

            const result = await getNonAdminUsers();
            expect(result).toEqual(mockUsers);
            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { role: { not: 'ADMIN' } }
            }));
        });
    });

    describe('toggleCourseVisibility', () => {
        it('updates course visibility', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);

            await toggleCourseVisibility('c1', true);

            expect(prisma.course.update).toHaveBeenCalledWith({
                where: { id: 'c1' },
                data: { isPublic: true }
            });
        });
    });

    describe('deleteCourse', () => {
        it('soft deletes course', async () => {
            vi.mocked(auth).mockResolvedValue(mockAdminSession as any);

            await deleteCourse('c1');

            expect(prisma.course.update).toHaveBeenCalledWith({
                where: { id: 'c1' },
                data: { deletedAt: expect.any(Date) }
            });
        });
    });
});
