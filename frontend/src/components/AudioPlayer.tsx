import React from 'react'
import { PlaybackState } from '../types'

interface AudioPlayerProps {
  playbackState: PlaybackState
  audioSize: number
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onDownload: () => void
  isLoading: boolean
}

const getStatusInfo = (state: PlaybackState) => {
  switch (state) {
    case 'playing':
      return { icon: '▶️', text: '播放中', color: '#4CAF50', dotColor: '#4CAF50' }
    case 'paused':
      return { icon: '⏸️', text: '已暂停', color: '#FF9800', dotColor: '#FF9800' }
    case 'loading':
      return { icon: '⏳', text: '生成中...', color: '#FF9800', dotColor: '#FF9800' }
    case 'error':
      return { icon: '❌', text: '失败', color: '#F44336', dotColor: '#F44336' }
    default:
      return { icon: '⏹️', text: '未播放', color: '#666666', dotColor: '#999999' }
  }
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  playbackState,
  audioSize,
  onPlay,
  onPause,
  onStop,
  onDownload,
  isLoading,
}) => {
  const statusInfo = getStatusInfo(playbackState)
  const isPlaybackActive = playbackState === 'playing' || playbackState === 'paused'

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onPlay}
            disabled={isLoading || playbackState === 'loading'}
            className="px-6 py-2 bg-warning text-white font-semibold rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            ▶️ 生成并播放
          </button>
          
          <button
            onClick={onDownload}
            disabled={isLoading || playbackState === 'loading'}
            className="px-6 py-2 bg-success text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            💾 生成并保存
          </button>
          
          {isPlaybackActive && (
            <>
              <button
                onClick={onPause}
                className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {playbackState === 'playing' ? '⏸️ 暂停' : '▶️ 继续'}
              </button>
              
              <button
                onClick={onStop}
                className="px-4 py-2 bg-danger text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 transition-colors duration-200"
              >
                ⏹️ 停止
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg">{statusInfo.icon}</span>
            <span className="font-medium text-gray-800">{statusInfo.text}</span>
            {audioSize > 0 && (
              <span className="text-xs text-gray-600">
                ({(audioSize / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
          
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: statusInfo.dotColor }}
          />
        </div>
      </div>
    </div>
  )
}
