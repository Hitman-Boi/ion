import { expect, test } from '@playwright/test';

test.describe('Learning Path Workflow', () => {
    test('Admin can create and manage learning paths', async ({ page }) => {
        // --- Admin Login ---
        await page.goto('/login');
        await page.getByLabel('Email').fill('admin@example.com');
        await page.getByLabel('Password').fill('admin');
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();

        // Wait for navigation to complete
        await page.waitForURL('**/learner-dashboard', { timeout: 10000, waitUntil: 'domcontentloaded' });

        // Check for dashboard redirect
        await expect(page).toHaveURL(/.*\/learner-dashboard/);

        // Navigate to Roles Page
        await page.goto('/admin-dashboard/roles');
        await expect(page.getByRole('heading', { name: 'Roles & Curriculums' })).toBeVisible();

        // Verify Path "Frontend Mastery" exists (from seed data)
        await expect(page.getByText('Frontend Mastery').first()).toBeVisible();

        // Edit path by clicking the card
        await page.getByText('Frontend Mastery').first().click();

        // Check Path Builder Sheet is open
        await expect(page.getByRole('heading', { name: 'Edit Path: Frontend Mastery' })).toBeVisible();
    });

    test('Student can view and select learning paths', async ({ page }) => {
        // --- Student Login ---
        await page.goto('/login');
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('Password').fill('test');
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();

        // Wait for navigation and check dashboard
        await page.waitForURL('**/learner-dashboard', { timeout: 10000, waitUntil: 'domcontentloaded' });
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

        // Check Role Selection or Journey Map
        // If Student doesn't have role selected, they should see "Choose your Career Path"
        // Otherwise they'll see the journey map directly
        const chooseHeader = page.getByRole('heading', { name: 'Choose your Career Path' });
        const isChoosing = await chooseHeader.isVisible().catch(() => false);

        if (isChoosing) {
            await page.getByText('Senior Frontend Engineer').click();
            await page.getByRole('button', { name: 'Select this Path' }).click();
            // Wait for the journey map to appear after selection
            await page.waitForTimeout(1000);
        }

        // After selection (or if already selected), verify we can see the learning path content

        // Check Journey Map displays the learning path
        await expect(page.getByText('Learning Path: Frontend Mastery').first()).toBeVisible();

        // Check course node is visible
        await expect(page.getByText('Advanced React').first()).toBeVisible();
        await expect(page.getByText('Step 1').first()).toBeVisible();

        // Check enrollment card also appears
        await expect(page.getByRole('heading', { name: 'Advanced React', level: 3 })).toBeVisible();
    });
});
