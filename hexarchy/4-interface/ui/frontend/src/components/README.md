# React Video Player Components

Modern, feature-rich video player built with React, TypeScript, and Tailwind CSS.

## Features

- ✅ **Custom Controls** - Play/pause, seek, volume, fullscreen
- ✅ **Interactive Progress Bar** - Buffering indicator, hover preview, seek
- ✅ **Keyboard Shortcuts** - Space, arrows, M, F for quick control
- ✅ **Playback Speed** - 0.25x to 2x adjustable speed
- ✅ **Picture-in-Picture** - Modern PiP API support
- ✅ **Loading States** - Spinner animation during buffering
- ✅ **Error Handling** - User-friendly error messages
- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Modern, responsive styling
- ✅ **Accessibility** - ARIA labels, keyboard navigation

## Components

### VideoPlayer.tsx
Main container component that orchestrates all video player functionality.

```tsx
import { VideoPlayer } from './components/VideoPlayer';

const video = {
  id: 'video-1',
  title: 'My Video',
  url: 'https://example.com/video.mp4',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  duration: 120,
};

<VideoPlayer
  video={video}
  autoPlay={false}
  onPlay={() => console.log('Playing')}
  onPause={() => console.log('Paused')}
/>
```

### VideoControls.tsx
Control bar with play/pause, skip, volume, settings, and fullscreen buttons.

### VideoProgressBar.tsx
Interactive progress bar with:
- Current progress indicator
- Buffered content preview
- Hover time preview
- Click/drag to seek

### VideoVolumeControl.tsx
Volume slider with mute toggle and icon states.

### VideoSettings.tsx
Settings panel for playback speed and quality selection.

## Hook: useVideoPlayer

Custom React hook managing video state and interactions.

```tsx
const {
  state,
  videoRef,
  containerRef,
  play,
  pause,
  togglePlay,
  seek,
  setVolume,
  toggleMute,
  toggleFullscreen,
  setPlaybackRate,
} = useVideoPlayer(video, autoPlay);
```

## Types

TypeScript interfaces in `types/videoPlayer.ts`:

- `VideoMetadata` - Video information
- `VideoPlayerProps` - Player component props
- `VideoControlsProps` - Controls component props
- `VideoProgressBarProps` - Progress bar props
- `VideoPlayerState` - Internal state
- `VideoPlayerAction` - Reducer actions

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` or `K` | Play/Pause |
| `←` | Seek backward 5s |
| `→` | Seek forward 5s |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Mute/Unmute |
| `F` | Fullscreen |

## Usage Example

See [App.tsx](./App.tsx) for a complete working example with:
- Video player implementation
- Event handlers
- Features documentation
- Keyboard shortcuts guide

## Styling

Built with Tailwind CSS utilities:
- Dark theme (bg-black, bg-gray-800)
- Smooth transitions
- Hover effects
- Responsive design
- Modern gradients

## State Management

Uses `useReducer` for predictable state updates:

```tsx
type VideoPlayerAction =
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  // ... more actions
```

## Browser Support

- Modern browsers with ES6+ support
- Fullscreen API support
- Picture-in-Picture API (optional)
- HTML5 video element

## Installation

```bash
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
```

## Integration with GraphQL API

The video player integrates with the GraphQL API for:
- Video metadata fetching
- Progress tracking
- Analytics events
- User preferences

```tsx
import { useQuery } from '@apollo/client';
import { GET_VIDEO } from './graphql/queries';

const { data } = useQuery(GET_VIDEO, { variables: { id: videoId } });

<VideoPlayer
  video={data.video}
  onTimeUpdate={(time) => {
    // Track progress
    updateVideoProgress({ videoId, currentTime: time });
  }}
/>
```

## Files Created

1. `types/videoPlayer.ts` - TypeScript interfaces (120 lines)
2. `hooks/useVideoPlayer.ts` - Custom hook (250 lines)
3. `components/VideoPlayer.tsx` - Main component (180 lines)
4. `components/VideoProgressBar.tsx` - Progress bar (120 lines)
5. `components/VideoControls.tsx` - Control buttons (150 lines)
6. `components/VideoVolumeControl.tsx` - Volume slider (80 lines)
7. `components/VideoSettings.tsx` - Settings panel (70 lines)
8. `App.tsx` - Usage example (140 lines)

**Total: 1,110 lines of production-ready TypeScript + React code**

## Next Steps

1. Add subtitle/caption support
2. Implement quality switching
3. Add thumbnail preview on hover
4. Integrate with video analytics
5. Add playback rate persistence
6. Implement gesture controls for mobile
7. Add video playlist support

## Algorithm Marketplace

The `AlgorithmMarketplace` component provides a simple UI to execute server-provided algorithms.

- Endpoints: `/api/algorithms` and `/api/algorithms/:id/execute`
- Add component to the app: see [App.tsx](../App.tsx)
- Inputs: JSON payload parsed in the textarea
- Output: Execution result or error rendered as JSON

### Tier Limits & Usage Tracking

- Tiers: Free (10/day), Pro (1000/month), Enterprise (unlimited)
- Server persists usage in `data/usage/algorithm-usage.json`
- Usage endpoint: `/api/algorithms/usage?user_id=YOUR_ID`

### Stripe Metered Usage (Optional)

- Set `STRIPE_API_KEY` and pass `subscription_item_id` in request body to record usage
- Uses Stripe Usage Records API to increment quantity

Quick try:

```bash
cd hexarchy/4-interface/ui/frontend
npm install
npm run dev
```

Make sure the frontend server is running to serve the API endpoints:

```bash
node scripts/servers/frontend-server.js
```
