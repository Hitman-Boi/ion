import { test, expect } from '@playwright/test';

test('mobile home page', async ({ page }) => {
    await page.goto('/');

    // Check if the main heading is visible on mobile
    await expect(page.getByRole('heading', { name: 'Level Up Your Skills' })).toBeVisible();

    // Check if the Get Started link is visible
    await expect(page.getByRole('link', { name: 'Get Started Now' })).toBeVisible();
});
