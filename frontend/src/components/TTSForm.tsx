import React from 'react'
import { VoiceSelector } from './VoiceSelector'
import { AudioPlayer } from './AudioPlayer'
import { Voice, PlaybackState } from '../types'

interface TTSFormProps {
  voices: Voice[]
  selectedVoice: string
  onVoiceChange: (voiceTag: string) => void
  text: string
  onTextChange: (text: string) => void
  playbackState: PlaybackState
  isLoading: boolean
  error: string | null
  audioSize: number
  onGenerateAndPlay: () => void
  onGenerateAndDownload: () => void
  onPause: () => void
  onStop: () => void
  onRefreshVoices: () => void
  onErrorClear: () => void
}

const PLACEHOLDER = '请输入要转换为语音的文本...'
const MAX_CHARS = 1000

export const TTSForm: React.FC<TTSFormProps> = ({
  voices,
  selectedVoice,
  onVoiceChange,
  text,
  onTextChange,
  playbackState,
  isLoading,
  error,
  audioSize,
  onGenerateAndPlay,
  onGenerateAndDownload,
  onPause,
  onStop,
  onRefreshVoices,
  onErrorClear,
}) => {
  const charCount = text.length
  const isCharCountExceeded = charCount > MAX_CHARS

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="text-5xl">🎙️</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            纳米AI文字转语音工具
          </h1>
          <p className="text-gray-600 text-lg">Text to Speech Converter</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div className="flex-1">
              <p className="font-semibold text-red-800">错误</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={onErrorClear}
              className="text-red-600 hover:text-red-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Text Input Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
            <span className="text-lg mr-2">📝</span>
            输入文本
          </h3>
          
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder={PLACEHOLDER}
            maxLength={MAX_CHARS}
            className="w-full h-40 p-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          
          <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
            <span>
              字符数: <span className={isCharCountExceeded ? 'text-red-600 font-bold' : ''}>
                {charCount}
              </span> / {MAX_CHARS}
            </span>
            {charCount === 0 && (
              <span className="text-gray-400">请输入文本</span>
            )}
          </div>
          
          {isCharCountExceeded && (
            <p className="mt-2 text-xs text-red-600">
              ⚠️ 字符数超过限制！请删除多余字符。
            </p>
          )}
        </div>

        {/* Voice Selector */}
        <VoiceSelector
          voices={voices}
          selectedVoice={selectedVoice}
          onVoiceChange={onVoiceChange}
          onRefreshVoices={onRefreshVoices}
          isLoading={isLoading}
        />

        {/* Audio Player & Controls */}
        <AudioPlayer
          playbackState={playbackState}
          audioSize={audioSize}
          onPlay={onGenerateAndPlay}
          onPause={onPause}
          onStop={onStop}
          onDownload={onGenerateAndDownload}
          isLoading={isLoading}
        />

        {/* Status Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>🔗 Connected to TTS Engine</p>
          <p className="mt-1">Made with ❤️ using React + TypeScript</p>
        </div>
      </div>
    </div>
  )
}
