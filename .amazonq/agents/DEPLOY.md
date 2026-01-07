# Deploy to h00tner.store

## Quick Deploy

```bash
# 1. Build demo app
cd .amazonq/agents
npm install express

# 2. Start server
node demo-app.js

# 3. Configure domain
# Point h00tner.store to your server IP
```

## Production Setup

### 1. Server Configuration (nginx)
```nginx
# /etc/nginx/sites-available/h00tner.store
server {
    listen 80;
    server_name h00tner.store www.h00tner.store;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d h00tner.store -d www.h00tner.store
```

### 3. PM2 Process Manager
```bash
npm install -g pm2
pm2 start demo-app.js --name h00tner
pm2 startup
pm2 save
```

### 4. Environment Variables
```bash
# .env
NODE_ENV=production
PORT=3000
DOMAIN=h00tner.store
```

## Deploy Script

```bash
#!/bin/bash
# deploy.sh

echo "🦉 Deploying to h00tner.store..."

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Restart app
pm2 restart h00tner

# Check status
pm2 status

echo "✅ Deployed to https://h00tner.store"
```

## Site Structure

```
h00tner.store/
├── /                    # Landing page (template showcase)
├── /demo                # Live demo app
├── /docs                # Documentation
├── /api                 # API endpoints
├── /templates           # Browse templates
└── /playground          # Interactive code editor
```

## Landing Page Content

**Hero Section:**
```
🦉 Build Your Own X
113 Minimal Code Templates

From CPU Emulators to Quantum Simulators
All under 150 lines. All working. All free.

[Browse Templates] [Try Demo] [GitHub]
```

**Features:**
- 113 templates across 17 categories
- 12,000 lines of minimal code
- 7 programming languages
- 100% tested and working
- Production-ready patterns

**Categories Grid:**
- Foundational (CPU, Assembler, Linker)
- Languages (Compiler, Interpreter, JIT)
- Operating Systems (Kernel, Scheduler)
- Distributed Systems (Blockchain, CDN)
- Testing (Fuzzer, Chaos Engineering)
- And 12 more...

## Quick Start

```bash
# Clone repo
git clone https://github.com/[user]/build-your-own-x
cd build-your-own-x

# Install
npm install

# Deploy to h00tner.store
./deploy.sh
```

## DNS Configuration

**A Record:**
```
h00tner.store → [Your Server IP]
www.h00tner.store → [Your Server IP]
```

**CNAME (if using Cloudflare/Vercel):**
```
h00tner.store → [deployment-url]
```

## Monitoring

```bash
# Check logs
pm2 logs h00tner

# Monitor performance
pm2 monit

# Restart if needed
pm2 restart h00tner
```

## Backup

```bash
# Backup script
#!/bin/bash
tar -czf backup-$(date +%Y%m%d).tar.gz .amazonq/agents/
aws s3 cp backup-*.tar.gz s3://h00tner-backups/
```

---

**Ready to deploy to h00tner.store!** 🚀
