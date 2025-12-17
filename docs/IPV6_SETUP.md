# IPv6 Configuration

## Network Details
- **IPv6 Address**: `2600:380:6679:cb4b:f6bc:ca65:7458:2f43`
- **Link-local IPv6**: `fe80::348:7b28:ee6e:12b9%10`
- **IPv6 DNS**: `2600:380:6679:cb4b::95`
- **IPv4 Address**: `10.156.90.185`

## Enabled Services

### Node.js Servers (Dual-Stack)
All servers now listen on `::` (IPv6 wildcard) which accepts both IPv4 and IPv6:

- **Main Server** (`server.js`): `http://[::1]:PORT` or `http://localhost:PORT`
- **Video Player** (`video-player-server.js`): `http://[::1]:3000`
- **Secure Server** (`secure-server.js`): `https://[::1]:3443`

### Docker Networks
Docker Compose configured with dual-stack networking:
- **Backend**: `172.20.0.0/16` (IPv4) + `fd00::/64` (IPv6)
- **Frontend**: `172.21.0.0/16` (IPv4) + `fd01::/64` (IPv6)

### Nginx
Configured to listen on both IPv4 and IPv6:
```nginx
listen 80;
listen [::]:80;
```

## Testing

```bash
# Test IPv6 connectivity
curl -6 http://[::1]:3000/health

# Test IPv4 (still works)
curl -4 http://localhost:3000/health

# Docker IPv6
docker network inspect hootner_backend
```

## Access URLs

### Local Development
- IPv4: `http://localhost:3000`
- IPv6: `http://[::1]:3000`

### External Access
- IPv6: `http://[2600:380:6679:cb4b:f6bc:ca65:7458:2f43]:3000`
