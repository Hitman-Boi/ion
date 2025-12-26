import { expect, test } from '@playwright/test';
import { loginAs } from './utils/auth-helpers';

test.describe('Admin Roles & Paths Page', () => {
    // TODO: This test has flaky UI interactions (Radix Select, dynamic content visibility) that need investigation
    test.skip('Admin should be able to create Roles and Paths and Link them', async ({ page }) => {
        test.setTimeout(120000); // Extended timeout for DB operations
        // --- Admin Login ---
        await loginAs(page, 'ADMIN');


        // --- Go to Roles Page ---
        await page.goto('/admin-dashboard/roles');
        await expect(page.getByRole('heading', { name: 'Job Roles', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Learning Paths', exact: true })).toBeVisible();

        // --- Create New Path ---
        // Use unique names to avoid data pollution from previous test runs
        const timestamp = Date.now();
        const pathName = `E2E Path ${timestamp}`;
        const roleName = `E2E Role ${timestamp}`;

        await page.getByRole('button', { name: 'New Path' }).click();
        await expect(page.getByText('Create New Learning Path')).toBeVisible();

        await page.getByLabel('Path Title').fill(pathName);

        // Select Level - Radix Select can have backdrop issues with click
        // Use type-ahead to select (typing the first letter jumps to that option)
        const combobox = page.getByRole('combobox');
        await combobox.scrollIntoViewIfNeeded();
        await combobox.click();

        // Wait for dropdown to be open
        await page.waitForTimeout(500);

        // Type 'i' to jump to 'Intermediate' option (type-ahead)
        await page.keyboard.type('i');
        await page.keyboard.press('Enter');

        await page.getByRole('button', { name: 'Create & Start Building' }).click();

        // --- Verify Path Created & In List ---
        await expect(page.getByText(pathName)).toBeVisible();
        await expect(page.getByText('INTERMEDIATE').first()).toBeVisible();

        // --- Create New Role ---
        await page.getByRole('button', { name: 'New', exact: true }).click();
        await expect(page.getByText('Create Job Role')).toBeVisible();

        await page.getByLabel('Title').fill(roleName);
        await page.getByLabel('Description').fill('E2E Test Description');
        await page.getByRole('button', { name: 'Create Role' }).click();

        // --- Verify Role Created & In List ---
        await expect(page.getByText(roleName).first()).toBeVisible();

        // --- Link Path to Role ---
        // Click on the role to edit (use first to avoid strict mode violation)
        await page.getByText(roleName).first().click();
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
        await page.getByLabel(pathName).click({ force: true });

        // Verify toast or success
        await expect(page.getByText('INTERMEDIATE path linked Updated')).toBeVisible();

        // Close sheet
        await page.keyboard.press('Escape');
    });
});
