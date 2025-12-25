"use client";

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import InstructorDashboardPage from './page';
import { auth } from '@/auth';
import { getInstructorDashboardData } from '@/app/actions/dashboard.actions';
import { redirect } from 'next/navigation';

// Mock auth and actions
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/app/actions/dashboard.actions', () => ({
    getInstructorDashboardData: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(() => { throw new Error('REDIRECT') }),
}));

// Mock child components
vi.mock('@/components/create-course-button', () => ({
    CreateCourseButton: () => <div data-testid="create-course-button">Create Course Button</div>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h2>{children}</h2>,
    CardDescription: ({ children }: any) => <p>{children}</p>,
    CardContent: ({ children }: any) => <div>{children}</div>,
    CardFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children }: any) => <button>{children}</button>,
}));

describe('InstructorDashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if not authenticated', async () => {
        (auth as any).mockResolvedValue(null);
        await expect(InstructorDashboardPage()).rejects.toThrow('REDIRECT');
    });

    it('renders teaching courses for instructor', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'INSTRUCTOR' } } as any);

        const mockData = {
            teachingCourses: [
                { id: 'c1', title: 'My Course', _count: { enrollments: 10 } }
            ]
        };
        vi.mocked(getInstructorDashboardData).mockResolvedValue(mockData as any);

        const jsx = await InstructorDashboardPage();
        render(jsx);

        expect(screen.getByText('Instructor Dashboard')).toBeInTheDocument();
        expect(screen.getByText('My Course')).toBeInTheDocument();
        expect(screen.getByText('10 Students Enrolled')).toBeInTheDocument();
        // Not admin, so no Create New Course card? 
        // Logic says `isInstructor = isAdmin || teachingCourses.length > 0`.
        // `Create New Course` card is rendered if `isAdmin`.
        expect(screen.queryByText('Create New Course')).not.toBeInTheDocument();
    });

    it('renders create card for admin', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'ADMIN' } } as any);
        const mockData = { teachingCourses: [] };
        vi.mocked(getInstructorDashboardData).mockResolvedValue(mockData as any);

        const jsx = await InstructorDashboardPage();
        render(jsx);

        expect(screen.getByText('Create New Course')).toBeInTheDocument();
    });

    it('renders empty state for non-instructor', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } } as any);
        const mockData = { teachingCourses: [] };
        vi.mocked(getInstructorDashboardData).mockResolvedValue(mockData as any);

        const jsx = await InstructorDashboardPage();
        render(jsx);

        expect(screen.getByText('Become an Instructor')).toBeInTheDocument();
    });
});
