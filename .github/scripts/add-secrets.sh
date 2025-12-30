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

# Add generated secrets (safer stdin method)
echo "Adding JWT_SECRET..."
printf '%s' '8NsAncYX5W1rCyfpPcn3zHeNEvJKmOIz+B/TNOoepulkRs/J0k3xGrTMVqzC/9ki' | gh secret set JWT_SECRET --repo Hootner/hootner --body-file -

echo "Adding JWT_REFRESH_SECRET..."
printf '%s' 'sDe5/08NsGoaUwPtMjcAHM7mU7OgFNzNvezUkqJfVoRHSfSWwx/tBN4siMLi12Pn' | gh secret set JWT_REFRESH_SECRET --repo Hootner/hootner --body-file -

echo "Adding COSIGN_PASSWORD..."
printf '%s' 'oHysj/YXH8nHnwvVwAOPsnY37WaZ2s2Y' | gh secret set COSIGN_PASSWORD --repo Hootner/hootner --body-file -

echo "Adding SESSION_SECRET..."
printf '%s' 'KUv4Mwz8UW+SAnSRnGLegjFNwUK3uMLG' | gh secret set SESSION_SECRET --repo Hootner/hootner --body-file -

echo "Adding ENCRYPTION_KEY..."
printf '%s' '2fTRsXvsWqyWg8Li31bcGJ4XxDThoiQJ' | gh secret set ENCRYPTION_KEY --repo Hootner/hootner --body-file -

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
