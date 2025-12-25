"use client";

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QuizEditorDrawer } from './quiz-editor-drawer';
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

vi.mock('@/components/ui/input', () => ({
    Input: ({ value, onChange, placeholder }: any) => (
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            data-testid="input"
        />
    )
}));

vi.mock('@/components/ui/label', () => ({
    Label: ({ children }: any) => <label>{children}</label>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>
}));

// Mock sonner
vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

describe('QuizEditorDrawer', () => {
    const mockResource = {
        id: 'r1',
        type: 'QUIZ',
        quizData: {
            questions: []
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state', () => {
        render(
            <QuizEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={vi.fn()}
                onResourceUpdate={vi.fn()}
            />
        );

        expect(screen.getByText('No questions yet. Add one below.')).toBeInTheDocument();
    });

    it('adds question and updates state', async () => {
        render(
            <QuizEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={vi.fn()}
                onResourceUpdate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Add Question'));

        expect(screen.getByText('Q1')).toBeInTheDocument();
        const inputs = screen.getAllByTestId('input');
        // First input is Question, then Options.
        // Mock adds { q: '', options: ['', ''], answer: '' }

        fireEvent.change(inputs[0], { target: { value: 'What is Jest?' } });

        // Save
        fireEvent.click(screen.getByText('Save Quiz'));

        await waitFor(() => {
            expect(updateTopicResource).toHaveBeenCalled();
            // Checking payload logic would be good
            const callArgs = vi.mocked(updateTopicResource).mock.calls[0];
            // arg 0: resourceId, arg 1: data, arg 2: courseId
            expect(callArgs[0]).toBe('r1');
            expect((callArgs[1] as any).quizData.questions[0].q).toBe('What is Jest?');
        });
    });
});
