# NanoAITTS Worker - Complete API Guide

## Overview

The NanoAITTS Worker provides a REST API for text-to-speech conversion. The API is compatible with OpenAI's TTS API format, making it easy to use as a drop-in replacement.

## Base URL

- Development: `http://localhost:8787`
- Production: `https://your-worker.workers.dev`

## Authentication

Most endpoints don't require authentication. However, the voice refresh endpoint may require an API key if configured:

```
Authorization: Bearer YOUR_API_KEY
```

## Content Type

All requests should use:
```
Content-Type: application/json
```

## Response Format

### Success Response (200 OK)
```json
{
  "data": "...",
  "status": "success"
}
```

### Error Response (4xx/5xx)
```json
{
  "error": {
    "message": "Error description",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 204 | No Content (CORS preflight) |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (API key required) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

Check if the service is healthy.

**Response:**
```json
{
  "status": "healthy",
  "service": "nanoaitts-worker",
  "voicesAvailable": 10,
  "timestamp": "2024-12-10T12:00:00Z"
}
```

**Example:**
```bash
curl http://localhost:8787/api/health
```

---

### 2. List Models (OpenAI Compatible)

**Endpoint:** `GET /v1/models`

Get list of available TTS models.

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "DeepSeek",
      "object": "model",
      "created": 1702200000,
      "owned_by": "nanoaitts",
      "permission": [],
      "root": "bot.n.cn",
      "parent": null
    },
    {
      "id": "另一个声音",
      "object": "model",
      "created": 1702200000,
      "owned_by": "nanoaitts",
      "permission": [],
      "root": "bot.n.cn",
      "parent": null
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:8787/v1/models
```

---

### 3. List Voices

**Endpoint:** `GET /v1/voices`

Get list of available voices.

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "DeepSeek",
      "name": "DeepSeek (Default)",
      "iconUrl": "https://..."
    },
    {
      "id": "voice-2",
      "name": "Voice 2",
      "iconUrl": "https://..."
    }
  ]
}
```

**Example:**
```bash
curl http://localhost:8787/v1/voices
```

---

### 4. Text to Speech (Main Endpoint)

**Endpoint:** `POST /v1/audio/speech`

Convert text to speech and return MP3 audio.

**Request Body:**
```json
{
  "input": "Hello, world!",
  "voice": "DeepSeek",
  "speed": 1.0,
  "pitch": 1.0,
  "stream": false
}
```

**Parameters:**

| Parameter | Type | Required | Default | Range/Notes |
|-----------|------|----------|---------|------------|
| `input` | string | Yes | - | Text to convert (1-10,000 characters) |
| `voice` | string | No | DeepSeek | Valid voice ID from `/v1/voices` |
| `speed` | number | No | 1.0 | 0.5 to 2.0 |
| `pitch` | number | No | 1.0 | 0.5 to 2.0 |
| `stream` | boolean | No | false | Not currently supported |

**Response:**
- Content-Type: `audio/mpeg`
- Body: MP3 binary audio data

**Errors:**

```json
{
  "error": {
    "message": "Input text cannot be empty",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

**Examples:**

Simple text:
```bash
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input":"Hello, world!"}' \
  --output audio.mp3
```

With custom parameters:
```bash
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "你好，世界",
    "voice": "DeepSeek",
    "speed": 1.2,
    "pitch": 1.1
  }' \
  --output audio.mp3
```

Chinese text:
```bash
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input":"这是一个文本转语音的测试"}' \
  --output chinese_audio.mp3
```

---

### 5. Refresh Voices Cache

**Endpoint:** `POST /v1/voices/refresh`

Manually refresh the voice list cache. Returns the updated voice list.

**Authentication:** Optional (if `API_KEY` is configured)

**Headers (if API key required):**
```
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "message": "Voices refreshed successfully",
  "voicesCount": 10
}
```

**Example:**
```bash
# Without API key
curl -X POST http://localhost:8787/v1/voices/refresh

# With API key
curl -X POST http://localhost:8787/v1/voices/refresh \
  -H "Authorization: Bearer your-api-key"
```

---

## CORS Support

The API supports CORS for browser requests:

**CORS Headers in Response:**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Max-Age: 86400
```

**Preflight Request:**
```bash
curl -X OPTIONS http://localhost:8787/v1/audio/speech \
  -H "Origin: https://example.com"
```

---

## Usage Examples

### JavaScript (Fetch API)

```javascript
// Get available voices
const voicesResponse = await fetch('http://localhost:8787/v1/voices');
const voices = await voicesResponse.json();

// Synthesize speech
const response = await fetch('http://localhost:8787/v1/audio/speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'Hello, world!',
    voice: voices.data[0].id,
    speed: 1.0,
  }),
});

