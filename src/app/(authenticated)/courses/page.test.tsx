"use client";

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import CoursesPage from './page';
import { getCourses } from '@/app/actions/courses.actions';
import { prisma } from '@/lib/prisma';

// Mock getCourses
vi.mock('@/app/actions/courses.actions', () => ({
    getCourses: vi.fn(),
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        skill: {
            findMany: vi.fn(),
        },
    },
}));

// Mock child components
vi.mock('./_components/search-input', () => ({
    SearchInput: () => <div data-testid="search-input">Search Input</div>,
}));

vi.mock('./_components/tag-filter', () => ({
    TagFilter: ({ items }: any) => <div data-testid="tag-filter">{items.length} skills</div>,
}));

vi.mock('./_components/course-card', () => ({
    CourseCard: ({ course }: any) => <div data-testid="course-card">{course.title}</div>,
}));

describe('CoursesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders courses grid when courses exist', async () => {
        vi.mocked(getCourses).mockResolvedValue([
            { id: 'c1', title: 'Course 1' },
            { id: 'c2', title: 'Course 2' }
        ] as any);

        vi.mocked(prisma.skill.findMany).mockResolvedValue([
            { id: 's1', name: 'Skill 1' }
        ] as any);

        const jsx = await CoursesPage({ searchParams: {} });
        render(jsx);

        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByTestId('tag-filter')).toHaveTextContent('1 skills');
        expect(screen.getAllByTestId('course-card')).toHaveLength(2);
    });

    it('renders empty state when no courses', async () => {
        vi.mocked(getCourses).mockResolvedValue([]);
        vi.mocked(prisma.skill.findMany).mockResolvedValue([]);

        const jsx = await CoursesPage({ searchParams: {} });
        render(jsx);

        expect(screen.getByText('No courses found')).toBeInTheDocument();
    });
});
