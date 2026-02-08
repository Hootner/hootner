# 🦉 Publish HOOTNER Extension to VS Code Marketplace

## Quick Publish

```bash
cd d:\my-local-repo\.vscode\extensions\hootner-bridge
npx @vscode/vsce publish
```

## Version Updates

```bash
# Patch (1.0.2 -> 1.0.3)
npx @vscode/vsce publish patch

# Minor (1.0.2 -> 1.1.0)
npx @vscode/vsce publish minor

# Major (1.0.2 -> 2.0.0)
npx @vscode/vsce publish major
```

## Manual Upload

```bash
# Create package
npx @vscode/vsce package

# Upload .vsix at:
# https://marketplace.visualstudio.com/manage/publishers/hootner
```

## Done

Extension live at: https://marketplace.visualstudio.com/items?itemName=hootner.hq-agent-bridge
