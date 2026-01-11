/**
 * Video Upload E2E Tests
 * Tests the complete video upload flow with Playwright
 */

import { expect, Page, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Test configuration
const TEST_VIDEO_PATH = path.join(__dirname, '../fixtures/test-video.mp4');
const TEST_THUMBNAIL_PATH = path.join(__dirname, '../fixtures/test-thumbnail.jpg');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test user credentials
const TEST_USER = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    username: `testuser_${Date.now()}`,
};

test.describe('Video Upload Flow', () => {
    let page: Page;
    let uploadedVideoId: string;

    test.beforeAll(async ({ browser }) => {
        // Create test fixtures if they don't exist
        await ensureTestFixtures();
    });

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();

        // Register and login
        await registerTestUser(page);
        await loginTestUser(page);
    });

    test.afterEach(async () => {
        // Cleanup: Delete uploaded video
        if (uploadedVideoId) {
            await deleteVideo(uploadedVideoId);
        }

        await page.close();
    });

    test('should successfully upload a video with metadata', async () => {
        // Navigate to upload page
        await page.goto(`${BASE_URL}/upload`);
        await expect(page).toHaveTitle(/Upload.*Video/i);

        // Fill in video metadata
        await page.fill('input[name="title"]', 'Test Video Upload');
        await page.fill('textarea[name="description"]', 'This is a test video uploaded via E2E tests');

        // Select category
        await page.selectOption('select[name="category"]', 'Education');

        // Add tags
        await page.fill('input[name="tags"]', 'test, automation, playwright');

        // Upload video file
        const videoInput = page.locator('input[type="file"][name="video"]');
        await videoInput.setInputFiles(TEST_VIDEO_PATH);

        // Wait for video validation
        await expect(page.locator('.video-preview')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('.video-duration')).toContainText(/\d+:\d+/);

        // Upload thumbnail (optional)
        const thumbnailInput = page.locator('input[type="file"][name="thumbnail"]');
        await thumbnailInput.setInputFiles(TEST_THUMBNAIL_PATH);
        await expect(page.locator('.thumbnail-preview')).toBeVisible();

        // Set visibility
        await page.click('input[name="visibility"][value="public"]');

        // Enable comments
        await page.check('input[name="allowComments"]');

        // Submit upload
        await page.click('button[type="submit"]:has-text("Upload Video")');

        // Wait for upload progress
        await expect(page.locator('.upload-progress')).toBeVisible();
        await expect(page.locator('.upload-progress-bar')).toBeVisible();

        // Wait for upload completion (may take a while)
        await expect(page.locator('.upload-success')).toBeVisible({ timeout: 60000 });
        await expect(page.locator('.upload-success')).toContainText(/successfully uploaded/i);

        // Extract video ID from success message or URL
        const successMessage = await page.locator('.upload-success').textContent();
        const videoIdMatch = successMessage?.match(/video\/([a-zA-Z0-9-]+)/);

        if (videoIdMatch) {
            uploadedVideoId = videoIdMatch[1];
            expect(uploadedVideoId).toBeTruthy();
        }

        // Verify redirect to video page
        await page.waitForURL(/.*\/video\/.+/, { timeout: 10000 });
    });

    test('should validate video file format and size', async () => {
        await page.goto(`${BASE_URL}/upload`);

        // Try to upload invalid file type
        const videoInput = page.locator('input[type="file"][name="video"]');

        // Create temporary invalid file
        const invalidFilePath = path.join(__dirname, '../fixtures/invalid-file.txt');
        fs.writeFileSync(invalidFilePath, 'This is not a video file');

        await videoInput.setInputFiles(invalidFilePath);

        // Check for error message
        await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.error-message')).toContainText(/invalid.*file.*type/i);

        // Cleanup
        fs.unlinkSync(invalidFilePath);
    });

    test('should show upload progress and allow cancellation', async () => {
        await page.goto(`${BASE_URL}/upload`);

        // Fill minimal required fields
        await page.fill('input[name="title"]', 'Test Upload Cancellation');

        // Upload video
        const videoInput = page.locator('input[type="file"][name="video"]');
        await videoInput.setInputFiles(TEST_VIDEO_PATH);

        // Submit upload
        await page.click('button[type="submit"]:has-text("Upload Video")');

        // Wait for progress to appear
        await expect(page.locator('.upload-progress')).toBeVisible();

        // Cancel upload
        await page.click('button:has-text("Cancel Upload")');

        // Verify cancellation
        await expect(page.locator('.upload-cancelled')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('.upload-cancelled')).toContainText(/upload.*cancelled/i);
    });

    test('should handle video processing and display processing status', async () => {
        await page.goto(`${BASE_URL}/upload`);

        // Fill in metadata
        await page.fill('input[name="title"]', 'Video Processing Test');
        await page.fill('textarea[name="description"]', 'Testing video processing pipeline');

        // Upload video
        const videoInput = page.locator('input[type="file"][name="video"]');
        await videoInput.setInputFiles(TEST_VIDEO_PATH);

        // Submit
        await page.click('button[type="submit"]:has-text("Upload Video")');

        // Wait for upload completion
        await expect(page.locator('.upload-success')).toBeVisible({ timeout: 60000 });

        // Navigate to video page
        await page.click('a:has-text("View Video")');

        // Check processing status
        const processingStatus = page.locator('.processing-status');

        // Video should be in processing state
        await expect(processingStatus).toBeVisible();
        await expect(processingStatus).toContainText(/processing|encoding/i);

        // Extract video ID for cleanup
        const currentUrl = page.url();
        const urlMatch = currentUrl.match(/video\/([a-zA-Z0-9-]+)/);
        if (urlMatch) {
            uploadedVideoId = urlMatch[1];
        }
    });

    test('should preserve draft if user navigates away', async () => {
        await page.goto(`${BASE_URL}/upload`);

        // Fill in some data
        const testTitle = 'Draft Video Title';
        await page.fill('input[name="title"]', testTitle);
        await page.fill('textarea[name="description"]', 'This is a draft description');

        // Navigate away
        await page.goto(`${BASE_URL}/dashboard`);

        // Come back to upload page
        await page.goto(`${BASE_URL}/upload`);

        // Check if draft is restored
        const titleValue = await page.inputValue('input[name="title"]');
        expect(titleValue).toBe(testTitle);
    });

    test('should display video in user library after upload', async () => {
        await page.goto(`${BASE_URL}/upload`);

        const videoTitle = `Library Test Video ${Date.now()}`;

        // Fill and upload
        await page.fill('input[name="title"]', videoTitle);
        const videoInput = page.locator('input[type="file"][name="video"]');
        await videoInput.setInputFiles(TEST_VIDEO_PATH);

        await page.click('button[type="submit"]:has-text("Upload Video")');
        await expect(page.locator('.upload-success')).toBeVisible({ timeout: 60000 });

        // Navigate to user library
        await page.goto(`${BASE_URL}/library`);

        // Search for uploaded video
        await page.fill('input[name="search"]', videoTitle);
        await page.keyboard.press('Enter');

        // Verify video appears in library
        await expect(page.locator(`.video-card:has-text("${videoTitle}")`)).toBeVisible({ timeout: 10000 });

        // Extract video ID for cleanup
        const videoCard = page.locator(`.video-card:has-text("${videoTitle}")`);
        const videoLink = await videoCard.locator('a').first().getAttribute('href');
        const videoIdMatch = videoLink?.match(/video\/([a-zA-Z0-9-]+)/);
        if (videoIdMatch) {
            uploadedVideoId = videoIdMatch[1];
        }
    });

    test('should allow editing video metadata after upload', async () => {
        // First upload a video
        await page.goto(`${BASE_URL}/upload`);

        await page.fill('input[name="title"]', 'Original Title');
        const videoInput = page.locator('input[type="file"][name="video"]');
        await videoInput.setInputFiles(TEST_VIDEO_PATH);

        await page.click('button[type="submit"]:has-text("Upload Video")');
        await expect(page.locator('.upload-success')).toBeVisible({ timeout: 60000 });

        // Get video URL and navigate
        const videoUrl = page.url();
        uploadedVideoId = videoUrl.match(/video\/([a-zA-Z0-9-]+)/)?.[1] || '';

        // Navigate to edit page
        await page.goto(`${BASE_URL}/video/${uploadedVideoId}/edit`);

        // Update metadata
        const newTitle = 'Updated Video Title';
        await page.fill('input[name="title"]', newTitle);
        await page.fill('textarea[name="description"]', 'Updated description');

        // Save changes
        await page.click('button:has-text("Save Changes")');

        // Verify changes saved
        await expect(page.locator('.save-success')).toBeVisible();

        // Navigate back to video and verify
        await page.goto(`${BASE_URL}/video/${uploadedVideoId}`);
        await expect(page.locator('h1')).toContainText(newTitle);
    });

    test('should handle multiple file uploads', async () => {
        await page.goto(`${BASE_URL}/upload`);

        // Enable batch upload mode
        await page.click('button:has-text("Batch Upload")');

        // Add multiple videos
        const videoInput = page.locator('input[type="file"][name="videos"]');
        await videoInput.setInputFiles([TEST_VIDEO_PATH, TEST_VIDEO_PATH]);

        // Verify multiple files listed
        const fileList = page.locator('.file-list-item');
        await expect(fileList).toHaveCount(2);

        // Fill metadata for each
        for (let i = 0; i < 2; i++) {
            await page.fill(`input[name="videos[${i}].title"]`, `Batch Video ${i + 1}`);
        }

        // Upload all
        await page.click('button:has-text("Upload All")');

        // Wait for all uploads
        await expect(page.locator('.batch-upload-complete')).toBeVisible({ timeout: 120000 });
    });
});

// Helper functions

async function ensureTestFixtures() {
    const fixturesDir = path.join(__dirname, '../fixtures');

    if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create dummy test video if it doesn't exist
    if (!fs.existsSync(TEST_VIDEO_PATH)) {
        // In real tests, use actual video files
        console.warn('Test video not found. Please add test-video.mp4 to fixtures/');
    }

    // Create dummy thumbnail if it doesn't exist
    if (!fs.existsSync(TEST_THUMBNAIL_PATH)) {
        console.warn('Test thumbnail not found. Please add test-thumbnail.jpg to fixtures/');
    }
}

async function registerTestUser(page: Page) {
    await page.goto(`${BASE_URL}/register`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.fill('input[name="confirmPassword"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for registration success
    await expect(page.locator('.registration-success')).toBeVisible({ timeout: 10000 });
}

async function loginTestUser(page: Page) {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Wait for login redirect
    await page.waitForURL(/.*\/(dashboard|home)/, { timeout: 10000 });
}

async function deleteVideo(videoId: string) {
    // Call API to delete test video
    try {
        const response = await fetch(`${BASE_URL}/api/videos/${videoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Failed to delete test video: ${videoId}`);
        }
    } catch (error) {
        console.error('Error deleting test video:', error);
    }
}
