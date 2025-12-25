"use client";

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import RolesPageWrapper from './roles-page-wrapper';

// Mock child components
vi.mock('./roles-list', () => ({
    RolesList: ({ onSelectRole, onCreateRole }: any) => (
        <div data-testid="roles-list">
            <button onClick={onCreateRole}>Create Role</button>
            <button onClick={() => onSelectRole({ id: 'r1' })}>Edit Role</button>
        </div>
    )
}));

vi.mock('./learning-paths-list', () => ({
    LearningPathsList: ({ onSelectPath, onCreatePath }: any) => (
        <div data-testid="learning-paths-list">
            <button onClick={onCreatePath}>Create Path</button>
            <button onClick={() => onSelectPath({ id: 'p1' })}>Edit Path</button>
        </div>
    )
}));

vi.mock('./role-editor-sheet', () => ({
    RoleEditorSheet: ({ open, role }: any) => open ? (
        <div data-testid="role-editor-sheet">{role ? 'Edit Role Sheet' : 'Create Role Sheet'}</div>
    ) : null
}));

vi.mock('./path-editor-sheet', () => ({
    PathEditorSheet: ({ open, path }: any) => open ? (
        <div data-testid="path-editor-sheet">{path ? 'Edit Path Sheet' : 'Create Path Sheet'}</div>
    ) : null
}));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children }: any) => <div>{children}</div>,
    TabsList: ({ children }: any) => <div>{children}</div>,
    TabsTrigger: ({ children }: any) => <div>{children}</div>,
    TabsContent: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children }: any) => <button>{children}</button>,
}));

vi.mock('@/app/actions/learning-paths.actions', () => ({
    getLearningPaths: vi.fn(),
}));
vi.mock('@/app/actions/roles.actions', () => ({
    getRoles: vi.fn(),
}));

describe('RolesPageWrapper', () => {
    const defaultProps = {
        roles: [],
        learningPaths: [],
        allCourses: []
    };

    it('renders lists', () => {
        render(<RolesPageWrapper {...defaultProps} />);
        // In mobile tabs, or desktop side-by-side, we should find lists.
        // My mock Tabs renders content. Desktop view also renders lists.
        // Since test env usually renders full dom, we might see duplicates if hidden classes not respected by jsdom logic (jsdom renders everything, classes are just attributes).
        // Yes, `md:hidden` and `hidden md:flex` simply hide visually but elements are in DOM.

        expect(screen.getAllByTestId('roles-list').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('learning-paths-list').length).toBeGreaterThan(0);
    });

    it('opens create role sheet', () => {
        render(<RolesPageWrapper {...defaultProps} />);

        // Find Create Role button. Might be multiple due to responsive layout.
        const createBtns = screen.getAllByText('Create Role');
        fireEvent.click(createBtns[0]);

        expect(screen.getByTestId('role-editor-sheet')).toHaveTextContent('Create Role Sheet');
    });

    it('opens edit role sheet', () => {
        render(<RolesPageWrapper {...defaultProps} />);

        const editBtns = screen.getAllByText('Edit Role');
        fireEvent.click(editBtns[0]);

        expect(screen.getByTestId('role-editor-sheet')).toHaveTextContent('Edit Role Sheet');
    });

    it('opens create path sheet', () => {
        render(<RolesPageWrapper {...defaultProps} />);

        const createBtns = screen.getAllByText('Create Path');
        fireEvent.click(createBtns[0]);

        expect(screen.getByTestId('path-editor-sheet')).toHaveTextContent('Create Path Sheet');
    });

    it('opens edit path sheet', () => {
        render(<RolesPageWrapper {...defaultProps} />);

        const editBtns = screen.getAllByText('Edit Path');
        fireEvent.click(editBtns[0]);

        expect(screen.getByTestId('path-editor-sheet')).toHaveTextContent('Edit Path Sheet');
    });
});
