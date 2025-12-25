"use client";

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import LearningPathsPage from './page';
import { getPublicLearningPaths } from '@/app/actions/learning-paths.actions';

// Mock actions
vi.mock('@/app/actions/learning-paths.actions', () => ({
    getPublicLearningPaths: vi.fn(),
}));

// Mock child components
vi.mock('../courses/_components/search-input', () => ({
    SearchInput: () => <div data-testid="search-input">Search Input</div>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div data-testid="learning-path-card">{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h2>{children}</h2>,
    CardDescription: ({ children }: any) => <p>{children}</p>,
    CardContent: ({ children }: any) => <div>{children}</div>,
    CardFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children }: any) => <button>{children}</button>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('LearningPathsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders learning paths when available', async () => {
        vi.mocked(getPublicLearningPaths).mockResolvedValue([
            {
                id: 'p1',
                title: 'Path 1',
                level: 'BEGINNER',
                _count: { items: 5 },
                roles: [{ id: 'r1', title: 'Role 1' }]
            },
            {
                id: 'p2',
                title: 'Path 2',
                level: 'ADVANCED',
                _count: { items: 3 },
                roles: []
            }
        ] as any);

        const jsx = await LearningPathsPage({ searchParams: {} });
        render(jsx);

        expect(screen.getByText('Learning Paths')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getAllByTestId('learning-path-card')).toHaveLength(2);
        expect(screen.getByText('Path 1')).toBeInTheDocument();
        expect(screen.getByText('Path 2')).toBeInTheDocument();
        expect(screen.getByText('5 Steps')).toBeInTheDocument();
    });

    it('renders empty state when no paths', async () => {
        vi.mocked(getPublicLearningPaths).mockResolvedValue([]);

        const jsx = await LearningPathsPage({ searchParams: {} });
        render(jsx);

        expect(screen.getByText('No learning paths found')).toBeInTheDocument();
    });
});
