#!/usr/bin/env node

/**
 * Generate Secure Secrets for GitHub Repository
 * Run: node .github/scripts/generate-secrets.js
 */

import crypto from 'crypto';

function generateSecret(length = 32) { return crypto.randomBytes(length).toString('base64').slice(0, length); }

function generateSecrets() { const secrets = { JWT_SECRET: generateSecret(64),
    JWT_REFRESH_SECRET: generateSecret(64),
    COSIGN_PASSWORD: generateSecret(32),
    SESSION_SECRET: generateSecret(32),
    ENCRYPTION_KEY: generateSecret(32) };

      );

  for (const [key, value] of Object.entries(secrets)) { ); }

      '); }

generateSecrets();
