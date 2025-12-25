"use client";

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { TagFilter } from './tag-filter';

// Create a mock function for useSearchParams
const mockUseSearchParams = vi.fn();
const mockPush = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    usePathname: () => '/courses',
    useSearchParams: () => mockUseSearchParams(),
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
    cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

describe('TagFilter', () => {
    const mockItems = [
        { id: '1', name: 'JavaScript' },
        { id: '2', name: 'TypeScript' },
        { id: '3', name: 'React' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Default return value
        mockUseSearchParams.mockReturnValue(new URLSearchParams(''));
    });

    describe('Rendering', () => {
        it('renders all tag items', () => {
            render(<TagFilter items={mockItems} />);
            expect(screen.getByText('JavaScript')).toBeInTheDocument();
            expect(screen.getByText('TypeScript')).toBeInTheDocument();
            expect(screen.getByText('React')).toBeInTheDocument();
        });

        it('renders as buttons', () => {
            render(<TagFilter items={mockItems} />);
            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(3);
        });
    });

    describe('Click Behavior', () => {
        it('calls router.push with tag param when clicked', () => {
            render(<TagFilter items={mockItems} />);

            const jsButton = screen.getByText('JavaScript');
            fireEvent.click(jsButton);

            expect(mockPush).toHaveBeenCalledWith('/courses?tag=JavaScript');
        });

        it('removes tag param when same tag is clicked again', () => {
            // Mock with existing tag for this specific test
            mockUseSearchParams.mockReturnValue(new URLSearchParams('tag=JavaScript'));

            render(<TagFilter items={mockItems} />);

            const jsButton = screen.getByText('JavaScript');
            fireEvent.click(jsButton);

            // Should remove the tag (push URL without tag param)
            expect(mockPush).toHaveBeenCalledWith('/courses?');
        });
    });

    describe('Empty State', () => {
        it('renders empty container when no items', () => {
            render(<TagFilter items={[]} />);
            const buttons = screen.queryAllByRole('button');
            expect(buttons).toHaveLength(0);
        });
    });

    describe('Selection Logic', () => {
        it('computes isSelected correctly', () => {
            mockUseSearchParams.mockReturnValue(new URLSearchParams('tag=JavaScript'));

            render(<TagFilter items={mockItems} />);

            const jsButton = screen.getByText('JavaScript');
            // Check for selected class styling (bg-indigo-600)
            expect(jsButton.className).toContain('bg-indigo-600');

            const reactButton = screen.getByText('React');
            expect(reactButton.className).not.toContain('bg-indigo-600');
        });
    });
});
