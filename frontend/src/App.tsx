import { useState, useEffect } from 'react'
import { TTSForm } from './components/TTSForm'
import { useTTS } from './hooks/useTTS'
import './styles/index.css'

function App() {
  const tts = useTTS()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const htmlElement = document.documentElement
    if (theme === 'dark') {
      htmlElement.classList.add('dark')
    } else {
      htmlElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <TTSForm
        voices={tts.voices}
        selectedVoice={tts.selectedVoice}
        onVoiceChange={tts.setSelectedVoice}
        text={tts.text}
        onTextChange={tts.setText}
        playbackState={tts.playbackState}
        isLoading={tts.isLoading}
        error={tts.error}
        audioSize={tts.audioSize}
        onGenerateAndPlay={() => tts.playAudio()}
        onGenerateAndDownload={() => tts.downloadAudio()}
        onPause={tts.pausePlayback}
        onStop={tts.stopPlayback}
        onRefreshVoices={tts.refreshVoices}
        onErrorClear={() => tts.setError(null)}
      />
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center justify-center text-xl border border-gray-200 dark:border-gray-700"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  )
}

export default App
