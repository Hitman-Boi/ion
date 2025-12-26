import { Page, expect } from '@playwright/test';
import { TEST_USERS } from '../../src/lib/test-users';

export async function loginAs(page: Page, userKey: keyof typeof TEST_USERS) {
    const user = TEST_USERS[userKey];

    await page.goto('/login');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to either learner-dashboard, admin, or instructor-dashboard
    // This regex covers the common redirect paths
    await page.waitForURL(/\/(learner-dashboard|admin|instructor-dashboard)/);
}
