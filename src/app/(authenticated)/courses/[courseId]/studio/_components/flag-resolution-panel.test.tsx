"use client";

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { FlagResolutionPanel } from './flag-resolution-panel';
import { resolveContentFlag, dismissContentFlag } from '@/app/actions/content-flag.actions';
import { useRouter } from 'next/navigation';

// Mock actions and router
vi.mock('@/app/actions/content-flag.actions', () => ({
    resolveContentFlag: vi.fn(),
    dismissContentFlag: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({
        refresh: vi.fn(),
    })),
}));

// Mock UI
vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h2>{children}</h2>,
    CardDescription: ({ children }: any) => <p>{children}</p>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, title, disabled }: any) => (
        <button onClick={onClick} title={title} disabled={disabled}>{children}</button>
    )
}));

// Mock sonner
vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() }
}));

describe('FlagResolutionPanel', () => {
    const mockFlags = [
        { id: 'f1', reason: 'Spam', details: 'Bad content', createdAt: new Date() }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders flags', () => {
        render(
            <FlagResolutionPanel
                flags={mockFlags}
                courseId="c1"
                isOwner={true}
                isAdmin={false}
            />
        );

        expect(screen.getByText('Content Issues')).toBeInTheDocument();
        expect(screen.getByText('Spam')).toBeInTheDocument();
        expect(screen.getByText('Bad content')).toBeInTheDocument();
    });

    it('handles resolve action', async () => {
        render(
            <FlagResolutionPanel
                flags={mockFlags}
                courseId="c1"
                isOwner={true}
                isAdmin={false}
            />
        );

        const resolveBtn = screen.getByTitle('Mark as resolved');
        fireEvent.click(resolveBtn);

        await waitFor(() => {
            expect(resolveContentFlag).toHaveBeenCalledWith('f1');
        });
    });

    it('renders dismiss button only for admin', () => {
        const { rerender } = render(
            <FlagResolutionPanel
                flags={mockFlags}
                courseId="c1"
                isOwner={true}
                isAdmin={false}
            />
        );

        expect(screen.queryByTitle('Dismiss flag')).not.toBeInTheDocument();

        rerender(
            <FlagResolutionPanel
                flags={mockFlags}
                courseId="c1"
                isOwner={false}
                isAdmin={true}
            />
        );

        expect(screen.getByTitle('Dismiss flag')).toBeInTheDocument();
    });
});
