import { test, expect } from '@playwright/test';

test.describe('Platform Health', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Hootner/);
  });

  test('should respond to health check', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.status).toBe('healthy');
  });

  test('should load GraphQL endpoint', async ({ request }) => {
    const response = await request.post('/graphql', {
      data: { query: '{ __typename }' }
    });
    expect(response.ok()).toBeTruthy();
  });
});
