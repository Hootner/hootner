/**
 * Video Player Usage Example
 * Demo implementation of the VideoPlayer component
 */

import { VideoPlayer } from './components/VideoPlayer';
import type { VideoMetadata } from './types/videoPlayer';

function App() {
  // Example video data
  const sampleVideo: VideoMetadata = {
    id: 'demo-video-1',
    title: 'Sample Video',
    description: 'This is a demonstration of the custom video player',
    url: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    duration: 120, // 2 minutes
    resolution: '1080p',
    format: 'mp4',
    size: 10485760, // 10MB
  };

  // Event handlers
  const handlePlay = () => {
    console.log('Video started playing');
  };

  const handlePause = () => {
    console.log('Video paused');
  };

  const handleEnded = () => {
    console.log('Video ended');
  };

  const handleTimeUpdate = (currentTime: number) => {
    // Update analytics, save progress, etc.
    if (currentTime % 10 === 0) {
      console.log(`Current time: ${currentTime}s`);
    }
  };

  const handleVolumeChange = (volume: number) => {
    console.log(`Volume changed to: ${volume}`);
  };

  const handleFullscreenChange = (isFullscreen: boolean) => {
    console.log(`Fullscreen: ${isFullscreen}`);
  };

  const handleError = (error: Error) => {
    console.error('Video error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Custom Video Player
        </h1>

        {/* Video Player */}
        <VideoPlayer
          video={sampleVideo}
          autoPlay={false}
          loop={false}
          muted={false}
          preload="metadata"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onVolumeChange={handleVolumeChange}
          onFullscreenChange={handleFullscreenChange}
          onError={handleError}
          className="mb-8"
        />

        {/* Features List */}
        <div className="bg-gray-800 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Custom controls with play/pause, seek, volume, and fullscreen</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Interactive progress bar with buffering indicator and hover preview</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Keyboard shortcuts (Space/K: play/pause, ←/→: seek, ↑/↓: volume, M: mute, F: fullscreen)</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Playback speed control (0.25x to 2x)</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Picture-in-Picture support</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Loading and error states with visual feedback</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Responsive design with Tailwind CSS</span>
            </li>
            <li className="flex items-start">
              <svg className="w-6 h-6 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>TypeScript for type safety</span>
            </li>
          </ul>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-gray-800 rounded-lg p-6 text-white mt-6">
          <h2 className="text-2xl font-semibold mb-4">Keyboard Shortcuts</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">Space</kbd> or{' '}
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">K</kbd>
              <span className="ml-2">Play/Pause</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">←</kbd>
              <span className="ml-2">Seek backward 5s</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">→</kbd>
              <span className="ml-2">Seek forward 5s</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">↑</kbd>
              <span className="ml-2">Volume up</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">↓</kbd>
              <span className="ml-2">Volume down</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">M</kbd>
              <span className="ml-2">Mute/Unmute</span>
            </div>
            <div>
              <kbd className="px-2 py-1 bg-gray-700 rounded text-sm">F</kbd>
              <span className="ml-2">Fullscreen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
