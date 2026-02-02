#!/usr/bin/env node

/**
 * Simple Website Server for Stripe Activation
 * Hosts your business website so Stripe can verify it
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Main website route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'stripe-activation-website.html'));
});

// Business info for Stripe verification
app.get('/about', (req, res) => {
  res.json({
    business: 'HOOTNER',
    description: 'AI Revenue Optimization Platform',
    services: [
      'AI Price Optimization',
      'Dynamic Pricing Engine', 
      'Revenue Forecasting',
      'Conversion Optimization'
    ],
    contact: 'hello@hootner.com',
    established: '2025',
    location: 'United States'
  });
});

// Terms of service
app.get('/terms', (req, res) => {
  res.send(`
    <h1>Terms of Service - HOOTNER</h1>
    <p>AI Revenue Optimization Platform</p>
    <p>Pay-per-use pricing for AI algorithms</p>
    <p>Contact: hello@hootner.com</p>
  `);
});

// Privacy policy
app.get('/privacy', (req, res) => {
  res.send(`
    <h1>Privacy Policy - HOOTNER</h1>
    <p>We protect your data and only use it for revenue optimization services.</p>
    <p>Contact: hello@hootner.com</p>
  `);
});

app.listen(PORT, () => {
  console.log('🦉 HOOTNER Website Server Started');
  console.log('================================');
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log('📧 Contact: hello@hootner.com');
  console.log('💼 Business: AI Revenue Optimization Platform');
  console.log('');
  console.log('📋 For Stripe Activation:');
  console.log(`1. Use this URL: http://localhost:${PORT}`);
  console.log('2. Or deploy to free hosting (Vercel, Netlify)');
  console.log('3. Submit to Stripe for account verification');
  console.log('');
  console.log('🚀 Ready for Stripe account activation!');
});

export default app;