"use client";

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { RoleEditorSheet } from './role-editor-sheet';

// Mock actions
const mockCreateRole = vi.fn();
const mockUpdateRole = vi.fn();
const mockUpdateRoleLinkPath = vi.fn();

vi.mock('@/app/actions/roles.actions', () => ({
    createRole: (...args: any[]) => mockCreateRole(...args),
    updateRole: (...args: any[]) => mockUpdateRole(...args),
    updateRoleLinkPath: (...args: any[]) => mockUpdateRoleLinkPath(...args),
}));

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: mockRefresh }),
}));

// Mock toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock UI components
vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }: any) => <div>{children}</div>,
    SheetContent: ({ children }: any) => <div>{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <h2>{children}</h2>,
    SheetDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input data-testid="input-title" {...props} />,
}));

vi.mock('@/components/ui/textarea', () => ({
    Textarea: (props: any) => <textarea data-testid="input-description" {...props} />,
}));

// Mock Select
vi.mock('@/components/ui/select', () => ({
    Select: ({ onValueChange, children, defaultValue }: any) => (
        <div data-testid="select-container">
            <select
                data-testid="mock-select"
                defaultValue={defaultValue}
                onChange={(e) => onValueChange(e.target.value)}
            >
                {children}
            </select>
        </div>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));

import { Controller } from 'react-hook-form';

// Mock Form components
vi.mock('@/components/ui/form', () => ({
    Form: ({ children }: any) => <>{children}</>,
    FormControl: ({ children }: any) => <>{children}</>,
    FormField: ({ render, control, name }: any) => (
        <Controller control={control} name={name} render={render} />
    ),
    FormItem: ({ children }: any) => <div>{children}</div>,
    FormLabel: ({ children }: any) => <label>{children}</label>,
    FormMessage: () => null,
}));

describe('RoleEditorSheet', () => {
    const mockLearningPaths = [
        { id: 'path-1', title: 'Beginner Path', level: 'BEGINNER' },
        { id: 'path-2', title: 'Mid Path', level: 'INTERMEDIATE' },
    ];

    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        role: null,
        onSave: vi.fn(),
        learningPaths: mockLearningPaths,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateRole.mockResolvedValue({});
        mockUpdateRole.mockResolvedValue({});
        mockUpdateRoleLinkPath.mockResolvedValue({});
    });

    describe('Rendering', () => {
        it('renders Create Job Role title in create mode', () => {
            render(<RoleEditorSheet {...defaultProps} />);
            expect(screen.getByText('Create Job Role')).toBeInTheDocument();
        });

        it('renders Edit Job Role title in edit mode', () => {
            render(<RoleEditorSheet {...defaultProps} role={{ id: '1', title: 'Test Role' }} />);
            expect(screen.getByText('Edit Job Role')).toBeInTheDocument();
        });

        it('renders form inputs', () => {
            render(<RoleEditorSheet {...defaultProps} />);
            expect(screen.getByTestId('input-title')).toBeInTheDocument();
            expect(screen.getByTestId('input-description')).toBeInTheDocument();
        });

        it('renders learning path links section only in edit mode', () => {
            const { rerender } = render(<RoleEditorSheet {...defaultProps} role={null} />);
            expect(screen.queryByText('Learning Path Links')).not.toBeInTheDocument();

            rerender(<RoleEditorSheet {...defaultProps} role={{ id: '1', title: 'Test Role', learningPaths: [] }} />);
            expect(screen.getByText('Learning Path Links')).toBeInTheDocument();
        });
    });

    describe('Submission', () => {
        it('calls createRole when submitting in create mode', async () => {
            const user = userEvent.setup();
            render(<RoleEditorSheet {...defaultProps} />);

            const titleInput = screen.getByTestId('input-title');
            await user.type(titleInput, 'New Role');

            const submitBtn = screen.getByText('Create Role');
            await user.click(submitBtn);

            await waitFor(() => {
                expect(mockCreateRole).toHaveBeenCalledWith(expect.objectContaining({
                    title: 'New Role'
                }));
            });
        });
    });

    describe('Path Linking', () => {
        it('calls updateRoleLinkPath when mock select changes', async () => {
            const roleWithPaths = {
                id: 'role-1',
                title: 'Test Role',
                learningPaths: [],
            };

            render(<RoleEditorSheet {...defaultProps} role={roleWithPaths} />);

            // Find all selects (we expect 3 for Beginner, Intermediate, Advanced)
            const selects = screen.getAllByTestId('mock-select');

            // Change the first one (Beginner)
            fireEvent.change(selects[0], { target: { value: 'path-1' } });

            await waitFor(() => {
                expect(mockUpdateRoleLinkPath).toHaveBeenCalledWith('role-1', 'BEGINNER', 'path-1');
            });
        });
    });
});
