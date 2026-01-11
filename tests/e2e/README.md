# Playwright E2E Tests

Comprehensive end-to-end tests for HOOTNER video platform using Playwright.

## Test Suites

### Video Upload Tests (`video-upload.spec.ts`)
Tests the complete video upload workflow:

- ✅ **Upload with metadata** - Title, description, tags, category
- ✅ **File validation** - Format, size, type checking
- ✅ **Upload progress** - Progress bar, cancellation
- ✅ **Video processing** - Processing status, encoding
- ✅ **Draft preservation** - Save form state on navigation
- ✅ **Library integration** - Video appears in user library
- ✅ **Metadata editing** - Edit video info after upload
- ✅ **Batch upload** - Multiple files at once

### Video Playback Tests (`video-playback.spec.ts`)
Tests video player functionality:

- ✅ **Player controls** - Play, pause, seek, volume
- ✅ **Keyboard shortcuts** - Space, M, F, arrows
- ✅ **Playback speed** - 0.25x to 2x speed control
- ✅ **Fullscreen mode** - Enter/exit fullscreen
- ✅ **Quality selection** - 1080p, 720p, 480p options
- ✅ **Buffering** - Loading indicators
- ✅ **Analytics** - View tracking, watch time
- ✅ **Social features** - Like, comment, share
- ✅ **Related videos** - Recommendations
- ✅ **Autoplay** - Next video autoplay

## Setup

### Install Dependencies

```bash
npm install -D @playwright/test
npx playwright install
```

### Environment Variables

Create `.env.test`:

```env
BASE_URL=http://localhost:3000
TEST_VIDEO_ID=sample-video-id
STRIPE_TEST_KEY=sk_test_...
API_URL=http://localhost:4000
```

### Test Fixtures

Add test media files to `tests/fixtures/`:

```
tests/fixtures/
├── test-video.mp4       # Sample video file (< 50MB)
├── test-thumbnail.jpg   # Thumbnail image
├── large-video.mp4      # Large file for size testing
└── invalid-file.txt     # Invalid format testing
```

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Suite
```bash
npx playwright test video-upload.spec.ts
```

### Run in Headed Mode (see browser)
```bash
npx playwright test --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

### Run in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run with UI
```bash
npx playwright test --ui
```

## Test Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  retries: 2,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Patterns

### Before Each Test
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/upload');
  await loginTestUser(page);
});
```

### After Each Cleanup
```typescript
test.afterEach(async () => {
  if (uploadedVideoId) {
    await deleteVideo(uploadedVideoId);
  }
});
```

### Assertions
```typescript
// Visibility
await expect(page.locator('.video-player')).toBeVisible();

// Text content
await expect(page.locator('h1')).toContainText('Upload Video');

// URL navigation
await page.waitForURL(/.*\/video\/.+/);

// Custom timeout
await expect(element).toBeVisible({ timeout: 10000 });
```

### File Uploads
```typescript
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles('./fixtures/test-video.mp4');
```

### Network Mocking
```typescript
await page.route('/api/videos', (route) => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ success: true }),
  });
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Reports

### HTML Report
```bash
npx playwright show-report
```

### JSON Report
```bash
npx playwright test --reporter=json
```

### Custom Reporter
```bash
npx playwright test --reporter=./custom-reporter.js
```

## Best Practices

### 1. Use Page Object Model
```typescript
class VideoUploadPage {
  constructor(private page: Page) {}

  async uploadVideo(file: string, title: string) {
    await this.page.goto('/upload');
    await this.page.fill('input[name="title"]', title);
    await this.page.setInputFiles('input[type="file"]', file);
    await this.page.click('button[type="submit"]');
  }
}
```

### 2. Wait for Network Idle
```typescript
await page.goto('/upload', { waitUntil: 'networkidle' });
```

### 3. Use Data Test IDs
```typescript
// In component
<button data-testid="upload-button">Upload</button>

// In test
await page.click('[data-testid="upload-button"]');
```

### 4. Cleanup After Tests
Always delete test data:
```typescript
test.afterEach(async () => {
  await cleanupTestData();
});
```

### 5. Parallel Execution
```typescript
test.describe.configure({ mode: 'parallel' });
```

## Troubleshooting

### Slow Tests
- Increase timeout in config
- Use `page.waitForLoadState('networkidle')`
- Mock slow API calls

### Flaky Tests
- Add explicit waits
- Increase retries in config
- Use `waitForSelector` with timeout

### Screenshot Debugging
```typescript
await page.screenshot({ path: 'debug.png' });
```

### Video Recording
```typescript
// Already enabled in config for failed tests
use: { video: 'retain-on-failure' }
```

## Coverage

### Run with Coverage
```bash
npm run test:e2e:coverage
```

### Coverage Report
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage.json`

## Next Steps

1. Add visual regression tests
2. Implement performance testing
3. Add accessibility tests (axe-core)
4. Mobile device testing
5. Network condition testing
6. Database state verification
7. Email verification tests
8. Payment flow tests
