import { test, expect } from '@playwright/test';
import { loginAs } from './utils/auth-helpers';

test.describe('Header', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'STUDENT');
    });

    test('should display correct branding', async ({ page }) => {
        // Branding is a span, not a link
        await expect(page.getByText('ION Learning Hub')).toBeVisible();
    });

    test('should display learner navigation', async ({ page, isMobile }) => {
        if (isMobile) {
            await page.getByRole('button', { name: 'Open menu' }).click();
        }
        const dashboardBtn = page.getByRole('link', { name: 'Learner Dashboard' });
        await expect(dashboardBtn).toBeVisible();

        // Active state check for active page
        await expect(dashboardBtn).toHaveClass(/bg-accent/);
        await expect(dashboardBtn).toHaveAttribute('aria-disabled', 'true');

        // User menu button check (desktop) vs mobile menu check
        if (!isMobile) {
            await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
        } else {
            // On mobile we already clicked 'Open menu', so we can check if Sheet is open or close it
            await page.keyboard.press('Escape'); // Close menu to reset state if needed
        }
    });

    test('should show sign out option in user menu', async ({ page, isMobile }) => {
        if (isMobile) {
            await page.getByRole('button', { name: 'Open menu' }).click();
            await expect(page.getByText('Sign Out')).toBeVisible();
        } else {
            // Click user menu button
            await page.getByRole('button', { name: 'User menu' }).click();
            // Sign Out option should be visible in dropdown
            await expect(page.getByText('Sign Out')).toBeVisible();
        }
    });
});

