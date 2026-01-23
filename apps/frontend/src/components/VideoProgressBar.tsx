/**
 * Video Progress Bar Component
 * Interactive progress bar with seek, buffering, and hover preview
 */

import React, { useRef, useState } from 'react'
import type { VideoProgressBarProps } from '../types/videoPlayer'

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  currentTime,
  duration,
  buffered,
  onSeek,
  className = '',
}) => {
  const progressRef = useRef<HTMLDivElement>(null)
  const [isSeeking, setIsSeeking] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const bufferedProgress = duration > 0 ? (buffered / duration) * 100 : 0
  const hoverProgress =
    hoverTime !== null && duration > 0 ? (hoverTime / duration) * 100 : 0

  const handleSeek = (clientX: number) => {
    if (!progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const time = percent * duration
    onSeek(time)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsSeeking(true)
    handleSeek(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const time = percent * duration
    setHoverTime(time)

    if (isSeeking) {
      handleSeek(e.clientX)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isSeeking) {
      setIsSeeking(false)
      handleSeek(e.clientX)
    }
  }

  const handleMouseLeave = () => {
    setHoverTime(null)
    setIsSeeking(false)
  }

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00'

    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className={`relative ${className}`}>
      {/* Time Display */}
      <div className="flex justify-between text-xs text-gray-300 mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Progress Bar Container */}
      <div
        ref={progressRef}
        className="relative h-2 bg-gray-700 rounded-full cursor-pointer group"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Buffered Progress */}
        <div
          className="absolute top-0 left-0 h-full bg-gray-600 rounded-full transition-all duration-300"
          style={{ width: `${bufferedProgress}%` }}
        />

        {/* Current Progress */}
        <div
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />

        {/* Hover Preview */}
        {hoverTime !== null && (
          <>
            <div
              className="absolute top-0 h-full w-0.5 bg-white opacity-50"
              style={{ left: `${hoverProgress}%` }}
            />
            <div
              className="absolute -top-8 transform -translate-x-1/2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded"
              style={{ left: `${hoverProgress}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          </>
        )}

        {/* Seek Handle */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ left: `${progress}%`, marginLeft: '-8px' }}
        />
      </div>
    </div>
  )
}
