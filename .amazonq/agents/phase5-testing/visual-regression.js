// Minimal Visual Regression Testing - Screenshot Comparison, Pixel Diff
class VisualRegressionTester {
  constructor(config = {}) {
    this.threshold = config.threshold || 0.01; // 1% difference allowed
    this.baselines = new Map();
    this.failures = [];
  }

  // Simulate screenshot (in real impl, use puppeteer/playwright)
  captureScreenshot(component) {
    // Mock: Convert component to pixel array
    const pixels = this.componentToPixels(component);
    return {
      width: component.width || 100,
      height: component.height || 100,
      pixels
    };
  }

  componentToPixels(component) {
    // Simplified: hash component properties to pixel values
    const str = JSON.stringify(component);
    const pixels = [];
    for (let i = 0; i < 100; i++) {
      const val = str.charCodeAt(i % str.length) || 0;
      pixels.push(val % 256);
    }
    return pixels;
  }

  // Calculate pixel difference
  pixelDiff(img1, img2) {
    if (img1.width !== img2.width || img1.height !== img2.height) {
      return 1.0; // 100% different if dimensions don't match
    }

    let diffPixels = 0;
    const totalPixels = img1.pixels.length;

    for (let i = 0; i < totalPixels; i++) {
      if (Math.abs(img1.pixels[i] - img2.pixels[i]) > 10) {
        diffPixels++;
      }
    }

    return diffPixels / totalPixels;
  }

  // Save baseline
  saveBaseline(name, component) {
    const screenshot = this.captureScreenshot(component);
    this.baselines.set(name, screenshot);
    console.log(`✓ Baseline saved: ${name}`);
  }

  // Compare against baseline
  compare(name, component) {
    const baseline = this.baselines.get(name);
    if (!baseline) {
      console.log(`⚠️  No baseline for ${name}, creating...`);
      this.saveBaseline(name, component);
      return true;
    }

    const current = this.captureScreenshot(component);
    const diff = this.pixelDiff(baseline, current);
    const diffPercent = (diff * 100).toFixed(2);

    if (diff > this.threshold) {
      this.failures.push({
        name,
        diff: diffPercent + '%',
        threshold: (this.threshold * 100).toFixed(2) + '%'
      });
      console.log(`✗ Visual regression: ${name} (${diffPercent}% different)`);
      return false;
    }

    console.log(`✓ Visual match: ${name} (${diffPercent}% different)`);
    return true;
  }

  // Update baselines
  updateBaselines(components) {
    console.log('\nUpdating baselines...');
    Object.entries(components).forEach(([name, component]) => {
      this.saveBaseline(name, component);
    });
  }

  // Report
  report() {
    if (this.failures.length === 0) {
      console.log('\n✓ All visual tests passed');
      return;
    }

    console.log(`\n✗ ${this.failures.length} visual regression(s) detected:\n`);
    this.failures.forEach(f => {
      console.log(`  ${f.name}:`);
      console.log(`    Difference: ${f.diff}`);
      console.log(`    Threshold: ${f.threshold}`);
    });
  }
}

// Demo
console.log('=== Visual Regression Testing Demo ===\n');

const tester = new VisualRegressionTester({ threshold: 0.05 });

// Mock UI components
const button = {
  type: 'button',
  text: 'Click Me',
  color: 'blue',
  width: 100,
  height: 40
};

const header = {
  type: 'header',
  text: 'Welcome',
  fontSize: 24,
  width: 200,
  height: 60
};

// Save baselines
console.log('--- Creating Baselines ---');
tester.saveBaseline('button', button);
tester.saveBaseline('header', header);

// Test 1: No changes (should pass)
console.log('\n--- Test 1: No Changes ---');
tester.compare('button', button);
tester.compare('header', header);

// Test 2: Minor change (should pass)
console.log('\n--- Test 2: Minor Change ---');
const buttonMinor = { ...button, text: 'Click Me!' };
tester.compare('button', buttonMinor);

// Test 3: Major change (should fail)
console.log('\n--- Test 3: Major Change ---');
const buttonMajor = { ...button, color: 'red', width: 150 };
tester.compare('button', buttonMajor);

// Test 4: New component (creates baseline)
console.log('\n--- Test 4: New Component ---');
const footer = { type: 'footer', text: 'Copyright 2025' };
tester.compare('footer', footer);

// Report
tester.report();

export default VisualRegressionTester;
