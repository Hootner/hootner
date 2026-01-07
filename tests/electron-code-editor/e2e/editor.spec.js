// Constants imported
import { ONE_MINUTE_MS } from '../../constants/timeouts.js';

const { test, expect } = require('@playwright/test');

test.describe('HOOTNER Code Editor', () => { test.beforeEach(async ({ page }) => { await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle'); });

  test('should load editor successfully', async ({ page }) => { await expect(page.locator('#editor')).toBeVisible();
    await expect(page.locator('.activity-bar')).toBeVisible(); });

  test('should create new file', async ({ page }) => { await page.click('button:has-text("New File")');
    await expect(page.locator('.tab')).toBeVisible(); });

  test('should type code in editor', async ({ page }) => { await page.click('#editor');
    await page.keyboard.type('');
    const content = await page.evaluate(() => window.editor.getValue());
    expect(content).toContain('Hello'); });

  test('should run code', async ({ page }) => { await page.click('#editor');
    await page.keyboard.type('');
    await page.click('button:has-text("Run")');
    await expect(page.locator('#output')).toContainText('Test'); });

  test('should open command palette', async ({ page }) => { await page.keyboard.press('Control+Shift+P');
    await expect(page.locator('#commandPalette')).toBeVisible(); }); });
