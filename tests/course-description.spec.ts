
import { test, expect } from '@playwright/test';
import { loginAs } from './utils/auth-helpers';

test.describe('Course Editor & Resource Management', () => {

    test.beforeEach(async ({ page }) => {
        // 1. Login as Instructor
        await loginAs(page, 'INSTRUCTOR');

        // 2. Navigate to Studio
        const courseCard = page.locator('text=Studio Test Course');
        await expect(courseCard).toBeVisible();
        await courseCard.click();

        // Check if we are on studio or need to click studio link
        const url = page.url();
        if (url.includes('/courses/') && !url.includes('/studio')) {
            const studioLink = page.locator('a[href*="/studio"]');
            if (await studioLink.count() > 0) {
                await studioLink.click();
            } else {
                await page.goto(`${url}/studio`);
            }
        }
        await expect(page).toHaveURL(/.*\/studio/);
    });

    test('should allow editing course title and description', async ({ page }) => {
        // 1. Check initial state
        const descriptionLocator = page.locator('header p.text-gray-400');
        const titleLocator = page.locator('header h1');
        await expect(descriptionLocator).toBeVisible();
        await expect(titleLocator).toBeVisible();

        // 2. Click Edit Button (Pencil icon)
        const editBtn = page.getByTitle("Edit Description");
        await editBtn.click();

        // 3. Verify Drawer opens
        await expect(page.locator('h2:has-text("Edit Course Details")')).toBeVisible();

        // 4. Enter new details
        const newTitle = `Updated Course Title ${Date.now()}`;
        const newDescription = `Updated Description ${Date.now()}`;

        await page.locator('input[placeholder="Data Structures & Algorithms"]').fill(newTitle);
        await page.locator('textarea[placeholder="Enter course description..."]').fill(newDescription);

        // 5. Save
        await page.click('button:has-text("Save Changes")');

        // 6. Verify Drawer closes and text updates
        await expect(page.locator('h2:has-text("Edit Course Details")')).not.toBeVisible();
        await expect(titleLocator).toHaveText(newTitle);
        await expect(descriptionLocator).toHaveText(newDescription);

        // 7. Reload and verify persistence
        await page.reload();
        await expect(titleLocator).toHaveText(newTitle);
        await expect(descriptionLocator).toHaveText(newDescription);
    });

    test('should update quiz summary when questions are added', async ({ page }) => {
        // 1. Create a module and quiz
        await page.getByTestId('new-module-button').click();
        await page.getByTestId('sheet-title-input').fill('Quiz Module');
        await page.getByTestId('sheet-submit-button').click();

        const moduleCard = page.locator('div', { hasText: 'Quiz Module' }).filter({ has: page.locator('[data-testid^="add-topic-btn-"]') }).last();
        await moduleCard.locator('[data-testid^="add-topic-btn-"]').click();

        await page.getByTestId('sheet-title-input').fill('Quiz Topic');
        await page.getByTestId('sheet-submit-button').click();

        const topicTitle = page.locator('text=Quiz Topic').last();
        await topicTitle.click();

        const topicCard = page.locator('div', { hasText: 'Quiz Topic' }).last();
        await topicCard.locator('[data-testid^="add-quiz-"]').click();

        // 2. Add 2 Questions
        await page.click('button:has-text("Add Question")'); // Multiple Choice
        await page.getByPlaceholder('Enter question...').fill('Q1');
        await page.getByPlaceholder('Option 1').fill('A');
        await page.getByPlaceholder('Option 2').fill('B');

        await page.click('button:has-text("Short Answer")'); // Text
        await page.getByPlaceholder('Enter question...').nth(1).fill('Q2'); // nth(1) because first one exists

        // 3. Save
        await page.click('button:has-text("Save Quiz")');

        // 4. Verify Summary
        const quizResource = page.locator('text=Quiz: 2 Questions').last();
        await expect(quizResource).toBeVisible();
    });

    test('should update resource summaries on save', async ({ page }) => {
        // 1. Setup Module/Topic
        await page.getByTestId('new-module-button').click();
        await page.getByTestId('sheet-title-input').fill('Resource Module');
        await page.getByTestId('sheet-submit-button').click();

        const moduleCard = page.locator('div', { hasText: 'Resource Module' }).filter({ has: page.locator('[data-testid^="add-topic-btn-"]') }).last();
        await moduleCard.locator('[data-testid^="add-topic-btn-"]').click();

        await page.getByTestId('sheet-title-input').fill('Resource Topic');
        await page.getByTestId('sheet-submit-button').click();

        const topicTitle = page.locator('text=Resource Topic').last();
        await topicTitle.click();
        const topicCard = page.locator('div', { hasText: 'Resource Topic' }).last();

        // 2. Video Test
        await topicCard.locator('[data-testid^="add-video-"]').click();
        // Just use a dummy URL or if simple validation allows
        await page.getByPlaceholder('https://youtube.com/... or direct video URL').fill('https://example.com/video.mp4');
        await page.click('button:has-text("Save Video")');

        const videoSummary = page.locator('text=Video from example.com').last();
        await expect(videoSummary).toBeVisible();

        // 3. Reading Test
        await topicCard.locator('[data-testid^="add-reading-"]').click();
        await page.getByPlaceholder('https://example.com/document.pdf').fill('https://example.com/guide.pdf');
        await page.click('button:has-text("Save Reading Material")');

        const readingSummary = page.locator('text=Reading: guide.pdf').last();
        await expect(readingSummary).toBeVisible();
    });
});
