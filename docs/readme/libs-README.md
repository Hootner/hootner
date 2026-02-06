# Local Libraries

To fix the CWE-94 security vulnerabilities, download these libraries locally:

## Required Files:

1. **video.js** (v8.6.1)
   - Download from: https://github.com/videojs/video.js/releases/tag/v8.6.1
   - Save as: `video.min.js`
   - CSS: `video-js.css`

2. **PeerJS** (v1.5.4)
   - Download from: https://github.com/peers/peerjs/releases/tag/v1.5.4
   - Save as: `peerjs.min.js`

## Quick Download Commands:

```bash
# Video.js
curl -o video.min.js https://vjs.zencdn.net/8.6.1/video.min.js
curl -o video-js.css https://vjs.zencdn.net/8.6.1/video-js.css

# PeerJS
curl -o peerjs.min.js https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js
```

## Security Benefits:

- Eliminates supply chain attack risks from external CDNs
- No dependency on third-party infrastructure
- Full control over library versions and integrity
