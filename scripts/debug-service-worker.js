#!/usr/bin/env node

/**
 * Service Worker Debug Helper
 * Helps debug service worker registration issues in webviews and browsers
 */

console.log('🔍 Service Worker Debug Helper\n');

// Common service worker registration function with enhanced debugging
function debugServiceWorkerEnvironment() {
  console.log('🌐 Environment Detection:');

  const checks = {
    'window.parent !== window': window.parent !== window,
    'vscode-webview protocol': window.location.protocol === 'vscode-webview:',
    'vscode-file protocol': window.location.protocol === 'vscode-file:',
    'webview in URL': window.location.href.includes('vscode-webview'),
    'Code in userAgent': navigator.userAgent.includes('Code'),
    'Electron in userAgent': navigator.userAgent.includes('Electron'),
    'file protocol': window.location.protocol === 'file:',
    'acquireVsCodeApi exists': typeof window.acquireVsCodeApi !== 'undefined',
    'chrome.webview exists': typeof window.chrome?.webview !== 'undefined',
    'empty domain': document.domain === '',
    'empty hostname': window.location.hostname === '',
    'serviceWorker supported': 'serviceWorker' in navigator,
    'https protocol': window.location.protocol === 'https:',
    'localhost hostname': window.location.hostname === 'localhost'
  };

  Object.entries(checks).forEach(([check, result]) => {
    console.log(`   ${result ? '✅' : '❌'} ${check}: ${result}`);
  });

  const isWebview = Object.values(checks).slice(0, 11).some(Boolean);
  const canRegisterSW = checks['serviceWorker supported'] && !isWebview &&
    (checks['https protocol'] || checks['localhost hostname']);

  console.log('\n📋 Summary:');
  console.log(`   Environment: ${isWebview ? 'Webview/Embedded' : 'Browser'}`);
  console.log(`   SW Registration: ${canRegisterSW ? 'ALLOWED ✅' : 'BLOCKED ❌'}`);
  console.log(`   Protocol: ${window.location.protocol}`);
  console.log(`   Hostname: ${window.location.hostname || 'none'}`);
  console.log(`   URL: ${window.location.href}`);

  return { isWebview, canRegisterSW, checks };
}

// Enhanced service worker registration with better error messages
function registerServiceWorkerSafely(swPath = './sw.js') {
  const debug = debugServiceWorkerEnvironment();

  if (!debug.canRegisterSW) {
    const reasons = [];
    if (!debug.checks['serviceWorker supported']) reasons.push('Service Worker not supported');
    if (debug.isWebview) reasons.push('Webview environment detected');
    if (!debug.checks['https protocol'] && !debug.checks['localhost hostname']) {
      reasons.push('Insecure protocol (requires HTTPS or localhost)');
    }

    console.log(`\n⚠️ Service Worker registration blocked: ${reasons.join(', ')}`);
    return Promise.resolve({ success: false, reasons });
  }

  console.log(`\n🚀 Attempting to register Service Worker: ${swPath}`);

  return navigator.serviceWorker.register(swPath)
    .then(registration => {
      console.log('✅ Service Worker registered successfully:', registration.scope);

      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found');
      });

      return { success: true, registration };
    })
    .catch(error => {
      console.error('❌ Service Worker registration failed:', error);

      // Common error analysis
      const errorAnalysis = {
        'InvalidStateError': 'Document in invalid state - try registering after DOM ready',
        'SecurityError': 'Security error - check HTTPS requirement and file paths',
        'TypeError': 'Network error - SW file might not exist or be accessible',
        'AbortError': 'Registration aborted - possibly due to page navigation'
      };

      const errorType = error.name;
      const suggestion = errorAnalysis[errorType] || 'Unknown error - check browser console';

      console.log(`\n💡 Suggestion: ${suggestion}`);

      return { success: false, error, suggestion };
    });
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debugServiceWorkerEnvironment,
    registerServiceWorkerSafely
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      debugServiceWorkerEnvironment();
    });
  } else {
    debugServiceWorkerEnvironment();
  }
}

console.log('\n📖 Usage:');
console.log('   debugServiceWorkerEnvironment() - Analyze current environment');
console.log('   registerServiceWorkerSafely(swPath) - Safe registration with debugging');
