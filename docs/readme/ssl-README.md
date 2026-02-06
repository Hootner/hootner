# SSL Certificates

## ⚠️ Security Notice

**Private keys and certificates should NEVER be committed to version control.**

This directory contains placeholder files. The actual SSL certificates are generated locally and ignored by `.gitignore`.

## Generate Certificates

### Using npm script (recommended):

```bash
npm run generate:ssl
```

### Manual generation:

```bash
cd apps/frontend/ssl
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout key.pem -out cert.pem -days 365 \
  -subj "/C=US/ST=State/L=City/O=Hootner/CN=localhost"
```

## Files

- `key.pem` - Private key (auto-generated, gitignored)
- `cert.pem` - SSL certificate (auto-generated, gitignored)
- `README.md` - This file (tracked)

## Production

For production environments, use proper SSL certificates from a trusted Certificate Authority (CA) like:

- Let's Encrypt (free)
- AWS Certificate Manager
- Cloudflare SSL

Never use self-signed certificates in production.
