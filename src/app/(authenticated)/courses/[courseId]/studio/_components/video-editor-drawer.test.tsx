"use client";

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VideoEditorDrawer } from './video-editor-drawer';
import { updateTopicResource } from '@/app/actions/course-editor.actions';

// Mock actions
vi.mock('@/app/actions/course-editor.actions', () => ({
    updateTopicResource: vi.fn(),
}));

// Mock UI
vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children, open }: any) => open ? <div data-testid="sheet">{children}</div> : null,
    SheetContent: ({ children }: any) => <div>{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <h2>{children}</h2>,
    SheetDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock('@/components/ui/label', () => ({
    Label: ({ children }: any) => <label>{children}</label>,
}));

vi.mock('@/components/ui/input', () => ({
    Input: ({ value, onChange, placeholder }: any) => (
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            data-testid="url-input"
        />
    )
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}));

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

describe('VideoEditorDrawer', () => {
    const mockResource = { id: 'r1', contentUrl: 'http://old.com', type: 'VIDEO' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with existing url', () => {
        render(
            <VideoEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={vi.fn()}
                onResourceUpdate={vi.fn()}
            />
        );

        expect(screen.getByTestId('url-input')).toHaveValue('http://old.com');
    });

    it('updates url on save', async () => {
        const onUpdate = vi.fn();
        const onOpenChange = vi.fn();

        render(
            <VideoEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={onOpenChange}
                onResourceUpdate={onUpdate}
            />
        );

        const input = screen.getByTestId('url-input');
        fireEvent.change(input, { target: { value: 'http://new.com' } });

        fireEvent.click(screen.getByText('Save Video'));

        await waitFor(() => {
            expect(updateTopicResource).toHaveBeenCalledWith('r1', { contentUrl: 'http://new.com' }, 'c1');
            expect(onUpdate).toHaveBeenCalledWith({ ...mockResource, contentUrl: 'http://new.com' });
            expect(onOpenChange).toHaveBeenCalledWith(false);
        });
    });
});
