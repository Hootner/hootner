import React from 'react'
import type { VideoSettingsProps } from './types'
import { PLAYBACK_RATES } from './types'

const VideoSettings: React.FC<VideoSettingsProps> = ({
  playbackRate,
  quality,
  availableQualities,
  onPlaybackRateChange,
  onQualityChange,
  className = '',
}) => {
  return (
    <div className={`bg-black bg-opacity-95 rounded-lg shadow-2xl p-4 min-w-[200px] ${className}`}>
      <div className="mb-4">
        <h4 className="text-white text-sm font-semibold mb-2">Playback Speed</h4>
        <div className="space-y-1">
          {PLAYBACK_RATES.map((rate) => (
            <button
              key={rate}
              onClick={() => onPlaybackRateChange(rate)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                playbackRate === rate ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {rate === 1 ? 'Normal' : `${rate}x`}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-white text-sm font-semibold mb-2">Quality</h4>
        <div className="space-y-1">
          {availableQualities.map((q) => (
            <button
              key={q}
              onClick={() => onQualityChange(q)}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                quality === q ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {q === 'auto' ? 'Auto' : q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VideoSettings
