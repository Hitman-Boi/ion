import { test, expect } from '@playwright/test';

test.describe('Header', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('Password').fill('test');
        await page.getByRole('button', { name: 'Sign In', exact: true }).click();
        await page.waitForURL('**/learner-dashboard');
    });

    test('should display correct branding', async ({ page }) => {
        await expect(page.getByRole('link', { name: 'ION Learning Hub' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'ION Learning Hub' })).toHaveAttribute('href', '/learner-dashboard');
    });

    test('should display learner navigation', async ({ page }) => {
        const dashboardBtn = page.getByRole('link', { name: 'Learner Dashboard' });
        await expect(dashboardBtn).toBeVisible();

        // Active state check for active page
        await expect(dashboardBtn).toHaveClass(/bg-accent/);
        await expect(dashboardBtn).toHaveAttribute('aria-disabled', 'true');

        // Other buttons should exist but not be active
        const careerBtn = page.getByRole('link', { name: 'Career' });
        await expect(careerBtn).toBeVisible();
        await expect(careerBtn).not.toHaveClass(/(^|\s)bg-accent(\s|$)/);

        await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    });

    test('should navigate to career and update active state', async ({ page }) => {
        const careerLink = page.getByRole('link', { name: 'Career' });
        await careerLink.click();

        await expect(page).toHaveURL(/\/career/);

        const careerBtn = page.getByRole('link', { name: 'Career' });
        await expect(careerBtn).toHaveClass(/bg-accent/);
        await expect(careerBtn).toHaveAttribute('aria-disabled', 'true');

        const dashboardBtn = page.getByRole('link', { name: 'Learner Dashboard' });
        await expect(dashboardBtn).not.toHaveClass(/(^|\s)bg-accent(\s|$)/);
    });
});
