import React from 'react'
import { Voice } from '../types'

interface VoiceSelectorProps {
  voices: Voice[]
  selectedVoice: string
  onVoiceChange: (voiceTag: string) => void
  onRefreshVoices: () => void
  isLoading: boolean
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoice,
  onVoiceChange,
  onRefreshVoices,
  isLoading,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
        <span className="text-lg mr-2">⚙️</span>
        语音设置
      </h3>
      
      <div className="flex gap-3 items-center">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          选择声音:
        </label>
        
        <select
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          disabled={isLoading || voices.length === 0}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
        >
          {voices.map((voice) => (
            <option key={voice.tag} value={voice.tag}>
              {voice.tag} - {voice.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={onRefreshVoices}
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          title="Refresh voice list"
        >
          {isLoading ? '⏳' : '🔄'} Refresh
        </button>
      </div>
      
      {voices.length === 0 && !isLoading && (
        <p className="text-xs text-gray-500 mt-2">No voices available. Please refresh.</p>
      )}
    </div>
  )
}
