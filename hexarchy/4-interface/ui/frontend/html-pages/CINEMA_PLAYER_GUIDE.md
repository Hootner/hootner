# Enhanced Cinema Player

## 🎬 Overview

The **HOOTNER Cinema Player** is a professional-grade HTML5 video player designed for **8K UHD HDR10** video with **Dolby Atmos 7.1.4** audio and support for **long-form content up to 4 hours**.

**Location**: `apps/frontend/html-pages/cinema-player.html`

---

## ✨ Features

### Video Capabilities
✅ **8K UHD Support** - Native 7680×4320 resolution playback
✅ **HDR10 Display** - 10-bit color depth with Rec.2020 color space
✅ **4-Hour Videos** - Optimized for feature-length content
✅ **Adaptive Quality** - Switch between 8K/4K/HD/SD on-the-fly
✅ **Smooth Playback** - Hardware-accelerated decoding

### Audio Features
✅ **Dolby Atmos 7.1.4** - Immersive spatial audio
✅ **Audio Visualization** - Real-time 12-channel audio bars
✅ **Volume Control** - Precise volume adjustment
✅ **Mute/Unmute** - Quick audio toggle

### Player Controls
✅ **Custom UI** - Cinema-grade interface
✅ **Progress Scrubbing** - Precise timeline navigation
✅ **Playback Speed** - 0.25x to 2x speed control
✅ **Fullscreen Mode** - Immersive viewing experience
✅ **Keyboard Shortcuts** - Professional shortcuts support
✅ **Buffer Indicator** - Real-time buffering status

### Advanced Features
✅ **Info Panel** - Detailed video/audio metadata
✅ **Quality Badges** - 8K/HDR10/Atmos indicators
✅ **Time Display** - HH:MM:SS format for long videos
✅ **Hover Tooltips** - Interactive timeline tooltips
✅ **Auto-Hide UI** - Clean viewing experience
✅ **Mobile Responsive** - Touch-friendly controls

---

## 🚀 Quick Start

### Basic Usage

1. **Open the player**:
   ```bash
   # Start a simple server
   cd apps/frontend/html-pages
   python -m http.server 8000
   ```

2. **Access in browser**:
   ```
   http://localhost:8000/cinema-player.html
   ```

3. **Load your video**:
   - Edit the `<source>` tag in the HTML
   - Or use JavaScript to load dynamically

### Load Custom Video

```html
<video id="cinema-video" preload="metadata">
    <source src="your-8k-hdr-video.mp4" type="video/mp4">
</video>
```

### Dynamic Loading

```javascript
const video = document.getElementById('cinema-video');
video.src = 'path/to/your/video.mp4';
video.load();
```

---

## ⌨️ Keyboard Shortcuts

### Playback Controls

| Key | Action |
|-----|--------|
| **Space** | Play/Pause |
| **→** | Skip forward 10 seconds |
| **←** | Skip backward 10 seconds |
| **Shift + →** | Skip forward 1 minute |
| **Shift + ←** | Skip backward 1 minute |

### Volume Controls

| Key | Action |
|-----|--------|
| **↑** | Increase volume |
| **↓** | Decrease volume |
| **M** | Mute/Unmute |

### Display Controls

| Key | Action |
|-----|--------|
| **F** | Toggle fullscreen |
| **I** | Toggle info panel |
| **?** | Show keyboard shortcuts |

### Speed Controls

| Key | Action |
|-----|--------|
| **>** | Increase speed (+0.25x) |
| **<** | Decrease speed (-0.25x) |
| **1** | Reset to normal speed (1x) |

---

## 🎨 UI Components

### Header Badges

Shows video specifications:
- **8K UHD** - Resolution indicator
- **HDR10** - Color depth indicator
- **Dolby Atmos 7.1.4** - Audio format
- **Duration** - Total video length

### Progress Bar

- **Blue gradient** - Current playback position
- **Gray fill** - Buffered content
- **White markers** - Chapter markers (if defined)
- **Tooltip** - Shows time on hover

### Control Buttons

- **Play/Pause** - Toggle playback
- **Skip ±10s** - Quick navigation
- **Volume** - Audio control with slider
- **Speed** - Playback rate (0.25x - 2x)
- **Quality** - Resolution selector (8K/4K/HD/SD)
- **Fullscreen** - Expand to full screen
- **Keyboard** - Show shortcuts

### Info Panel

Technical details:
- Resolution (e.g., 7680×4320)
- Frame rate (e.g., 24 fps)
- Codec (HEVC/H.265)
- Color depth (10-bit HDR10)
- Color space (Rec.2020)
- Audio format (Dolby Atmos 7.1.4)
- Bitrate (e.g., 50 Mbps)
- Buffer status (%)

### Audio Visualizer

