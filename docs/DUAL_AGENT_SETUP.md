# Amazon Q + GitHub Copilot Dual-Agent Setup

## Overview

This repo is configured to use **dual-agent mode** with GitHub Copilot and Amazon Q. Both AI agents work together:

- **GitHub Copilot**: inline code completion, refactoring, chat
- **Amazon Q**: codebase search, AWS integration, security scanning, enterprise policies

## Prerequisites

### GitHub Copilot

- VS Code extension: `GitHub.copilot` (installed)
- GitHub account with Copilot subscription
- Authenticate: Press `Ctrl+Shift+P` → "GitHub Copilot: Sign in"

### Amazon Q

- VS Code extension: `AmazonWebServices.amazon-q-vscode` (installed)
- AWS Account with Amazon Q access
- AWS credentials configured at `~/.aws/credentials` or `~/.aws/config`

## Enable Amazon Q

1. Open VS Code
2. Press `Ctrl+Shift+P` → search "Amazon Q: Start Web Experience"
3. Authenticate with AWS SSO or credentials
4. Once authenticated, Amazon Q chat and code references are available

### AWS Credentials

If using AWS CLI locally:

```bash
# Configure AWS credentials (interactive)
aws configure

# Or manually edit ~/.aws/credentials:
[default]
aws_access_key_id = YOUR_KEY_ID
aws_secret_access_key = YOUR_SECRET
region = us-east-1
```

## Dual-Agent Routing

When you make a request (via chat or commands), the system routes to the appropriate agent:

| Request Type | Primary Agent | Use Case |
|---|---|---|
| AWS-specific | Amazon Q | S3, Lambda, ECS, etc. |
| Codebase context | Amazon Q | Search files, understand structure |
| Inline code | Copilot | Auto-complete, in-editor suggestions |
| Chat refactor | Copilot | Multi-line refactoring, chat |
| Security audit | Amazon Q | Vulnerability scanning |
| General coding | Copilot | Standard code generation |
| Documentation | Copilot | Comments, docstrings |
| Compliance | Amazon Q | Enterprise policies |

If the primary agent fails or isn't available, the system falls back to the other agent.

## Usage Examples

### GitHub Copilot

Press `Ctrl+K` to open the Command Menu and type a request:

```
// Example: "Refactor this function to use async/await"
// Copilot will generate a refactored version
```

Or use `Ctrl+I` for inline suggestions.

### Amazon Q

Press `Ctrl+Q` to open Amazon Q chat:

```
// Example: "How do we use S3 in this codebase?"
// Amazon Q will search and provide context-aware answers
```

Or use the Amazon Q panel on the right sidebar for code references.

## Disable Dual-Agent Mode

If you want to use only Copilot:

```bash
# Edit .vscode/dual-agent-config.json and set:
"dualAgent": {
  "enabled": false,
  "mode": "copilot-only"
}
```

Then reload VS Code.

## Troubleshooting

### Amazon Q not working

- Ensure AWS credentials are configured: `aws sts get-caller-identity`
- Check that you have Amazon Q access in your AWS account
- Open the Amazon Q panel (sidebar) and click "Start Web Experience" again

### Copilot not responding

- Verify GitHub authentication: `Ctrl+Shift+P` → "GitHub Copilot: Sign in"
- Check internet connection
- Restart VS Code

### Both agents failing

- Check internet connectivity
- Ensure both extensions are installed and enabled in VS Code
- Check VS Code output panels for error messages

## Configuration

See `.vscode/dual-agent-config.json` for full configuration options:

```json
{
  "dualAgent": {
    "enabled": true,
    "mode": "cooperative",
    "primaryAgent": "copilot",
    "enableFallback": true,
    "routingStrategy": "context-aware"
  }
}
```

## CLI Commands

Use npm scripts to manage dual-agent mode:

```bash
# Enable dual-agent mode
npm run dual-agent:enable

# Disable dual-agent mode (Copilot only)
npm run dual-agent:disable

# Show current dual-agent status
npm run dual-agent:status
```

Or use the CLI directly:

```bash
# Enable
node scripts/dual-agent-switcher.js enable

# Disable
node scripts/dual-agent-switcher.js disable

# Status
node scripts/dual-agent-switcher.js status
```

## Next Steps

1. **Authenticate both agents** (Copilot + Amazon Q)
2. **Test dual-agent mode** with sample requests
3. **Customize routing rules** in `.vscode/dual-agent-config.json` if desired
4. **Use in development** — both agents will be available in chat and inline

---

**Need help?**

- [GitHub Copilot Docs](https://github.com/features/copilot)
- [Amazon Q Docs](https://aws.amazon.com/q/)
- Review `frameworks/ai/agents/dual-agent-orchestrator.js` for routing logic
