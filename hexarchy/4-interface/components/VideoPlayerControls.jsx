// Video Player Controls Component
import React from 'react';
import { formatDuration } from '../utils/formatters.js';

export const VideoPlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onPlaybackRateChange
}) => {
  const progress = (currentTime / duration) * 100 || 0;

  return (
    <div className="video-controls">
      <div className="progress-bar" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        onSeek(pos * duration);
      }}>
        <div className="progress-filled" style={{ width: `${progress}%` }} />
      </div>

      <div className="controls-row">
        <div className="left-controls">
          <button className="control-button" onClick={onTogglePlay}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className="volume-control">
            <button className="control-button" onClick={onToggleMute}>
              {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>

          <span className="time">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>

        <div className="right-controls">
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
            className="playback-rate"
          >
            <option value="0.25">0.25x</option>
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>

          <button className="control-button" onClick={onToggleFullscreen}>
            ⛶
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerControls;
