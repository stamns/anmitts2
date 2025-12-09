import { NanoAITTS } from './nano-ai-tts.js';
import { processText } from './text-processor.js';

/**
 * Main TTS Service
 * Orchestrates text processing and audio generation
 */

export class TTSService {
  constructor(kv = null) {
    this.nanoAiTts = new NanoAITTS(kv);
    this.kv = kv;
  }

  /**
   * Initialize the service
   */
  async init() {
    await this.nanoAiTts.loadVoices();
  }

  /**
   * Get available models/voices
   */
  getModels() {
    const voices = this.nanoAiTts.getVoices();
    return Object.entries(voices).map(([id, info]) => ({
      id: id,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'nanoaitts',
      permission: [],
      root: 'bot.n.cn',
      parent: null,
    }));
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.nanoAiTts.getVoices();
  }

  /**
   * Validate voice exists
   */
  validateVoice(voice) {
    const voices = this.nanoAiTts.getVoices();
    if (!voices[voice]) {
      throw new Error(
        `Voice "${voice}" not found. Available voices: ${Object.keys(voices).join(', ')}`
      );
    }
  }

  /**
   * Generate speech from text
   */
  async synthesize(text, voice = 'DeepSeek', options = {}) {
    const {
      speed = 1.0,
      pitch = 1.0,
      stream = false,
      chunkSize = 500,
      maxLength = 10000,
      shouldClean = true,
      concurrency = 6,
    } = options;

    // Validate voice
    this.validateVoice(voice);

    // Validate speed and pitch
    if (speed < 0.5 || speed > 2.0) {
      throw new Error('Speed must be between 0.5 and 2.0');
    }
    if (pitch < 0.5 || pitch > 2.0) {
      throw new Error('Pitch must be between 0.5 and 2.0');
    }

    // Process and validate text
    const processed = processText(text, {
      maxLength,
      shouldClean,
      chunkSize,
    });

    // If single chunk, generate directly
    if (processed.chunks.length === 1) {
      const audio = await this.nanoAiTts.getAudio(processed.chunks[0], voice);
      return {
        audio: audio,
        format: 'mp3',
        text: text,
        chunks: 1,
        stream: false,
      };
    }

    // Multi-chunk processing
    const audio = await this.nanoAiTts.getAudioBatch(
      processed.chunks,
      voice,
      concurrency
    );

    return {
      audio: audio,
      format: 'mp3',
      text: text,
      chunks: processed.chunks.length,
      stream: false,
    };
  }

  /**
   * Refresh voice cache
   */
  async refreshVoices() {
    await this.nanoAiTts.loadVoices(true);
    return this.nanoAiTts.getVoices();
  }
}
