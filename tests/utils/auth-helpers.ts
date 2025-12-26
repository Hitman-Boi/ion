import { Page } from '@playwright/test';
import { TEST_USERS } from '../../src/lib/test-users';

export async function loginAs(page: Page, userKey: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userKey];

    await page.goto('/login');

    // Wait for the login form to be ready
    await page.waitForSelector('input[name="email"]');

    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);

    // Click the "Sign In" button (not the "Sign in with Microsoft" button)
    // Use text matching to click the correct button
    await page.click('button:has-text("Sign In"):not(:has-text("Microsoft"))');

    // Wait for navigation to one of the expected dashboard URLs
    // This is more reliable than waitForLoadState('networkidle')
    try {
        await page.waitForURL(/\/(learner-dashboard|admin-dashboard|instructor-dashboard)/, {
            timeout: 30000,
        });
    } catch {
        // Take a screenshot for debugging if we're still on login
        const currentUrl = page.url();
        if (currentUrl.includes('/login')) {
            await page.screenshot({ path: 'test-results/login-debug.png', fullPage: true });

            // Check for error message
            const errorElement = page.locator('.bg-red-50, .text-red-700, [role="alert"]');
            const hasError = await errorElement.count() > 0;

            if (hasError) {
                const errorText = await errorElement.first().textContent();
                throw new Error(`Login failed with error: ${errorText}`);
            }

            // If no visible error but still on login page, the form might not have submitted
            throw new Error(`Login did not redirect. Still on: ${currentUrl}. Screenshot saved to test-results/login-debug.png`);
        }
        // If we're not on login but also not on a dashboard, just continue
    }
}

