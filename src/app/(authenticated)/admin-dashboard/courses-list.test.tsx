import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CoursesList } from './courses-list';

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children, variant, ...props }: any) => (
        <span data-testid="badge" data-variant={variant} {...props}>{children}</span>
    ),
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input data-testid="search-input" {...props} />,
}));

vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children, ...props }: any) => <div data-testid="scroll-area" {...props}>{children}</div>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

describe('CoursesList', () => {
    const mockCourses = [
        {
            id: '1',
            title: 'Introduction to TypeScript',
            description: 'Learn TypeScript basics',
            isPublic: true,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            instructorId: 'user1',
            enrollments: [
                { role: 'STUDENT' },
                { role: 'STUDENT' },
                { role: 'INSTRUCTOR' },
            ],
        },
        {
            id: '2',
            title: 'Advanced React Patterns',
            description: 'Advanced React techniques',
            isPublic: false,
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            instructorId: 'user2',
            enrollments: [
                { role: 'STUDENT' },
                { role: 'MODERATOR' },
            ],
        },
        {
            id: '3',
            title: 'Deleted Course',
            description: 'This course was deleted',
            isPublic: true,
            deletedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            instructorId: 'user1',
            enrollments: [],
        },
    ];

    describe('Rendering', () => {
        it('renders the courses list with title', () => {
            render(<CoursesList courses={mockCourses} />);
            expect(screen.getByText('Courses')).toBeInTheDocument();
        });

        it('renders search input', () => {
            render(<CoursesList courses={mockCourses} />);
            expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument();
        });

        it('renders all courses', () => {
            render(<CoursesList courses={mockCourses} />);
            expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
            expect(screen.getByText('Advanced React Patterns')).toBeInTheDocument();
            expect(screen.getByText('Deleted Course')).toBeInTheDocument();
        });

        it('renders correct badges for public/private courses', () => {
            render(<CoursesList courses={mockCourses} />);
            expect(screen.getByText('Public')).toBeInTheDocument();
            expect(screen.getByText('Private')).toBeInTheDocument();
        });

        it('renders deleted badge for deleted courses', () => {
            render(<CoursesList courses={mockCourses} />);
            expect(screen.getByText('Deleted')).toBeInTheDocument();
        });

        it('displays enrollment counts', () => {
            render(<CoursesList courses={mockCourses} />);
            expect(screen.getByText('2 Students')).toBeInTheDocument();
            expect(screen.getByText('1 Instructors')).toBeInTheDocument();
            expect(screen.getByText('1 Moderators')).toBeInTheDocument();
        });
    });

    describe('Search Functionality', () => {
        it('filters courses based on search query', async () => {
            const user = userEvent.setup();
            render(<CoursesList courses={mockCourses} />);

            const searchInput = screen.getByPlaceholderText('Search courses...');
            await user.type(searchInput, 'TypeScript');

            expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
            expect(screen.queryByText('Advanced React Patterns')).not.toBeInTheDocument();
        });

        it('shows no courses found message when search has no results', async () => {
            const user = userEvent.setup();
            render(<CoursesList courses={mockCourses} />);

            const searchInput = screen.getByPlaceholderText('Search courses...');
            await user.type(searchInput, 'nonexistent');

            expect(screen.getByText(/No courses found matching/)).toBeInTheDocument();
        });

        it('search is case insensitive', async () => {
            const user = userEvent.setup();
            render(<CoursesList courses={mockCourses} />);

            const searchInput = screen.getByPlaceholderText('Search courses...');
            await user.type(searchInput, 'typescript');

            expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
        });
    });

    describe('Course Links', () => {
        it('renders correct links to course detail pages', () => {
            render(<CoursesList courses={mockCourses} />);

            const links = screen.getAllByRole('link');
            expect(links[0]).toHaveAttribute('href', '/admin-dashboard/courses/1');
            expect(links[1]).toHaveAttribute('href', '/admin-dashboard/courses/2');
        });
    });

    describe('Empty State', () => {
        it('handles empty courses array', () => {
            render(<CoursesList courses={[]} />);
            expect(screen.getByText('Courses')).toBeInTheDocument();
        });
    });
});
