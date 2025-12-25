"use client";

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SubscribeButton } from './subscribe-button';

// Mock the learning-paths actions
vi.mock('@/app/actions/learning-paths.actions', () => ({
    subscribeToLearningPath: vi.fn(() => Promise.resolve()),
    unsubscribeFromLearningPath: vi.fn(() => Promise.resolve()),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, onClick, ...props }: any) => (
        <button disabled={disabled} onClick={onClick} {...props}>{children}</button>
    ),
}));

describe('SubscribeButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Not Subscribed State', () => {
        it('renders Subscribe button when not subscribed', () => {
            render(<SubscribeButton pathId="path-1" isSubscribed={false} />);
            expect(screen.getByText('Subscribe')).toBeInTheDocument();
        });

        it('has correct min-width class', () => {
            render(<SubscribeButton pathId="path-1" isSubscribed={false} />);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('min-w-[140px]');
        });
    });

    describe('Subscribed State', () => {
        it('renders Subscribed button when subscribed', () => {
            render(<SubscribeButton pathId="path-1" isSubscribed={true} />);
            expect(screen.getByText('Subscribed')).toBeInTheDocument();
        });

        it('shows Unsubscribe on hover (hidden by default)', () => {
            render(<SubscribeButton pathId="path-1" isSubscribed={true} />);
            // The Unsubscribe text exists but is hidden via CSS
            expect(screen.getByText('Unsubscribe')).toBeInTheDocument();
        });
    });

    describe('Click Behavior', () => {
        it('calls subscribe action when not subscribed and clicked', async () => {
            const { subscribeToLearningPath } = await import('@/app/actions/learning-paths.actions');
            const user = userEvent.setup();

            render(<SubscribeButton pathId="test-path" isSubscribed={false} />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(subscribeToLearningPath).toHaveBeenCalledWith('test-path');
        });

        it('calls unsubscribe action when subscribed and clicked', async () => {
            const { unsubscribeFromLearningPath } = await import('@/app/actions/learning-paths.actions');
            const user = userEvent.setup();

            render(<SubscribeButton pathId="test-path" isSubscribed={true} />);

            const button = screen.getByRole('button');
            await user.click(button);

            expect(unsubscribeFromLearningPath).toHaveBeenCalledWith('test-path');
        });
    });

    describe('Props', () => {
        it('accepts pathId prop correctly', () => {
            expect(() => render(
                <SubscribeButton pathId="my-learning-path" isSubscribed={false} />
            )).not.toThrow();
        });

        it('handles different isSubscribed states', () => {
            const { rerender } = render(
                <SubscribeButton pathId="path-1" isSubscribed={false} />
            );
            expect(screen.getByText('Subscribe')).toBeInTheDocument();

            rerender(<SubscribeButton pathId="path-1" isSubscribed={true} />);
            expect(screen.getByText('Subscribed')).toBeInTheDocument();
        });
    });
});