const audioBuffer = await response.arrayBuffer();

// Play audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioSource = audioContext.createBufferSource();
audioSource.buffer = await audioContext.decodeAudioData(audioBuffer);
audioSource.connect(audioContext.destination);
audioSource.start(0);
```

### Python

```python
import requests

# Synthesize speech
response = requests.post(
    'http://localhost:8787/v1/audio/speech',
    json={
        'input': 'Hello, world!',
        'voice': 'DeepSeek',
        'speed': 1.0,
    }
)

# Save to file
with open('audio.mp3', 'wb') as f:
    f.write(response.content)
```

### cURL

```bash
# Basic synthesis
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input":"你好"}' \
  -o output.mp3

# With all parameters
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "Testing all parameters",
    "voice": "DeepSeek",
    "speed": 1.2,
    "pitch": 0.9
  }' \
  -o output.mp3
```

### Node.js (using node-fetch)

```javascript
import fetch from 'node-fetch';
import fs from 'fs';

async function synthesizeSpeech() {
  const response = await fetch('http://localhost:8787/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: 'Hello from Node.js!',
      voice: 'DeepSeek',
    }),
  });

  const buffer = await response.buffer();
  fs.writeFileSync('output.mp3', buffer);
  console.log('Audio saved to output.mp3');
}

synthesizeSpeech();
```

### OpenAI Python Library (Drop-in Replacement)

```python
from openai import OpenAI

# Use NanoAITTS Worker as base URL
client = OpenAI(
    api_key="not-used",  # API key not required
    base_url="http://localhost:8787"
)

# Generate speech
response = client.audio.speech.create(
    model="DeepSeek",
    input="Hello, world!",
    voice="DeepSeek",
    speed=1.0,
)

# Save to file
response.stream_to_file("output.mp3")
```

---

## Error Handling

### Example Error Responses

**Missing Input:**
```json
{
  "error": {
    "message": "Missing or invalid \"input\" field",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

**Empty Input:**
```json
{
  "error": {
    "message": "Input text cannot be empty",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

**Invalid Voice:**
```json
{
  "error": {
    "message": "Voice \"InvalidVoice\" not found. Available voices: DeepSeek, voice-2",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

**Invalid Speed:**
```json
{
  "error": {
    "message": "Speed must be between 0.5 and 2.0",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

**Text Too Long:**
```json
{
  "error": {
    "message": "Text is too long. Maximum length: 10000",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

---

## Rate Limiting

Currently no rate limiting is enforced. However, be aware of:
- Cloudflare Worker timeout: 30 seconds
- Subrequest limit: 50 per request
- Text length limit: 10,000 characters

---

## Performance Notes

- Single chunk synthesis: 1-3 seconds
- Long text auto-chunking: 6+ concurrent chunks, up to 30 seconds
- Voice cache: 24 hours (expires automatically)
- Audio is cacheable for 1 hour

---

## Testing

See the test examples in:
- `tests/curl-examples.sh` - cURL examples
- `tests/test_python.py` - Python test suite
- `tests/test.js` - JavaScript test examples

---

## API Version

Current API version: `v1`

Endpoints are versioned under `/v1/` prefix for future compatibility.
