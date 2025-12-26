import { expect, test } from '@playwright/test';
import { loginAs } from './utils/auth-helpers';

test.describe('Admin UI', () => {
    test.beforeEach(async ({ page }) => {
        // Login flow
        await loginAs(page, 'ADMIN');
    });

    test('Add Admin Sheet should be visible', async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        await page.goto('/admin-dashboard', { timeout: 60000 });

        // Click "Manage Admins" button
        await page.getByRole('button', { name: 'Manage Admins' }).click();

        // Check for Sheet Title
        await expect(page.getByRole('heading', { name: 'Add New Admin' })).toBeVisible();

        // Check for Select User label
        await expect(page.getByLabel('Select User')).toBeVisible();

        // Check for Combobox trigger
        await expect(page.getByRole('combobox')).toBeVisible();

        // Open Combobox
        // Scope to dialog to avoid clicking elements behind the overlay
        await page.getByRole('dialog').getByRole('combobox').dispatchEvent('click');

        // Check for Search input in Command
        await expect(page.getByPlaceholder('Search user...')).toBeVisible();

        // Search for seeded user
        await page.getByPlaceholder('Search user...').fill('test');

        // Verify user is in the list
        await expect(page.getByText('test@example.com')).toBeVisible();
    });

    test('Create Course Sheet should be visible', async ({ page }) => {
        await page.goto('/admin-dashboard');

        // Click "Create Course" button
        await page.getByRole('button', { name: 'Create Course' }).click();

        // Check for Sheet Title
        await expect(page.getByRole('heading', { name: 'Create New Course' })).toBeVisible();

        // Check for Input field inside sheet
        await expect(page.getByLabel('Course Title')).toBeVisible();
    });
});
