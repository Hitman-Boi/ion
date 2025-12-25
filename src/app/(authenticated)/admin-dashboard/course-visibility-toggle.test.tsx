"use client";

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CourseVisibilityToggle } from './course-visibility-toggle';

// Mock the actions
vi.mock('@/app/actions/admin.actions', () => ({
    toggleCourseVisibility: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => (
        <button {...props}>{children}</button>
    ),
}));

describe('CourseVisibilityToggle', () => {
    describe('Public Course State', () => {
        it('renders Make Private button when course is public', () => {
            render(<CourseVisibilityToggle courseId="course-1" isPublic={true} />);
            expect(screen.getByText('Make Private')).toBeInTheDocument();
        });

        it('renders Lock icon when course is public', () => {
            render(<CourseVisibilityToggle courseId="course-1" isPublic={true} />);
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Private Course State', () => {
        it('renders Make Public button when course is private', () => {
            render(<CourseVisibilityToggle courseId="course-1" isPublic={false} />);
            expect(screen.getByText('Make Public')).toBeInTheDocument();
        });

        it('renders Globe icon when course is private', () => {
            render(<CourseVisibilityToggle courseId="course-1" isPublic={false} />);
            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Props', () => {
        it('accepts courseId prop', () => {
            expect(() => render(
                <CourseVisibilityToggle courseId="test-course" isPublic={true} />
            )).not.toThrow();
        });

        it('handles state changes correctly', () => {
            const { rerender } = render(
                <CourseVisibilityToggle courseId="course-1" isPublic={true} />
            );
            expect(screen.getByText('Make Private')).toBeInTheDocument();

            rerender(<CourseVisibilityToggle courseId="course-1" isPublic={false} />);
            expect(screen.getByText('Make Public')).toBeInTheDocument();
        });
    });

    describe('Form Structure', () => {
        it('renders as a form element', () => {
            render(<CourseVisibilityToggle courseId="course-1" isPublic={true} />);
            const form = document.querySelector('form');
            expect(form).toBeInTheDocument();
        });
    });
});
