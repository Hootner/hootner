/**
 * Video Player Hook
 * Custom React hook for video player state management
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { VideoMetadata, VideoPlayerAction, VideoPlayerState } from '../types/videoPlayer';

const initialState: VideoPlayerState = {
    isPlaying: false,
    isMuted: false,
    isFullscreen: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    buffered: 0,
    playbackRate: 1,
    quality: 'auto',
    error: null,
    loading: true,
};

function videoPlayerReducer(state: VideoPlayerState, action: VideoPlayerAction): VideoPlayerState {
    switch (action.type) {
        case 'PLAY':
            return { ...state, isPlaying: true };

        case 'PAUSE':
            return { ...state, isPlaying: false };

        case 'TOGGLE_PLAY':
            return { ...state, isPlaying: !state.isPlaying };

        case 'SEEK':
            return { ...state, currentTime: action.payload };

        case 'SET_VOLUME':
            return { ...state, volume: Math.max(0, Math.min(1, action.payload)), isMuted: false };

        case 'TOGGLE_MUTE':
            return { ...state, isMuted: !state.isMuted };

        case 'TOGGLE_FULLSCREEN':
            return { ...state, isFullscreen: !state.isFullscreen };

        case 'SET_PLAYBACK_RATE':
            return { ...state, playbackRate: action.payload };

        case 'SET_QUALITY':
            return { ...state, quality: action.payload };

        case 'SET_DURATION':
            return { ...state, duration: action.payload, loading: false };

        case 'UPDATE_TIME':
            return { ...state, currentTime: action.payload };

        case 'UPDATE_BUFFERED':
            return { ...state, buffered: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, loading: false };

        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        default:
            return state;
    }
}

export function useVideoPlayer(_video: VideoMetadata, autoPlay = false) {
    const [state, dispatch] = useReducer(videoPlayerReducer, {
        ...initialState,
        isPlaying: autoPlay,
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Play/Pause
    const play = useCallback(async () => {
        if (videoRef.current) {
            try {
                await videoRef.current.play();
                dispatch({ type: 'PLAY' });
            } catch (error) {
                dispatch({ type: 'SET_ERROR', payload: error as Error });
            }
        }
    }, []);

    const pause = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            dispatch({ type: 'PAUSE' });
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (state.isPlaying) {
            pause();
        } else {
            play();
        }
    }, [state.isPlaying, play, pause]);

    // Seek
    const seek = useCallback((time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            dispatch({ type: 'SEEK', payload: time });
        }
    }, []);

    // Volume
    const setVolume = useCallback((volume: number) => {
        if (videoRef.current) {
            videoRef.current.volume = Math.max(0, Math.min(1, volume));
            dispatch({ type: 'SET_VOLUME', payload: volume });
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !state.isMuted;
            dispatch({ type: 'TOGGLE_MUTE' });
        }
    }, [state.isMuted]);

    // Fullscreen
    const toggleFullscreen = useCallback(async () => {
        if (!containerRef.current) return;

        try {
            if (!state.isFullscreen) {
                if (containerRef.current.requestFullscreen) {
                    await containerRef.current.requestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                }
            }
            dispatch({ type: 'TOGGLE_FULLSCREEN' });
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    }, [state.isFullscreen]);

    // Playback rate
    const setPlaybackRate = useCallback((rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            dispatch({ type: 'SET_PLAYBACK_RATE', payload: rate });
        }
    }, []);

    // Event handlers
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            dispatch({ type: 'SET_DURATION', payload: video.duration });
        };

        const handleTimeUpdate = () => {
            dispatch({ type: 'UPDATE_TIME', payload: video.currentTime });
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const buffered = video.buffered.end(video.buffered.length - 1);
                dispatch({ type: 'UPDATE_BUFFERED', payload: buffered });
            }
        };

        const handleError = () => {
            dispatch({ type: 'SET_ERROR', payload: new Error('Video load error') });
        };

        const handleWaiting = () => {
            dispatch({ type: 'SET_LOADING', payload: true });
        };

        const handleCanPlay = () => {
            dispatch({ type: 'SET_LOADING', payload: false });
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('error', handleError);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('error', handleError);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    seek(Math.max(0, state.currentTime - 5));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    seek(Math.min(state.duration, state.currentTime + 5));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(Math.min(1, state.volume + 0.1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(Math.max(0, state.volume - 0.1));
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state, togglePlay, seek, setVolume, toggleMute, toggleFullscreen]);

    return {
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
    };
}
