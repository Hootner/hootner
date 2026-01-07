#!/bin/bash
# Deploy to h00tner.store (198.49.23.145)

SERVER_IP="198.49.23.145"
DOMAIN="h00tner.store"

echo "🦉 Deploying to $DOMAIN ($SERVER_IP)"

# SSH and setup
ssh root@$SERVER_IP << 'EOF'
# Install dependencies
apt update
apt install -y nginx certbot python3-certbot-nginx nodejs npm

# Install PM2
npm install -g pm2

# Create directory
mkdir -p /var/www/h00tner.store

# Setup nginx
cat > /etc/nginx/sites-available/h00tner.store << 'NGINX'
server {
    listen 80;
    server_name h00tner.store www.h00tner.store;
    root /var/www/h00tner.store;
    index index.html;
    
    location /demo {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/h00tner.store /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL
certbot --nginx -d h00tner.store -d www.h00tner.store --non-interactive --agree-tos -m admin@h00tner.store

echo "✅ Server configured"
EOF

# Upload files
scp index.html root@$SERVER_IP:/var/www/h00tner.store/
scp -r .amazonq/agents root@$SERVER_IP:/root/

# Start app
ssh root@$SERVER_IP << 'EOF'
cd /root/agents
npm install express
pm2 start demo-app.js --name h00tner
pm2 startup
pm2 save
EOF

echo "✅ Deployed to https://$DOMAIN"
