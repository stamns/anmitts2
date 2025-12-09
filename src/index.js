import { TTSService } from './services/tts.js';

/**
 * Cloudflare Worker for NanoAITTS
 * Converts text to speech using bot.n.cn API
 */

// Global TTS service instance
let ttsService = null;

/**
 * Initialize TTS service
 */
async function initTTSService(env) {
  if (!ttsService) {
    const kv = env.NANO_AI_TTS_KV || null;
    ttsService = new TTSService(kv);
    await ttsService.init();
  }
  return ttsService;
}

/**
 * CORS headers
 */
function getCorsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Create JSON response
 */
function jsonResponse(data, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

/**
 * Create error response
 */
function errorResponse(message, status = 400, corsHeaders = {}) {
  return jsonResponse(
    {
      error: {
        message: message,
        type: 'invalid_request_error',
        code: status,
      },
    },
    status,
    corsHeaders
  );
}

/**
 * Handle health check
 */
async function handleHealthCheck(env, corsHeaders) {
  const service = await initTTSService(env);
  const voices = service.getVoices();
  return jsonResponse(
    {
      status: 'healthy',
      service: 'nanoaitts-worker',
      voicesAvailable: Object.keys(voices).length,
      timestamp: new Date().toISOString(),
    },
    200,
    corsHeaders
  );
}

/**
 * Handle models endpoint (OpenAI compatible)
 */
async function handleModels(env, corsHeaders) {
  const service = await initTTSService(env);
  const models = service.getModels();
  return jsonResponse(
    {
      object: 'list',
      data: models,
    },
    200,
    corsHeaders
  );
}

/**
 * Handle voices endpoint
 */
async function handleVoices(env, corsHeaders) {
  const service = await initTTSService(env);
  const voices = service.getVoices();
  return jsonResponse(
    {
      object: 'list',
      data: Object.entries(voices).map(([id, info]) => ({
        id: id,
        name: info.name,
        iconUrl: info.iconUrl,
      })),
    },
    200,
    corsHeaders
  );
}

/**
 * Handle speech synthesis
 */
async function handleSpeech(request, env, corsHeaders) {
  try {
    const body = await request.json();

    const {
      input,
      voice = 'DeepSeek',
      speed = 1.0,
      pitch = 1.0,
      stream = false,
    } = body;

    // Validate input
    if (!input || typeof input !== 'string') {
      return errorResponse('Missing or invalid "input" field', 400, corsHeaders);
    }

    if (input.length === 0) {
      return errorResponse('Input text cannot be empty', 400, corsHeaders);
    }

    // Initialize service
    const service = await initTTSService(env);

    // Synthesize speech
    const result = await service.synthesize(input, voice, {
      speed,
      pitch,
      stream,
    });

    // Convert ArrayBuffer to base64 for JSON response if needed
    // Or return as binary MP3
    const audioBuffer = result.audio;

    // Return audio as binary data
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength,
        'Cache-Control': 'public, max-age=3600',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error in speech synthesis:', error);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    return errorResponse(error.message, statusCode, corsHeaders);
  }
}

/**
 * Handle voice refresh
 */
async function handleRefreshVoices(env, corsHeaders) {
  try {
    const service = await initTTSService(env);
    const voices = await service.refreshVoices();
    return jsonResponse(
      {
        message: 'Voices refreshed successfully',
        voicesCount: Object.keys(voices).length,
      },
      200,
      corsHeaders
    );
  } catch (error) {
    console.error('Error refreshing voices:', error);
    return errorResponse(error.message, 500, corsHeaders);
  }
}

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Get CORS headers
    const origin = request.headers.get('Origin') || '*';
    const corsHeaders = getCorsHeaders(origin);

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Route handling
    try {
      // Health check
      if (pathname === '/api/health' && method === 'GET') {
        return await handleHealthCheck(env, corsHeaders);
      }

      // Models endpoint (OpenAI compatible)
      if (pathname === '/v1/models' && method === 'GET') {
        return await handleModels(env, corsHeaders);
      }

      // Voices endpoint
      if (pathname === '/v1/voices' && method === 'GET') {
        return await handleVoices(env, corsHeaders);
      }

      // Speech synthesis
      if (pathname === '/v1/audio/speech' && method === 'POST') {
        return await handleSpeech(request, env, corsHeaders);
      }

      // Refresh voices
      if (pathname === '/v1/voices/refresh' && method === 'POST') {
        // Optional: Add API key check here
        if (env.API_KEY && request.headers.get('Authorization') !== `Bearer ${env.API_KEY}`) {
          return errorResponse('Unauthorized', 401, corsHeaders);
        }
        return await handleRefreshVoices(env, corsHeaders);
      }

      // Not found
      return errorResponse(
        `Endpoint not found: ${pathname}`,
        404,
        corsHeaders
      );
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse(
        'Internal server error',
        500,
        corsHeaders
      );
    }
  },
};
