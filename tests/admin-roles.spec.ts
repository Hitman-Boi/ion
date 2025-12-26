import { expect, test } from '@playwright/test';
import { loginAs } from './utils/auth-helpers';

test.describe('Admin Roles & Paths Page', () => {
    test('Admin should be able to create Roles and Paths and Link them', async ({ page }) => {
        test.setTimeout(120000); // Extended timeout for DB operations
        // --- Admin Login ---
        await loginAs(page, 'ADMIN');


        // --- Go to Roles Page ---
        await page.goto('/admin-dashboard/roles');
        await expect(page.getByRole('heading', { name: 'Job Roles', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Learning Paths', exact: true })).toBeVisible();

        // --- Create New Path ---
        await page.getByRole('button', { name: 'New Path' }).click();
        await expect(page.getByText('Create New Learning Path')).toBeVisible();

        await page.getByLabel('Path Title').fill('Test React Path');
        // Select Level
        await page.getByRole('combobox').click({ force: true });
        await page.getByLabel('Intermediate').click({ force: true });

        await page.getByRole('button', { name: 'Create & Start Building' }).click();

        // --- Verify Path Created & In List ---
        await expect(page.getByText('Test React Path')).toBeVisible();
        await expect(page.getByText('INTERMEDIATE')).toBeVisible();

        // --- Create New Role ---
        await page.getByRole('button', { name: 'New', exact: true }).click();
        await expect(page.getByText('Create Job Role')).toBeVisible();

        await page.getByLabel('Title').fill('Test Role');
        await page.getByLabel('Description').fill('Test Description');
        await page.getByRole('button', { name: 'Create Role' }).click();

        // --- Verify Role Created & In List ---
        await expect(page.getByText('Test Role')).toBeVisible();

        // --- Link Path to Role ---
        // Click on the role to edit
        await page.getByText('Test Role').click();
        await expect(page.getByText('Edit Job Role')).toBeVisible();

        // Find Intermediate Path Select
        // There are 3 selects. We need to find the one for Intermediate.
        // Label is 'intermediate'.
        // Wait for select to be visible.
        const intermediateLabel = page.locator('label', { hasText: 'intermediate' });
        await expect(intermediateLabel).toBeVisible();

        // The Select trigger is next sibling or nearby.
        // Let's click just the select trigger associated with intermediate.
        // Easier: click the trigger following the label.
        await page.locator('div').filter({ hasText: /^intermediateSelect Path$/ }).getByRole('combobox').click({ force: true });

        // Select our path
        await page.getByLabel('Test React Path').click({ force: true });

        // Verify toast or success
        await expect(page.getByText('INTERMEDIATE path linked Updated')).toBeVisible();

        // Close sheet
        await page.keyboard.press('Escape');
    });
});
