/**
 * Video Player Component
 * Modern video player with custom controls, TypeScript, and Tailwind CSS
 */

import React from "react";
import { useVideoPlayer } from "../hooks/useVideoPlayer";
import type { VideoPlayerProps } from "../types/videoPlayer";
import { VideoControls } from "./VideoControls";
import { VideoProgressBar } from "./VideoProgressBar";

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  autoPlay = false,
  loop = false,
  muted = false,
  preload = "metadata",
  className = "",
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onVolumeChange,
  onFullscreenChange,
  onError,
}) => {
  const {
    state,
    videoRef,
    containerRef,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    setPlaybackRate,
  } = useVideoPlayer(video, autoPlay);

  // Callbacks
  React.useEffect(() => {
    if (state.isPlaying) {
      onPlay?.();
    } else {
      onPause?.();
    }
  }, [state.isPlaying, onPlay, onPause]);

  React.useEffect(() => {
    onTimeUpdate?.(state.currentTime);
  }, [state.currentTime, onTimeUpdate]);

  React.useEffect(() => {
    onVolumeChange?.(state.volume);
  }, [state.volume, onVolumeChange]);

  React.useEffect(() => {
    onFullscreenChange?.(state.isFullscreen);
  }, [state.isFullscreen, onFullscreenChange]);

  React.useEffect(() => {
    if (state.error) {
      onError?.(state.error);
    }
  }, [state.error, onError]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-black rounded-lg overflow-hidden shadow-2xl group ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.url}
        poster={video.thumbnailUrl}
        loop={loop}
        muted={muted}
        preload={preload}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {state.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error Message */}
      {state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center text-white p-6">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xl font-semibold mb-2">Error Loading Video</p>
            <p className="text-gray-400">{state.error.message}</p>
          </div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {!state.isPlaying && !state.loading && !state.error && (
          <button
            onClick={togglePlay}
            aria-label={state.isPlaying ? "Pause video" : "Play video"}
            className="pointer-events-auto w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform"
          >
            <svg
              className="w-10 h-10 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>

      {/* Video Info Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <h3 className="text-white text-lg font-semibold truncate">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-gray-300 text-sm mt-1 truncate">
            {video.description}
          </p>
        )}
      </div>

      {/* Controls Container */}
      <div className="absolute bottom-0 left-0 right-0 video-controls-container opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Progress Bar */}
        <VideoProgressBar
          currentTime={state.currentTime}
          duration={state.duration}
          buffered={state.buffered}
          onSeek={seek}
          className="px-4 pt-4"
        />

        {/* Controls */}
        <VideoControls
          isPlaying={state.isPlaying}
          isMuted={state.isMuted}
          isFullscreen={state.isFullscreen}
          currentTime={state.currentTime}
          duration={state.duration}
          volume={state.volume}
          buffered={state.buffered}
          playbackRate={state.playbackRate}
          onPlayPause={togglePlay}
          onSeek={seek}
          onVolumeChange={setVolume}
          onMuteToggle={toggleMute}
          onFullscreenToggle={toggleFullscreen}
          onPlaybackRateChange={setPlaybackRate}
          className="px-4 pb-4"
        />
      </div>
    </div>
  );
};
