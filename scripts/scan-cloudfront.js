#!/usr/bin/env node

/**
 * CloudFront URL Scanner
 * Analyzes what's deployed and running on the live platform
 */

import https from 'https';
import http from 'http';

const CLOUDFRONT_URL = 'https://daxqx65ar35pp.cloudfront.net';

const endpoints = [
  '/pages/dashboard.html',
  '/pages/cinema-player.html',
  '/pages/index.html',
  '/api/health',
  '/api/graphql',
  '/assets/css/main.css',
  '/assets/js/main.js',
];

function checkEndpoint(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          size: data.length,
          contentType: res.headers['content-type'],
        });
      });
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });
  });
}

async function scanPlatform() {
  console.log('\n🔍 Scanning CloudFront Platform...\n');
  console.log(`Base URL: ${CLOUDFRONT_URL}\n`);

  const results = await Promise.all(
    endpoints.map(path => checkEndpoint(`${CLOUDFRONT_URL}${path}`))
  );

  console.log('📊 Scan Results:\n');
  results.forEach(r => {
    const status = r.status === 200 ? '✅' : r.status === 'ERROR' ? '❌' : '⚠️';
    console.log(`${status} ${r.url}`);
    console.log(`   Status: ${r.status}`);
    if (r.contentType) console.log(`   Type: ${r.contentType}`);
    if (r.size) console.log(`   Size: ${(r.size / 1024).toFixed(2)} KB`);
    if (r.error) console.log(`   Error: ${r.error}`);
    console.log('');
  });
}

scanPlatform();
