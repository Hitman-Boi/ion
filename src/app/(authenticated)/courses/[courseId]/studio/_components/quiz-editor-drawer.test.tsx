"use client";


import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QuizEditorDrawer } from './quiz-editor-drawer';
import { updateTopicResource } from '@/app/actions/course-editor.actions';
import { toast } from 'sonner';

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

        fireEvent.click(screen.getByText('Multiple Choice'));

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
    it('adds a subjective question (Text) and updates state', async () => {
        render(
            <QuizEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={vi.fn()}
                onResourceUpdate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Short Answer'));

        // Change type to Text (No longer needed as we clicked specific button)
        // const selects = screen.getAllByRole('combobox');
        // fireEvent.change(selects[0], { target: { value: 'text' } });

        // Enter Question
        const inputs = screen.getAllByTestId('input');
        fireEvent.change(inputs[0], { target: { value: 'Explain Quantum Physics' } }); // Question Input

        // Enter Expected Answer
        fireEvent.change(inputs[1], { target: { value: 'Particles and Waves' } }); // Answer Input

        // Save
        fireEvent.click(screen.getByText('Save Quiz'));

        await waitFor(() => {
            expect(updateTopicResource).toHaveBeenCalled();
            const callArgs = vi.mocked(updateTopicResource).mock.calls[0];
            expect((callArgs[1] as any).quizData.questions[0].type).toBe('text');
            expect((callArgs[1] as any).quizData.questions[0].q).toBe('Explain Quantum Physics');
            expect((callArgs[1] as any).quizData.questions[0].answer).toBe('Particles and Waves');
        });
    });

    it('adds a number question and updates state', async () => {
        render(
            <QuizEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={vi.fn()}
                onResourceUpdate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Number'));

        // Change type to Number (No longer needed)
        // const selects = screen.getAllByRole('combobox');
        // fireEvent.change(selects[0], { target: { value: 'number' } });

        // Enter Question
        const inputs = screen.getAllByTestId('input');
        fireEvent.change(inputs[0], { target: { value: 'What is 2 + 2?' } });

        // Enter Answer
        fireEvent.change(inputs[1], { target: { value: '4' } });

        // Save
        fireEvent.click(screen.getByText('Save Quiz'));

        await waitFor(() => {
            expect(updateTopicResource).toHaveBeenCalled();
            const callArgs = vi.mocked(updateTopicResource).mock.calls[0];
            expect((callArgs[1] as any).quizData.questions[0].type).toBe('number');
            expect((callArgs[1] as any).quizData.questions[0].answer).toBe('4');
        });
    });
    it('shows error when question text is missing', async () => {
        vi.mocked(updateTopicResource).mockRejectedValue(new Error('Question 1: Question text is required'));

        render(
            <QuizEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={vi.fn()}
                onResourceUpdate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Multiple Choice'));
        // Don't enter question text

        fireEvent.click(screen.getByText('Save Quiz'));

        await waitFor(() => {
            expect(updateTopicResource).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Question 1: Question text is required');
        });
    });

    it('shows error when multiple choice answer is not selected', async () => {
        vi.mocked(updateTopicResource).mockRejectedValue(new Error('Question 1: Please select a correct answer'));

        render(
            <QuizEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={vi.fn()}
                onResourceUpdate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Multiple Choice'));
        const inputs = screen.getAllByTestId('input');
        fireEvent.change(inputs[0], { target: { value: 'Valid Question?' } });
        fireEvent.change(inputs[1], { target: { value: 'Op 1' } });
        fireEvent.change(inputs[2], { target: { value: 'Op 2' } });

        // Don't select answer

        fireEvent.click(screen.getByText('Save Quiz'));

        await waitFor(() => {
            expect(updateTopicResource).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Question 1: Please select a correct answer');
        });
    });

    it('shows error when number answer is missing', async () => {
        vi.mocked(updateTopicResource).mockRejectedValue(new Error('Question 1: Correct number answer is required'));

        render(
            <QuizEditorDrawer
                courseId="c1"
                resource={mockResource}
                open={true}
                onOpenChange={vi.fn()}
                onResourceUpdate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByText('Number'));
        const inputs = screen.getAllByTestId('input');
        fireEvent.change(inputs[0], { target: { value: 'Math Q' } });
        // Don't enter number answer

        fireEvent.click(screen.getByText('Save Quiz'));

        await waitFor(() => {
            expect(updateTopicResource).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith('Question 1: Correct number answer is required');
        });
    });
});
