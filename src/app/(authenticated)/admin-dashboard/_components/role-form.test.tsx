"use client";

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RoleForm } from './role-form';

// Mock actions
const mockCreateRole = vi.fn();
const mockUpdateRole = vi.fn();

vi.mock('@/app/actions/roles.actions', () => ({
    createRole: (...args: any[]) => mockCreateRole(...args),
    updateRole: (...args: any[]) => mockUpdateRole(...args),
}));

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: mockRefresh }),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, ...props }: any) => (
        <button disabled={disabled} {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input data-testid="input-title" {...props} />,
}));

vi.mock('@/components/ui/textarea', () => ({
    Textarea: (props: any) => <textarea data-testid="input-description" {...props} />,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children, onClick, variant, ...props }: any) => (
        <span onClick={onClick} data-variant={variant} data-testid="skill-badge" {...props}>{children}</span>
    ),
}));

describe('RoleForm', () => {
    const mockSkills = [
        { id: 'skill-1', name: 'JavaScript' },
        { id: 'skill-2', name: 'React' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mocks implementation
        mockCreateRole.mockResolvedValue({});
        mockUpdateRole.mockResolvedValue({});
    });

    describe('Rendering - Create Mode', () => {
        it('renders empty form by default', () => {
            render(<RoleForm allSkills={mockSkills} />);
            expect(screen.getByTestId('input-title')).toHaveValue('');
            expect(screen.getByTestId('input-description')).toHaveValue('');
            expect(screen.getByText('Create Role')).toBeInTheDocument();
        });

        it('renders available skills', () => {
            render(<RoleForm allSkills={mockSkills} />);
            expect(screen.getByText('JavaScript')).toBeInTheDocument();
            expect(screen.getByText('React')).toBeInTheDocument();
        });
    });

    describe('Rendering - Edit Mode', () => {
        const existingRole = {
            id: 'role-1',
            title: 'Frontend Engineer',
            description: 'Develop UI',
            skills: [{ id: 'skill-1', name: 'JavaScript' }],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        it('pre-fills form with role data', () => {
            render(<RoleForm role={existingRole} allSkills={mockSkills} />);

            expect(screen.getByTestId('input-title')).toHaveValue('Frontend Engineer');
            expect(screen.getByTestId('input-description')).toHaveValue('Develop UI');
            expect(screen.getByText('Update Role')).toBeInTheDocument();
        });

        it('marks existing skills as selected', () => {
            render(<RoleForm role={existingRole} allSkills={mockSkills} />);

            const badges = screen.getAllByTestId('skill-badge');
            // JavaScript should be selected (variant=default)
            expect(badges[0]).toHaveAttribute('data-variant', 'default');
            // React should not be selected (variant=outline)
            expect(badges[1]).toHaveAttribute('data-variant', 'outline');
        });
    });

    describe('Interactions', () => {
        it('toggles skill selection', async () => {
            const user = userEvent.setup();
            render(<RoleForm allSkills={mockSkills} />);

            const jsBadge = screen.getByText('JavaScript');

            // Initial state: not selected
            expect(jsBadge).toHaveAttribute('data-variant', 'outline');

            // Select
            await user.click(jsBadge);
            expect(jsBadge).toHaveAttribute('data-variant', 'default');

            // Deselect
            await user.click(jsBadge);
            expect(jsBadge).toHaveAttribute('data-variant', 'outline');
        });

        it('submits create form', async () => {
            const user = userEvent.setup();
            render(<RoleForm allSkills={mockSkills} />);

            await user.type(screen.getByTestId('input-title'), 'New Role');
            await user.type(screen.getByTestId('input-description'), 'Role Description');

            // Select skill
            await user.click(screen.getByText('JavaScript'));

            await user.click(screen.getByText('Create Role'));

            expect(mockCreateRole).toHaveBeenCalledWith({
                title: 'New Role',
                description: 'Role Description',
                skillIds: ['skill-1'],
            });
            expect(mockRefresh).toHaveBeenCalled();
        });

        it('submits update form', async () => {
            const existingRole = {
                id: 'role-1',
                title: 'Old Title',
                description: 'Old Desc',
                skills: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const user = userEvent.setup();
            render(<RoleForm role={existingRole} allSkills={mockSkills} />);

            const titleInput = screen.getByTestId('input-title');
            await user.clear(titleInput);
            await user.type(titleInput, 'Updated Title');

            await user.click(screen.getByText('Update Role'));

            expect(mockUpdateRole).toHaveBeenCalledWith('role-1', expect.objectContaining({
                title: 'Updated Title',
            }));
            expect(mockRefresh).toHaveBeenCalled();
        });
    });
});
