import { expect, test } from '@playwright/test';

test.describe('Instructor Dashboard Access', () => {

    test('Instructor (Admin) should see Dashboard link and access page', async ({ page }) => {
        // --- Login as Instructor ---
        await page.goto('/login');
        await page.getByLabel('Email').fill('admin@example.com');
        await page.getByLabel('Password').fill('admin');

        // Wait for navigation triggered by form submission
        await Promise.all([
            page.waitForURL(/\/learner-dashboard/, { timeout: 15000 }),
            page.getByRole('button', { name: 'Sign In', exact: true }).click()
        ]);

        // --- Verify Link in Header ---
        // Assuming the link text is "Instructor" based on my implementation
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
        await page.goto('/login');
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('Password').fill('test');

        // Wait for navigation triggered by form submission
        await Promise.all([
            page.waitForURL(/\/learner-dashboard/, { timeout: 15000 }),
            page.getByRole('button', { name: 'Sign In', exact: true }).click()
        ]);

        // --- Verify Link NOT in Header ---
        await expect(page.getByRole('link', { name: 'Instructor Dashboard', exact: true })).not.toBeVisible();

        // --- (Optional) Navigate manually and check for empty state or access ---
        // My implementation allows access but shows empty state.
        await page.goto('/instructor-dashboard');
        await expect(page.getByText('Become an Instructor')).toBeVisible();
        await expect(page.getByText('You are not currently listed as an instructor for any courses.')).toBeVisible();
    });

});
