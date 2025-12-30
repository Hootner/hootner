import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filesToFix = [
  'middleware/correlation-id.js', 'middleware/csp.js', 'middleware/enhanced-security.js',
  'middleware/error-handler.js', 'middleware/injection-protection.js', 'middleware/rate-limiter.js',
  'middleware/security-headers.js', 'middleware/security-integration.js', 'middleware/security.js',
  'middleware/timeout.js', 'electron/main.js', 'electron/renderer.js', 'constants/ui-constants.js',
  'apps/frontend/public/script.js', 'config/app-config-browser.js',
  'apps/frontend/html-pages/electron-code-editor/ai-assistant.js',
  'apps/frontend/html-pages/electron-code-editor/cloud-sync.js',
  'apps/frontend/html-pages/electron-code-editor/cross-integration.js',
  'apps/frontend/html-pages/electron-code-editor/enterprise.js',
  'apps/frontend/html-pages/electron-code-editor/error-handler.js',
  'apps/frontend/html-pages/electron-code-editor/fallback-handlers.js',
  'apps/frontend/html-pages/electron-code-editor/feature-expansions.js',
  'apps/frontend/html-pages/electron-code-editor/lsp-client.js',
  'apps/frontend/html-pages/electron-code-editor/monaco-extensions.js',
  'apps/frontend/html-pages/electron-code-editor/package-manager.js',
  'apps/frontend/html-pages/electron-code-editor/performance-optimizer.js',
  'apps/frontend/html-pages/electron-code-editor/platform-integration.js',
  'apps/frontend/html-pages/electron-code-editor/plugin-api.js',
  'apps/frontend/html-pages/electron-code-editor/plugin-system.js',
  'apps/frontend/html-pages/electron-code-editor/quick-setup.js',
  'apps/frontend/html-pages/electron-code-editor/renderer-manager.js',
  'apps/frontend/html-pages/electron-code-editor/security-compliance.js',
  'apps/frontend/html-pages/electron-code-editor/ui-enhancements.js',
  'apps/frontend/html-pages/electron-code-editor/web-bridge.js',
  'scripts/ai/cursor-ai-modes.js', 'scripts/ai/multi-agent-orchestrator.js',
  'scripts/collaboration/realtime-collab.js', 'scripts/linting/fix-syntax-errors.js',
  'scripts/linting/lint-all.js', 'scripts/linting/simple-lint-fix.js',
  'scripts/monitoring/compliance-dashboard.js', 'scripts/refactoring/advanced-refactor.js',
  'scripts/refactoring/extract-constants.js', 'scripts/refactoring/final-quality-fixes.js',
  'scripts/refactoring/fix-code-quality.js', 'scripts/refactoring/function-breakdown.js',
  'scripts/refactoring/simplify-ternary.js', 'scripts/ui/visual-designer.js',
  'scripts/utilities/event-utils.js', 'scripts/utilities/function-utils.js',
  'scripts/utilities/json-utils.js', 'scripts/utilities/lazy-loader.js',
  'scripts/utilities/security-utils.js'
];

let fixed = 0;
filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  content = content.replace(/^\/\*\* \*\/\n \*/gm, '/**\n *');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixed++;
    console.log(`Fixed: ${file}`);
  }
});

console.log(`\nFixed ${fixed} files`);
