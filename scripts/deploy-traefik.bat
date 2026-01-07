@echo off
echo 🔒 Setting up Traefik Reverse Proxy with Let's Encrypt

if not exist .env.traefik (
  echo ❌ .env.traefik not found. Copy .env.traefik and configure it.
  exit /b 1
)

echo 📋 Starting Traefik deployment...

docker-compose -f docker-compose.traefik.yml up -d

echo.
echo ✅ Traefik deployed successfully!
echo.
echo 🌐 Configure your .env.traefik file with:
echo    - DOMAIN=yourdomain.com
echo    - ACME_EMAIL=admin@yourdomain.com
echo    - TRAEFIK_AUTH (generate with htpasswd)
echo.
echo 📝 DNS records needed:
echo    A    yourdomain.com        -^> YOUR_SERVER_IP
echo    A    video.yourdomain.com  -^> YOUR_SERVER_IP
echo    A    api.yourdomain.com    -^> YOUR_SERVER_IP
echo    A    traefik.yourdomain.com -^> YOUR_SERVER_IP
