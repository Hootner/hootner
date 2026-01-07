#!/usr/bin/env node
const http = require('http');

const component = process.argv[2] || 'all';

const endpoints = { frontend: 'http://localhost:3000/health',
  backend: 'http://localhost:4000/health',
  database: 'http://localhost:27017',
  all: ['frontend', 'backend', 'database'] };

const check = (url) => new Promise((resolve) => { http.get(url, (res) => resolve(res.statusCode === 200))
    .on('error', () => resolve(false)); });

(async () => { const targets = component === 'all' ? endpoints.all : [component];

  for (const target of targets) { const url = endpoints[target];
    const status = await check(url); } })();
