import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AddEnrollmentButton } from './add-enrollment-button';

// Mock the actions
vi.mock('@/app/actions/admin.actions', () => ({
    enrollUserInCourse: vi.fn(),
    getUnenrolledUsers: vi.fn(() => Promise.resolve([
        { id: 'user1', email: 'user1@example.com', name: 'User One' },
        { id: 'user2', email: 'user2@example.com', name: 'User Two' },
    ])),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, ...props }: any) => (
        <button disabled={disabled} {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }: any) => <div>{children}</div>,
    SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
    SheetDescription: ({ children }: any) => <p>{children}</p>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <h2>{children}</h2>,
    SheetTrigger: ({ children, asChild }: any) => <div data-testid="sheet-trigger">{children}</div>,
}));

vi.mock('@/components/ui/popover', () => ({
    Popover: ({ children }: any) => <div>{children}</div>,
    PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
    PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
}));

vi.mock('@/components/ui/command', () => ({
    Command: ({ children }: any) => <div>{children}</div>,
    CommandEmpty: ({ children }: any) => <div>{children}</div>,
    CommandGroup: ({ children }: any) => <div>{children}</div>,
    CommandInput: (props: any) => <input {...props} />,
    CommandItem: ({ children, onSelect, ...props }: any) => (
        <div onClick={onSelect} {...props}>{children}</div>
    ),
    CommandList: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/lib/utils', () => ({
    cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('AddEnrollmentButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('formatRole function', () => {
        it('formats role names correctly', () => {
            const formatRole = (r: string) => r.charAt(0) + r.slice(1).toLowerCase();

            expect(formatRole('STUDENT')).toBe('Student');
            expect(formatRole('INSTRUCTOR')).toBe('Instructor');
            expect(formatRole('MODERATOR')).toBe('Moderator');
        });
    });

    describe('Rendering', () => {
        it('renders the add button with correct role text', () => {
            render(<AddEnrollmentButton courseId="course1" role="STUDENT" />);
            expect(screen.getByRole('button', { name: /Add Student/i })).toBeInTheDocument();
        });

        it('renders instructor button text', () => {
            render(<AddEnrollmentButton courseId="course1" role="INSTRUCTOR" />);
            expect(screen.getByRole('button', { name: /Add Instructor/i })).toBeInTheDocument();
        });

        it('renders moderator button text', () => {
            render(<AddEnrollmentButton courseId="course1" role="MODERATOR" />);
            expect(screen.getByRole('button', { name: /Add Moderator/i })).toBeInTheDocument();
        });
    });

    describe('Props', () => {
        it('accepts courseId prop', () => {
            expect(() => render(
                <AddEnrollmentButton courseId="test-course-id" role="STUDENT" />
            )).not.toThrow();
        });

        it('accepts different role values', () => {
            const { rerender } = render(
                <AddEnrollmentButton courseId="course1" role="STUDENT" />
            );
            expect(screen.getByRole('button', { name: /Add Student/i })).toBeInTheDocument();

            rerender(<AddEnrollmentButton courseId="course1" role="INSTRUCTOR" />);
            expect(screen.getByRole('button', { name: /Add Instructor/i })).toBeInTheDocument();
        });
    });
});
