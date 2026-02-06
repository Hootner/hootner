/**
 * E2E Test Helpers
 * Shared utilities for Playwright tests
 */

import { Page, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';

export interface TestUser {
    email: string;
    password: string;
    username: string;
    id?: string;
}

/**
 * Generate a unique test user
 */
export function generateTestUser(): TestUser {
    const timestamp = Date.now();
    return {
        email: `test-${timestamp}@example.com`,
        password: 'TestPassword123!',
        // cSpell:disable-next-line
        username: `testuser_${timestamp}`,
    };
}

/**
 * Register a new test user
 */
export async function registerUser(page: Page, user: TestUser): Promise<void> {
    await page.goto(`${BASE_URL}/register`);

    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="username"]', user.username);
    await page.fill('input[name="password"]', user.password);
    await page.fill('input[name="confirmPassword"]', user.password);

    await page.click('button[type="submit"]');

    // Wait for registration success
    await expect(page.locator('.registration-success, .success-message')).toBeVisible({
        timeout: 10000
    });
}

/**
 * Login a test user
 */
export async function loginUser(page: Page, user: TestUser): Promise<void> {
    await page.goto(`${BASE_URL}/login`);

    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);

    await page.click('button[type="submit"]');

    // Wait for login redirect
    await page.waitForURL(/.*\/(dashboard|home|profile)/, { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logoutUser(page: Page): Promise<void> {
    await page.click('button[aria-label="User menu"], .user-menu');
    await page.click('button:has-text("Logout"), a:has-text("Logout")');

    // Wait for redirect to login
    await page.waitForURL(/.*\/(login|home)/, { timeout: 5000 });
}

/**
 * Delete a video via API
 */
export async function deleteVideo(videoId: string, authToken?: string): Promise<void> {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}/api/videos/${videoId}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            console.error('Failed to delete video:', { videoId: videoId.replace(/[\r\n]/g, ''), status: response.status });
        }
    } catch (error) {
        console.error('Error deleting video');
    }
}

/**
 * Delete a user via API
 */
export async function deleteUser(userId: string, authToken?: string): Promise<void> {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            console.error('Failed to delete user:', { userId: userId.replace(/[\r\n]/g, ''), status: response.status });
        }
    } catch (error) {
        console.error('Error deleting user');
    }
}

/**
 * Wait for video processing to complete
 */
export async function waitForVideoProcessing(
    page: Page,
    videoId: string,
    timeout = 60000
): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        const status = await page.locator('.video-status, .processing-status').textContent();

        if (status?.includes('ready') || status?.includes('completed')) {
            return;
        }

        if (status?.includes('failed') || status?.includes('error')) {
            throw new Error('Video processing failed');
        }

        await page.waitForTimeout(2000);
        await page.reload();
    }

    throw new Error('Video processing timeout');
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshot(
    page: Page,
    name: string
): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await page.screenshot({
        path: `screenshots/${name}-${timestamp}.png`,
        fullPage: true,
    });
}

/**
 * Wait for network requests to complete
 */
export async function waitForNetworkIdle(
    page: Page,
    timeout = 5000
): Promise<void> {
    // cSpell:disable-next-line
    await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Clear browser storage
 */
export async function clearStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    await page.context().clearCookies();
}

/**
 * Set local storage item
 */
export async function setLocalStorage(
    page: Page,
    key: string,
    value: string
): Promise<void> {
    await page.evaluate(
        ({ key, value }) => localStorage.setItem(key, value),
        { key, value }
    );
}

/**
 * Get local storage item
 */
export async function getLocalStorage(
    page: Page,
    key: string
): Promise<string | null> {
    return await page.evaluate(
        (key) => localStorage.getItem(key),
        key
    );
}

/**
 * Mock API response
 */
export async function mockApiResponse(
    page: Page,
    url: string | RegExp,
    response: any,
    status = 200
): Promise<void> {
    await page.route(url, (route) => {
        route.fulfill({
            status,
            contentType: 'application/json',
            body: JSON.stringify(response),
        });
    });
}

/**
 * Intercept and modify API response
 */
export async function interceptApiResponse(
    page: Page,
    url: string | RegExp,
    modifier: (response: any) => any
): Promise<void> {
    await page.route(url, async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        const modified = modifier(json);

        await route.fulfill({
            response,
            body: JSON.stringify(modified),
        });
    });
}

/**
 * Wait for GraphQL query/mutation
 */
export async function waitForGraphQL(
    page: Page,
    operationName: string,
    timeout = 10000
): Promise<any> {
    return await page.waitForResponse(
        (response) => {
            if (response.url().includes('/graphql')) {
                const postData = response.request().postDataJSON();
                return postData?.operationName === operationName;
            }
            return false;
        },
        { timeout }
    );
}

/**
 * Fill form with multiple fields
 */
export async function fillForm(
    page: Page,
    fields: Record<string, string>
): Promise<void> {
    for (const [name, value] of Object.entries(fields)) {
        await page.fill(`input[name="${name}"], textarea[name="${name}"]`, value);
    }
}

/**
 * Check if element exists (without timeout)
 */
export async function elementExists(
    page: Page,
    selector: string
): Promise<boolean> {
    return (await page.locator(selector).count()) > 0;
}

/**
 * Scroll to element
 */
export async function scrollToElement(
    page: Page,
    selector: string
): Promise<void> {
    await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Hover over element
 */
export async function hoverElement(
    page: Page,
    selector: string
): Promise<void> {
    await page.hover(selector);
}

/**
 * Select option by label
 */
export async function selectByLabel(
    page: Page,
    selector: string,
    label: string
): Promise<void> {
    await page.selectOption(selector, { label });
}

/**
 * Get text content
 */
export async function getText(
    page: Page,
    selector: string
): Promise<string | null> {
    return await page.locator(selector).textContent();
}

/**
 * Get attribute value
 */
export async function getAttribute(
    page: Page,
    selector: string,
    attribute: string
): Promise<string | null> {
    return await page.locator(selector).getAttribute(attribute);
}

/**
 * Wait for URL pattern
 */
export async function waitForUrl(
    page: Page,
    pattern: string | RegExp,
    timeout = 10000
): Promise<void> {
    await page.waitForURL(pattern, { timeout });
}

/**
 * Press keyboard key
 */
export async function pressKey(
    page: Page,
    key: string
): Promise<void> {
    await page.keyboard.press(key);
}

/**
 * Type text with delay (simulates human typing)
 */
export async function typeSlowly(
    page: Page,
    selector: string,
    text: string,
    delay = 100
): Promise<void> {
    await page.type(selector, text, { delay });
}

/**
 * Drag and drop
 */
export async function dragAndDrop(
    page: Page,
    source: string,
    target: string
): Promise<void> {
    await page.dragAndDrop(source, target);
}

/**
 * Check if checkbox is checked
 */
export async function isChecked(
    page: Page,
    selector: string
): Promise<boolean> {
    return await page.isChecked(selector);
}

/**
 * Wait for element to disappear
 */
export async function waitForElementToDisappear(
    page: Page,
    selector: string,
    timeout = 10000
): Promise<void> {
    await page.waitForSelector(selector, { state: 'hidden', timeout });
}
