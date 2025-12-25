"use client";

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import SettingsPage from './page';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// Mock auth
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    redirect: vi.fn(() => { throw new Error('REDIRECT') }),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h2>{children}</h2>,
    CardDescription: ({ children }: any) => <p>{children}</p>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/separator', () => ({
    Separator: () => <hr />,
}));

describe('SettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if not authenticated', async () => {
        vi.mocked(auth).mockResolvedValue(null);
        await expect(SettingsPage()).rejects.toThrow('REDIRECT');
        expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('renders user profile information', async () => {
        vi.mocked(auth).mockResolvedValue({
            user: {
                id: 'user-123',
                name: 'Test User',
                email: 'test@example.com'
            }
        } as any);

        const jsx = await SettingsPage();
        render(jsx);

        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('user-123')).toBeInTheDocument();
    });
});
