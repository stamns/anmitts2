# NanoAITTS Worker

A Cloudflare Worker implementation of NanoAITTS - Text to Speech conversion service using the bot.n.cn API.

This project converts the original Python NanoAITTS implementation to a serverless JavaScript worker that runs on Cloudflare's global network.

## Features

- **Text to Speech Conversion**: Convert text to high-quality MP3 audio using bot.n.cn API
- **Multiple Voices**: Support for multiple voice options (dynamically loaded from bot.n.cn)
- **Intelligent Text Processing**: 
  - Multi-stage text cleaning (Markdown, emojis, URLs, etc.)
  - Smart text chunking by sentence boundaries
  - Automatic batch processing
- **OpenAI Compatible API**: REST endpoints compatible with OpenAI's TTS API format
- **CORS Support**: Full CORS support for cross-origin requests
- **Voice Caching**: Automatic caching of voice list using Cloudflare KV
- **Error Handling**: Comprehensive error handling and validation
- **Stream Support**: Ready for streaming responses

## Project Structure

```
├── src/
│   ├── index.js                 # Worker entry point and request routing
│   ├── services/
│   │   ├── tts.js              # Main TTS orchestration service
│   │   ├── nano-ai-tts.js       # NanoAITTS API client
│   │   └── text-processor.js    # Text cleaning and chunking utilities
│   └── utils/
│       └── md5.js              # MD5 hash implementation
├── tests/
│   └── test.js                 # Test scripts (curl examples)
├── wrangler.toml               # Cloudflare Workers configuration
├── package.json                # Node.js dependencies
├── .env.example                # Environment variables template
├── README.md                   # This file
└── DEPLOYMENT.md               # Deployment guide
```

## Installation

### Prerequisites

- Node.js 16+ and npm
- Wrangler CLI: `npm install -g @cloudflare/wrangler`
- Cloudflare account

### Setup

1. Clone the repository:
```bash
git clone <repository>
cd nanoaitts-worker
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your settings
```

4. (Optional) Set up Cloudflare KV namespace for voice caching:
```bash
wrangler kv:namespace create "NANO_AI_TTS_KV"
wrangler kv:namespace create "NANO_AI_TTS_KV" --preview
```

Update `wrangler.toml` with the namespace IDs.

## Development

Start the local development server:

```bash
npm run dev
```

The worker will be available at `http://localhost:8787`

## API Endpoints

### Health Check

**GET** `/api/health`

Check if the service is healthy and get voice count.

Response:
```json
{
  "status": "healthy",
  "service": "nanoaitts-worker",
  "voicesAvailable": 10,
  "timestamp": "2024-12-10T12:00:00Z"
}
```

### Models (OpenAI Compatible)

**GET** `/v1/models`

Get list of available TTS models.

Response:
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
    }
  ]
}
```

### Voices

**GET** `/v1/voices`

Get list of available voices.

Response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "DeepSeek",
      "name": "DeepSeek (Default)",
      "iconUrl": "https://..."
    }
  ]
}
```

### Text to Speech

**POST** `/v1/audio/speech`

Convert text to speech.

Request:
```json
{
  "input": "Hello, how are you?",
  "voice": "DeepSeek",
  "speed": 1.0,
  "pitch": 1.0,
  "stream": false
}
```

Parameters:
- `input` (string, required): Text to convert to speech (max 10,000 characters)
- `voice` (string, optional): Voice ID (default: "DeepSeek")
- `speed` (number, optional): Playback speed (0.5 - 2.0, default: 1.0)
- `pitch` (number, optional): Pitch adjustment (0.5 - 2.0, default: 1.0)
- `stream` (boolean, optional): Stream response (default: false)

Response:
- Content-Type: `audio/mpeg`
- Body: MP3 audio file

### Refresh Voices

**POST** `/v1/voices/refresh`

Refresh the voice list cache (requires API key if configured).

Headers:
```
Authorization: Bearer YOUR_API_KEY
```

Response:
```json
{
  "message": "Voices refreshed successfully",
  "voicesCount": 10
}
```

## Testing

### Using curl

Health check:
```bash
curl http://localhost:8787/api/health
```

Get voices:
```bash
curl http://localhost:8787/v1/voices
```

