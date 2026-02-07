# GitHub Actions Monitoring Agent

## Overview

The GitHub Actions Monitoring Agent is an intelligent infrastructure agent that continuously monitors GitHub Actions workflow runs, detects failures, analyzes patterns, and can automatically trigger recovery actions.

## Features

### Core Capabilities

1. **Workflow Monitoring**
   - Polls GitHub Actions API at configurable intervals (default: 5 minutes)
   - Monitors workflow run status (success, failure, in-progress, queued)
   - Tracks multiple workflows simultaneously
   - Branch-specific monitoring

2. **Failure Detection**
   - Detects workflow failures in real-time
   - Tracks consecutive failure counts per workflow
   - Identifies critical failure patterns
   - Analyzes workflow logs for error patterns

3. **Pattern Analysis**
   - 8 pre-configured failure patterns with regex
   - Severity classification (low, medium, high, critical)
   - Pattern frequency tracking

4. **Auto-Recovery**
   - Automatic retry on transient failures
   - Cache clearing for dependency issues
   - Resource scaling for memory issues
   - Team notifications for code issues

5. **Event Emitters**
   - workflowCheck, workflowFailure, criticalPattern, consecutiveFailures, autoRecovery, error

## Configuration

See config/github-actions-monitor.config.js for all options.

## Usage

The agent is automatically started with the Enhanced Agent Hub.

## Success Criteria

1. ✅ Agent monitors GitHub Actions workflow runs
2. ✅ Detects workflow failures in real-time
3. ✅ Tracks consecutive failures per workflow
4. ✅ Identifies 8+ failure patterns with regex
5. ✅ Triggers alerts when threshold exceeded
6. ✅ Auto-recovery for network and dependency failures
7. ✅ Event emitters for integration with other agents
8. ✅ Configurable via environment variables
9. ✅ Works in mock mode without GitHub token
10. ✅ Provides comprehensive monitoring status