Real-time 12-channel visualization representing Dolby Atmos 7.1.4 audio:
- 7 bed channels (L, R, C, Ls, Rs, Lrs, Rrs)
- 1 LFE (subwoofer)
- 4 height channels (Ltm, Rtm, Ltf, Rtf)

---

## 🔧 Configuration

### Supported Video Formats

| Format | Codec | Resolution | HDR | Audio |
|--------|-------|------------|-----|-------|
| MP4 | HEVC (H.265) | Up to 8K | ✅ HDR10 | ✅ Dolby Atmos |
| MP4 | AVC (H.264) | Up to 4K | ❌ SDR | ✅ AAC/AC3 |
| WEBM | VP9 | Up to 4K | ✅ HDR10 | ✅ Opus |

### Quality Profiles

Built-in quality presets:

```javascript
const qualities = {
    '8k': {
        resolution: '7680×4320',
        bitrate: '150 Mbps',
        label: '8K UHD'
    },
    '4k': {
        resolution: '3840×2160',
        bitrate: '50 Mbps',
        label: '4K UHD'
    },
    'hd': {
        resolution: '1920×1080',
        bitrate: '8 Mbps',
        label: 'Full HD'
    },
    'sd': {
        resolution: '1280×720',
        bitrate: '4 Mbps',
        label: 'HD'
    }
};
```

### Browser Requirements

**Minimum Requirements**:
- Chrome 90+, Edge 90+, Safari 14+
- Hardware video decoding support
- WebAudio API for visualizer

**Optimal Experience**:
- Chrome 100+ or Edge 100+ (best HDR support)
- Discrete GPU for 8K playback
- HDR-capable display
- Dolby Atmos-compatible audio system

---

## 🎯 Advanced Usage

### Custom Themes

Modify CSS variables for custom branding:

```css
:root {
    --primary-color: #00ffff;
    --secondary-color: #00ff00;
    --background: linear-gradient(135deg, #0a0a0f, #1a1a2e);
}
```

### Add Chapter Markers

```javascript
const chapters = [
    { time: 0, label: 'Introduction' },
    { time: 300, label: 'Act 1' },
    { time: 1800, label: 'Act 2' },
    { time: 3600, label: 'Act 3' },
    { time: 7200, label: 'Finale' }
];

// Add markers to progress bar
chapters.forEach(chapter => {
    const marker = document.createElement('div');
    marker.className = 'chapter-marker';
    marker.style.left = (chapter.time / video.duration * 100) + '%';
    document.getElementById('chapterMarkers').appendChild(marker);
});
```

### Integrate with Backend API

```javascript
// Fetch video metadata from server
fetch('/api/video/metadata/12345')
    .then(res => res.json())
    .then(data => {
        document.getElementById('infoResolution').textContent = data.resolution;
        document.getElementById('infoFPS').textContent = data.fps + ' fps';
        document.getElementById('infoBitrate').textContent = data.bitrate;
    });
```

### Analytics Tracking

```javascript
// Track playback events
video.addEventListener('play', () => {
    analytics.track('video_play', {
        video_id: '12345',
        quality: currentQuality,
        timestamp: video.currentTime
    });
});

video.addEventListener('ended', () => {
    analytics.track('video_complete', {
        video_id: '12345',
        watch_time: video.duration
    });
});
```

---

## 📊 Performance Optimization

### Preload Strategies

```html
<!-- Metadata only (fastest initial load) -->
<video preload="metadata">

<!-- Auto (load some data) -->
<video preload="auto">

<!-- None (load on demand) -->
<video preload="none">
```

### Adaptive Bitrate Streaming

For best experience with 4-hour videos, use HLS or DASH:

```html
<video id="cinema-video">
    <source src="video.m3u8" type="application/x-mpegURL">
    <source src="video.mpd" type="application/dash+xml">
</video>
```

### Hardware Acceleration

Ensure GPU acceleration is enabled:

```javascript
// Check hardware acceleration support
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
if (gl) {
    console.log('✅ Hardware acceleration available');
}
```

---

## 🐛 Troubleshooting

### Video Not Playing

**Issue**: Black screen or error message

**Solutions**:
1. Check video codec: Must be HEVC (H.265) for 8K HDR
2. Verify browser supports HDR10
3. Enable hardware acceleration in browser settings
4. Check file permissions and CORS headers

### Audio Not Working

**Issue**: No sound or visualizer not showing

**Solutions**:
1. Check audio codec: Must be EAC3 for Dolby Atmos
2. Enable autoplay policy in browser
3. Click on player to activate audio context
4. Check system audio device settings

### Buffering/Stuttering

**Issue**: Playback stutters or buffers frequently

**Solutions**:
1. Lower quality from 8K to 4K or HD
2. Ensure sufficient bandwidth (150+ Mbps for 8K)
3. Use local files instead of streaming
4. Close other tabs/applications
5. Check GPU temperature and utilization

