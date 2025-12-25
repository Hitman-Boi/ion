"use client";

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RolesList } from './roles-list';

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children, onClick, className, ...props }: any) => (
        <div onClick={onClick} className={className} data-testid="role-card" {...props}>{children}</div>
    ),
    CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h4 data-testid="card-title">{children}</h4>,
}));

vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

describe('RolesList', () => {
    const mockRoles = [
        {
            id: 'role-1',
            title: 'Software Engineer',
            description: 'Develops software applications',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'role-2',
            title: 'Product Manager',
            description: 'Manages product development',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const mockOnSelectRole = vi.fn();
    const mockOnCreateRole = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the Job Roles header', () => {
            render(
                <RolesList
                    roles={mockRoles}
                    selectedRole={null}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );
            expect(screen.getByText('Job Roles')).toBeInTheDocument();
        });

        it('renders the New button', () => {
            render(
                <RolesList
                    roles={mockRoles}
                    selectedRole={null}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );
            expect(screen.getByText('New')).toBeInTheDocument();
        });

        it('renders all roles', () => {
            render(
                <RolesList
                    roles={mockRoles}
                    selectedRole={null}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );
            expect(screen.getByText('Software Engineer')).toBeInTheDocument();
            expect(screen.getByText('Product Manager')).toBeInTheDocument();
        });

        it('renders role descriptions', () => {
            render(
                <RolesList
                    roles={mockRoles}
                    selectedRole={null}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );
            expect(screen.getByText('Develops software applications')).toBeInTheDocument();
            expect(screen.getByText('Manages product development')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('shows empty message when no roles', () => {
            render(
                <RolesList
                    roles={[]}
                    selectedRole={null}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );
            expect(screen.getByText('No roles defined yet.')).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('calls onCreateRole when New button is clicked', () => {
            render(
                <RolesList
                    roles={mockRoles}
                    selectedRole={null}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );

            const newButton = screen.getByText('New');
            fireEvent.click(newButton);

            expect(mockOnCreateRole).toHaveBeenCalled();
        });

        it('calls onSelectRole when a role card is clicked', () => {
            render(
                <RolesList
                    roles={mockRoles}
                    selectedRole={null}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );

            const roleCards = screen.getAllByTestId('role-card');
            fireEvent.click(roleCards[0]);

            expect(mockOnSelectRole).toHaveBeenCalledWith(mockRoles[0]);
        });
    });

    describe('Selection State', () => {
        it('applies selected styling to selected role', () => {
            render(
                <RolesList
                    roles={mockRoles}
                    selectedRole={mockRoles[0]}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );

            const roleCards = screen.getAllByTestId('role-card');
            expect(roleCards[0].className).toContain('border-primary');
        });
    });

    describe('Default Description', () => {
        it('shows "No description" for roles without description', () => {
            const rolesWithoutDesc = [{
                id: 'role-3',
                title: 'Test Role',
                description: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }];

            render(
                <RolesList
                    roles={rolesWithoutDesc as any}
                    selectedRole={null}
                    onSelectRole={mockOnSelectRole}
                    onCreateRole={mockOnCreateRole}
                />
            );
            expect(screen.getByText('No description')).toBeInTheDocument();
        });
    });
});
