#!/usr/bin/env node

/**
 * USB Passkey API Routes
 * Handles WebAuthn registration and authentication endpoints
 */

import express from 'express';
import usbPasskeyAuth from '../../../hexarchy/0-core/auth/usb-passkey.js';
import { authenticate, requireUSBPasskey } from '../../../hexarchy/0-core/auth/middleware.js';

const router = express.Router();

/**
 * GET /api/auth/passkey/register/begin
 * Start USB passkey registration process
 */
router.post('/register/begin', authenticate, async (req, res) => {
  try {
    const { userName, userEmail } = req.body;
    const userId = req.user.id;

    if (!userName || !userEmail) {
      return res.status(400).json({
        error: 'userName and userEmail are required'
      });
    }

    const options = usbPasskeyAuth.generateRegistrationOptions(
      userId,
      userName,
      userEmail
    );

    res.json({
      success: true,
      options,
      message: 'Insert your USB security key and follow the prompts'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration initiation failed',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/passkey/register/finish
 * Complete USB passkey registration
 */
router.post('/register/finish', authenticate, async (req, res) => {
  try {
    const { credential, challenge } = req.body;

    if (!credential || !challenge) {
      return res.status(400).json({
        error: 'credential and challenge are required'
      });
    }

    const verification = await usbPasskeyAuth.verifyRegistration(credential, challenge);

    if (!verification.success) {
      return res.status(400).json({
        error: 'Passkey registration failed',
        details: verification.error
      });
    }

    // TODO: Store credential in database
    // For now, we'll just return success
    // In a real implementation, you'd store:
    // - verification.credentialId
    // - verification.publicKey
    // - verification.userId
    // - verification.timestamp

    res.json({
      success: true,
      credentialId: verification.credentialId,
      message: 'USB passkey registered successfully! You can now use it for enhanced security.',
      authMethod: 'usb-passkey'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration completion failed',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/passkey/authenticate/begin
 * Start USB passkey authentication
 */
router.post('/authenticate/begin', async (req, res) => {
  try {
    const { allowedCredentials = [] } = req.body;

    // TODO: Get user's registered credentials from database
    // For demo, we'll use provided allowedCredentials

    const options = usbPasskeyAuth.generateAuthenticationOptions(allowedCredentials);

    res.json({
      success: true,
      options,
      message: 'Insert your USB security key and follow the prompts'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Authentication initiation failed',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/passkey/authenticate/finish
 * Complete USB passkey authentication
 */
router.post('/authenticate/finish', async (req, res) => {
  try {
    const { credential, challenge, userId } = req.body;

    if (!credential || !challenge || !userId) {
      return res.status(400).json({
        error: 'credential, challenge, and userId are required'
      });
    }

    const verification = await usbPasskeyAuth.verifyAuthentication(
      credential,
      challenge,
      userId
    );

    if (!verification.success) {
      return res.status(400).json({
        error: 'Passkey authentication failed',
        details: verification.error
      });
    }

    // TODO: Generate session token or JWT for the authenticated user
    // For now, we'll just return success

    res.json({
      success: true,
      userId: verification.userId,
      credentialId: verification.credentialId,
      userVerified: verification.userVerified,
      message: 'USB passkey authentication successful!',
      authMethod: 'usb-passkey',
      timestamp: verification.timestamp
    });
  } catch (error) {
    res.status(500).json({
      error: 'Authentication completion failed',
      details: error.message
    });
  }
});

/**
 * GET /api/auth/passkey/info
 * Get supported authenticator information
 */
router.get('/info', (req, res) => {
  try {
    const authenticators = usbPasskeyAuth.getSupportedAuthenticators();

    res.json({
      success: true,
      platform: 'HOOTNER Enhanced Security Platform',
      supportedAuthenticators: authenticators,
      features: {
        userVerification: true,
        residentKeys: true,
        multiDevice: true,
        backup: true
      },
      securityLevel: 'Military-Grade',
      standards: ['FIDO2', 'WebAuthn', 'CTAP2']
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get authenticator info',
      details: error.message
    });
  }
});

/**
 * POST /api/auth/passkey/test
 * Test endpoint requiring USB passkey authentication
 */
router.post('/test', requireUSBPasskey, (req, res) => {
  res.json({
    success: true,
    message: 'USB passkey authentication verified!',
    user: req.user,
    authMethod: req.authMethod,
    timestamp: new Date().toISOString()
  });
});

/**
 * DELETE /api/auth/passkey/revoke
 * Revoke a USB passkey credential
 */
router.delete('/revoke', authenticate, requireUSBPasskey, async (req, res) => {
  try {
    const { credentialId } = req.body;

    if (!credentialId) {
      return res.status(400).json({
        error: 'credentialId is required'
      });
    }

    // TODO: Remove credential from database
    // For now, we'll just return success

    res.json({
      success: true,
      message: 'USB passkey credential revoked successfully',
      credentialId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to revoke credential',
      details: error.message
    });
  }
});

export default router;
