import axios, { AxiosInstance } from 'axios'
import { Voice } from '../types'

class TTSApi {
  private api: AxiosInstance
  private baseURL: string

  constructor() {
    const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000'
    this.baseURL = apiUrl
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    })
  }

  async getVoices(): Promise<Voice[]> {
    try {
      const response = await this.api.get('/api/voices')
      return response.data.data || []
    } catch (error) {
      console.error('Failed to fetch voices:', error)
      return this.getDefaultVoices()
    }
  }

  async generateAudio(text: string, voiceTag: string): Promise<ArrayBuffer> {
    try {
      const response = await this.api.post('/api/tts', 
        { text, voice: voiceTag },
        { responseType: 'arraybuffer' }
      )
      return response.data
    } catch (error) {
      console.error('Failed to generate audio:', error)
      throw error
    }
  }

  private getDefaultVoices(): Voice[] {
    return [
      { tag: 'DeepSeek', name: 'DeepSeek (默认)', iconUrl: '' },
    ]
  }
}

export const ttsApi = new TTSApi()
