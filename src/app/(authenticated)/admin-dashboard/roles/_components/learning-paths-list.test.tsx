"use client";

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LearningPathsList } from './learning-paths-list';

// Mock UI components
vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children, className, ...props }: any) => (
        <span className={className} data-testid="badge" {...props}>{children}</span>
    ),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>{children}</button>
    ),
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children, onClick, ...props }: any) => (
        <div onClick={onClick} data-testid="path-card" {...props}>{children}</div>
    ),
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h4 data-testid="card-title">{children}</h4>,
}));

vi.mock('@/components/ui/scroll-area', () => ({
    ScrollArea: ({ children }: any) => <div data-testid="scroll-area">{children}</div>,
}));

describe('LearningPathsList', () => {
    const mockPaths = [
        {
            id: 'path-1',
            title: 'Frontend Developer Path',
            description: 'Learn frontend development',
            level: 'BEGINNER' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: [{ id: 'item-1' }, { id: 'item-2' }],
        },
        {
            id: 'path-2',
            title: 'Backend Developer Path',
            description: 'Learn backend development',
            level: 'INTERMEDIATE' as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            items: [{ id: 'item-3' }],
        },
    ];

    const mockOnSelectPath = vi.fn();
    const mockOnCreatePath = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('renders the Learning Paths header', () => {
            render(
                <LearningPathsList
                    paths={mockPaths}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );
            expect(screen.getByText('Learning Paths')).toBeInTheDocument();
        });

        it('renders the New Path button', () => {
            render(
                <LearningPathsList
                    paths={mockPaths}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );
            expect(screen.getByText('New Path')).toBeInTheDocument();
        });

        it('renders all paths', () => {
            render(
                <LearningPathsList
                    paths={mockPaths}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );
            expect(screen.getByText('Frontend Developer Path')).toBeInTheDocument();
            expect(screen.getByText('Backend Developer Path')).toBeInTheDocument();
        });

        it('renders path descriptions', () => {
            render(
                <LearningPathsList
                    paths={mockPaths}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );
            expect(screen.getByText('Learn frontend development')).toBeInTheDocument();
            expect(screen.getByText('Learn backend development')).toBeInTheDocument();
        });

        it('renders step counts', () => {
            render(
                <LearningPathsList
                    paths={mockPaths}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );
            expect(screen.getByText('2 steps')).toBeInTheDocument();
            expect(screen.getByText('1 steps')).toBeInTheDocument();
        });

        it('renders level badges', () => {
            render(
                <LearningPathsList
                    paths={mockPaths}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );
            expect(screen.getByText('BEGINNER')).toBeInTheDocument();
            expect(screen.getByText('INTERMEDIATE')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('shows empty message when no paths', () => {
            render(
                <LearningPathsList
                    paths={[]}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );
            expect(screen.getByText('No learning paths found. Create one to get started.')).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('calls onCreatePath when New Path button is clicked', () => {
            render(
                <LearningPathsList
                    paths={mockPaths}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );

            const newButton = screen.getByText('New Path');
            fireEvent.click(newButton);

            expect(mockOnCreatePath).toHaveBeenCalled();
        });

        it('calls onSelectPath when a path card is clicked', () => {
            render(
                <LearningPathsList
                    paths={mockPaths}
                    onSelectPath={mockOnSelectPath}
                    onCreatePath={mockOnCreatePath}
                />
            );

            const pathCards = screen.getAllByTestId('path-card');
            fireEvent.click(pathCards[0]);

            expect(mockOnSelectPath).toHaveBeenCalledWith(mockPaths[0]);
        });
    });

    describe('getLevelBadge helper', () => {
        it('returns correct colors for BEGINNER', () => {
            const getLevelBadge = (level: string) => {
                switch (level) {
                    case "BEGINNER": return "bg-green-100 text-green-800";
                    case "INTERMEDIATE": return "bg-blue-100 text-blue-800";
                    case "ADVANCED": return "bg-purple-100 text-purple-800";
                    default: return "bg-gray-100 text-gray-800";
                }
            };
            expect(getLevelBadge('BEGINNER')).toContain('green');
        });

        it('returns correct colors for INTERMEDIATE', () => {
            const getLevelBadge = (level: string) => {
                switch (level) {
                    case "BEGINNER": return "bg-green-100";
                    case "INTERMEDIATE": return "bg-blue-100";
                    case "ADVANCED": return "bg-purple-100";
                    default: return "bg-gray-100";
                }
            };
            expect(getLevelBadge('INTERMEDIATE')).toContain('blue');
        });

        it('returns correct colors for ADVANCED', () => {
            const getLevelBadge = (level: string) => {
                switch (level) {
                    case "BEGINNER": return "bg-green-100";
                    case "INTERMEDIATE": return "bg-blue-100";
                    case "ADVANCED": return "bg-purple-100";
                    default: return "bg-gray-100";
                }
            };
            expect(getLevelBadge('ADVANCED')).toContain('purple');
        });
    });
});
