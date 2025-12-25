import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Header } from './header';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/learner-dashboard'),
}));

// Mock the auth actions
vi.mock('@/app/actions/auth.actions', () => ({
    logout: vi.fn(),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, asChild, ...props }: any) => {
        if (asChild) {
            return <span {...props}>{children}</span>;
        }
        return <button {...props}>{children}</button>;
    },
}));

vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }: any) => <div data-testid="sheet">{children}</div>,
    SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <h2>{children}</h2>,
    SheetTrigger: ({ children }: any) => <div data-testid="sheet-trigger">{children}</div>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
    DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
    DropdownMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
}));

describe('Header', () => {
    const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
    };

    const mockAdminUser = {
        id: '2',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the header with app name', () => {
            render(<Header user={mockUser} />);
            expect(screen.getByText('ION Learning Hub')).toBeInTheDocument();
        });

        it('renders learner dashboard link for regular users', () => {
            render(<Header user={mockUser} />);
            expect(screen.getAllByText('Learner Dashboard').length).toBeGreaterThan(0);
        });

        it('renders instructor dashboard link when user is instructor', () => {
            render(<Header user={mockUser} isInstructor={true} />);
            expect(screen.getAllByText('Instructor Dashboard').length).toBeGreaterThan(0);
        });

        it('does not render instructor dashboard link when user is not instructor', () => {
            render(<Header user={mockUser} isInstructor={false} />);
            expect(screen.queryByText('Instructor Dashboard')).not.toBeInTheDocument();
        });

        it('renders admin dashboard link for admin users', () => {
            render(<Header user={mockAdminUser} />);
            expect(screen.getAllByText('Admin Dashboard').length).toBeGreaterThan(0);
        });

        it('does not render admin dashboard link for non-admin users', () => {
            render(<Header user={mockUser} />);
            expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
        });
    });

    describe('User Information', () => {
        it('displays user name in the header', () => {
            render(<Header user={mockUser} />);
            expect(screen.getAllByText('Test User').length).toBeGreaterThan(0);
        });

        it('displays user email in the header', () => {
            render(<Header user={mockUser} />);
            expect(screen.getAllByText('test@example.com').length).toBeGreaterThan(0);
        });
    });

    describe('Navigation', () => {
        it('renders settings link', () => {
            render(<Header user={mockUser} />);
            expect(screen.getAllByText('Settings').length).toBeGreaterThan(0);
        });

        it('renders sign out button', () => {
            render(<Header user={mockUser} />);
            expect(screen.getAllByText('Sign Out').length).toBeGreaterThan(0);
        });
    });

    describe('Responsive Elements', () => {
        it('renders mobile menu trigger', () => {
            render(<Header user={mockUser} />);
            expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
        });

        it('renders dropdown menu for desktop', () => {
            render(<Header user={mockUser} />);
            expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
        });
    });
});
