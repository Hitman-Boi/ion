"use client";

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import PathPage from './page';
import { auth } from '@/auth';
import { getLearningPathPageData } from '@/app/actions/learning-paths.actions';
import { redirect } from 'next/navigation';

// Mock auth and actions
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/app/actions/learning-paths.actions', () => ({
    getLearningPathPageData: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(() => { throw new Error('REDIRECT') }),
}));

// Mock child components
vi.mock('@/components/learning-path/journey-map', () => ({
    JourneyMap: () => <div data-testid="journey-map">Journey Map</div>,
}));

vi.mock('./_components/subscribe-button', () => ({
    SubscribeButton: ({ isSubscribed }: any) => (
        <button data-testid="subscribe-button">{isSubscribed ? 'Unsubscribe' : 'Subscribe'}</button>
    ),
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div data-testid="curriculum-card">{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h2>{children}</h2>,
    CardDescription: ({ children }: any) => <p>{children}</p>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children }: any) => <button>{children}</button>,
}));

vi.mock('next/link', () => ({
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('PathPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if not authenticated', async () => {
        (auth as any).mockResolvedValue(null);
        await expect(PathPage({ params: { pathId: 'p1' } })).rejects.toThrow('REDIRECT');
        expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('renders path details and curriculum', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'u1' } });

        const mockData = {
            path: {
                id: 'p1',
                title: 'Test Path',
                description: 'Path Desc',
                items: [
                    {
                        id: 'i1',
                        course: {
                            id: 'c1',
                            title: 'Course 1',
                            modules: [{ topics: [{ id: 't1' }, { id: 't2' }] }]
                        }
                    }
                ]
            },
            isSubscribed: false,
            userProgress: [] // No progress
        };
        vi.mocked(getLearningPathPageData).mockResolvedValue(mockData as any);

        const jsx = await PathPage({ params: { pathId: 'p1' } });
        render(jsx);

        expect(screen.getByText('Test Path')).toBeInTheDocument();
        expect(screen.getByTestId('subscribe-button')).toHaveTextContent('Subscribe');
        expect(screen.getByText('Course 1')).toBeInTheDocument();
        expect(screen.getByText('2 Topics')).toBeInTheDocument();
        expect(screen.getByTestId('journey-map')).toBeInTheDocument();
    });

    it('skips item count if no items', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'u1' } });
        const mockData = {
            path: { id: 'p1', title: 'Empty Path', items: [] },
            isSubscribed: true,
            userProgress: []
        };
        vi.mocked(getLearningPathPageData).mockResolvedValue(mockData as any);

        const jsx = await PathPage({ params: { pathId: 'p1' } });
        render(jsx);

        expect(screen.getByText('Empty Path')).toBeInTheDocument();
        // Check stats rendering
        // 0 Milestones
        expect(screen.getByText('0')).toBeInTheDocument();
        // Subscribe button says Unsubscribe
        expect(screen.getByTestId('subscribe-button')).toHaveTextContent('Unsubscribe');
    });

    it('renders not found state', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'u1' } });
        vi.mocked(getLearningPathPageData).mockResolvedValue({ path: null, isSubscribed: false, userProgress: [] } as any);

        const jsx = await PathPage({ params: { pathId: 'p1' } });
        render(jsx);

        expect(screen.getByText('Path Not Found')).toBeInTheDocument();
    });
});
