# 🤖 Dual-Agent Setup Guide

## Current Status

✅ Dual-agent mode is **ENABLED** (Copilot + Amazon Q)

## Setup Steps

### 1. Configure AWS Credentials

```bash
aws configure
```

Enter:

- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., us-east-1)
- Default output format (json)

### 2. Enable Dual-Agent Mode

```bash
npm run dual-agent:enable
```

### 3. Authenticate in VS Code

#### GitHub Copilot

1. Press `Ctrl+Shift+P`
2. Type: "GitHub Copilot: Sign in"
3. Follow browser authentication

#### Amazon Q

1. Press `Ctrl+Q`
2. Select "Amazon Q: Start Web Experience"
3. Choose AWS SSO or IAM credentials
4. Complete authentication

### 4. Check Status

```bash
npm run dual-agent:status
```

### 5. Test Both Agents

#### Test Copilot

- Open any `.js` file
- Start typing a function
- Wait for inline suggestions

#### Test Amazon Q

- Press `Ctrl+Q` to open Q chat
- Ask: "Review this file for AWS best practices"

## Routing Strategy

The system automatically routes requests:

| Task Type             | Agent    |
| --------------------- | -------- |
| AWS-specific code     | Amazon Q |
| Security audits       | Amazon Q |
| Inline completions    | Copilot  |
| Code refactoring      | Copilot  |
| General coding        | Copilot  |
| Enterprise compliance | Amazon Q |

## Commands

```bash
# Enable dual-agent
npm run dual-agent:enable

# Disable dual-agent (Copilot only)
npm run dual-agent:disable

# Check status
npm run dual-agent:status
```

## Troubleshooting

### AWS Credentials Not Found

```bash
# Check credentials
aws sts get-caller-identity

# Reconfigure
aws configure
```

### Copilot Not Working

1. Check GitHub authentication: `Ctrl+Shift+P` → "GitHub Copilot: Check Status"
2. Restart VS Code
3. Reinstall extension if needed

### Amazon Q Not Working

1. Check AWS credentials: `aws sts get-caller-identity`
2. Verify IAM permissions for CodeWhisperer
3. Restart VS Code

## Configuration File

Location: `.vscode/dual-agent-config.json`

Current settings:

- Mode: `cooperative`
- Primary: `copilot`
- Fallback: `amazonQ`
- Strategy: `context-aware`