Generate speech:
```bash
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{
    "input": "你好，世界",
    "voice": "DeepSeek"
  }' \
  --output output.mp3
```

### Using fetch

```javascript
const response = await fetch('http://localhost:8787/v1/audio/speech', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    input: 'Hello, world!',
    voice: 'DeepSeek',
    speed: 1.0,
    pitch: 1.0,
  }),
});

const audio = await response.arrayBuffer();
// Use audio data (play, save, etc.)
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:8787/v1/audio/speech',
    json={
        'input': 'Hello, world!',
        'voice': 'DeepSeek',
        'speed': 1.0,
        'pitch': 1.0,
    }
)

if response.status_code == 200:
    with open('output.mp3', 'wb') as f:
        f.write(response.content)
```

## Configuration

### Environment Variables

See `.env.example` for all available options:

- `API_KEY`: Optional API key for protected endpoints
- `MAX_TEXT_LENGTH`: Maximum text length (default: 10,000)
- `MIN_TEXT_LENGTH`: Minimum text length (default: 1)
- `CHUNK_SIZE`: Text chunk size for batch processing (default: 500)
- `MAX_CONCURRENCY`: Maximum concurrent API requests (default: 6)
- `DEFAULT_VOICE`: Default voice to use (default: "DeepSeek")

### Cloudflare KV Setup

For production voice caching:

1. Create KV namespaces in Cloudflare Dashboard
2. Get the namespace IDs
3. Update `wrangler.toml` with the IDs
4. Deploy

Voice cache expires after 24 hours and can be manually refreshed via the API.

## Deployment

### To Cloudflare

```bash
# Preview
wrangler publish --env development

# Production
wrangler publish --env production
```

See `DEPLOYMENT.md` for detailed deployment instructions.

## Implementation Notes

### Converted from Python

Key components converted from the original Python NanoAITTS:

1. **MD5 Hashing**: Pure JavaScript MD5 implementation
2. **Request Headers**: Device platform, timestamp, access tokens with proper hashing
3. **Voice Loading**: Caching robots.json from bot.n.cn API
4. **Audio Generation**: POST requests to bot.n.cn TTS endpoint
5. **Text Processing**: Multi-stage cleaning and intelligent chunking

### Cloudflare Worker Specifics

- Uses Cloudflare KV for persistent cache
- Respects Worker subrequest limits (default 50)
- Automatic batch processing for long texts
- CORS support for browser requests
- Global edge distribution

### Performance

- Typical response time: 1-5 seconds for single chunks
- Batch processing: Up to 6 concurrent requests per batch
- Voice cache: 24-hour TTL (configurable)
- MP3 output is cacheable for 1 hour

## Limitations

- Maximum text length: 10,000 characters (configurable)
- Cloudflare Worker timeout: 30 seconds (CPU)
- Subrequest limit: 50 per request (respects with batching)
- KV operations: Limited to configured namespaces

## Error Handling

The API returns standard error responses:

```json
{
  "error": {
    "message": "Error description",
    "type": "invalid_request_error",
    "code": 400
  }
}
```

Common status codes:
- 200: Success
- 400: Invalid request
- 401: Unauthorized (if API key required)
- 404: Not found
- 500: Server error

## Security

- Optional API key authentication for sensitive endpoints
- CORS restricted to configured origins (default: all)
- Input validation and sanitization
- Text length limits to prevent abuse
- No sensitive data in logs

## Troubleshooting

### Voices not loading

- Check network connectivity to bot.n.cn
- Clear KV cache: POST `/v1/voices/refresh`
- Check console logs in Wrangler

### Slow responses

- Check Cloudflare Worker logs
- Monitor subrequest usage
- Adjust CHUNK_SIZE for smaller chunks

### Audio quality issues

- Voice issues: Try different voice IDs from `/v1/voices`
- Text encoding: Ensure UTF-8 text encoding
- Network: Check bot.n.cn API availability

## License

MIT

## Support

For issues or questions:
1. Check the README and DEPLOYMENT.md
2. Review Cloudflare Worker logs
3. Test with curl first before integrating

## References

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [KV Store Documentation](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- Original NanoAITTS Python implementation
