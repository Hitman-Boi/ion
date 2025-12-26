"use client";

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CourseSidebar } from './course-sidebar';

// Mock next/navigation
const mockUseSearchParams = vi.hoisted(() => vi.fn(() => new URLSearchParams('')));
vi.mock('next/navigation', () => ({
    usePathname: () => '/courses/course-1/topic/topic-1',
    useSearchParams: mockUseSearchParams,
}));

// Mock UI components
vi.mock('@/lib/utils', () => ({
    cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

vi.mock('@/components/ui/tooltip', () => ({
    TooltipProvider: ({ children }: any) => <div>{children}</div>,
    Tooltip: ({ children }: any) => <div>{children}</div>,
    TooltipTrigger: ({ children, asChild }: any) => <div>{children}</div>,
    TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

describe('CourseSidebar', () => {
    const mockCourse = {
        id: 'course-1',
        title: 'Introduction to TypeScript',
        description: 'Learn TypeScript',
        isPublic: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        instructorId: 'instructor-1',
        modules: [
            {
                id: 'module-1',
                title: 'Getting Started',
                sortOrder: 1,
                courseId: 'course-1',
                topics: [
                    {
                        id: 'topic-1',
                        title: 'Introduction',
                        sortOrder: 1,
                        moduleId: 'module-1',
                        progress: [{ isTopicComplete: true }],
                    },
                    {
                        id: 'topic-2',
                        title: 'Setup Environment',
                        sortOrder: 2,
                        moduleId: 'module-1',
                        progress: [],
                    },
                ],
            },
            {
                id: 'module-2',
                title: 'Advanced Topics',
                sortOrder: 2,
                courseId: 'course-1',
                topics: [
                    {
                        id: 'topic-3',
                        title: 'Type Guards',
                        sortOrder: 1,
                        moduleId: 'module-2',
                        progress: [],
                    },
                ],
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the sidebar', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
        });

        it('renders course title when expanded', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            // Sidebar starts expanded by default
            expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
        });

        it('renders module titles when expanded', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            // Sidebar starts expanded by default
            expect(screen.getByText('Getting Started')).toBeInTheDocument();
            expect(screen.getByText('Advanced Topics')).toBeInTheDocument();
        });

        it('renders topic links when expanded', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            // Sidebar starts expanded by default
            expect(screen.getByText('Introduction')).toBeInTheDocument();
            expect(screen.getByText('Setup Environment')).toBeInTheDocument();
            expect(screen.getByText('Type Guards')).toBeInTheDocument();
        });
    });

    describe('Progress Display', () => {
        it('displays progress percentage when expanded', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={75} />);
            // Sidebar starts expanded by default
            expect(screen.getByText('75%')).toBeInTheDocument();
        });

        it('shows Course Progress label when expanded', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            // Sidebar starts expanded by default
            expect(screen.getByText('Course Progress')).toBeInTheDocument();
        });
    });

    describe('Toggle Behavior', () => {
        it('starts in expanded state', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            // When expanded, course title should be visible
            expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
        });

        it('collapses when toggle button is clicked', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            const toggleButton = screen.getByRole('button');
            fireEvent.click(toggleButton);
            // Course title should not be visible when collapsed
            expect(screen.queryByText('Introduction to TypeScript')).not.toBeInTheDocument();
        });

        it('expands when toggle button is clicked while collapsed', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            const toggleButton = screen.getByRole('button');

            // Collapse first
            fireEvent.click(toggleButton);
            expect(screen.queryByText('Introduction to TypeScript')).not.toBeInTheDocument();

            // Expand
            fireEvent.click(toggleButton);
            expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
        });
    });

    describe('Topic Links', () => {
        it('generates correct links for topics', () => {
            render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            // Sidebar starts expanded by default
            const links = screen.getAllByRole('link');
            expect(links[0]).toHaveAttribute('href', '/courses/course-1/topic/topic-1');
        });
    });

    describe('Preview Mode', () => {
        it('returns null when in preview mode', () => {
            mockUseSearchParams.mockReturnValue(new URLSearchParams('preview=true'));

            const { container } = render(<CourseSidebar course={mockCourse as any} progressCount={50} />);
            expect(container).toBeEmptyDOMElement();
        });
    });
});
