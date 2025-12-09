import { useState, useCallback, useRef, useEffect } from 'react'
import { Voice, PlaybackState } from '../types'
import { ttsApi } from '../services/api'

export const useTTS = () => {
  const [voices, setVoices] = useState<Voice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('DeepSeek')
  const [text, setText] = useState<string>('')
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioSize, setAudioSize] = useState<number>(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentAudioBlobRef = useRef<Blob | null>(null)

  useEffect(() => {
    loadVoices()
  }, [])

  const loadVoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const voicesList = await ttsApi.getVoices()
      setVoices(voicesList)
      if (voicesList.length > 0) {
        setSelectedVoice(voicesList[0].tag)
      }
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load voices'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateAudio = useCallback(async (textToGenerate?: string) => {
    const textToUse = textToGenerate || text
    
    if (!textToUse.trim()) {
      setError('Please enter text to convert')
      return null
    }

    try {
      setIsLoading(true)
      setPlaybackState('loading')
      setError(null)
      
      const audioBuffer = await ttsApi.generateAudio(textToUse, selectedVoice)
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      
      setAudioSize(audioBlob.size)
      currentAudioBlobRef.current = audioBlob
      
      return audioBlob
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate audio'
      setError(message)
      setPlaybackState('error')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [text, selectedVoice])

  const playAudio = useCallback(async (textToGenerate?: string) => {
    try {
      const audioBlob = await generateAudio(textToGenerate)
      
      if (!audioBlob) {
        setPlaybackState('error')
        return
      }

      if (!audioRef.current) {
        audioRef.current = new Audio()
        audioRef.current.onplay = () => setPlaybackState('playing')
        audioRef.current.onpause = () => setPlaybackState('paused')
        audioRef.current.onended = () => setPlaybackState('idle')
        audioRef.current.onerror = () => {
          setPlaybackState('error')
          setError('Audio playback error')
        }
      }

      const url = URL.createObjectURL(audioBlob)
      audioRef.current.src = url
      audioRef.current.play()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Playback error'
      setError(message)
      setPlaybackState('error')
    }
  }, [generateAudio])

  const pausePlayback = useCallback(() => {
    if (audioRef.current) {
      if (playbackState === 'playing') {
        audioRef.current.pause()
        setPlaybackState('paused')
      } else if (playbackState === 'paused') {
        audioRef.current.play()
        setPlaybackState('playing')
      }
    }
  }, [playbackState])

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaybackState('idle')
    }
  }, [])

  const downloadAudio = useCallback(async (textToGenerate?: string) => {
    try {
      const audioBlob = currentAudioBlobRef.current || await generateAudio(textToGenerate)
      
      if (!audioBlob) {
        setError('No audio to download')
        return
      }

      const url = URL.createObjectURL(audioBlob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
      link.href = url
      link.download = `tts_${timestamp}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download'
      setError(message)
    }
  }, [generateAudio])

  const refreshVoices = useCallback(async () => {
    await loadVoices()
  }, [loadVoices])

  return {
    voices,
    selectedVoice,
    setSelectedVoice,
    text,
    setText,
    playbackState,
    isLoading,
    error,
    setError,
    audioSize,
    playAudio,
    pausePlayback,
    stopPlayback,
    downloadAudio,
    refreshVoices,
  }
}
