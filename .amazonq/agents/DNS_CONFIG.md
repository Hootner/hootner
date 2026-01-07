# DNS Configuration for h00tner.store

## Server IP: 198.49.23.145

## DNS Records (Add in your domain registrar)

```
Type    Name    Value           TTL
A       @       198.49.23.145   3600
A       www     198.49.23.145   3600
```

## Quick Deploy

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

## Manual Setup

```bash
# SSH to server
ssh root@198.49.23.145

# Run setup commands from deploy.sh
```

## Verify

```bash
# Check DNS
dig h00tner.store +short
# Should return: 198.49.23.145

# Check site
curl https://h00tner.store
```

## Access

- Landing: https://h00tner.store
- Demo App: https://h00tner.store/demo
- Docs: https://h00tner.store/docs

Done! 🚀
