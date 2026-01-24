// Video Player Component
import React, { useRef, useState, useEffect } from 'react';
import { VideoPlayerControls } from './VideoPlayerControls.jsx';

export const VideoPlayer = ({ video, onProgress, onEnded, onPlay, onPause }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
      onProgress?.(videoElement.currentTime, videoElement.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onEnded]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (isPlaying) {
      videoElement.pause();
      onPause?.();
    } else {
      videoElement.play();
      onPlay?.();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time) => {
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume) => {
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current.parentElement;
    if (!isFullscreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handlePlaybackRateChange = (rate) => {
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  };

  return (
    <div className={`video-player ${isFullscreen ? 'fullscreen' : ''}`}>
      <video
        ref={videoRef}
        src={video.url}
        poster={video.thumbnailUrl}
        onClick={togglePlay}
      />

      <VideoPlayerControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        playbackRate={playbackRate}
        onTogglePlay={togglePlay}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onPlaybackRateChange={handlePlaybackRateChange}
      />
    </div>
  );
};

export default VideoPlayer;
