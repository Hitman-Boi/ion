"use client";

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ManageSkillsSheet } from './manage-skills-sheet';

// Mock actions
const mockCreateSkill = vi.fn();
const mockCreateSkillTarget = vi.fn();

vi.mock('@/app/actions/skills.actions', () => ({
    createSkill: (...args: any[]) => mockCreateSkill(...args),
    createSkillTarget: (...args: any[]) => mockCreateSkillTarget(...args),
}));

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: mockRefresh }),
}));

// Mock UI components
vi.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }: any) => <div data-testid="sheet">{children}</div>,
    SheetTrigger: ({ children, onClick }: any) => <div onClick={onClick} data-testid="sheet-trigger">{children}</div>,
    SheetContent: ({ children }: any) => <div>{children}</div>,
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children }: any) => <h2>{children}</h2>,
    SheetDescription: ({ children }: any) => <p>{children}</p>,
}));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children }: any) => <div>{children}</div>,
    TabsList: ({ children }: any) => <div>{children}</div>,
    TabsTrigger: ({ children, value, onClick }: any) => <button onClick={onClick}>{value}</button>,
    TabsContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/card', () => ({
    Card: ({ children }: any) => <div>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children }: any) => <h3>{children}</h3>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/progress', () => ({
    Progress: ({ value }: any) => <div data-testid="progress" data-value={value}></div>,
}));

vi.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

// Mock form action handling since jsdom doesn't support action prop fully
// We can intercept the form submit or inspect the form action prop.
// Check if the component uses `action={async (formData) => ...}`
// Yes it does. React handles this. Testing it might require triggering submit on form.

describe('ManageSkillsSheet', () => {
    const initialGapData = [
        { id: 'gap1', skillName: 'React', currentCount: 2, targetCount: 5, gap: 3 },
        { id: 'gap2', skillName: 'Node', currentCount: 5, targetCount: 5, gap: 0 },
    ];

    const allSkills = [
        { id: 's1', name: 'React', category: 'Frontend', createdAt: new Date(), updatedAt: new Date(), roles: [], item: [], userSkills: [] }, // Adding extra fields to satisfy Type if needed, but error said createdAt, updatedAt, and maybe others if strict. 
        // Error: missing ... createdAt, updatedAt.
        // I'll add them.
        { id: 's2', name: 'Node', category: 'Backend', createdAt: new Date(), updatedAt: new Date(), roles: [], item: [], userSkills: [] },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockCreateSkill.mockResolvedValue({});
        mockCreateSkillTarget.mockResolvedValue({});
    });

    it('renders skill gap data correctly', async () => {
        const user = userEvent.setup();
        render(<ManageSkillsSheet initialGapData={initialGapData} allSkills={allSkills} />);

        await user.click(screen.getByRole('button', { name: /manage skills/i }));

        expect(screen.getByRole('heading', { name: 'React' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Node' })).toBeInTheDocument();
        expect(screen.getByText(/2/)).toBeInTheDocument(); // 2 / 5
        expect(screen.getByText(/3 more people needed/)).toBeInTheDocument();

        expect(screen.getByText(/Target met or exceeded/)).toBeInTheDocument();
    });

    // Testing actions in TabsContent value="actions"
    // Since mock Tabs renders all content (bad mock?) or we need to switch tabs?
    // My mock Tabs simply renders children. TabsList renders buttons. TabsContent renders children.
    // So both "Overview" and "Actions" contents are rendered simultaneously in my simple mock.
    // This allows testing existence without clicking tabs, which is fine for unit tests unless we test visibility.

    it('renders creation forms', async () => {
        const user = userEvent.setup();
        render(<ManageSkillsSheet initialGapData={initialGapData} allSkills={allSkills} />);
        await user.click(screen.getByRole('button', { name: /manage skills/i }));

        expect(screen.getByText('Define New Skill')).toBeInTheDocument();
        expect(screen.getByText('Set Skill Target')).toBeInTheDocument();
    });
});
