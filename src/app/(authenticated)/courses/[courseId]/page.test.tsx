"use client";

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import CourseIdPage from './page';
import { auth } from '@/auth';
import { getCourseById } from '@/app/actions/courses.actions';
import { redirect } from 'next/navigation';

// Mock auth and actions
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/app/actions/courses.actions', () => ({
    getCourseById: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

// Mock child components
vi.mock('./_components/enroll-button', () => ({
    EnrollButton: () => <button data-testid="enroll-button">Enroll Now</button>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, asChild }: any) => {
        // If asChild is true, Slot is used. In tests, we can just render children.
        return <button>{children}</button>
    },
}));

// Mock next/link
vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('CourseIdPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if not authenticated', async () => {
        vi.mocked(auth).mockResolvedValue(null);
        await CourseIdPage({ params: { courseId: 'c1' } });
        expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('redirects to courses if course not found', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);
        vi.mocked(getCourseById).mockResolvedValue(null);

        await CourseIdPage({ params: { courseId: 'c1' } });
        expect(redirect).toHaveBeenCalledWith('/courses');
    });

    it('renders course details and enroll button for non-enrolled user', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);

        const mockCourse = {
            id: 'c1',
            title: 'Test Course',
            description: 'Course Desc',
            skills: [{ id: 's1', name: 'React' }],
            instructor: { name: 'Instructor Name' },
            modules: [
                { id: 'm1', title: 'Module 1', topics: [{ id: 't1', title: 'Topic 1' }] }
            ],
            enrollments: [] // Not enrolled
        };
        vi.mocked(getCourseById).mockResolvedValue(mockCourse as any);

        const jsx = await CourseIdPage({ params: { courseId: 'c1' } });
        render(jsx);

        expect(screen.getByText('Test Course')).toBeInTheDocument();
        expect(screen.getByTestId('enroll-button')).toBeInTheDocument();
        expect(screen.getByText('Topic 1')).toBeInTheDocument();
        // Check Lock icon presence? (lucide-react not mocked, so SVG. Can assume text is "Topic 1" in non-link span)
        // Or check that "Start Learning" button is NOT present
        expect(screen.queryByText('Start Learning')).not.toBeInTheDocument();
    });

    it('renders continue learning button for enrolled user', async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: 'u1' } } as any);

        const mockCourse = {
            id: 'c1',
            title: 'Test Course',
            skills: [],
            instructor: { name: 'Inst' },
            modules: [
                {
                    id: 'm1',
                    title: 'Module 1',
                    topics: [
                        {
                            id: 't1',
                            title: 'Topic 1',
                            progress: [{ isTopicComplete: true }] // Completed
                        },
                        {
                            id: 't2',
                            title: 'Topic 2',
                            progress: [] // Incomplete
                        }
                    ]
                }
            ],
            enrollments: [{ id: 'e1' }] // Enrolled
        };
        vi.mocked(getCourseById).mockResolvedValue(mockCourse as any);

        const jsx = await CourseIdPage({ params: { courseId: 'c1' } });
        render(jsx);

        expect(screen.getByText('Continue Learning')).toBeInTheDocument();
        // Should link to topic 2 (t2)
        const link = screen.getByText('Continue Learning').closest('a');
        expect(link).toHaveAttribute('href', '/courses/c1/topic/t2');
    });
});
