# VS Code Publisher Setup

## Step 1: Create Publisher (No Token Needed)

```bash
cd .vscode/extensions/hootner-bridge
npx @vscode/vsce create-publisher hootner
```

Fill in:
- **Publisher ID**: hootner
- **Display Name**: HOOTNER
- **Description**: AI-Powered Development Intelligence

## Step 2: Login

```bash
npx @vscode/vsce login hootner
```

This opens browser - sign in with Microsoft account.

## Step 3: Publish

```bash
npx @vscode/vsce publish
```

No token needed - uses browser auth.

---

Or publish .vsix manually:
```bash
npx @vscode/vsce package
# Upload at: https://marketplace.visualstudio.com/manage/publishers/hootner
```
