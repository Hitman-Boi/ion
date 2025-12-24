import { expect, test } from '@playwright/test';

test.describe('Admin UI', () => {
    test.beforeEach(async ({ page }) => {
        // Login flow
        await page.goto('/login');

        // Ensure we are on the login page
        await expect(page).toHaveURL(/.*\/login/);

        // Fill credentials
        await page.getByLabel('Email').fill('admin@example.com');
        await page.getByLabel('Password').fill('admin');

        // Click strict Sign In button (avoiding Microsoft one)
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();

        // Wait for redirect to home or dashboard
        // Wait for a visible element on the dashboard to confirm login
        await expect(page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible({ timeout: 15000 });
    });

    test('Add Admin Sheet should be visible', async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        await page.goto('/admin', { timeout: 60000 });

        // Click "Manage Admins" button
        await page.getByRole('button', { name: 'Manage Admins' }).click();

        // Check for Sheet Title
        await expect(page.getByRole('heading', { name: 'Add New Admin' })).toBeVisible();

        // Check for Select User label
        await expect(page.getByLabel('Select User')).toBeVisible();

        // Check for Combobox trigger
        await expect(page.getByRole('combobox')).toBeVisible();

        // Open Combobox
        await page.getByRole('combobox').click();

        // Check for Search input in Command
        await expect(page.getByPlaceholder('Search user...')).toBeVisible();

        // Search for seeded user
        await page.getByPlaceholder('Search user...').fill('test');

        // Verify user is in the list
        await expect(page.getByText('test@example.com')).toBeVisible();
    });

    test('Create Course Sheet should be visible', async ({ page }) => {
        await page.goto('/admin');

        // Click "Create Course" button
        await page.getByRole('button', { name: 'Create Course' }).click();

        // Check for Sheet Title
        await expect(page.getByRole('heading', { name: 'Create New Course' })).toBeVisible();

        // Check for Input field inside sheet
        await expect(page.getByLabel('Course Title')).toBeVisible();
    });
});
