/**
 * GitHub Actions Monitoring Agent Configuration
 * 
 * Configuration options for the GitHub Actions monitoring agent
 * that monitors workflow runs, detects failures, and triggers auto-recovery
 */

export const githubActionsMonitorConfig = {
  // Authentication
  githubToken: process.env.GITHUB_TOKEN || null,
  
  // Repository settings
  owner: process.env.GITHUB_OWNER || 'Hootner',
  repo: process.env.GITHUB_REPO || 'hootner',
  
  // Polling configuration
  pollingInterval: parseInt(process.env.GITHUB_MONITOR_INTERVAL) || 5 * 60 * 1000, // 5 minutes default
  
  // Monitoring scope
  maxWorkflowRuns: parseInt(process.env.GITHUB_MONITOR_MAX_RUNS) || 10,
  monitoredWorkflows: process.env.GITHUB_MONITOR_WORKFLOWS?.split(',') || ['all'],
  monitoredBranches: process.env.GITHUB_MONITOR_BRANCHES?.split(',') || ['main', 'develop'],
  
  // Failure thresholds
  failureThreshold: parseInt(process.env.GITHUB_MONITOR_FAILURE_THRESHOLD) || 3,
  alertCooldown: parseInt(process.env.GITHUB_MONITOR_ALERT_COOLDOWN) || 3600000, // 1 hour
  
  // Auto-recovery settings
  autoRecoveryEnabled: process.env.GITHUB_MONITOR_AUTO_RECOVERY !== 'false',
  retryDelayMinutes: parseInt(process.env.GITHUB_MONITOR_RETRY_DELAY) || 15,
  maxRetryAttempts: parseInt(process.env.GITHUB_MONITOR_MAX_RETRIES) || 3,
  
  // Failure pattern regexes
  failurePatterns: [
    {
      name: 'Network Errors',
      pattern: /ECONNREFUSED|ETIMEDOUT|ENOTFOUND|ERR_SOCKET_TIMEOUT/i,
      type: 'network',
      severity: 'high',
      autoRecoverable: true,
      recoveryAction: 'retry_workflow'
    },
    {
      name: 'Dependency Errors',
      pattern: /npm ERR!|yarn error|pnpm ERR!|Failed to install|package not found/i,
      type: 'dependency',
      severity: 'medium',
      autoRecoverable: true,
      recoveryAction: 'clear_cache'
    },
    {
      name: 'Test Failures',
      pattern: /Error: test.* failed|Test suite failed|[0-9]+ failing/i,
      type: 'test_failure',
      severity: 'medium',
      autoRecoverable: false,
      recoveryAction: 'notify_team'
    },
    {
      name: 'Code Errors',
      pattern: /SyntaxError|ReferenceError|TypeError|Cannot find module/i,
      type: 'code_error',
      severity: 'high',
      autoRecoverable: false,
      recoveryAction: 'notify_team'
    },
    {
      name: 'Resource Exhaustion',
      pattern: /Out of memory|ENOMEM|heap out of memory|JavaScript heap/i,
      type: 'resource',
      severity: 'high',
      autoRecoverable: true,
      recoveryAction: 'increase_resources'
    },
    {
      name: 'Process Exit Errors',
      pattern: /exit code [1-9]|Process completed with exit code/i,
      type: 'process_exit',
      severity: 'medium',
      autoRecoverable: false,
      recoveryAction: 'analyze_logs'
    },
    {
      name: 'Authentication Errors',
      pattern: /authentication failed|permission denied|401 Unauthorized|403 Forbidden/i,
      type: 'auth',
      severity: 'critical',
      autoRecoverable: false,
      recoveryAction: 'check_credentials'
    },
    {
      name: 'Build Failures',
      pattern: /build failed|compilation error|webpack.*error|tsc.*error/i,
      type: 'build',
      severity: 'high',
      autoRecoverable: false,
      recoveryAction: 'notify_team'
    }
  ],
  
  // Notification settings
  notifications: {
    enabled: process.env.GITHUB_MONITOR_NOTIFICATIONS !== 'false',
    channels: (process.env.GITHUB_MONITOR_NOTIFICATION_CHANNELS?.split(',') || ['console', 'event']),
    severityThreshold: process.env.GITHUB_MONITOR_SEVERITY_THRESHOLD || 'medium', // 'low', 'medium', 'high', 'critical'
  },
  
  // Logging
  logLevel: process.env.GITHUB_MONITOR_LOG_LEVEL || 'info', // 'debug', 'info', 'warn', 'error'
  logToFile: process.env.GITHUB_MONITOR_LOG_TO_FILE === 'true',
  logFilePath: process.env.GITHUB_MONITOR_LOG_FILE || './logs/github-actions-monitor.log'
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Recovery actions
export const RECOVERY_ACTIONS = {
  RETRY_WORKFLOW: 'retry_workflow',
  CLEAR_CACHE: 'clear_cache',
  UPDATE_DEPENDENCIES: 'update_dependencies',
  INCREASE_RESOURCES: 'increase_resources',
  RESTART_RUNNERS: 'restart_runners',
  NOTIFY_TEAM: 'notify_team',
  ANALYZE_LOGS: 'analyze_logs',
  CHECK_CREDENTIALS: 'check_credentials'
};

export default githubActionsMonitorConfig;
