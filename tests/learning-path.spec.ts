import { expect, test } from '@playwright/test';
import { loginAs } from './utils/auth-helpers';

test.describe('Learning Path Workflow', () => {
    test('Admin can create and manage learning paths', async ({ page, isMobile }) => {
        test.skip(isMobile, 'Learning Path management is not optimized for mobile yet');
        // --- Admin Login ---
        await loginAs(page, 'ADMIN');

        // Navigate to Roles Page
        await page.goto('/admin-dashboard/roles');
        await expect(page.getByRole('heading', { name: 'Roles & Curriculums' })).toBeVisible();

        // Verify Path "Frontend Mastery" exists (from seed data)
        const pathEl = page.getByText('Frontend Mastery').first();
        if (isMobile) {
            await pathEl.scrollIntoViewIfNeeded();
        }
        await expect(pathEl).toBeVisible();

        // Edit path by clicking the card
        await page.getByText('Frontend Mastery').first().click();

        // Check Path Builder Sheet is open
        await expect(page.getByRole('heading', { name: 'Edit Path: Frontend Mastery' })).toBeVisible();
    });

    // TODO: This test is flaky due to shared DB state (student onboarding status)
    test.skip('Student can view and select learning paths', async ({ page }) => {
        // --- Student Login ---
        await loginAs(page, 'STUDENT');
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

        // Check Journey Map displays the learning path (partial match)
        // Try looking for it as a heading or strong text
        const pathTitle = page.locator('text=Frontend Mastery').first();
        if (isMobile) {
            // On mobile, verify it exists even if off-screen, or scroll to it
            await pathTitle.scrollIntoViewIfNeeded();
        }
        await expect(pathTitle).toBeVisible();

        // Check course node is visible
        await expect(page.getByText('Advanced React').first()).toBeVisible();
        await expect(page.getByText('Step 1').first()).toBeVisible();

        // Check enrollment card also appears
        await expect(page.getByRole('heading', { name: 'Advanced React', level: 3 })).toBeVisible();
    });
});
