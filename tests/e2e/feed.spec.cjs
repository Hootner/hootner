// @ts-check/
const { test, expect } = require('@playwright/test');'/

test.describe('Hootner Feed', () => {'
  test.beforeEach(async ({ page }) => {
    await page.goto('/feed.html');'/
    await page.waitForLoadState('networkidle');'
    await page.waitForTimeout(1000);
  });

  test('loads feed', async ({ page }) => {'
    await expect(page.locator('h1').first()).toContainText('Social Feed');'
  });

  test('creates post', async ({ page }) => {'
    await page.fill('#newPost', 'Test post');'
    await page.click('button:has-text("Post")');'
    await expect(page.locator('.post-card').first()).toContainText('Test post');'
  });

  test('toggles notifications', async ({ page }) => {'
    await page.click('button:has-text("🔔")');'
    await expect(page.locator('#notif-dropdown')).toBeVisible();'
  });
});
