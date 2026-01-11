/**
 * Stripe Webhook Routes
 * Express routes for Stripe webhook endpoints
 */

const express = require('express');
const stripeWebhookHandler = require('./stripeWebhookHandler');

const router = express.Router();

/**
 * Stripe webhook endpoint
 * Note: Must use raw body parser for signature verification
 */
router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        await stripeWebhookHandler.handleWebhook(req, res);
    }
);

/**
 * Webhook health check
 */
router.get('/stripe/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'stripe-webhooks',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;
