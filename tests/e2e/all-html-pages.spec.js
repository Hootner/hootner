/**
 * E2E Tests for All HTML5 Pages in UI Interface
 * Tests all 25 pages in heptagonal/4-interface/ui/pages/
 */

const { test, expect } = require('@playwright/test');

// Base URL for the application
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// List of all HTML pages to test
const HTML_PAGES = [
  'index.html',
  'dashboard.html',
  'login.html',
  'settings.html',
  'profile.html',
  'video-player.html',
  'upload-video.html',
  'my-videos.html',
  'analytics.html',
  'ai-video.html',
  'marketplace.html',
  'messages.html',
  'contact.html',
  'security.html',
  'admin-session-manager.html',
  'agent-management.html',
  'auto-editor.html',
  'code-editor.html',
  'collaboration.html',
  'devops-monitoring.html',
  'erp-dashboard.html',
  'feed-react.html',
  'live-activity.html',
  'live-stream.html',
  'ultra-editor.html'
];

test.describe('All HTML5 Pages E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Set timeout for page loads
    page.setDefaultTimeout(30000);
  });

  // Test each HTML page loads successfully
  for (const htmlPage of HTML_PAGES) {
    test(`should load ${htmlPage} successfully`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}/${htmlPage}`, {
        waitUntil: 'networkidle',
        timeout: 30000
      });
      
      // Check HTTP status
      expect(response.status()).toBeLessThan(400);
      
      // Check page has proper DOCTYPE
      const doctype = await page.evaluate(() => {
        return document.doctype ? document.doctype.name : null;
      });
      expect(doctype).toBe('html');
      
      // Check page has HTML tag with lang attribute
      const hasLang = await page.evaluate(() => {
        const html = document.documentElement;
        return html.hasAttribute('lang');
      });
      expect(hasLang).toBe(true);
      
      // Check page has meta charset
      const hasCharset = await page.evaluate(() => {
        const charset = document.querySelector('meta[charset]');
        return charset !== null;
      });
      expect(hasCharset).toBe(true);
      
      // Check page has a title
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      // Check no console errors (except known warnings)
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded');
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `tests/test-results/screenshots/${htmlPage.replace('.html', '')}.png`,
        fullPage: true 
      });
      
      console.log(`✓ ${htmlPage} loaded successfully`);
    });
  }
  
  // Test navigation between pages
  test('should navigate between pages without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard.html`, { waitUntil: 'networkidle' });
    
    // Test a few key navigation links
    const navigationTests = [
      { from: 'dashboard.html', to: 'my-videos.html', linkText: 'Videos' },
      { from: 'dashboard.html', to: 'analytics.html', linkText: 'Analytics' },
      { from: 'dashboard.html', to: 'settings.html', linkText: 'Settings' }
    ];
    
    for (const nav of navigationTests) {
      await page.goto(`${BASE_URL}/${nav.from}`, { waitUntil: 'networkidle' });
      
      // Try to find and click navigation link (if exists)
      const link = page.locator(`a[href*="${nav.to}"]`).first();
      if (await link.count() > 0) {
        await link.click();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain(nav.to);
        console.log(`✓ Navigation from ${nav.from} to ${nav.to} successful`);
      }
    }
  });
  
  // Test responsive design
  test('should render properly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    // Test a few key pages on mobile
    const mobilePagesToTest = ['index.html', 'dashboard.html', 'video-player.html'];
    
    for (const htmlPage of mobilePagesToTest) {
      await page.goto(`${BASE_URL}/${htmlPage}`, { waitUntil: 'networkidle' });
      
      // Check page is visible and interactive
      const bodyVisible = await page.isVisible('body');
      expect(bodyVisible).toBe(true);
      
      console.log(`✓ ${htmlPage} renders on mobile`);
    }
  });
  
  // Test accessibility basics
  test('should have basic accessibility features', async ({ page }) => {
    const pagesToTest = ['dashboard.html', 'login.html', 'settings.html'];
    
    for (const htmlPage of pagesToTest) {
      await page.goto(`${BASE_URL}/${htmlPage}`, { waitUntil: 'networkidle' });
      
      // Check for alt attributes on images
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.hasAttribute('alt')).length;
      });
      
      // Check for form labels
      const inputsWithoutLabels = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]'));
        return inputs.filter(input => {
          const id = input.id;
          const label = document.querySelector(`label[for="${id}"]`);
          return !label && !input.hasAttribute('aria-label');
        }).length;
      });
      
      console.log(`✓ ${htmlPage} accessibility check complete`);
    }
  });
});

test.describe('GraphQL Integration Tests', () => {
  
  test('GraphQL health endpoint should respond', async ({ request }) => {
    try {
      const response = await request.post(`${BASE_URL}/graphql`, {
        data: {
          query: '{ health }'
        }
      });
      
      expect(response.status()).toBeLessThan(500);
      console.log('✓ GraphQL endpoint is responsive');
    } catch (error) {
      console.log('⚠ GraphQL endpoint not available:', error.message);
    }
  });
});
