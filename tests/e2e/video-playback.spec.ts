/**
 * Video Playback E2E Tests
 * Tests video player functionality and interactions
 */

import { expect, Page, test } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_VIDEO_ID = process.env.TEST_VIDEO_ID || 'sample-video-id';

test.describe('Video Playback', () => {
    let page: Page;

    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto(`${BASE_URL}/video/${TEST_VIDEO_ID}`);
    });

    test.afterEach(async () => {
        await page.close();
    });

    test('should load and display video player', async () => {
        // Check video player is visible
        const videoPlayer = page.locator('video');
        await expect(videoPlayer).toBeVisible();

        // Check video metadata
        await expect(page.locator('.video-title')).toBeVisible();
        await expect(page.locator('.video-views')).toBeVisible();
        await expect(page.locator('.video-upload-date')).toBeVisible();
    });

    test('should play and pause video', async () => {
        const playButton = page.locator('button[aria-label="Play"]');
        const pauseButton = page.locator('button[aria-label="Pause"]');
        const video = page.locator('video');

        // Click play
        await playButton.click();

        // Wait for video to start playing
        await page.waitForTimeout(1000);

        // Check video is playing
        const isPlaying = await video.evaluate((v: HTMLVideoElement) => !v.paused);
        expect(isPlaying).toBeTruthy();

        // Click pause
        await pauseButton.click();

        // Check video is paused
        const isPaused = await video.evaluate((v: HTMLVideoElement) => v.paused);
        expect(isPaused).toBeTruthy();
    });

    test('should seek to specific time', async () => {
        const video = page.locator('video');
        const progressBar = page.locator('.video-progress-bar');

        // Play video first
        await page.locator('button[aria-label="Play"]').click();
        await page.waitForTimeout(1000);

        // Click on progress bar to seek
        const progressBox = await progressBar.boundingBox();
        if (progressBox) {
            // Click at 50% position
            await page.mouse.click(
                progressBox.x + progressBox.width * 0.5,
                progressBox.y + progressBox.height * 0.5
            );
        }

        // Check that time has changed
        const currentTime = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
        expect(currentTime).toBeGreaterThan(0);
    });

    test('should adjust volume', async () => {
        const video = page.locator('video');
        const volumeSlider = page.locator('input[aria-label="Volume"]');

        // Set volume to 50%
        await volumeSlider.fill('0.5');

        // Check volume changed
        const volume = await video.evaluate((v: HTMLVideoElement) => v.volume);
        expect(volume).toBeCloseTo(0.5, 1);
    });

    test('should toggle mute', async () => {
        const video = page.locator('video');
        const muteButton = page.locator('button[aria-label="Mute"]');

        // Click mute
        await muteButton.click();

        // Check video is muted
        const isMuted = await video.evaluate((v: HTMLVideoElement) => v.muted);
        expect(isMuted).toBeTruthy();

        // Click unmute
        const unmuteButton = page.locator('button[aria-label="Unmute"]');
        await unmuteButton.click();

        // Check video is unmuted
        const isUnmuted = await video.evaluate((v: HTMLVideoElement) => !v.muted);
        expect(isUnmuted).toBeTruthy();
    });

    test('should change playback speed', async () => {
        const video = page.locator('video');
        const settingsButton = page.locator('button[aria-label="Settings"]');

        // Open settings
        await settingsButton.click();

        // Select playback speed
        await page.click('button:has-text("Playback Speed")');
        await page.click('button:has-text("1.5x")');

        // Check playback rate changed
        const playbackRate = await video.evaluate((v: HTMLVideoElement) => v.playbackRate);
        expect(playbackRate).toBe(1.5);
    });

    test('should toggle fullscreen', async () => {
        const fullscreenButton = page.locator('button[aria-label="Enter fullscreen"]');

        // Enter fullscreen
        await fullscreenButton.click();

        // Wait a bit for fullscreen to activate
        await page.waitForTimeout(500);

        // Check fullscreen state
        const isFullscreen = await page.evaluate(() => !!document.fullscreenElement);
        expect(isFullscreen).toBeTruthy();

        // Exit fullscreen using Escape key
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        const isNotFullscreen = await page.evaluate(() => !document.fullscreenElement);
        expect(isNotFullscreen).toBeTruthy();
    });

    test('should handle keyboard shortcuts', async () => {
        const video = page.locator('video');

        // Space to play/pause
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        const isPlaying = await video.evaluate((v: HTMLVideoElement) => !v.paused);
        expect(isPlaying).toBeTruthy();

        await page.keyboard.press('Space');
        await page.waitForTimeout(500);
        const isPaused = await video.evaluate((v: HTMLVideoElement) => v.paused);
        expect(isPaused).toBeTruthy();

        // M to mute
        await page.keyboard.press('m');
        const isMuted = await video.evaluate((v: HTMLVideoElement) => v.muted);
        expect(isMuted).toBeTruthy();

        // F for fullscreen
        await page.keyboard.press('f');
        await page.waitForTimeout(500);
        const isFullscreen = await page.evaluate(() => !!document.fullscreenElement);
        expect(isFullscreen).toBeTruthy();
    });

    test('should display video quality options', async () => {
        const settingsButton = page.locator('button[aria-label="Settings"]');

        // Open settings
        await settingsButton.click();

        // Click quality option
        await page.click('button:has-text("Quality")');

        // Check quality options are visible
        await expect(page.locator('button:has-text("1080p")')).toBeVisible();
        await expect(page.locator('button:has-text("720p")')).toBeVisible();
        await expect(page.locator('button:has-text("480p")')).toBeVisible();
    });

    test('should show buffering indicator', async () => {
        const video = page.locator('video');

        // Simulate slow connection by throttling
        const client = await page.context().newCDPSession(page);
        await client.send('Network.emulateNetworkConditions', {
            offline: false,
            downloadThroughput: 50 * 1024, // 50 KB/s
            uploadThroughput: 20 * 1024,
            latency: 500,
        });

        // Play video
        await page.locator('button[aria-label="Play"]').click();

        // Check for loading spinner
        await expect(page.locator('.video-loading-spinner')).toBeVisible({ timeout: 5000 });
    });

    test('should track watch time and analytics', async () => {
        // Play video
        await page.locator('button[aria-label="Play"]').click();

        // Watch for 5 seconds
        await page.waitForTimeout(5000);

        // Check that analytics event was sent
        const analyticsRequest = await page.waitForRequest(
            (request) => request.url().includes('/api/analytics'),
            { timeout: 10000 }
        );

        // Should have sent view tracking
        expect(analyticsRequest).toBeTruthy();
    });

    test('should allow liking/disliking video', async () => {
        const likeButton = page.locator('button[aria-label="Like"]');
        const likeCount = page.locator('.like-count');

        // Get initial like count
        const initialCount = await likeCount.textContent();

        // Click like
        await likeButton.click();

        // Wait for update
        await page.waitForTimeout(500);

        // Check like count increased
        const newCount = await likeCount.textContent();
        expect(newCount).not.toBe(initialCount);

        // Check button state changed
        await expect(likeButton).toHaveClass(/active|liked/);
    });

    test('should load and display comments', async () => {
        // Scroll to comments section
        await page.locator('.comments-section').scrollIntoViewIfNeeded();

        // Check comments are visible
        await expect(page.locator('.comments-section')).toBeVisible();
        await expect(page.locator('.comment-count')).toBeVisible();

        // Check comment input is present
        await expect(page.locator('textarea[placeholder*="comment"]')).toBeVisible();
    });

    test('should post a comment', async () => {
        // Login first (if not already logged in)
        // await loginTestUser(page);

        const commentText = `Test comment ${Date.now()}`;
        const commentInput = page.locator('textarea[placeholder*="comment"]');
        const submitButton = page.locator('button:has-text("Comment")');

        // Scroll to comments
        await commentInput.scrollIntoViewIfNeeded();

        // Type comment
        await commentInput.fill(commentText);

        // Submit
        await submitButton.click();

        // Wait for comment to appear
        await expect(page.locator(`.comment:has-text("${commentText}")`)).toBeVisible({ timeout: 5000 });
    });

    test('should display related videos', async () => {
        // Check related videos sidebar
        const relatedVideos = page.locator('.related-videos');
        await expect(relatedVideos).toBeVisible();

        // Should have at least 3 related videos
        const videoCards = page.locator('.related-video-card');
        await expect(videoCards).toHaveCount(3, { timeout: 5000 });
    });

    test('should autoplay next video', async () => {
        const video = page.locator('video');

        // Enable autoplay
        await page.click('button[aria-label="Autoplay"]');

        // Play video and fast forward to end
        await page.locator('button[aria-label="Play"]').click();

        // Seek to near end
        await video.evaluate((v: HTMLVideoElement) => {
            v.currentTime = v.duration - 5;
        });

        // Wait for video to end
        await video.evaluate((v: HTMLVideoElement) => {
            return new Promise<void>((resolve) => {
                v.addEventListener('ended', () => resolve(), { once: true });
            });
        });

        // Check that next video started loading
        await page.waitForURL(/.*\/video\/.+/, { timeout: 10000 });
    });
});
