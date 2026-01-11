/**
 * Video Player Types
 * TypeScript interfaces for video player components
 */

export interface VideoMetadata {
    id: string;
    title: string;
    description?: string;
    url: string;
    thumbnailUrl?: string;
    duration: number;
    resolution?: string;
    format?: string;
    size?: number;
}

export interface VideoPlayerProps {
    video: VideoMetadata;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
    controls?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    className?: string;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
    onVolumeChange?: (volume: number) => void;
    onFullscreenChange?: (isFullscreen: boolean) => void;
    onError?: (error: Error) => void;
}

export interface VideoControlsProps {
    isPlaying: boolean;
    isMuted: boolean;
    isFullscreen: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    buffered: number;
    playbackRate: number;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
    onVolumeChange: (volume: number) => void;
    onMuteToggle: () => void;
    onFullscreenToggle: () => void;
    onPlaybackRateChange: (rate: number) => void;
    className?: string;
}

export interface VideoProgressBarProps {
    currentTime: number;
    duration: number;
    buffered: number;
    onSeek: (time: number) => void;
    className?: string;
}

export interface VideoVolumeControlProps {
    volume: number;
    isMuted: boolean;
    onVolumeChange: (volume: number) => void;
    onMuteToggle: () => void;
    className?: string;
}

export interface VideoSettingsProps {
    playbackRate: number;
    quality: string;
    availableQualities: string[];
    onPlaybackRateChange: (rate: number) => void;
    onQualityChange: (quality: string) => void;
    className?: string;
}

export interface VideoPlayerState {
    isPlaying: boolean;
    isMuted: boolean;
    isFullscreen: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    buffered: number;
    playbackRate: number;
    quality: string;
    error: Error | null;
    loading: boolean;
}

export type VideoPlayerAction =
    | { type: 'PLAY' }
    | { type: 'PAUSE' }
    | { type: 'TOGGLE_PLAY' }
    | { type: 'SEEK'; payload: number }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'TOGGLE_MUTE' }
    | { type: 'TOGGLE_FULLSCREEN' }
    | { type: 'SET_PLAYBACK_RATE'; payload: number }
    | { type: 'SET_QUALITY'; payload: string }
    | { type: 'SET_DURATION'; payload: number }
    | { type: 'UPDATE_TIME'; payload: number }
    | { type: 'UPDATE_BUFFERED'; payload: number }
    | { type: 'SET_ERROR'; payload: Error }
    | { type: 'SET_LOADING'; payload: boolean };

export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export type PlaybackRate = typeof PLAYBACK_RATES[number];

export const VIDEO_QUALITIES = ['auto', '1080p', '720p', '480p', '360p', '240p'] as const;
export type VideoQuality = typeof VIDEO_QUALITIES[number];
