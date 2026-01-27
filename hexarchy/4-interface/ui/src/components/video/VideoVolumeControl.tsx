import React, { useState } from 'react'
import type { VideoVolumeControlProps } from './types'

const VideoVolumeControl: React.FC<VideoVolumeControlProps> = ({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  className = '',
}) => {
  const [showSlider, setShowSlider] = useState(false)

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
      )
    } else if (volume < 0.5) {
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 11a3 3 0 01-3 3" />
      )
    } else {
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      )
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} onMouseEnter={() => setShowSlider(true)} onMouseLeave={() => setShowSlider(false)}>
      <button onClick={onMuteToggle} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors" aria-label={isMuted ? 'Unmute' : 'Mute'}>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {getVolumeIcon()}
        </svg>
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${showSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
        <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600" aria-label="Volume" />
      </div>
    </div>
  )
}

export default VideoVolumeControl
