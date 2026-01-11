#!/bin/bash

# GitHub CLI Secret Setup Script
# Run: bash .github/scripts/add-secrets.sh
# Requires: gh CLI installed and authenticated (gh auth login)

set -e

echo "🔐 Adding secrets to Hootner/hootner..."
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Install: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated. Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Generate secure secrets instead of hardcoded ones
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
COSIGN_PASSWORD=$(openssl rand -base64 16)
SESSION_SECRET=$(openssl rand -base64 16)
ENCRYPTION_KEY=$(openssl rand -base64 16)

# Add generated secrets (safer stdin method)
echo "Adding JWT_SECRET..."
if ! printf '%s' "$JWT_SECRET" | gh secret set JWT_SECRET --repo Hootner/hootner --body-file -; then
    echo "❌ Failed to add JWT_SECRET"
    exit 1
fi

echo "Adding JWT_REFRESH_SECRET..."
if ! printf '%s' "$JWT_REFRESH_SECRET" | gh secret set JWT_REFRESH_SECRET --repo Hootner/hootner --body-file -; then
    echo "❌ Failed to add JWT_REFRESH_SECRET"
    exit 1
fi

echo "Adding COSIGN_PASSWORD..."
if ! printf '%s' "$COSIGN_PASSWORD" | gh secret set COSIGN_PASSWORD --repo Hootner/hootner --body-file -; then
    echo "❌ Failed to add COSIGN_PASSWORD"
    exit 1
fi

echo "Adding SESSION_SECRET..."
if ! printf '%s' "$SESSION_SECRET" | gh secret set SESSION_SECRET --repo Hootner/hootner --body-file -; then
    echo "❌ Failed to add SESSION_SECRET"
    exit 1
fi

echo "Adding ENCRYPTION_KEY..."
if ! printf '%s' "$ENCRYPTION_KEY" | gh secret set ENCRYPTION_KEY --repo Hootner/hootner --body-file -; then
    echo "❌ Failed to add ENCRYPTION_KEY"
    exit 1
fi

echo ""
echo "⚠️  AWS secrets require your real values:"
echo "Run these manually with your credentials:"
echo ""
echo "  printf '%s' 'YOUR_AWS_KEY' | gh secret set AWS_ACCESS_KEY_ID --repo Hootner/hootner --body-file -"
echo "  printf '%s' 'YOUR_AWS_SECRET' | gh secret set AWS_SECRET_ACCESS_KEY --repo Hootner/hootner --body-file -"
echo ""

echo "✅ Core secrets added successfully!"
echo ""
echo "Verify with: gh secret list --repo Hootner/hootner"
