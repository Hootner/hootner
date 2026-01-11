# HOOTNER TODO Report
Generated: 2025-12-30T15:14:10.713Z
Total Items: 368

## Summary by Tag

- **BUG**: 2
- **CLEANUP**: 14
- **DEPRECATED**: 3
- **DOCS**: 4
- **FIXME**: 1
- **HACK**: 1
- **NOTE**: 6
- **OPTIMIZE**: 12
- **PERFORMANCE**: 31
- **REFACTOR**: 12
- **REVIEW**: 14
- **SECURITY**: 110
- **TEST**: 144
- **TODO**: 14

## Details by Tag

### BUG (2)

- `docs\TODO_GUIDELINES.md:18` - Memory leak in video player cleanup
- `docs\TODO_GUIDELINES.md:99` - (john): Race condition in payment processing - Issue #456

### CLEANUP (14)

- `apps\frontend\html-pages\code-editor.html:1813` - on page unload
- `apps\frontend\html-pages\electron-code-editor\index.html:6178` - on page unload
- `apps\frontend\html-pages\electron-code-editor\platform-integration.js:497` - 
- `apps\frontend\html-pages\electron-code-editor\plugin-system.js:331` - 
- `docs\TODO_GUIDELINES.md:69` - Remove unused imports
- `electron\renderer.js:37` - on unload`
- `Hootner\README.md:102` - 
- `lib\memory-monitor.js:15` - () {
- `mcp-tools-test.js:54` - 
- `middleware\csrf.js:15` - old tokens periodically to prevent memory leaks
- `middleware\csrf.js:22` - Interval = setInterval(() => {
- `middleware\csrf.js:27` - Interval.unref();
- `server.js:340` - [() => memoryMonitor.cleanup()],
- `servers\hub-app.js:24` - expired tokens

### DEPRECATED (3)

- `.github\workflows\api-contract.yml:238` - =$(grep -r "@deprecated" src/ | wc -l || echo "0")
- `docs\TODO_GUIDELINES.md:40` - Use newFunction() instead (remove in v2.0)
- `docs\TODO_GUIDELINES.md:103` - Remove legacy API v1 endpoints by Q2 2025

### DOCS (4)

- `docs\TODO_GUIDELINES.md:79` - Add JSDoc comments
- `Hootner\example-pattern.json:25` - .aws.amazon.com/lambda/latest/dg/with-sqs.html?trk=2dd77e51-cb93-4970-a61a-5993781e5576&sc_channel=el"
- `Hootner\README.md:17` - .aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed and configured
- `Hootner\README.md:19` - .aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) (AWS SAM) installed

### FIXME (1)

- `docs\TODO_GUIDELINES.md:23` - API endpoint returns 500 on invalid token

### HACK (1)

- `docs\TODO_GUIDELINES.md:64` - Temporary fix until library is updated

### NOTE (6)

- `apps\frontend\html-pages\auto-editor.html:1482` - SpeechSynthesis doesn't directly connect, need hack or library
- `apps\frontend\html-pages\profile.html:1326` - s: `<div draggable="true" data-widget="notes" style="grid-column:span 2;padding:12px;background:rgba(255,255,0,0.05);border-radius:8px;border:1px solid rgba(255,255,0,0.3);cursor:move;position:relative;" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">
- `docs\TODO_GUIDELINES.md:74` - This function is called by external service
- `Hootner\README.md:52` - the outputs from the AWS SAM deployment process. These contain the resource names and/or ARNs to use for testing.
- `temp\backup_20251216_042406\auto-editor.html:1225` - SpeechSynthesis doesn't directly connect, need hack or library
- `temp\backup_20251216_042406\profile.html:3700` - s: `<div draggable="true" data-widget="notes" style="grid-column:span 2;padding:12px;background:rgba(255,255,0,0.05);border-radius:8px;border:1px solid rgba(255,255,0,0.3);cursor:move;position:relative;" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">

### OPTIMIZE (12)

- `.github\workflows\performance-regression.yml:538` - code/assets
- `apps\frontend\html-pages\electron-code-editor\ai-agent-panel.js:85` - 'optimize performance of current code'
- `apps\frontend\html-pages\electron-code-editor\ai-assistant.js:410` - Code() {
- `apps\frontend\html-pages\electron-code-editor\index.html:4756` - ForLongSession: () => {},
- `apps\frontend\html-pages\electron-code-editor\performance-optimizer.js:144` - ForLongSession() {
- `config\network.yml:2` - d for 425 Mbps connection and video streaming
- `docs\readme\electron-code-editor-README.md:124` - d LSP communication
- `docs\reports\NOTIFICATION_EMBEDDING_SUMMARY.md:266` - bundle size
- `docs\SYNTAX_FIXES_EXAMPLES.md:118` - 'optimize performance of current code
- `docs\SYNTAX_FIXES_EXAMPLES.md:127` - 'optimize performance of current code'
- `docs\TODO_GUIDELINES.md:52` - Reduce bundle size by lazy loading
- `middleware\performance.js:1` - d performance monitor

### PERFORMANCE (31)

- `.github\workflows\api-contract.yml:207` - Tests" >> $GITHUB_STEP_SUMMARY
- `.github\workflows\performance-regression.yml:474` - Regression Summary" >> $GITHUB_STEP_SUMMARY
- `.github\workflows\performance-regression.yml:522` - Regression Alert
- `apps\frontend\html-pages\electron-code-editor\index.html:2313` - & Monitoring -->
- `apps\frontend\html-pages\electron-code-editor\index.html:5985` - .memory.usedJSHeapSize / 1048576
- `apps\frontend\html-pages\electron-code-editor\index.html:5990` - .memory.usedJSHeapSize >
- `config\app-config-browser.js:50` - 
- `config\app-config-browser.js:51` - {
- `docs\CODE_SCANNER.md:294` - Issues
- `docs\commands\deployment.md:214` - tests
- `docs\commands\deployment.md:304` - verification
- `docs\commands\maintenance.md:40` - monitoring
- `docs\commands\maintenance.md:88` - monitoring
- `docs\commands\maintenance.md:271` - baseline
- `docs\commands\maintenance.md:300` - report
- `docs\commands\quick-reference.md:233` - test
- `docs\ELECTRON_OPTIMIZATION.md:56` - Memory Report
- `docs\ELECTRON_OPTIMIZATION.md:57` - Clear Cache
- `docs\ELECTRON_OPTIMIZATION.md:105` - Features
- `docs\ELECTRON_OPTIMIZATION.md:118` - reports
- `docs\ELECTRON_OPTIMIZATION.md:227` - Monitoring
- `docs\IDE_MCP_SETUP.md:98` - Issues
- `docs\readme\electron-code-editor-README.md:120` - 
- `docs\reports\NOTIFICATION_EMBEDDING_SUMMARY.md:190` - Metrics
- `docs\TODO_GUIDELINES.md:30` - Cache database queries
- `docs\TODO_GUIDELINES.md:101` - Add Redis caching layer
- `docs\ZED_OPTIMIZATION.md:9` - Optimizations
- `docs\ZED_OPTIMIZATION.md:120` - Metrics
- `electron\renderer.js:21` - monitoring
- `README.md:509` - & Collaboration
- `ULTIMATE_LINT_REPORT.md:68` - -optimizer.js

### REFACTOR (12)

- `apps\frontend\html-pages\electron-code-editor\ai-agent-panel.js:83` - 'refactor current file for better readability',
- `apps\frontend\html-pages\electron-code-editor\ai-assistant.js:17` - ing: true,
- `docs\AI_AGENT_ORCHESTRATION.md:75` - ing: 4 parallel subagents
- `docs\CURSOR_AI_MODES.md:96` - Mode
- `docs\SYNTAX_FIXES_EXAMPLES.md:116` - 'refactor current file for better readability',
- `docs\SYNTAX_FIXES_EXAMPLES.md:125` - 'refactor current file for better readability',
- `docs\TODO_GUIDELINES.md:35` - Extract duplicate logic to shared utility
- `docs\TODO_GUIDELINES.md:102` - Split this 500-line file into modules
- `FINAL_LINT_REPORT.md:103` - 4 useless try-catch blocks
- `LINT_PROGRESS.md:59` - useless try-catch blocks (4 files)
- `scripts\ai\cursor-ai-modes.js:34` - Mode - Code transformation
- `scripts\refactoring\advanced-refactor.js:339` - .refactorAllFiles().catch(console.error);'

### REVIEW (14)

- `.github\workflows\backup-verification.yml:420` - backup logs
- `.github\workflows\container-scan.yml:244` - vulnerability details
- `.github\workflows\cost-monitoring.yml:187` - cost breakdown by service
- `.github\workflows\license-check.yml:239` - non-compliant dependencies
- `.github\workflows\performance-regression.yml:536` - performance metrics
- `.github\workflows\terraform-drift.yml:223` - the drift changes below
- `docs\CODE_SCANNER.md:290` - pattern matching logic
- `docs\DASHBOARD_BEST_PRACTICES.md:203` - performance impact
- `docs\ELECTRON_CODE_EDITOR_SECURITY.md:175` - permissions regularly
- `docs\reports\NOTIFICATION_EMBEDDING_SUMMARY.md:265` - security best practices
- `docs\TODO_GUIDELINES.md:57` - Check if this approach is correct
- `docs\TODO_GUIDELINES.md:192` - TODOs weekly in team meetings
- `scripts\agents\README.md:64` - changes before committing
- `SYNTAX_FIXES_COMPLETE.md:69` - import/export warnings (most are intentional)

### SECURITY (110)

- `.github\workflows\aws-compliance.yml:53` - Hub Findings" >> $GITHUB_STEP_SUMMARY
- `.github\workflows\aws-compliance.yml:146` - hub-results.json
- `.github\workflows\container-scan.yml:27` - -events: write
- `.github\workflows\container-scan.yml:188` - Configuration - ${{ matrix.image.name }}" >> $GITHUB_STEP_SUMMARY
- `.github\workflows\dependency-update.yml:147` - Audit" >> $GITHUB_STEP_SUMMARY
- `.github\workflows\dependency-update.yml:192` - vulnerabilities: ${{ steps.audit.outputs.vulnerabilities }}
- `apps\frontend\html-pages\code-editor.html:853` - Compliance = new SecurityCompliance();
- `apps\frontend\html-pages\code-editor.html:854` - Compliance.applyRoleRestrictions(securityCompliance.getCurrentRole());
- `apps\frontend\html-pages\code-editor.html:1121` - Compliance.logAudit('file_created', { filename: name });
- `apps\frontend\html-pages\code-editor.html:1293` - Compliance.logAudit('code_executed', {
- `apps\frontend\html-pages\code-editor.html:1787` - Compliance.logAudit('state_saved', {
- `apps\frontend\html-pages\code-editor.html:1968` - Compliance.exportLogsCSV();
- `apps\frontend\html-pages\code-editor.html:1970` - Compliance.exportLogsJSON();
- `apps\frontend\html-pages\code-editor.html:1982` - Compliance.setUserRole(role);
- `apps\frontend\html-pages\dashboard.html:51` - & Utilities -->
- `apps\frontend\html-pages\dashboard.html:2927` - HTML sanitization helper
- `apps\frontend\html-pages\dashboard.html:3034` - Use Function constructor instead of eval
- `apps\frontend\html-pages\dashboard.html:3080` - Check length first to prevent ReDoS
- `apps\frontend\html-pages\dashboard.html:3967` - Use Function constructor instead of eval
- `apps\frontend\html-pages\electron-code-editor\enterprise.js:15` - true,
- `apps\frontend\html-pages\electron-code-editor\enterprise.js:330` - 'Secure',
- `apps\frontend\html-pages\electron-code-editor\feature-expansions.js:375` - {
- `apps\frontend\html-pages\electron-code-editor\feature-expansions.js:392` - STATUS`
- `apps\frontend\html-pages\electron-code-editor\index.html:2502` - & Compliance -->
- `apps\frontend\html-pages\electron-code-editor\index.html:2559` - Status
- `apps\frontend\html-pages\electron-code-editor\index.html:4819` - Compliance = window.SecurityCompliance
- `apps\frontend\html-pages\electron-code-editor\index.html:5172` - Compliance.logAudit('file_created', { filename: name });
- `apps\frontend\html-pages\electron-code-editor\index.html:5379` - Compliance.logAudit('code_executed', {
- `apps\frontend\html-pages\electron-code-editor\index.html:6153` - Compliance.logAudit('state_saved', {
- `apps\frontend\html-pages\electron-code-editor\index.html:6292` - Compliance.exportLogsCSV();
- `apps\frontend\html-pages\electron-code-editor\index.html:6294` - Compliance.exportLogsJSON();
- `apps\frontend\html-pages\electron-code-editor\index.html:6309` - Compliance.setUserRole(role);
- `apps\frontend\html-pages\electron-code-editor\security-compliance.js:375` - Dashboard
- `apps\frontend\html-pages\settings.html:593` - 
- `config\app-config-browser.js:43` - 
- `config\app-config-browser.js:44` - {
- `config\app-config.js:33` - Service
- `config\app-config.js:34` - {
- `config\app-config.js:57` - {
- `config\docker\docker-compose.yml:255` - -service:
- `config\linting\eslint.security.config.js:35` - security,
- `config\linting\eslint.security.config.js:39` - rules (OWASP Top 10 focused)
- `config\network.yml:43` - 
- `DASHBOARD_MANUAL_FIXES.md:45` - HTML sanitization helper
- `DASHBOARD_MANUAL_FIXES.md:86` - Use Function constructor instead of eval
- `DASHBOARD_MANUAL_FIXES.md:110` - Check length first to prevent ReDoS
- `DASHBOARD_MANUAL_FIXES.md:220` - Use Function constructor instead of eval
- `docs\ARCHITECTURE.md:64` - Service
- `docs\CODE_SCANNER.md:77` - Checks
- `docs\CODE_SCANNER.md:158` - Hardcoded API key detected
- `docs\CODE_SCANNER.md:321` - patterns are regex-based (not AST analysis)
- `docs\commands\deployment.md:148` - policies
- `docs\commands\deployment.md:178` - policies
- `docs\commands\deployment.md:211` - audit
- `docs\commands\development.md:147` - scanning
- `docs\commands\maintenance.md:37` - monitoring
- `docs\commands\maintenance.md:148` - updates
- `docs\commands\maintenance.md:303` - report
- `docs\commands\quick-reference.md:15` - audit
- `docs\commands\quick-reference.md:74` - audit
- `docs\commands\quick-reference.md:170` - fixes
- `docs\commands\security.md:89` - audit in containers
- `docs\commands\security.md:120` - -focused linting
- `docs\commands\security.md:233` - audit report
- `docs\commands\security.md:272` - incident detection
- `docs\commands\security.md:278` - breach response
- `docs\commands\security.md:291` - configuration validation
- `docs\commands\security.md:294` - best practices audit
- `docs\commands\testing.md:128` - audit
- `docs\DASHBOARD_BEST_PRACTICES.md:216` - Using DOMPurify to prevent XSS attacks
- `docs\DASHBOARD_BEST_PRACTICES.md:222` - considerations
- `docs\ELECTRON_CODE_EDITOR_SECURITY.md:1` - & Compliance Documentation
- `docs\ELECTRON_CODE_EDITOR_SECURITY.md:65` - Compliance.exportLogsCSV({
- `docs\ELECTRON_CODE_EDITOR_SECURITY.md:76` - Compliance.exportLogsJSON({
- `docs\ELECTRON_CODE_EDITOR_SECURITY.md:123` - Compliance.setUserRole('viewer');
- `docs\ELECTRON_CODE_EDITOR_SECURITY.md:269` - Compliance Class
- `docs\ELECTRON_OPTIMIZATION.md:9` - Architecture
- `docs\ELECTRON_OPTIMIZATION.md:127` - Features
- `docs\MCP_DEPLOYMENT.md:104` - Configuration
- `docs\MCP_INTEGRATION.md:96` - Audit Workflow
- `docs\MCP_INTEGRATION.md:193` - Integration
- `docs\readme\apps-README.md:80` - 
- `docs\readme\commands-README.md:14` - & audit commands
- `docs\readme\commands-README.md:32` - audit
- `docs\readme\libs-README.md:27` - Benefits:
- `docs\reports\NOTIFICATION_EMBEDDING_SUMMARY.md:206` - Considerations
- `docs\TODO_GUIDELINES.md:13` - Validate user input to prevent XSS
- `docs\TODO_GUIDELINES.md:98` - Sanitize user input before database query
- `docs\ZED_OPTIMIZATION.md:202` - 
- `mcp-http-server.js:64` - Scan: async (input) => {
- `middleware\rate-limiter.js:49` - createRateLimiter({
- `middleware\security-integration.js:32` - headers
- `README.md:329` - audit
- `README.md:430` - headers (Helmet.js with CSP)
- `README.md:525` - 
- `README.md:741` - policies
- `scripts\analysis\advanced-code-scanner.js:24` - true,
- `scripts\analysis\advanced-code-scanner.js:157` - checks
- `server.js:41` - middleware/
- `servers\mcp-server.js:21` - middleware/
- `servers\mcp-server.js:22` - middleware
- `servers\secure-server.js:29` - middleware
- `temp\backup_20251216_042406\settings.html:561` - 
- `tools\USAGE.md:23` - Scan
- `ULTIMATE_LINT_REPORT.md:40` - -headers.js
- `ULTIMATE_LINT_REPORT.md:41` - -integration.js
- `ULTIMATE_LINT_REPORT.md:42` - .js
- `ULTIMATE_LINT_REPORT.md:50` - .config.ts
- `ULTIMATE_LINT_REPORT.md:74` - -compliance.js
- `ULTIMATE_LINT_REPORT.md:138` - best practices enforced

### TEST (144)

- `.github\workflows\api-contract.yml:63` - test@localhost:27017/test
- `.github\workflows\api-contract.yml:144` - 1: Health check
- `.github\workflows\api-contract.yml:156` - 2: Schema introspection
- `.github\workflows\api-contract.yml:168` - 3: Error handling
- `.github\workflows\api-contract.yml:274` - s Passed: ${{ steps.contract.outputs.passed }}
- `.github\workflows\api-contract.yml:275` - s Failed: ${{ steps.contract.outputs.failed }}
- `.github\workflows\api-contract.yml:278` - Results
- `.github\workflows\backup-verification.yml:25` - 
- `.github\workflows\backup-verification.yml:30` - _DB_PREFIX: restore_test_
- `.github\workflows\backup-verification.yml:152` - test@localhost:27017', {
- `.github\workflows\backup-verification.yml:219` - test@localhost:27017/admin --eval "
- `.github\workflows\backup-verification.yml:331` - download of random backup
- `.github\workflows\backup-verification.yml:332` - _FILE=$(echo "$RECENT_BACKUPS" | shuf -n 1 | awk '{print $4}')
- `.github\workflows\backup-verification.yml:423` - manual restore
- `.github\workflows\dependency-update.yml:178` - Results" >> UPDATE_SUMMARY.md
- `.github\workflows\dependency-update.yml:269` - failures
- `.github\workflows\e2e-tests.yml:85` - test@localhost:27017/test
- `.github\workflows\e2e-tests.yml:190` - (`Visual: ${page.name}`, async ({ page: p }) => {
- `.github\workflows\e2e-tests.yml:279` - (`A11y: ${url}`, async ({ page }) => {
- `.github\workflows\e2e-tests.yml:341` - .use(devices['${{ matrix.device }}']);
- `.github\workflows\e2e-tests.yml:343` - ('Mobile: Navigation', async ({ page }) => {
- `.github\workflows\e2e-tests.yml:347` - touch interactions
- `.github\workflows\e2e-tests.yml:352` - ('Mobile: Swipe gestures', async ({ page }) => {
- `.github\workflows\e2e-tests.yml:356` - swipe
- `.github\workflows\performance-regression.yml:276` - test@localhost:27017/test
- `.github\workflows\performance-regression.yml:287` - GraphQL endpoint
- `.github\workflows\performance-regression.yml:318` - test@localhost:27017', {
- `.github\workflows\performance-regression.yml:354` - ();
- `apps\frontend\html-pages\electron-code-editor\cloud-sync.js:185` - API key
- `apps\frontend\html-pages\electron-code-editor\integration-commands.js:113` - 'echo "Error: no test specified" && exit 1'
- `apps\frontend\html-pages\electron-code-editor\package-manager.js:327` - 'echo "Error: no test specified" && exit 1'
- `apps\frontend\html-pages\electron-code-editor\package-manager.js:355` - ing: ['jest', 'mocha', 'chai'],
- `apps\frontend\html-pages\video-player.html:1713` - -streams.mux.dev/x36xhzz/x36xhzz.m3u8',
- `config\docker\docker-compose.yml:43` - ['CMD', 'node', 'healthcheck.js']
- `config\docker\docker-compose.yml:91` - 
- `config\docker\docker-compose.yml:110` - ['CMD', 'redis-cli', '--pass', '${REDIS_PASSWORD}', 'ping']
- `config\docker\docker-compose.yml:288` - ['CMD', 'node', 'healthcheck.js']
- `config\docker\docker-compose.yml:382` - 
- `config\testing\electron-playwright.config.js:3` - Dir: './tests/e2e',
- `config\testing\playwright.config.js:4` - Dir: './tests/e2e',
- `config\testing\vitest.config.ts:2` - {
- `CRITICAL_FIXES_APPLIED.md:25` - the application with updated dependencies
- `DASHBOARD_MANUAL_FIXES.md:248` - code editor (should work without eval)
- `DASHBOARD_MANUAL_FIXES.md:249` - search suggestions
- `DASHBOARD_MANUAL_FIXES.md:250` - notifications
- `DASHBOARD_MANUAL_FIXES.md:251` - profile validation
- `docker-compose.mcp.yml:17` - ["CMD", "curl", "-f", "http://localhost:3000/health"]
- `docs\CODE_SCANNER.md:99` - Validation
- `docs\commands\ai-services.md:40` - video generation
- `docs\commands\ai-services.md:83` - agent coordination
- `docs\commands\ai-services.md:101` - content moderation
- `docs\commands\ai-services.md:247` - AI video generation
- `docs\commands\ai-services.md:251` - AI models
- `docs\commands\deployment.md:71` - blue environment
- `docs\commands\maintenance.md:241` - backup restoration
- `docs\commands\maintenance.md:326` - backup/restore
- `docs\commands\maintenance.md:329` - failover
- `docs\commands\maintenance.md:332` - monitoring
- `docs\commands\maintenance.md:335` - recovery procedures
- `docs\commands\quick-reference.md:128` - AI
- `docs\commands\quick-reference.md:265` - PWA features
- `docs\commands\quick-reference.md:282` - offline mode
- `docs\commands\security.md:100` - security headers
- `docs\commands\security.md:107` - HTTPS configuration
- `docs\commands\security.md:134` - JWT implementation
- `docs\commands\security.md:137` - Firebase auth
- `docs\commands\security.md:140` - session management
- `docs\commands\security.md:143` - password security
- `docs\commands\security.md:146` - rate limiting
- `docs\commands\security.md:153` - input validation
- `docs\commands\security.md:156` - XSS protection
- `docs\commands\security.md:159` - SQL injection protection
- `docs\commands\security.md:162` - NoSQL injection protection
- `docs\commands\security.md:165` - command injection protection
- `docs\commands\security.md:178` - database connections
- `docs\commands\security.md:196` - firewall rules
- `docs\commands\security.md:256` - encryption implementation
- `docs\commands\security.md:259` - password hashing
- `docs\commands\security.md:262` - data encryption at rest
- `docs\commands\security.md:265` - TLS/SSL configuration
- `docs\commands\security.md:332` - security middleware
- `docs\commands\security.md:338` - injection protection
- `docs\commands\security.md:341` - security headers
- `docs\commands\testing.md:58` - specific endpoints
- `docs\commands\testing.md:146` - in Docker environment
- `docs\commands\testing.md:346` - with logs
- `docs\CUSTOM_MCP_SERVER.md:13` - tools
- `docs\CUSTOM_MCP_SERVER.md:108` - ing Tools
- `docs\CUSTOM_MCP_SERVER.md:117` - deploy_service
- `docs\DASHBOARD_BEST_PRACTICES.md:202` - error handling
- `docs\ELECTRON_CODE_EDITOR_SECURITY.md:163` - decryption regularly
- `docs\IDE_MCP_SETUP.md:9` - MCP integration  
- `docs\IDE_MCP_SETUP.md:91` - manually: `npm run mcp:test`
- `docs\IPV6_SETUP.md:30` - ing
- `docs\IPV6_SETUP.md:33` - IPv6 connectivity
- `docs\IPV6_SETUP.md:36` - IPv4 (still works)
- `docs\MCP_DEPLOYMENT.md:136` - ing Deployment
- `docs\MCP_DEPLOYMENT.md:228` - tools directly
- `docs\MCP_INTEGRATION.md:139` - manually
- `docs\MCP_INTEGRATION.md:168` - MCP server
- `docs\MCP_INTEGRATION.md:174` - tool execution
- `docs\readme\commands-README.md:12` - ing & QA commands
- `docs\reports\NOTIFICATION_EMBEDDING_SUMMARY.md:175` - ing Checklist
- `docs\reports\NOTIFICATION_EMBEDDING_SUMMARY.md:272` - notification functionality
- `docs\status\SYNTAX_FIX_COMPLETE.md:77` - core functionality
- `docs\status\SYNTAX_FIX_COMPLETE.md:79` - development mode
- `docs\status\SYNTAX_FIX_PRIORITY.md:39` - functionality after fixes
- `docs\SYNTAX_FIXES_SUMMARY.md:113` - affected functionality
- `docs\TODO_GUIDELINES.md:84` - Add unit tests for error scenarios
- `Hootner\README.md:81` - ing
- `mcp-tools-test.js:37` - each tool
- `mcp-tools-test.js:38` - Tools.forEach((tool, index) => {
- `playwright-report\index.html:18900` - Info: u,
- `playwright-report\index.html:18932` - info', '', u];
- `playwright-report\index.html:18940` - source', '', '```ts', E, '```'),
- `playwright-report\index.html:19032` - Info: [
- `playwright-report\index.html:19241` - u,
- `playwright-report\index.html:19305` - i,
- `playwright-report\index.html:19306` - RunMetadata: c,
- `playwright-report\index.html:19407` - i,
- `playwright-report\index.html:19409` - RunMetadata: c,
- `playwright-report\index.html:19536` - u,
- `playwright-report\index.html:19844` - s: i.slice(0, c),
- `playwright-report\index.html:20002` - Id: E,
- `playwright-report\index.html:20003` - IdToFileIdMap: N,
- `playwright-report\index.html:20013` - IdToFileIdMap: i,
- `playwright-report\index.html:20016` - Id: r,
- `playwright-report\index.html:20056` - RunMetadata: E,
- `playwright-report\index.html:20060` - d,
- `playwright-report\index.html:20094` - s: [],
- `scripts\agents\README.md:63` - thoroughly after running agents
- `scripts\analysis\advanced-code-scanner.js:28` - s: true,
- `scripts\analysis\advanced-code-scanner.js:168` - checks
- `scripts\analysis\unified-scanner.js:47` - file validation
- `temp\backup_20251216_042406\video-player.html:1681` - -streams.mux.dev/x36xhzz/x36xhzz.m3u8',
- `test-mcp-ide.js:11` - MCP server startup
- `test-mcp-ide.js:26` - tool availability
- `tests\electron-code-editor\e2e\editor.spec.js:6` - .describe('HOOTNER Code Editor', () => {
- `tests\electron-code-editor\e2e\editor.spec.js:7` - .beforeEach(async ({ page }) => {
- `tests\electron-code-editor\e2e\editor.spec.js:12` - ('should load editor successfully', async ({ page }) => {
- `tests\electron-code-editor\e2e\editor.spec.js:17` - ('should create new file', async ({ page }) => {
- `tests\electron-code-editor\e2e\editor.spec.js:22` - ('should type code in editor', async ({ page }) => {
- `tests\electron-code-editor\e2e\editor.spec.js:29` - ('should run code', async ({ page }) => {
- `tests\electron-code-editor\e2e\editor.spec.js:36` - ('should open command palette', async ({ page }) => {

### TODO (14)

- `apps\frontend\html-pages\auto-editor.html:1451` - Integrate Transcribe.js for STT
- `apps\frontend\html-pages\libs\video.min.js:37` - Add proper error handling/
- `apps\frontend\html-pages\libs\video.min.js:41` - Add proper error handling/
- `apps\frontend\html-pages\libs\video.min.js:45` - Add proper error handling/
- `apps\frontend\html-pages\ultra-editor.html:477` - Add error handling\ntry {\n  // Your code here\n} catch (error) {\n  console.error(error);\n}'
- `docs\TODO_GUIDELINES.md:47` - Add error handling for edge cases
- `docs\TODO_GUIDELINES.md:100` - Implement retry logic with exponential backoff
- `scripts\ai\cursor-ai-modes.js:63` - Implement\n}`,`
- `scripts\refactoring\function-breakdown.js:221` - Implement extracted logic`
- `scripts\scan-todos.js:42` - s.push({
- `scripts\scan-todos.js:72` - s.push(...fileTodos);
- `scripts\scan-todos.js:84` - s.forEach(todo => {
- `scripts\scan-todos.js:140` - s.forEach(todo => {
- `temp\backup_20251216_042406\auto-editor.html:1194` - Integrate Transcribe.js for STT

## Details by File

### .github\workflows\api-contract.yml (9)

- Line 63 [TEST]: test@localhost:27017/test
- Line 144 [TEST]: 1: Health check
- Line 156 [TEST]: 2: Schema introspection
- Line 168 [TEST]: 3: Error handling
- Line 207 [PERFORMANCE]: Tests" >> $GITHUB_STEP_SUMMARY
- Line 238 [DEPRECATED]: =$(grep -r "@deprecated" src/ | wc -l || echo "0")
- Line 274 [TEST]: s Passed: ${{ steps.contract.outputs.passed }}
- Line 275 [TEST]: s Failed: ${{ steps.contract.outputs.failed }}
- Line 278 [TEST]: Results

### .github\workflows\aws-compliance.yml (2)

- Line 53 [SECURITY]: Hub Findings" >> $GITHUB_STEP_SUMMARY
- Line 146 [SECURITY]: hub-results.json

### .github\workflows\backup-verification.yml (8)

- Line 25 [TEST]: 
- Line 30 [TEST]: _DB_PREFIX: restore_test_
- Line 152 [TEST]: test@localhost:27017', {
- Line 219 [TEST]: test@localhost:27017/admin --eval "
- Line 331 [TEST]: download of random backup
- Line 332 [TEST]: _FILE=$(echo "$RECENT_BACKUPS" | shuf -n 1 | awk '{print $4}')
- Line 420 [REVIEW]: backup logs
- Line 423 [TEST]: manual restore

### .github\workflows\container-scan.yml (3)

- Line 27 [SECURITY]: -events: write
- Line 188 [SECURITY]: Configuration - ${{ matrix.image.name }}" >> $GITHUB_STEP_SUMMARY
- Line 244 [REVIEW]: vulnerability details

### .github\workflows\cost-monitoring.yml (1)

- Line 187 [REVIEW]: cost breakdown by service

### .github\workflows\dependency-update.yml (4)

- Line 147 [SECURITY]: Audit" >> $GITHUB_STEP_SUMMARY
- Line 178 [TEST]: Results" >> UPDATE_SUMMARY.md
- Line 192 [SECURITY]: vulnerabilities: ${{ steps.audit.outputs.vulnerabilities }}
- Line 269 [TEST]: failures

### .github\workflows\e2e-tests.yml (8)

- Line 85 [TEST]: test@localhost:27017/test
- Line 190 [TEST]: (`Visual: ${page.name}`, async ({ page: p }) => {
- Line 279 [TEST]: (`A11y: ${url}`, async ({ page }) => {
- Line 341 [TEST]: .use(devices['${{ matrix.device }}']);
- Line 343 [TEST]: ('Mobile: Navigation', async ({ page }) => {
- Line 347 [TEST]: touch interactions
- Line 352 [TEST]: ('Mobile: Swipe gestures', async ({ page }) => {
- Line 356 [TEST]: swipe

### .github\workflows\license-check.yml (1)

- Line 239 [REVIEW]: non-compliant dependencies

### .github\workflows\performance-regression.yml (8)

- Line 276 [TEST]: test@localhost:27017/test
- Line 287 [TEST]: GraphQL endpoint
- Line 318 [TEST]: test@localhost:27017', {
- Line 354 [TEST]: ();
- Line 474 [PERFORMANCE]: Regression Summary" >> $GITHUB_STEP_SUMMARY
- Line 522 [PERFORMANCE]: Regression Alert
- Line 536 [REVIEW]: performance metrics
- Line 538 [OPTIMIZE]: code/assets

### .github\workflows\terraform-drift.yml (1)

- Line 223 [REVIEW]: the drift changes below

### CRITICAL_FIXES_APPLIED.md (1)

- Line 25 [TEST]: the application with updated dependencies

### DASHBOARD_MANUAL_FIXES.md (8)

- Line 45 [SECURITY]: HTML sanitization helper
- Line 86 [SECURITY]: Use Function constructor instead of eval
- Line 110 [SECURITY]: Check length first to prevent ReDoS
- Line 220 [SECURITY]: Use Function constructor instead of eval
- Line 248 [TEST]: code editor (should work without eval)
- Line 249 [TEST]: search suggestions
- Line 250 [TEST]: notifications
- Line 251 [TEST]: profile validation

### FINAL_LINT_REPORT.md (1)

- Line 103 [REFACTOR]: 4 useless try-catch blocks

### Hootner\README.md (5)

- Line 17 [DOCS]: .aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed and configured
- Line 19 [DOCS]: .aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) (AWS SAM) installed
- Line 52 [NOTE]: the outputs from the AWS SAM deployment process. These contain the resource names and/or ARNs to use for testing.
- Line 81 [TEST]: ing
- Line 102 [CLEANUP]: 

### Hootner\example-pattern.json (1)

- Line 25 [DOCS]: .aws.amazon.com/lambda/latest/dg/with-sqs.html?trk=2dd77e51-cb93-4970-a61a-5993781e5576&sc_channel=el"

### LINT_PROGRESS.md (1)

- Line 59 [REFACTOR]: useless try-catch blocks (4 files)

### README.md (5)

- Line 329 [SECURITY]: audit
- Line 430 [SECURITY]: headers (Helmet.js with CSP)
- Line 509 [PERFORMANCE]: & Collaboration
- Line 525 [SECURITY]: 
- Line 741 [SECURITY]: policies

### SYNTAX_FIXES_COMPLETE.md (1)

- Line 69 [REVIEW]: import/export warnings (most are intentional)

### ULTIMATE_LINT_REPORT.md (7)

- Line 40 [SECURITY]: -headers.js
- Line 41 [SECURITY]: -integration.js
- Line 42 [SECURITY]: .js
- Line 50 [SECURITY]: .config.ts
- Line 68 [PERFORMANCE]: -optimizer.js
- Line 74 [SECURITY]: -compliance.js
- Line 138 [SECURITY]: best practices enforced

### apps\frontend\html-pages\auto-editor.html (2)

- Line 1451 [TODO]: Integrate Transcribe.js for STT
- Line 1482 [NOTE]: SpeechSynthesis doesn't directly connect, need hack or library

### apps\frontend\html-pages\code-editor.html (9)

- Line 853 [SECURITY]: Compliance = new SecurityCompliance();
- Line 854 [SECURITY]: Compliance.applyRoleRestrictions(securityCompliance.getCurrentRole());
- Line 1121 [SECURITY]: Compliance.logAudit('file_created', { filename: name });
- Line 1293 [SECURITY]: Compliance.logAudit('code_executed', {
- Line 1787 [SECURITY]: Compliance.logAudit('state_saved', {
- Line 1813 [CLEANUP]: on page unload
- Line 1968 [SECURITY]: Compliance.exportLogsCSV();
- Line 1970 [SECURITY]: Compliance.exportLogsJSON();
- Line 1982 [SECURITY]: Compliance.setUserRole(role);

### apps\frontend\html-pages\dashboard.html (5)

- Line 51 [SECURITY]: & Utilities -->
- Line 2927 [SECURITY]: HTML sanitization helper
- Line 3034 [SECURITY]: Use Function constructor instead of eval
- Line 3080 [SECURITY]: Check length first to prevent ReDoS
- Line 3967 [SECURITY]: Use Function constructor instead of eval

### apps\frontend\html-pages\electron-code-editor\ai-agent-panel.js (2)

- Line 83 [REFACTOR]: 'refactor current file for better readability',
- Line 85 [OPTIMIZE]: 'optimize performance of current code'

### apps\frontend\html-pages\electron-code-editor\ai-assistant.js (2)

- Line 17 [REFACTOR]: ing: true,
- Line 410 [OPTIMIZE]: Code() {

### apps\frontend\html-pages\electron-code-editor\cloud-sync.js (1)

- Line 185 [TEST]: API key

### apps\frontend\html-pages\electron-code-editor\enterprise.js (2)

- Line 15 [SECURITY]: true,
- Line 330 [SECURITY]: 'Secure',

### apps\frontend\html-pages\electron-code-editor\feature-expansions.js (2)

- Line 375 [SECURITY]: {
- Line 392 [SECURITY]: STATUS`

### apps\frontend\html-pages\electron-code-editor\index.html (14)

- Line 2313 [PERFORMANCE]: & Monitoring -->
- Line 2502 [SECURITY]: & Compliance -->
- Line 2559 [SECURITY]: Status
- Line 4756 [OPTIMIZE]: ForLongSession: () => {},
- Line 4819 [SECURITY]: Compliance = window.SecurityCompliance
- Line 5172 [SECURITY]: Compliance.logAudit('file_created', { filename: name });
- Line 5379 [SECURITY]: Compliance.logAudit('code_executed', {
- Line 5985 [PERFORMANCE]: .memory.usedJSHeapSize / 1048576
- Line 5990 [PERFORMANCE]: .memory.usedJSHeapSize >
- Line 6153 [SECURITY]: Compliance.logAudit('state_saved', {
- Line 6178 [CLEANUP]: on page unload
- Line 6292 [SECURITY]: Compliance.exportLogsCSV();
- Line 6294 [SECURITY]: Compliance.exportLogsJSON();
- Line 6309 [SECURITY]: Compliance.setUserRole(role);

### apps\frontend\html-pages\electron-code-editor\integration-commands.js (1)

- Line 113 [TEST]: 'echo "Error: no test specified" && exit 1'

### apps\frontend\html-pages\electron-code-editor\package-manager.js (2)

- Line 327 [TEST]: 'echo "Error: no test specified" && exit 1'
- Line 355 [TEST]: ing: ['jest', 'mocha', 'chai'],

### apps\frontend\html-pages\electron-code-editor\performance-optimizer.js (1)

- Line 144 [OPTIMIZE]: ForLongSession() {

### apps\frontend\html-pages\electron-code-editor\platform-integration.js (1)

- Line 497 [CLEANUP]: 

### apps\frontend\html-pages\electron-code-editor\plugin-system.js (1)

- Line 331 [CLEANUP]: 

### apps\frontend\html-pages\electron-code-editor\security-compliance.js (1)

- Line 375 [SECURITY]: Dashboard

### apps\frontend\html-pages\libs\video.min.js (3)

- Line 37 [TODO]: Add proper error handling/
- Line 41 [TODO]: Add proper error handling/
- Line 45 [TODO]: Add proper error handling/

### apps\frontend\html-pages\profile.html (1)

- Line 1326 [NOTE]: s: `<div draggable="true" data-widget="notes" style="grid-column:span 2;padding:12px;background:rgba(255,255,0,0.05);border-radius:8px;border:1px solid rgba(255,255,0,0.3);cursor:move;position:relative;" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">

### apps\frontend\html-pages\settings.html (1)

- Line 593 [SECURITY]: 

### apps\frontend\html-pages\ultra-editor.html (1)

- Line 477 [TODO]: Add error handling\ntry {\n  // Your code here\n} catch (error) {\n  console.error(error);\n}'

### apps\frontend\html-pages\video-player.html (1)

- Line 1713 [TEST]: -streams.mux.dev/x36xhzz/x36xhzz.m3u8',

### config\app-config-browser.js (4)

- Line 43 [SECURITY]: 
- Line 44 [SECURITY]: {
- Line 50 [PERFORMANCE]: 
- Line 51 [PERFORMANCE]: {

### config\app-config.js (3)

- Line 33 [SECURITY]: Service
- Line 34 [SECURITY]: {
- Line 57 [SECURITY]: {

### config\docker\docker-compose.yml (6)

- Line 43 [TEST]: ['CMD', 'node', 'healthcheck.js']
- Line 91 [TEST]: 
- Line 110 [TEST]: ['CMD', 'redis-cli', '--pass', '${REDIS_PASSWORD}', 'ping']
- Line 255 [SECURITY]: -service:
- Line 288 [TEST]: ['CMD', 'node', 'healthcheck.js']
- Line 382 [TEST]: 

### config\linting\eslint.security.config.js (2)

- Line 35 [SECURITY]: security,
- Line 39 [SECURITY]: rules (OWASP Top 10 focused)

### config\network.yml (2)

- Line 2 [OPTIMIZE]: d for 425 Mbps connection and video streaming
- Line 43 [SECURITY]: 

### config\testing\electron-playwright.config.js (1)

- Line 3 [TEST]: Dir: './tests/e2e',

### config\testing\playwright.config.js (1)

- Line 4 [TEST]: Dir: './tests/e2e',

### config\testing\vitest.config.ts (1)

- Line 2 [TEST]: {

### docker-compose.mcp.yml (1)

- Line 17 [TEST]: ["CMD", "curl", "-f", "http://localhost:3000/health"]

### docs\AI_AGENT_ORCHESTRATION.md (1)

- Line 75 [REFACTOR]: ing: 4 parallel subagents

### docs\ARCHITECTURE.md (1)

- Line 64 [SECURITY]: Service

### docs\CODE_SCANNER.md (6)

- Line 77 [SECURITY]: Checks
- Line 99 [TEST]: Validation
- Line 158 [SECURITY]: Hardcoded API key detected
- Line 290 [REVIEW]: pattern matching logic
- Line 294 [PERFORMANCE]: Issues
- Line 321 [SECURITY]: patterns are regex-based (not AST analysis)

### docs\CURSOR_AI_MODES.md (1)

- Line 96 [REFACTOR]: Mode

### docs\CUSTOM_MCP_SERVER.md (3)

- Line 13 [TEST]: tools
- Line 108 [TEST]: ing Tools
- Line 117 [TEST]: deploy_service

### docs\DASHBOARD_BEST_PRACTICES.md (4)

- Line 202 [TEST]: error handling
- Line 203 [REVIEW]: performance impact
- Line 216 [SECURITY]: Using DOMPurify to prevent XSS attacks
- Line 222 [SECURITY]: considerations

### docs\ELECTRON_CODE_EDITOR_SECURITY.md (7)

- Line 1 [SECURITY]: & Compliance Documentation
- Line 65 [SECURITY]: Compliance.exportLogsCSV({
- Line 76 [SECURITY]: Compliance.exportLogsJSON({
- Line 123 [SECURITY]: Compliance.setUserRole('viewer');
- Line 163 [TEST]: decryption regularly
- Line 175 [REVIEW]: permissions regularly
- Line 269 [SECURITY]: Compliance Class

### docs\ELECTRON_OPTIMIZATION.md (7)

- Line 9 [SECURITY]: Architecture
- Line 56 [PERFORMANCE]: Memory Report
- Line 57 [PERFORMANCE]: Clear Cache
- Line 105 [PERFORMANCE]: Features
- Line 118 [PERFORMANCE]: reports
- Line 127 [SECURITY]: Features
- Line 227 [PERFORMANCE]: Monitoring

### docs\IDE_MCP_SETUP.md (3)

- Line 9 [TEST]: MCP integration  
- Line 91 [TEST]: manually: `npm run mcp:test`
- Line 98 [PERFORMANCE]: Issues

### docs\IPV6_SETUP.md (3)

- Line 30 [TEST]: ing
- Line 33 [TEST]: IPv6 connectivity
- Line 36 [TEST]: IPv4 (still works)

### docs\MCP_DEPLOYMENT.md (3)

- Line 104 [SECURITY]: Configuration
- Line 136 [TEST]: ing Deployment
- Line 228 [TEST]: tools directly

### docs\MCP_INTEGRATION.md (5)

- Line 96 [SECURITY]: Audit Workflow
- Line 139 [TEST]: manually
- Line 168 [TEST]: MCP server
- Line 174 [TEST]: tool execution
- Line 193 [SECURITY]: Integration

### docs\SYNTAX_FIXES_EXAMPLES.md (4)

- Line 116 [REFACTOR]: 'refactor current file for better readability',
- Line 118 [OPTIMIZE]: 'optimize performance of current code
- Line 125 [REFACTOR]: 'refactor current file for better readability',
- Line 127 [OPTIMIZE]: 'optimize performance of current code'

### docs\SYNTAX_FIXES_SUMMARY.md (1)

- Line 113 [TEST]: affected functionality

### docs\TODO_GUIDELINES.md (21)

- Line 13 [SECURITY]: Validate user input to prevent XSS
- Line 18 [BUG]: Memory leak in video player cleanup
- Line 23 [FIXME]: API endpoint returns 500 on invalid token
- Line 30 [PERFORMANCE]: Cache database queries
- Line 35 [REFACTOR]: Extract duplicate logic to shared utility
- Line 40 [DEPRECATED]: Use newFunction() instead (remove in v2.0)
- Line 47 [TODO]: Add error handling for edge cases
- Line 52 [OPTIMIZE]: Reduce bundle size by lazy loading
- Line 57 [REVIEW]: Check if this approach is correct
- Line 64 [HACK]: Temporary fix until library is updated
- Line 69 [CLEANUP]: Remove unused imports
- Line 74 [NOTE]: This function is called by external service
- Line 79 [DOCS]: Add JSDoc comments
- Line 84 [TEST]: Add unit tests for error scenarios
- Line 98 [SECURITY]: Sanitize user input before database query
- Line 99 [BUG]: (john): Race condition in payment processing - Issue #456
- Line 100 [TODO]: Implement retry logic with exponential backoff
- Line 101 [PERFORMANCE]: Add Redis caching layer
- Line 102 [REFACTOR]: Split this 500-line file into modules
- Line 103 [DEPRECATED]: Remove legacy API v1 endpoints by Q2 2025
- Line 192 [REVIEW]: TODOs weekly in team meetings

### docs\ZED_OPTIMIZATION.md (3)

- Line 9 [PERFORMANCE]: Optimizations
- Line 120 [PERFORMANCE]: Metrics
- Line 202 [SECURITY]: 

### docs\commands\ai-services.md (5)

- Line 40 [TEST]: video generation
- Line 83 [TEST]: agent coordination
- Line 101 [TEST]: content moderation
- Line 247 [TEST]: AI video generation
- Line 251 [TEST]: AI models

### docs\commands\deployment.md (6)

- Line 71 [TEST]: blue environment
- Line 148 [SECURITY]: policies
- Line 178 [SECURITY]: policies
- Line 211 [SECURITY]: audit
- Line 214 [PERFORMANCE]: tests
- Line 304 [PERFORMANCE]: verification

### docs\commands\development.md (1)

- Line 147 [SECURITY]: scanning

### docs\commands\maintenance.md (12)

- Line 37 [SECURITY]: monitoring
- Line 40 [PERFORMANCE]: monitoring
- Line 88 [PERFORMANCE]: monitoring
- Line 148 [SECURITY]: updates
- Line 241 [TEST]: backup restoration
- Line 271 [PERFORMANCE]: baseline
- Line 300 [PERFORMANCE]: report
- Line 303 [SECURITY]: report
- Line 326 [TEST]: backup/restore
- Line 329 [TEST]: failover
- Line 332 [TEST]: monitoring
- Line 335 [TEST]: recovery procedures

### docs\commands\quick-reference.md (7)

- Line 15 [SECURITY]: audit
- Line 74 [SECURITY]: audit
- Line 128 [TEST]: AI
- Line 170 [SECURITY]: fixes
- Line 233 [PERFORMANCE]: test
- Line 265 [TEST]: PWA features
- Line 282 [TEST]: offline mode

### docs\commands\security.md (28)

- Line 89 [SECURITY]: audit in containers
- Line 100 [TEST]: security headers
- Line 107 [TEST]: HTTPS configuration
- Line 120 [SECURITY]: -focused linting
- Line 134 [TEST]: JWT implementation
- Line 137 [TEST]: Firebase auth
- Line 140 [TEST]: session management
- Line 143 [TEST]: password security
- Line 146 [TEST]: rate limiting
- Line 153 [TEST]: input validation
- Line 156 [TEST]: XSS protection
- Line 159 [TEST]: SQL injection protection
- Line 162 [TEST]: NoSQL injection protection
- Line 165 [TEST]: command injection protection
- Line 178 [TEST]: database connections
- Line 196 [TEST]: firewall rules
- Line 233 [SECURITY]: audit report
- Line 256 [TEST]: encryption implementation
- Line 259 [TEST]: password hashing
- Line 262 [TEST]: data encryption at rest
- Line 265 [TEST]: TLS/SSL configuration
- Line 272 [SECURITY]: incident detection
- Line 278 [SECURITY]: breach response
- Line 291 [SECURITY]: configuration validation
- Line 294 [SECURITY]: best practices audit
- Line 332 [TEST]: security middleware
- Line 338 [TEST]: injection protection
- Line 341 [TEST]: security headers

### docs\commands\testing.md (4)

- Line 58 [TEST]: specific endpoints
- Line 128 [SECURITY]: audit
- Line 146 [TEST]: in Docker environment
- Line 346 [TEST]: with logs

### docs\readme\apps-README.md (1)

- Line 80 [SECURITY]: 

### docs\readme\commands-README.md (3)

- Line 12 [TEST]: ing & QA commands
- Line 14 [SECURITY]: & audit commands
- Line 32 [SECURITY]: audit

### docs\readme\electron-code-editor-README.md (2)

- Line 120 [PERFORMANCE]: 
- Line 124 [OPTIMIZE]: d LSP communication

### docs\readme\libs-README.md (1)

- Line 27 [SECURITY]: Benefits:

### docs\reports\NOTIFICATION_EMBEDDING_SUMMARY.md (6)

- Line 175 [TEST]: ing Checklist
- Line 190 [PERFORMANCE]: Metrics
- Line 206 [SECURITY]: Considerations
- Line 265 [REVIEW]: security best practices
- Line 266 [OPTIMIZE]: bundle size
- Line 272 [TEST]: notification functionality

### docs\status\SYNTAX_FIX_COMPLETE.md (2)

- Line 77 [TEST]: core functionality
- Line 79 [TEST]: development mode

### docs\status\SYNTAX_FIX_PRIORITY.md (1)

- Line 39 [TEST]: functionality after fixes

### electron\renderer.js (2)

- Line 21 [PERFORMANCE]: monitoring
- Line 37 [CLEANUP]: on unload`

### lib\memory-monitor.js (1)

- Line 15 [CLEANUP]: () {

### mcp-http-server.js (1)

- Line 64 [SECURITY]: Scan: async (input) => {

### mcp-tools-test.js (3)

- Line 37 [TEST]: each tool
- Line 38 [TEST]: Tools.forEach((tool, index) => {
- Line 54 [CLEANUP]: 

### middleware\csrf.js (3)

- Line 15 [CLEANUP]: old tokens periodically to prevent memory leaks
- Line 22 [CLEANUP]: Interval = setInterval(() => {
- Line 27 [CLEANUP]: Interval.unref();

### middleware\performance.js (1)

- Line 1 [OPTIMIZE]: d performance monitor

### middleware\rate-limiter.js (1)

- Line 49 [SECURITY]: createRateLimiter({

### middleware\security-integration.js (1)

- Line 32 [SECURITY]: headers

### playwright-report\index.html (18)

- Line 18900 [TEST]: Info: u,
- Line 18932 [TEST]: info', '', u];
- Line 18940 [TEST]: source', '', '```ts', E, '```'),
- Line 19032 [TEST]: Info: [
- Line 19241 [TEST]: u,
- Line 19305 [TEST]: i,
- Line 19306 [TEST]: RunMetadata: c,
- Line 19407 [TEST]: i,
- Line 19409 [TEST]: RunMetadata: c,
- Line 19536 [TEST]: u,
- Line 19844 [TEST]: s: i.slice(0, c),
- Line 20002 [TEST]: Id: E,
- Line 20003 [TEST]: IdToFileIdMap: N,
- Line 20013 [TEST]: IdToFileIdMap: i,
- Line 20016 [TEST]: Id: r,
- Line 20056 [TEST]: RunMetadata: E,
- Line 20060 [TEST]: d,
- Line 20094 [TEST]: s: [],

### scripts\agents\README.md (2)

- Line 63 [TEST]: thoroughly after running agents
- Line 64 [REVIEW]: changes before committing

### scripts\ai\cursor-ai-modes.js (2)

- Line 34 [REFACTOR]: Mode - Code transformation
- Line 63 [TODO]: Implement\n}`,`

### scripts\analysis\advanced-code-scanner.js (4)

- Line 24 [SECURITY]: true,
- Line 28 [TEST]: s: true,
- Line 157 [SECURITY]: checks
- Line 168 [TEST]: checks

### scripts\analysis\unified-scanner.js (1)

- Line 47 [TEST]: file validation

### scripts\refactoring\advanced-refactor.js (1)

- Line 339 [REFACTOR]: .refactorAllFiles().catch(console.error);'

### scripts\refactoring\function-breakdown.js (1)

- Line 221 [TODO]: Implement extracted logic`

### scripts\scan-todos.js (4)

- Line 42 [TODO]: s.push({
- Line 72 [TODO]: s.push(...fileTodos);
- Line 84 [TODO]: s.forEach(todo => {
- Line 140 [TODO]: s.forEach(todo => {

### server.js (2)

- Line 41 [SECURITY]: middleware/
- Line 340 [CLEANUP]: [() => memoryMonitor.cleanup()],

### servers\hub-app.js (1)

- Line 24 [CLEANUP]: expired tokens

### servers\mcp-server.js (2)

- Line 21 [SECURITY]: middleware/
- Line 22 [SECURITY]: middleware

### servers\secure-server.js (1)

- Line 29 [SECURITY]: middleware

### temp\backup_20251216_042406\auto-editor.html (2)

- Line 1194 [TODO]: Integrate Transcribe.js for STT
- Line 1225 [NOTE]: SpeechSynthesis doesn't directly connect, need hack or library

### temp\backup_20251216_042406\profile.html (1)

- Line 3700 [NOTE]: s: `<div draggable="true" data-widget="notes" style="grid-column:span 2;padding:12px;background:rgba(255,255,0,0.05);border-radius:8px;border:1px solid rgba(255,255,0,0.3);cursor:move;position:relative;" ondragstart="handleDragStart(event)" ondragover="handleDragOver(event)" ondrop="handleDrop(event)">

### temp\backup_20251216_042406\settings.html (1)

- Line 561 [SECURITY]: 

### temp\backup_20251216_042406\video-player.html (1)

- Line 1681 [TEST]: -streams.mux.dev/x36xhzz/x36xhzz.m3u8',

### test-mcp-ide.js (2)

- Line 11 [TEST]: MCP server startup
- Line 26 [TEST]: tool availability

### tests\electron-code-editor\e2e\editor.spec.js (7)

- Line 6 [TEST]: .describe('HOOTNER Code Editor', () => {
- Line 7 [TEST]: .beforeEach(async ({ page }) => {
- Line 12 [TEST]: ('should load editor successfully', async ({ page }) => {
- Line 17 [TEST]: ('should create new file', async ({ page }) => {
- Line 22 [TEST]: ('should type code in editor', async ({ page }) => {
- Line 29 [TEST]: ('should run code', async ({ page }) => {
- Line 36 [TEST]: ('should open command palette', async ({ page }) => {

### tools\USAGE.md (1)

- Line 23 [SECURITY]: Scan

