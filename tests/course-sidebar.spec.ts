import { expect, test } from '@playwright/test';
import { loginAs } from './utils/auth-helpers';

test.describe('Course Sidebar', () => {
    test.beforeEach(async ({ page }) => {
        // Login as seeded student
        await loginAs(page, 'STUDENT');
    });

    test('Sidebar collapse/expand and navigation', async ({ page }) => {
        // Find and click the "Start Course" or "Continue Learning" button for Advanced React on Dashboard
        // The dashboard lists enrolled courses.
        const courseCard = page.locator('.rounded-xl').filter({ hasText: 'Advanced React' }).first();
        // Just find the link with correct text. On dashboard it is "Start Course" or "Continue Learning"
        await page.getByRole('link', { name: /Start Course|Continue Learning/ }).first().click();

        // Ensure we are on the course details page (since dashboard link goes to /courses/[id])
        // Dashboard link: href={`/courses/${enrollment.courseId}`}
        await expect(page).toHaveURL(/\/courses\/[0-9a-f-]{36}/);

        // On Course Details page, click "Start Learning" or "Continue Learning" to go to learn page
        await page.getByRole('link', { name: /Start Learning|Continue Learning/ }).first().click();


        // Ensure we are on the learning page
        await expect(page).toHaveURL(/\/topic\//);

        // 1. Verify Initial State (Expanded) - sidebar now defaults to expanded
        // Expanded width is 320px (w-80 = 20rem = 320px)
        const sidebar = page.locator('.h-full.flex.flex-col.border-r').first();
        const initialBox = await sidebar.boundingBox();
        expect(initialBox?.width).toBeGreaterThan(300);

        // Sidebar content should be visible when expanded
        await expect(sidebar.getByText('Introduction')).toBeVisible();
        await expect(sidebar.getByText('Welcome to the Course')).toBeVisible();

        // 2. Collapse Sidebar via Button
        // The toggle button is in the sidebar header
        const toggleButton = sidebar.getByRole('button').first();
        await toggleButton.waitFor({ state: 'visible' });
        await toggleButton.click({ force: true });

        // 3. Verify Collapsed State
        // Collapsed width is 60px
        await page.waitForTimeout(500); // Wait for transition
        const collapsedBox = await sidebar.boundingBox();
        expect(collapsedBox?.width).toBeCloseTo(60, 0);

        // Sidebar content should be hidden (titles)
        await expect(sidebar.getByText('Introduction')).not.toBeVisible();
        await expect(sidebar.getByText('Welcome to the Course')).not.toBeVisible();

        // 4. Expand Sidebar again
        await toggleButton.click({ force: true });
        await page.waitForTimeout(500);
        const expandedBox = await sidebar.boundingBox();
        expect(expandedBox?.width).toBeGreaterThan(300);

        // Content should be visible again
        await expect(sidebar.getByText('Introduction')).toBeVisible();

        // 5. Test Navigation
        // Click on the second topic
        await page.getByRole('link', { name: 'Setup Environment' }).click();

        // URL should have changed (we don't know the exact UUID, but it should change)
        // We can check if the active state changed manually or just ensure no error
        await expect(page).not.toHaveURL(/error/);

        // 6. Test Keyboard Shortcut (Cmd+B)
        // Focus somewhere
        await page.mouse.click(100, 100);

        // Collapse first
        await toggleButton.click();
        await page.waitForTimeout(500);
        const collapsedBox2 = await sidebar.boundingBox();
        expect(collapsedBox2?.width).toBeCloseTo(60, 0);

        // Press Shortcut to Expand
        await page.keyboard.press('Meta+b');
        await page.waitForTimeout(500);
        const expandedBox2 = await sidebar.boundingBox();
        expect(expandedBox2?.width).toBeGreaterThan(300);

        // Press Shortcut to Collapse
        await page.keyboard.press('Meta+b');
        await page.waitForTimeout(500);
        const collapsedBox3 = await sidebar.boundingBox();
        expect(collapsedBox3?.width).toBeCloseTo(60, 0);
    });
});

