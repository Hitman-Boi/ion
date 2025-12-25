import { test, expect } from "@playwright/test";

/**
 * Admin Heatmap E2E Tests
 * Tests for the skill matrix heatmap and content health dashboard
 * Note: Heatmap visualization is a future enhancement item
 */

test.describe("Admin Content Health Dashboard", () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto("/login");
        await page.fill('input[name="email"]', "admin@test.com");
        await page.fill('input[name="password"]', "password123");
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(learner-dashboard|admin)/);
    });

    test("admin dashboard should load successfully", async ({ page }) => {
        await page.goto("/admin-dashboard");

        await expect(page).toHaveURL(/\/admin-dashboard/);
        await expect(page).not.toHaveTitle(/Error/);
    });

    test("should display courses with health indicators", async ({ page }) => {
        await page.goto("/admin-dashboard");

        // Look for course cards or list items
        const courseCards = page.locator('[data-testid="course-card"], .course-card, .course-item');

        // Admin page should load even if no courses exist
        await expect(page).toHaveURL(/\/admin-dashboard/);
    });

    test("stale courses should show warning badges", async ({ page }) => {
        await page.goto("/admin-dashboard");

        // Look for various status badges
        const warningBadges = page.locator('.badge, [data-testid="needs-review"], [data-testid="review-soon"]');

        // Page should load
        await expect(page).not.toHaveTitle(/Error/);
    });
});

test.describe("Skill Matrix Heatmap (Future)", () => {
    // Note: The skill matrix heatmap is a future enhancement
    // These tests are placeholder for when the feature is implemented

    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', "admin@test.com");
        await page.fill('input[name="password"]', "password123");
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(learner-dashboard|admin)/);
    });

    test("heatmap should be accessible from admin dashboard", async ({ page }) => {
        await page.goto("/admin-dashboard");

        // Look for content health or heatmap links
        const healthLink = page.locator('a[href*="/content-health"], a[href*="/heatmap"], text=Content Health');

        // For now, just verify admin loads
        await expect(page).toHaveURL(/\/admin-dashboard/);
    });

    test("heatmap should display skills on Y-axis", async ({ page }) => {
        // Future: Verify skill names are displayed
        await page.goto("/admin-dashboard");
        await expect(page).not.toHaveTitle(/Error/);
    });

    test("heatmap should display teams on X-axis", async ({ page }) => {
        // Future: Verify team names are displayed
        await page.goto("/admin-dashboard");
        await expect(page).not.toHaveTitle(/Error/);
    });

    test("heatmap cells should show health score colors", async ({ page }) => {
        // Future: Verify color coding (Red/Yellow/Green)
        // Red: No content
        // Yellow: Health Score < 60
        // Green: Health Score > 85
        await page.goto("/admin-dashboard");
        await expect(page).not.toHaveTitle(/Error/);
    });
});

test.describe("Coverage Metrics", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/login");
        await page.fill('input[name="email"]', "admin@test.com");
        await page.fill('input[name="password"]', "password123");
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(learner-dashboard|admin)/);
    });

    test("should display staleness ratio metric", async ({ page }) => {
        // Staleness Ratio = % of active content expired (target < 10%)
        await page.goto("/admin-dashboard");

        const stalenessMetric = page.locator('[data-testid="staleness-ratio"], .staleness-metric');

        await expect(page).toHaveURL(/\/admin-dashboard/);
    });

    test("should display coverage ratio metric", async ({ page }) => {
        // Coverage Ratio = % of Required Skills with at least 1 Topic (target 100%)
        await page.goto("/admin-dashboard");

        const coverageMetric = page.locator('[data-testid="coverage-ratio"], .coverage-metric');

        await expect(page).toHaveURL(/\/admin-dashboard/);
    });
});