### HDR Not Displaying

**Issue**: HDR content appears washed out

**Solutions**:
1. Ensure display supports HDR10
2. Enable HDR in OS display settings (Windows: Settings > Display > HDR)
3. Use Edge or Chrome (best HDR support)
4. Check video metadata has HDR10 flag

---

## 📱 Mobile Support

The player is fully responsive with touch controls:

- **Tap to play/pause**
- **Swipe left/right** to skip ±10s
- **Swipe up/down** for volume
- **Pinch to zoom** (in fullscreen)
- **Double-tap** for fullscreen

Mobile-specific optimizations:
- Simplified UI for small screens
- Battery-efficient playback
- Adaptive quality based on connection
- Touch-friendly button sizes

---

## 🔐 Security Features

### Content Security Policy (CSP)

Built-in CSP headers:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               media-src 'self' https:;
               script-src 'self' 'unsafe-inline';">
```

### DRM Support (Future)

Ready for Widevine/PlayReady integration:
```javascript
// DRM configuration (example)
video.addEventListener('encrypted', (e) => {
    // Handle DRM initialization
});
```

---

## 🎓 Integration Examples

### Example 1: Simple Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Video</title>
</head>
<body>
    <iframe src="cinema-player.html?video=my-video.mp4"
            width="100%"
            height="100%"
            frameborder="0">
    </iframe>
</body>
</html>
```

### Example 2: React Component

```jsx
import React, { useEffect, useRef } from 'react';

function CinemaPlayer({ videoUrl }) {
    const iframeRef = useRef(null);

    useEffect(() => {
        // Load player
        iframeRef.current.src = `cinema-player.html?video=${videoUrl}`;
    }, [videoUrl]);

    return (
        <iframe
            ref={iframeRef}
            style={{ width: '100%', height: '100vh' }}
            frameBorder="0"
        />
    );
}
```

### Example 3: Playlist Support

```javascript
const playlist = [
    'video1.mp4',
    'video2.mp4',
    'video3.mp4'
];

let currentIndex = 0;

video.addEventListener('ended', () => {
    currentIndex = (currentIndex + 1) % playlist.length;
    video.src = playlist[currentIndex];
    video.play();
});
```

---

## 📚 API Reference

### Video Element Methods

```javascript
// Playback control
video.play()
video.pause()
video.load()

// Seeking
video.currentTime = 100  // Jump to 100 seconds
video.currentTime += 10  // Skip forward 10 seconds

// Properties
video.duration  // Total length in seconds
video.volume    // 0.0 to 1.0
video.playbackRate  // Speed (0.25 to 2.0)
video.muted     // boolean

// Events
video.addEventListener('play', handler)
video.addEventListener('pause', handler)
video.addEventListener('timeupdate', handler)
video.addEventListener('ended', handler)
video.addEventListener('loadedmetadata', handler)
```

### Custom Functions

```javascript
// Defined in cinema-player.html

togglePlayPause()     // Play/pause video
skipTime(seconds)     // Skip forward/backward
toggleMute()          // Mute/unmute audio
setVolume(event)      // Set volume from click
setSpeed(speed)       // Change playback speed
setQuality(quality)   // Switch resolution
toggleFullscreen()    // Enter/exit fullscreen
toggleInfo()          // Show/hide info panel
toggleShortcuts()     // Show/hide shortcuts
```

---

## ✅ Browser Compatibility

| Browser | 8K | HDR10 | Dolby Atmos | Score |
|---------|-------|-------|-------------|-------|
| Chrome 100+ | ✅ | ✅ | ✅ | 10/10 |
| Edge 100+ | ✅ | ✅ | ✅ | 10/10 |
| Safari 15+ | ⚠️ Limited | ✅ | ⚠️ Limited | 7/10 |
| Firefox 100+ | ⚠️ Limited | ⚠️ Limited | ❌ | 5/10 |

**Recommended**: Chrome or Edge for best experience

---

## 📝 License

Part of the HOOTNER platform. See main LICENSE file.

---

## 🎉 Summary

The **HOOTNER Cinema Player** provides a professional video playback experience with:

✅ **8K UHD HDR10** support
✅ **Dolby Atmos 7.1.4** spatial audio
✅ **4-hour video** support
✅ **Cinema-grade UI** with custom controls
✅ **Keyboard shortcuts** for power users
✅ **Mobile responsive** design
✅ **Real-time audio visualization**
✅ **Adaptive quality** switching
✅ **Professional info panel**

Perfect for streaming feature films, documentaries, concerts, and any long-form cinema-grade content! 🎬✨

---

**Created**: January 11, 2026
**Version**: 1.0 - Cinema Grade Player
**Location**: `apps/frontend/html-pages/cinema-player.html`
