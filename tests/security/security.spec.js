/**
 * Security Testing Suite
 * Automated security tests for QA/Security Engineer
 */

import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {

  // Authentication & Authorization
  test.describe('Authentication', () => {

    test('should reject invalid JWT tokens', async ({ request }) => {
      const response = await request.get('/api/protected', {
        headers: { 'Authorization': 'Bearer invalid_token' }
      });
      expect(response.status()).toBe(401);
    });

    test('should enforce password complexity', async ({ request }) => {
      const weakPasswords = ['123456', 'password', 'abc123'];
      const testEmail = `test-${Date.now()}@example.com`;

      for (const password of weakPasswords) {
        const response = await request.post('/api/auth/register', {
          data: {
            email: testEmail,
            password
          }
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('password');
      }
    });

    test('should implement rate limiting on login', async ({ request }) => {
      const attempts = [];
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = process.env.TEST_INVALID_PASSWORD || 'wrong';

      for (let i = 0; i < 10; i++) {
        attempts.push(
          request.post('/api/auth/login', {
            data: { email: testEmail, password: testPassword }
          })
        );
      }

      const responses = await Promise.all(attempts);
      const rateLimited = responses.some(r => r.status() === 429);
      expect(rateLimited).toBe(true);
    });

    test('should expire sessions after timeout', async ({ page }) => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = process.env.TEST_PASSWORD || 'ValidPass123!';

      await page.goto('/login');
      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', testPassword);
      await page.click('button[type="submit"]');

      // Simulate session timeout by clearing cookies
      await page.context().clearCookies();

      await page.goto('/dashboard');
      await expect(page).toHaveURL('/login');
    });
  });

  // Injection Attacks
  test.describe('Injection Prevention', () => {

    test('should prevent SQL injection', async ({ request }) => {
      const sqlPayloads = [
        "' OR '1'='1",
        "'; DROP TABLE users--",
        "1' UNION SELECT * FROM users--"
      ];

      for (const payload of sqlPayloads) {
        const response = await request.get(`/api/users?id=${payload}`);
        expect(response.status()).not.toBe(200);
      }
    });

    test('should prevent NoSQL injection', async ({ request }) => {
      const noSqlPayloads = [
        { $gt: '' },
        { $ne: null },
        { $regex: '.*' }
      ];

      for (const payload of noSqlPayloads) {
        const response = await request.post('/api/auth/login', {
          data: {
            email: payload,
            password: payload
          }
        });
        expect(response.status()).toBe(400);
      }
    });

    test('should prevent XSS attacks', async ({ page }) => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        'javascript:alert("XSS")'
      ];

      for (const payload of xssPayloads) {
        await page.goto('/profile');
        await page.fill('[name="bio"]', payload);
        await page.click('button[type="submit"]');

        await page.reload();
        const bio = await page.textContent('.user-bio');
        expect(bio).not.toContain('<script>');
        expect(bio).not.toContain('onerror');
      }
    });

    test('should prevent command injection', async ({ request }) => {
      const cmdPayloads = [
        '; ls -la',
        '| cat /etc/passwd',
        '`whoami`'
      ];

      for (const payload of cmdPayloads) {
        const response = await request.post('/api/process', {
          data: { filename: payload }
        });
        expect(response.status()).toBe(400);
      }
    });
  });

  // CSRF Protection
  test.describe('CSRF Protection', () => {

    test('should require CSRF token for state-changing operations', async ({ request }) => {
      const response = await request.post('/api/users/delete', {
        data: { userId: '123' }
        // No CSRF token
      });
      expect(response.status()).toBe(403);
    });

    test('should validate CSRF token', async ({ page, request }) => {
      await page.goto('/dashboard');
      const csrfToken = await page.getAttribute('meta[name="csrf-token"]', 'content');

      const response = await request.post('/api/users/update', {
        headers: { 'X-CSRF-Token': 'invalid_token' },
        data: { name: 'Test' }
      });
      expect(response.status()).toBe(403);
    });
  });

  // Data Exposure
  test.describe('Data Protection', () => {

    test('should not expose sensitive data in responses', async ({ request }) => {
      const response = await request.get('/api/users/me');
      const body = await response.json();

      expect(body).not.toHaveProperty('password');
      expect(body).not.toHaveProperty('passwordHash');
      expect(body).not.toHaveProperty('salt');
      expect(body).not.toHaveProperty('privateKey');
    });

    test('should not expose stack traces in production', async ({ request }) => {
      const response = await request.get('/api/error-endpoint');
      const body = await response.json();

      expect(body).not.toHaveProperty('stack');
      expect(JSON.stringify(body)).not.toContain('at Object');
    });

    test.skip('should enforce HTTPS', async ({ page }) => {
      // Skip in development - only run in production/staging
      await page.goto('http://localhost:3000');
      expect(page.url()).toMatch(/^https:/);
    });
  });

  // File Upload Security
  test.describe('File Upload Security', () => {

    test('should validate file types', async ({ request }) => {
      const maliciousFiles = [
        { name: 'malware.exe', type: 'application/x-msdownload' },
        { name: 'script.php', type: 'application/x-php' },
        { name: 'shell.sh', type: 'application/x-sh' }
      ];

      for (const file of maliciousFiles) {
        const response = await request.post('/api/upload', {
          multipart: {
            file: {
              name: file.name,
              mimeType: file.type,
              buffer: Buffer.from('malicious content')
            }
          }
        });
        expect(response.status()).toBe(400);
      }
    });

    test('should enforce file size limits', async ({ request }) => {
      const largeFile = Buffer.alloc(100 * 1024 * 1024); // 100MB

      const response = await request.post('/api/upload', {
        multipart: {
          file: {
            name: 'large.mp4',
            mimeType: 'video/mp4',
            buffer: largeFile
          }
        }
      });
      expect(response.status()).toBe(413);
    });

    test('should sanitize filenames', async ({ request }) => {
      const maliciousNames = [
        '../../../etc/passwd',
        'file;rm -rf /',
        'file<script>.mp4'
      ];

      for (const name of maliciousNames) {
        const response = await request.post('/api/upload', {
          multipart: {
            file: {
              name,
              mimeType: 'video/mp4',
              buffer: Buffer.from('content')
            }
          }
        });

        if (response.status() === 200) {
          const body = await response.json();
          expect(body.filename).not.toContain('..');
          expect(body.filename).not.toContain(';');
          expect(body.filename).not.toContain('<');
        }
      }
    });
  });

  // API Security
  test.describe('API Security', () => {

    test('should implement rate limiting', async ({ request }) => {
      const requests = Array(100).fill(null).map(() =>
        request.get('/api/videos')
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status() === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    test('should validate content-type', async ({ request }) => {
      const response = await request.post('/api/users', {
        headers: { 'Content-Type': 'text/plain' },
        data: 'not json'
      });
      expect(response.status()).toBe(415);
    });

    test('should set security headers', async ({ request }) => {
      const response = await request.get('/');
      const headers = response.headers();

      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
      expect(headers['strict-transport-security']).toContain('max-age');
      expect(headers['content-security-policy']).toBeDefined();
    });
  });

  // Session Management
  test.describe('Session Security', () => {

    test('should use secure cookies', async ({ page }) => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = process.env.TEST_PASSWORD || 'ValidPass123!';

      await page.goto('/login');
      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', testPassword);
      await page.click('button[type="submit"]');

      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(c => c.name === 'session');

      expect(sessionCookie.secure).toBe(true);
      expect(sessionCookie.httpOnly).toBe(true);
      expect(sessionCookie.sameSite).toBe('Strict');
    });

    test('should invalidate session on logout', async ({ page }) => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = process.env.TEST_PASSWORD || 'ValidPass123!';

      await page.goto('/login');
      await page.fill('[name="email"]', testEmail);
      await page.fill('[name="password"]', testPassword);
      await page.click('button[type="submit"]');

      const cookiesBefore = await page.context().cookies();

      await page.click('[data-testid="logout"]');

      const cookiesAfter = await page.context().cookies();
      const sessionCookie = cookiesAfter.find(c => c.name === 'session');

      expect(sessionCookie).toBeUndefined();
    });
  });

  // GDPR Compliance
  test.describe('GDPR Compliance', () => {

    test('should allow data export', async ({ request }) => {
      const response = await request.get('/api/users/me/export', {
        headers: { 'Authorization': 'Bearer valid_token' }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('personal_data');
      expect(data).toHaveProperty('content');
      expect(data).toHaveProperty('activity_history');
    });

    test('should allow account deletion', async ({ request }) => {
      const response = await request.delete('/api/users/me', {
        headers: { 'Authorization': 'Bearer valid_token' }
      });

      expect(response.status()).toBe(200);
    });

    test('should require consent for cookies', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-testid="cookie-banner"]')).toBeVisible();
    });
  });
});

// Performance & Load Testing
test.describe('Performance Tests', () => {

  test('should handle concurrent requests', async ({ request }) => {
    const concurrentRequests = 20;
    const requests = Array(concurrentRequests).fill(null).map(() =>
      request.get('/api/videos')
    );

    const start = Date.now();
    const responses = await Promise.allSettled(requests);
    const duration = Date.now() - start;

    const successful = responses.filter(r => r.status === 'fulfilled' && r.value.status() === 200).length;
    const successRate = successful / concurrentRequests;
    expect(successRate).toBeGreaterThan(0.95); // 95% success rate
    expect(duration).toBeLessThan(5000); // Complete within 5 seconds
  });

  test('should respond within SLA', async ({ request }) => {
    const endpoints = [
      '/api/videos',
      '/api/users/me',
      '/api/dashboard'
    ];

    for (const endpoint of endpoints) {
      const start = Date.now();
      await request.get(endpoint);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500); // 500ms SLA
    }
  });
});
