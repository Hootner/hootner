# 🚀 GitHub Actions Monitoring Agent - Quick Start Guide

## Installation & Setup

The GitHub Actions Monitoring Agent is already integrated into the HOOTNER platform. No installation is required.

## Quick Start (3 Steps)

### 1. Set Environment Variables

```bash
# Copy example and edit
cp .env.example .env

# Set your GitHub token
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=Hootner
GITHUB_REPO=hootner
```

### 2. Start the Agent Hub

```bash
# The agent automatically starts with the hub
node enhanced-agent-hub.js
```

### 3. Monitor the Agent

The agent will start monitoring immediately and output status:

```
🤖 Initializing Enhanced Agent Hub with 75+ agents...
✅ Enhanced Agent Hub initialized with 76 agents
🚀 Starting production agents with real functionality...
✅ github-actions-monitoring started successfully
   ✅ github-actions-monitoring - Running with real implementation
```

## Usage Examples

### Get Agent Status

```javascript
import enhancedAgentHub from './enhanced-agent-hub.js';

await enhancedAgentHub.initialize();

const agent = await enhancedAgentHub.getAgentInstance('github-actions-monitoring');
const status = agent.getMonitoringStatus();
console.log(status);
```

### Listen for Workflow Failures

```javascript
const agent = await enhancedAgentHub.getAgentInstance('github-actions-monitoring');

agent.on('workflowFailure', (data) => {
  console.log(`❌ Workflow ${data.workflow} failed!`);
  console.log(`   URL: ${data.url}`);
  console.log(`   Consecutive failures: ${data.consecutiveFailures}`);
});
```

### Listen for Critical Patterns

```javascript
agent.on('criticalPattern', (data) => {
  console.log(`🚨 Critical: ${data.message}`);
  console.log(`   Workflow: ${data.workflow}`);
  console.log(`   Type: ${data.type}`);
  console.log(`   Count: ${data.count}`);
  
  // Trigger additional alerts
  // Send notifications
  // Escalate to team
});
```

### Manually Trigger Check

```javascript
// Force an immediate check instead of waiting for polling interval
await agent.checkWorkflowRuns();
```

### Get Workflow Logs

```javascript
const logs = await agent.getWorkflowLogs(runId);
console.log(logs.summary); // "1 network error(s), 2 dependency error(s)"
console.log(logs.patterns); // Array of detected patterns
```

## Testing Without GitHub Token

The agent supports mock mode for testing:

```bash
# Simply don't set GITHUB_TOKEN
unset GITHUB_TOKEN
node test-github-actions-agent.js
```

Mock mode generates realistic workflow data for testing all features.

## Configuration

All configuration is done via environment variables. See `.env.example` for full list:

```bash
# Polling frequency (default: 5 minutes)
GITHUB_MONITOR_INTERVAL=300000

# Number of workflow runs to check (default: 10)
GITHUB_MONITOR_MAX_RUNS=10

# Failure threshold before alerting (default: 3)
GITHUB_MONITOR_FAILURE_THRESHOLD=3

# Enable auto-recovery (default: true)
GITHUB_MONITOR_AUTO_RECOVERY=true
```

## Common Workflows

### Monitor Specific Workflows

```bash
# Only monitor specific workflows
GITHUB_MONITOR_WORKFLOWS=CI,Deploy,Tests
```

### Monitor Specific Branches

```bash
# Only monitor main and develop branches
GITHUB_MONITOR_BRANCHES=main,develop
```

### Adjust Alert Sensitivity

```bash
# More sensitive (alert after 1 failure)
GITHUB_MONITOR_FAILURE_THRESHOLD=1

# Less sensitive (alert after 5 failures)
GITHUB_MONITOR_FAILURE_THRESHOLD=5
```

## Integration with Other Agents

The GitHub Actions Monitoring Agent emits events that other agents can listen to:

```javascript
// Security agent checks failed security workflows
agent.on('workflowFailure', async (data) => {
  if (data.workflow.includes('security')) {
    const securityAgent = await enhancedAgentHub.getAgentInstance('security-service');
    // Perform additional security analysis
  }
});

// Auto-scaling agent handles resource issues
agent.on('criticalPattern', async (data) => {
  if (data.type === 'resource') {
    const scalingAgent = await enhancedAgentHub.getAgentInstance('auto-scaling');
    // Trigger resource scaling
  }
});
```

## Troubleshooting

### Agent Not Starting

**Problem**: Agent fails to start
**Solution**: Check if GitHub token is valid and has correct scopes (`repo`, `actions:read`)

### No Failures Detected

**Problem**: Agent running but not detecting failures
**Solution**: 
- Check if workflows are actually failing
- Verify repository owner/name is correct
- Check if polling interval has elapsed (default 5 minutes)

### High API Usage

**Problem**: Approaching GitHub API rate limits
**Solution**: Increase polling interval to 10+ minutes:
```bash
GITHUB_MONITOR_INTERVAL=600000  # 10 minutes
```

### Auto-Recovery Not Working

**Problem**: Auto-recovery not triggering
**Solution**:
- Verify `GITHUB_MONITOR_AUTO_RECOVERY=true`
- Check if failure type is marked as auto-recoverable
- Verify agent has necessary permissions

## Performance Considerations

- **API Rate Limits**: Default 5-minute polling stays well within GitHub's limits (5000 requests/hour)
- **Memory Usage**: Agent is lightweight (~5MB additional memory)
- **CPU Usage**: Minimal, polling checks are async and non-blocking
- **Network Usage**: ~1KB per API request, ~12KB per hour at default settings

## Best Practices

1. **Set appropriate thresholds**: Use 3 failures for critical workflows, 5+ for less critical
2. **Monitor mock mode first**: Test with mock mode before connecting to real API
3. **Use event listeners**: Subscribe to events instead of polling status
4. **Enable auto-recovery for transient issues**: Network/dependency failures should auto-recover
5. **Configure alert cooldown**: Prevent alert spam with 1-hour cooldown

## Next Steps

1. ✅ Start the agent (done automatically with hub)
2. ✅ Monitor console output for status
3. ✅ Set up event listeners for your use case
4. ✅ Configure thresholds based on your needs
5. ✅ Integrate with your alerting system

## Documentation

- Full documentation: `docs/agents/github-actions-monitoring.md`
- Implementation details: `docs/agents/IMPLEMENTATION_SUMMARY.md`
- Visual overview: `docs/agents/VISUAL_SUMMARY.md`
- Configuration reference: `config/github-actions-monitor.config.js`

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the full documentation
3. Check the test files for usage examples
4. Review agent status: `agent.getMonitoringStatus()`

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2026-02-07
