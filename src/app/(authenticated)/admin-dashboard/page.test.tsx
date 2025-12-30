"use client";

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminPage from './page';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Import actions to mock them using vi.mocked() later
import { getAdminDashboardData } from '@/app/actions/dashboard.actions';
import { getRoles } from '@/app/actions/roles.actions';
import { getSkillGapData, getSkills } from '@/app/actions/skills.actions';

vi.mock('@/app/actions/dashboard.actions', () => ({
    getAdminDashboardData: vi.fn(),
}));

vi.mock('@/app/actions/roles.actions', () => ({
    getRoles: vi.fn(),
}));

vi.mock('@/app/actions/skills.actions', () => ({
    getSkillGapData: vi.fn(),
    getSkills: vi.fn(),
}));

// Mock auth and redirect
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(() => { throw new Error('REDIRECT') }),
}));

// Mock child components to verify props
vi.mock('./courses-list', () => ({
    CoursesList: ({ courses }: any) => <div data-testid="courses-list">{courses.length} courses</div>,
}));

vi.mock('@/components/course/create-course-button', () => ({
    CreateCourseButton: () => <div data-testid="create-course-button">Create Course</div>,
}));

vi.mock('./manage-admins-sheet', () => ({
    ManageAdminsSheet: ({ initialAdmins }: any) => <div data-testid="manage-admins-sheet">{initialAdmins.length} admins</div>,
}));

vi.mock('./manage-skills-sheet', () => ({
    ManageSkillsSheet: ({ initialGapData }: any) => <div data-testid="manage-skills-sheet">{initialGapData.length} gaps</div>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects if user is not admin', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { role: 'STUDENT' } } as any);

        await expect(AdminPage()).rejects.toThrow('REDIRECT');

        expect(redirect).toHaveBeenCalledWith('/learner-dashboard');
    });

    it('renders dashboard if user is admin', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { role: 'ADMIN' } } as any);

        const mockAdminData = {
            adminUsers: [{ id: 'u1' }],
            courses: [{ id: 'c1' }]
        };
        vi.mocked(getAdminDashboardData).mockResolvedValue(mockAdminData as any);
        vi.mocked(getRoles).mockResolvedValue([{ id: 'r1' }] as any);
        vi.mocked(getSkillGapData).mockResolvedValue([{ id: 'g1' }] as any);
        vi.mocked(getSkills).mockResolvedValue([{ id: 's1' }] as any);

        // Since it's an async server component, we need to await it
        const jsx = await AdminPage();
        render(jsx);

        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('courses-list')).toHaveTextContent('1 courses');
        expect(screen.getByTestId('manage-admins-sheet')).toHaveTextContent('1 admins');
        expect(screen.getByTestId('manage-skills-sheet')).toHaveTextContent('1 gaps');
        expect(screen.getByText('Manage Learning Paths & Roles')).toBeInTheDocument();
    });
});
