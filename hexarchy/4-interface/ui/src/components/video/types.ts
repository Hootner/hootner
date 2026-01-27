export interface VideoControlsProps {
  isPlaying: boolean
  isMuted: boolean
  isFullscreen: boolean
  currentTime: number
  duration: number
  volume: number
  buffered: number
  playbackRate: number
  onPlayPause: () => void
  onSeek: (time: number) => void
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  onFullscreenToggle: () => void
  onPlaybackRateChange: (rate: number) => void
  className?: string
}

export interface VideoProgressBarProps {
  currentTime: number
  duration: number
  buffered: number
  onSeek: (time: number) => void
  className?: string
}

export interface VideoVolumeControlProps {
  volume: number
  isMuted: boolean
  onVolumeChange: (volume: number) => void
  onMuteToggle: () => void
  className?: string
}

export interface VideoSettingsProps {
  playbackRate: number
  quality: string
  availableQualities: string[]
  onPlaybackRateChange: (rate: number) => void
  onQualityChange: (quality: string) => void
  className?: string
}

export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const
