import { md5Hash } from '../utils/md5.js';

/**
 * NanoAITTS Service - Handles communication with bot.n.cn API
 * Converted from Python implementation to JavaScript for Cloudflare Workers
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36';
const ROBOTS_JSON_URL = 'https://bot.n.cn/api/robot/platform';
const TTS_API_URL = 'https://bot.n.cn/api/tts/v1';
const DOMAIN = 'https://bot.n.cn';

export class NanoAITTS {
  constructor(kv = null) {
    this.ua = UA;
    this.voices = {};
    this.kv = kv;
    this.voicesLoaded = false;
  }

  /**
   * MD5 hash function
   */
  md5(msg) {
    return md5Hash(msg);
  }

  /**
   * Generate hash value from string
   */
  _e(nt) {
    const HASH_MASK_1 = 268435455;
    const HASH_MASK_2 = 266338304;

    let at = 0;
    for (let i = nt.length - 1; i >= 0; i--) {
      const st = nt.charCodeAt(i);
      at = ((at << 6) & HASH_MASK_1) + st + (st << 14);
      const it = at & HASH_MASK_2;
      if (it !== 0) {
        at = at ^ (it >> 21);
      }
    }
    return at;
  }

  /**
   * Generate unique hash
   */
  generateUniqueHash() {
    const lang = 'zh-CN';
    const appName = 'chrome';
    const ver = 1.0;
    const platform = 'Win32';
    const width = 1920;
    const height = 1080;
    const colorDepth = 24;
    const referrer = 'https://bot.n.cn/chat';

    let nt = `${appName}${ver}${lang}${platform}${this.ua}${width}x${height}${colorDepth}${referrer}`;
    let at = nt.length;
    let it = 1;
    while (it) {
      nt += String(it ^ at);
      it -= 1;
      at += 1;
    }

    return Math.round(Math.random() * 2147483647) ^ this._e(nt) * 2147483647;
  }

  /**
   * Generate MID (Mobile Identification Number)
   */
  generateMid() {
    const rt =
      String(this._e(DOMAIN)) +
      String(this.generateUniqueHash()) +
      String(Date.now() + Math.random() + Math.random());
    return rt.replace(/\./g, 'e').substring(0, 32);
  }

  /**
   * Get ISO8601 timestamp
   */
  getISO8601Time() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+08:00`;
  }

  /**
   * Generate request headers for bot.n.cn API
   */
  getHeaders() {
    const device = 'Web';
    const ver = '1.2';
    const timestamp = this.getISO8601Time();
    const accessToken = this.generateMid();
    const zmUa = this.md5(this.ua);

    const zmTokenStr = `${device}${timestamp}${ver}${accessToken}${zmUa}`;
    const zmToken = this.md5(zmTokenStr);

    return {
      'device-platform': device,
      'timestamp': timestamp,
      'access-token': accessToken,
      'zm-token': zmToken,
      'zm-ver': ver,
      'zm-ua': zmUa,
      'User-Agent': this.ua,
    };
  }

  /**
   * Load voices from robots.json (with caching)
   */
  async loadVoices(forceRefresh = false) {
    try {
      // Try to load from KV cache if available
      if (this.kv && !forceRefresh) {
        const cached = await this.kv.get('robots_json');
        if (cached) {
          const data = JSON.parse(cached);
          this._parseVoices(data);
          return;
        }
      }

      // Fetch from API
      const headers = this.getHeaders();
      const response = await fetch(ROBOTS_JSON_URL, {
        method: 'GET',
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch robots.json: ${response.status}`);
      }

      const data = await response.json();

      // Cache in KV (24 hours)
      if (this.kv) {
        await this.kv.put('robots_json', JSON.stringify(data), {
          expirationTtl: 86400,
        });
      }

      this._parseVoices(data);
    } catch (error) {
      console.error('Failed to load voices:', error);
      // Add default voice as fallback
      this.voices = {
        DeepSeek: { name: 'DeepSeek (Default)', iconUrl: '' },
      };
    }

    this.voicesLoaded = true;
  }

  /**
   * Parse voices from API response
   */
  _parseVoices(data) {
    this.voices = {};
    if (data && data.data && data.data.list) {
      for (const item of data.data.list) {
        this.voices[item.tag] = {
          name: item.title,
          iconUrl: item.icon,
        };
      }
    }
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.voices;
  }

  /**
   * Get audio from bot.n.cn API
   */
  async getAudio(text, voice = 'DeepSeek') {
    if (!this.voicesLoaded) {
      await this.loadVoices();
    }

    // Validate voice exists
    if (!this.voices[voice]) {
      throw new Error(
        `Voice "${voice}" not found. Available voices: ${Object.keys(this.voices).join(', ')}`
      );
    }

    const url = `${TTS_API_URL}?roleid=${encodeURIComponent(voice)}`;
    const headers = this.getHeaders();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    const formData = `&text=${encodeURIComponent(text)}&audio_type=mp3&format=stream`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
      }

      // Return audio as ArrayBuffer
      return await response.arrayBuffer();
    } catch (error) {
      throw new Error(`Failed to get audio: ${error.message}`);
    }
  }

  /**
   * Get audio for multiple text chunks and combine them
   * Respects Cloudflare Worker subrequest limits
   */
  async getAudioBatch(chunks, voice = 'DeepSeek', concurrency = 6) {
    const audioBuffers = [];

    for (let i = 0; i < chunks.length; i += concurrency) {
      const batch = chunks.slice(i, i + concurrency);
      const promises = batch.map((text) => this.getAudio(text, voice));

      try {
        const results = await Promise.all(promises);
        audioBuffers.push(...results);
      } catch (error) {
        throw new Error(`Batch processing failed: ${error.message}`);
      }
    }

    // Combine audio buffers
    return this._combineAudioBuffers(audioBuffers);
  }

  /**
   * Combine multiple audio buffers into one
   */
  _combineAudioBuffers(buffers) {
    // For MP3 files, simple concatenation works for streaming purposes
    let totalSize = 0;
    for (const buf of buffers) {
      totalSize += buf.byteLength;
    }

    const combined = new Uint8Array(totalSize);
    let offset = 0;

    for (const buf of buffers) {
      const view = new Uint8Array(buf);
      combined.set(view, offset);
      offset += view.byteLength;
    }

    return combined.buffer;
  }
}

/**
 * Refresh voice cache
 */
export async function refreshVoiceCache(kv) {
  const tts = new NanoAITTS(kv);
  await tts.loadVoices(true);
  return tts.getVoices();
}
