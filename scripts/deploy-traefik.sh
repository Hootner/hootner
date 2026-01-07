#!/bin/bash

echo "🔒 Setting up Traefik Reverse Proxy with Let's Encrypt"

# Check if .env.traefik exists
if [ ! -f .env.traefik ]; then
  echo "❌ .env.traefik not found. Copy .env.traefik and configure it."
  exit 1
fi

# Set acme.json permissions (Linux/Mac only)
if [ -f traefik/acme.json ]; then
  chmod 600 traefik/acme.json
  echo "✅ Set acme.json permissions"
fi

# Load environment variables
export $(cat .env.traefik | grep -v '^#' | xargs)

# Validate required variables
if [ -z "$DOMAIN" ] || [ -z "$ACME_EMAIL" ]; then
  echo "❌ DOMAIN and ACME_EMAIL must be set in .env.traefik"
  exit 1
fi

echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email: $ACME_EMAIL"

# Start Traefik
docker-compose -f docker-compose.traefik.yml up -d

echo ""
echo "✅ Traefik deployed successfully!"
echo ""
echo "🌐 Access points:"
echo "   Main site: https://$DOMAIN"
echo "   Video player: https://video.$DOMAIN"
echo "   API: https://api.$DOMAIN"
echo "   Traefik dashboard: https://traefik.$DOMAIN"
echo ""
echo "📝 Make sure DNS records point to this server:"
echo "   A    $DOMAIN           -> YOUR_SERVER_IP"
echo "   A    video.$DOMAIN     -> YOUR_SERVER_IP"
echo "   A    api.$DOMAIN       -> YOUR_SERVER_IP"
echo "   A    traefik.$DOMAIN   -> YOUR_SERVER_IP"
