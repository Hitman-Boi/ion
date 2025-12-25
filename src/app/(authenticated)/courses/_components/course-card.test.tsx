import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CourseCard } from './course-card';

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
    CardFooter: ({ children }: any) => <div data-testid="card-footer">{children}</div>,
    CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
    CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} data-testid="course-link" {...props}>{children}</a>
    ),
}));

describe('CourseCard', () => {
    const mockCourse = {
        id: 'course-1',
        title: 'Introduction to JavaScript',
        description: 'Learn JavaScript from scratch',
        isPublic: true,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        instructorId: 'instructor-1',
        instructor: {
            id: 'instructor-1',
            name: 'John Doe',
            email: 'john@example.com',
        },
        skills: [
            { id: 'skill-1', name: 'JavaScript' },
            { id: 'skill-2', name: 'Web Development' },
        ],
        _count: {
            modules: 5,
        },
    };

    describe('Rendering', () => {
        it('renders the course title', () => {
            render(<CourseCard course={mockCourse as any} />);
            expect(screen.getByText('Introduction to JavaScript')).toBeInTheDocument();
        });

        it('renders the course description', () => {
            render(<CourseCard course={mockCourse as any} />);
            expect(screen.getByText('Learn JavaScript from scratch')).toBeInTheDocument();
        });

        it('renders default description when none provided', () => {
            const courseWithoutDesc = { ...mockCourse, description: null };
            render(<CourseCard course={courseWithoutDesc as any} />);
            expect(screen.getByText('No description available.')).toBeInTheDocument();
        });

        it('renders instructor name', () => {
            render(<CourseCard course={mockCourse as any} />);
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('renders default instructor text when no name', () => {
            const courseWithoutInstructor = {
                ...mockCourse,
                instructor: { ...mockCourse.instructor, name: null },
            };
            render(<CourseCard course={courseWithoutInstructor as any} />);
            expect(screen.getByText('Instructor')).toBeInTheDocument();
        });

        it('renders module count', () => {
            render(<CourseCard course={mockCourse as any} />);
            expect(screen.getByText('5 Modules')).toBeInTheDocument();
        });
    });

    describe('Skills Display', () => {
        it('renders skill badges', () => {
            render(<CourseCard course={mockCourse as any} />);
            expect(screen.getByText('JavaScript')).toBeInTheDocument();
            expect(screen.getByText('Web Development')).toBeInTheDocument();
        });

        it('limits displayed skills to 3 and shows overflow count', () => {
            const courseWithManySkills = {
                ...mockCourse,
                skills: [
                    { id: '1', name: 'Skill 1' },
                    { id: '2', name: 'Skill 2' },
                    { id: '3', name: 'Skill 3' },
                    { id: '4', name: 'Skill 4' },
                    { id: '5', name: 'Skill 5' },
                ],
            };
            render(<CourseCard course={courseWithManySkills as any} />);
            expect(screen.getByText('+2')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('links to the correct course detail page', () => {
            render(<CourseCard course={mockCourse as any} />);
            const link = screen.getByTestId('course-link');
            expect(link).toHaveAttribute('href', '/courses/course-1');
        });
    });
});
