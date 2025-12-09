export interface Voice {
  tag: string
  name: string
  iconUrl: string
}

export interface TTSResponse {
  success: boolean
  message: string
  data?: ArrayBuffer
}

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'loading' | 'error'
