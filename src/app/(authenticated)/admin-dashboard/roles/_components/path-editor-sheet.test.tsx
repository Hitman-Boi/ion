"use client";

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { PathEditorSheet } from './path-editor-sheet';

// Mock actions
const mockCreateLearningPath = vi.fn();
const mockUpdateLearningPath = vi.fn();

vi.mock('@/app/actions/learning-paths.actions', () => ({
    createLearningPath: (...args: any[]) => mockCreateLearningPath(...args),
    updateLearningPath: (...args: any[]) => mockUpdateLearningPath(...args),
}));

// Mock PathBuilder since it's tested separately
vi.mock('../../_components/path-builder', () => ({
    PathBuilder: () => <div data-testid="path-builder">Mock Path Builder</div>,
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
    Sheet: ({ children, open }: any) => open ? <div>{children}</div> : null,
    SheetContent: ({ children }: any) => <div>{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <h2>{children}</h2>,
    SheetDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children, defaultValue }: any) => <div>{children}</div>,
    TabsList: ({ children }: any) => <div>{children}</div>,
    TabsTrigger: ({ children }: any) => <button>{children}</button>,
    TabsContent: ({ children, value }: any) => (
        <div data-testid={`tab-content-${value}`}>{children}</div>
    ),
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input data-testid="input-title" {...props} />,
}));

vi.mock('@/components/ui/select', () => ({
    Select: ({ onValueChange, children, defaultValue }: any) => (
        <select data-testid="select-level" defaultValue={defaultValue} onChange={e => onValueChange(e.target.value)}>
            {children}
        </select>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

import { Controller } from 'react-hook-form';

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

describe('PathEditorSheet', () => {
    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        path: null,
        allCourses: [],
        onSave: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateLearningPath.mockResolvedValue({});
        mockUpdateLearningPath.mockResolvedValue({});
    });

    describe('Create Mode', () => {
        it('renders create title', () => {
            render(<PathEditorSheet {...defaultProps} />);
            expect(screen.getByText('Create New Learning Path')).toBeInTheDocument();
        });

        it('shows form fields', () => {
            render(<PathEditorSheet {...defaultProps} />);
            expect(screen.getByTestId('input-title')).toBeInTheDocument();
            expect(screen.getByTestId('select-level')).toBeInTheDocument();
        });

        it('calls createLearningPath on submit', async () => {
            const user = userEvent.setup();
            render(<PathEditorSheet {...defaultProps} />);

            await user.type(screen.getByTestId('input-title'), 'New Path');
            // Select level (default BEGINNER, changing isn't strictly necessary for existence check)

            await user.click(screen.getByText('Create & Start Building'));

            await waitFor(() => {
                expect(mockCreateLearningPath).toHaveBeenCalledWith(expect.objectContaining({
                    title: 'New Path',
                    level: 'BEGINNER'
                }));
            });
            expect(mockRefresh).toHaveBeenCalled();
        });
    });

    describe('Edit Mode', () => {
        const mockPath = {
            id: 'path-1',
            title: 'Existing Path',
            level: 'ADVANCED',
            items: []
        };

        it('renders edit title', () => {
            render(<PathEditorSheet {...defaultProps} path={mockPath} />);
            expect(screen.getByText('Edit Path: Existing Path')).toBeInTheDocument();
        });

        it('renders tabs', () => {
            render(<PathEditorSheet {...defaultProps} path={mockPath} />);
            expect(screen.getByText('Content Builder')).toBeInTheDocument();
            expect(screen.getByText('Settings')).toBeInTheDocument();
        });

        it('renders PathBuilder in content tab', () => {
            render(<PathEditorSheet {...defaultProps} path={mockPath} />);
            expect(screen.getByTestId('path-builder')).toBeInTheDocument();
        });

        it('calls updateLearningPath on settings submit', async () => {
            const user = userEvent.setup();
            render(<PathEditorSheet {...defaultProps} path={mockPath} />);

            // Switch to Settings tab if not visible (default is Content)
            // Tabs implementation in mock might render both contents if we don't control state?
            // My mock renders `TabsContent` always? 
            // `TabsContent` in mock: <div data-testid={`tab-content-${value}`}>{children}</div>
            // So both are rendered. 

            // Find settings input
            // There are two forms now? No, conditional rendering "Create Mode : Form" VS "Tabs". 
            // Inside Tabs, there is "Settings" tab with form.

            const inputs = screen.getAllByTestId('input-title');
            // One in create mode logic? No, conditional on !path.
            // Inside Edit mode: TabsContent settings has a form with input-title.

            const titleInput = inputs[0];
            await user.clear(titleInput);
            await user.type(titleInput, 'Updated Path');

            await user.click(screen.getByText('Save Changes'));

            await waitFor(() => {
                expect(mockUpdateLearningPath).toHaveBeenCalledWith('path-1', expect.objectContaining({
                    title: 'Updated Path',
                    level: 'ADVANCED'
                }));
            });
        });
    });
});
