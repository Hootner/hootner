# Traefik TLS Setup - Quick Reference

## ✅ What Was Implemented

### 1. Reverse Proxy (Traefik v2.10)
- Automatic HTTPS with Let's Encrypt
- HTTP → HTTPS redirect
- TLS 1.2+ minimum version
- Strong cipher suites only
- Security headers middleware

### 2. TLS Security Features
- **Minimum TLS**: 1.2 (blocks TLS 1.0/1.1)
- **Ciphers**: ECDHE-RSA/ECDSA with AES-GCM and ChaCha20
- **Curves**: P-521, P-384
- **HSTS**: Enabled with preload
- **SNI Strict**: Enabled

### 3. Services Protected
- Main frontend: `https://yourdomain.com`
- Video player: `https://video.yourdomain.com`
- API: `https://api.yourdomain.com`
- Traefik dashboard: `https://traefik.yourdomain.com`

## 🚀 Quick Start

### Step 1: Configure Environment
```bash
cp .env.traefik .env.traefik.local
# Edit .env.traefik.local with your domain and email
```

### Step 2: Generate Dashboard Password
```bash
# Linux/Mac
htpasswd -nb admin your_password

# Windows (use online generator or Docker)
docker run --rm httpd:alpine htpasswd -nb admin your_password
```

### Step 3: Deploy
```bash
# Linux/Mac
chmod +x scripts/deploy-traefik.sh
./scripts/deploy-traefik.sh

# Windows
scripts\deploy-traefik.bat
```

### Step 4: Configure DNS
Point these A records to your server IP:
- `yourdomain.com`
- `video.yourdomain.com`
- `api.yourdomain.com`
- `traefik.yourdomain.com`

## 📋 Files Created

```
traefik/
├── traefik.yml          # Main config
├── acme.json            # Let's Encrypt certs (auto-generated)
└── config/
    └── tls.yml          # TLS settings

docker-compose.traefik.yml  # Docker services
.env.traefik                # Environment template
scripts/
├── deploy-traefik.sh       # Linux/Mac deployment
└── deploy-traefik.bat      # Windows deployment
```

## 🔒 Security Features

### TLS Configuration
- ✅ TLS 1.2+ only
- ✅ Forward secrecy (ECDHE)
- ✅ AEAD ciphers (GCM, ChaCha20-Poly1305)
- ✅ Strong curves (P-521, P-384)
- ✅ SNI strict mode

### HTTP Headers
- ✅ HSTS (1 year, preload)
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy

### Rate Limiting
- 100 requests/minute average
- 50 burst capacity

## 🛠️ Management Commands

```bash
# Start services
docker-compose -f docker-compose.traefik.yml up -d

# View logs
docker-compose -f docker-compose.traefik.yml logs -f traefik

# Stop services
docker-compose -f docker-compose.traefik.yml down

# Restart Traefik
docker-compose -f docker-compose.traefik.yml restart traefik

# Check certificate status
docker exec hootner-traefik cat /acme.json
```

## 🔍 Testing TLS

```bash
# Test SSL configuration
curl -I https://yourdomain.com

# Check TLS version
openssl s_client -connect yourdomain.com:443 -tls1_2

# SSL Labs test
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com
```

## 📊 Expected SSL Labs Grade

With this configuration, you should achieve:
- **Grade**: A or A+
- **Protocol Support**: TLS 1.2, TLS 1.3
- **Cipher Strength**: 256-bit
- **Forward Secrecy**: Yes
- **HSTS**: Yes

## 🐛 Troubleshooting

### Certificate not issued
- Check DNS records are correct
- Verify port 80 is accessible (Let's Encrypt validation)
- Check logs: `docker logs hootner-traefik`

### 502 Bad Gateway
- Ensure backend services are running
- Check service ports match Docker labels
- Verify network connectivity

### Dashboard not accessible
- Check TRAEFIK_AUTH is set correctly
- Verify DNS for traefik.yourdomain.com
- Check Traefik logs for errors

## 🔄 Migration from Old Setup

### Remove old HTTPS servers
The following files are no longer needed:
- `servers/secure-server.js` (replaced by Traefik)
- `ssl/cert.pem` (replaced by Let's Encrypt)
- `ssl/key.pem` (replaced by Let's Encrypt)

### Update application code
Remove HTTPS server creation - all services now run on HTTP internally:
```javascript
// OLD (remove)
const server = https.createServer(options, app);

// NEW (keep)
const server = app.listen(3000);
```

## 📚 Additional Resources

- [Traefik Docs](https://doc.traefik.io/traefik/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Mozilla SSL Config](https://ssl-config.mozilla.org/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
