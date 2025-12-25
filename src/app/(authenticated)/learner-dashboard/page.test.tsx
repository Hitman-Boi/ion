"use client";

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DashboardPage from './page';
import { auth } from '@/auth';
import { getLearnerDashboardData } from '@/app/actions/dashboard.actions';
import { redirect } from 'next/navigation';

// Mock auth and actions
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/app/actions/dashboard.actions', () => ({
    getLearnerDashboardData: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(() => { throw new Error('REDIRECT') }),
}));

// Mock child components
vi.mock('@/components/learning-path/journey-map', () => ({
    JourneyMap: () => <div data-testid="journey-map">Journey Map</div>,
}));

vi.mock('@/components/dashboard/role-picker', () => ({
    RolePicker: () => <div data-testid="role-picker">Role Picker</div>,
}));

vi.mock('@/components/dashboard/goal-card', () => ({
    GoalCard: ({ title }: any) => <div data-testid="goal-card">{title}</div>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock UI components
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

vi.mock('@/components/ui/progress', () => ({
    Progress: ({ value }: any) => <div data-testid="progress" data-value={value}></div>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: any) => <span>{children}</span>,
}));

describe('LearnerDashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if not authenticated', async () => {
        (auth as any).mockResolvedValue(null);
        await expect(DashboardPage()).rejects.toThrow('REDIRECT');
    });

    it('renders dashboard with data', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } } as any);

        const mockDashboardData = {
            user: {
                skills: [],
                targetRoles: [
                    {
                        id: 'r1',
                        title: 'Frontend Dev',
                        skills: [],
                        learningPaths: []
                    }
                ]
            },
            allRoles: [],
            userProgress: [],
            subscribedPaths: [],
            enrollments: [
                {
                    id: 'e1',
                    courseId: 'c1',
                    mode: 'audit',
                    course: {
                        id: 'c1',
                        title: 'React Course',
                        description: 'Learn React',
                        modules: []
                    }
                }
            ]
        };
        vi.mocked(getLearnerDashboardData).mockResolvedValue(mockDashboardData as any);

        const jsx = await DashboardPage();
        render(jsx);

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('My Courses')).toBeInTheDocument();
        expect(screen.getByText('React Course')).toBeInTheDocument();
        // GoalCard check
        expect(screen.getByText('Frontend Dev')).toBeInTheDocument();
    });

    it('renders empty states', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1', role: 'STUDENT' } } as any);

        const mockEmptyData = {
            user: { skills: [], targetRoles: [] },
            allRoles: [],
            userProgress: [],
            subscribedPaths: [],
            enrollments: []
        };
        vi.mocked(getLearnerDashboardData).mockResolvedValue(mockEmptyData as any);

        const jsx = await DashboardPage();
        render(jsx);

        expect(screen.getByText('No active enrollments')).toBeInTheDocument();
        expect(screen.getByText('Start Your Journey')).toBeInTheDocument();
    });
});
