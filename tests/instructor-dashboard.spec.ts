import { expect, test } from '@playwright/test';
import { loginAs } from './utils/auth-helpers';

test.describe('Instructor Dashboard Access', () => {

    test('Instructor (Admin) should see Dashboard link and access page', async ({ page, isMobile }) => {
        // --- Login as Instructor ---
        await loginAs(page, 'ADMIN'); // Using admin as they are an instructor too in this test context

        // --- Verify Link in Header ---
        // Assuming the link text is "Instructor" based on my implementation
        if (isMobile) {
            await page.getByRole('button', { name: 'Open menu' }).click();
        }
        await expect(page.getByRole('link', { name: 'Instructor Dashboard', exact: true })).toBeVisible();

        // --- Navigate to Instructor Dashboard ---
        await page.getByRole('link', { name: 'Instructor Dashboard', exact: true }).click();
        await expect(page).toHaveURL(/\/instructor-dashboard/);

        // --- Verify Page Content ---
        await expect(page.getByRole('heading', { name: 'Instructor Dashboard' })).toBeVisible();

        // Verify course card is visible
        await expect(page.getByRole('heading', { name: 'Advanced React' }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: 'Manage Course' }).first()).toBeVisible();
    });

    test('Student should NOT see Dashboard link', async ({ page }) => {
        // --- Login as Student ---
        await loginAs(page, 'STUDENT');

        // --- Verify Link NOT in Header ---
        await expect(page.getByRole('link', { name: 'Instructor Dashboard', exact: true })).not.toBeVisible();

        // --- (Optional) Navigate manually and check for empty state or access ---
        // My implementation allows access but shows empty state.
        await page.goto('/instructor-dashboard');
        await expect(page.getByText('Become an Instructor')).toBeVisible();
        await expect(page.getByText('You are not currently listed as an instructor for any courses.')).toBeVisible();
    });

});
