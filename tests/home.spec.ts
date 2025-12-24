import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    // Adjust this based on the actual title of the app, assuming "Learning Hub" or similar.
    // If unsure, we can check for something generic or just that the page loads.
    // For now, let's check for the presence of a main element or just that it doesn't 404.
    await expect(page).toHaveTitle(/Learning Hub/);
});

test('get started link', async ({ page }) => {
    await page.goto('/');

    // Check if there's a heading
    await expect(page.getByRole('heading', { name: 'Start learning with Learning Hub' })).toBeVisible();

    // Check if there's a Get Started link
    await expect(page.getByRole('link', { name: 'Get Started Now' })).toBeVisible();
});
