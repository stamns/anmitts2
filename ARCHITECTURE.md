# NanoAITTS Worker - Architecture Documentation

## Overview

This document describes the architecture and design decisions for the NanoAITTS Worker - a Cloudflare Workers-based text-to-speech service.

## Project Structure

```
nanoaitts-worker/
├── src/
│   ├── index.js                 # Main Worker entry point
│   ├── services/
│   │   ├── tts.js              # TTS orchestration service
│   │   ├── nano-ai-tts.js       # NanoAITTS API client
│   │   └── text-processor.js    # Text cleaning and chunking
│   └── utils/
│       └── md5.js              # MD5 hash utility
├── tests/
│   ├── test.js                 # JavaScript test examples
│   ├── test_python.py          # Python test suite
│   └── curl-examples.sh        # cURL command examples
├── wrangler.toml               # Cloudflare Workers config
├── package.json                # Node.js dependencies
├── .env.example                # Environment variables template
├── README.md                   # User guide
├── DEPLOYMENT.md               # Deployment instructions
├── API_GUIDE.md               # Complete API reference
└── ARCHITECTURE.md            # This file
```

## Core Components

### 1. Worker Entry Point (`src/index.js`)

**Responsibilities:**
- Handle HTTP requests and route to appropriate handlers
- Manage CORS headers
- Initialize and cache TTS service instance
- Error handling and response formatting

**Key Functions:**
- `fetch(request, env, ctx)`: Main request handler
- `handleHealthCheck()`: Health endpoint
- `handleModels()`: List models
- `handleVoices()`: List voices
- `handleSpeech()`: Speech synthesis
- `handleRefreshVoices()`: Voice cache refresh

**Design Pattern:** Request routing with middleware-like error handling

---

### 2. TTS Service (`src/services/tts.js`)

**Responsibilities:**
- Orchestrate text processing and audio generation
- Validate input parameters
- Manage synthesis workflow

**Key Methods:**
- `synthesize(text, voice, options)`: Main synthesis method
- `getModels()`: Return OpenAI-compatible model format
- `getVoices()`: Get available voices
- `validateVoice(voice)`: Validate voice exists
- `refreshVoices()`: Refresh voice cache

**Design Pattern:** Service layer with composition

---

### 3. NanoAITTS Client (`src/services/nano-ai-tts.js`)

**Responsibilities:**
- Communicate with bot.n.cn API
- Generate authentication headers and tokens
- Manage voice cache with KV storage
- Handle audio retrieval

**Key Methods:**
- `getHeaders()`: Generate request headers with authentication
- `generateMid()`: Generate unique request ID
- `generateUniqueHash()`: Generate hash for authentication
- `loadVoices()`: Load voices from API (with KV caching)
- `getAudio()`: Get single audio chunk from API
- `getAudioBatch()`: Get multiple audio chunks with concurrency control

**Design Pattern:** API client with caching layer

**Authentication Flow:**
1. Generate timestamp and device ID
2. Create access token (MID) from domain and hashes
3. Generate zm-token by MD5 hashing device + timestamp + version + access-token + zm-ua
4. Include all headers in API requests

---

### 4. Text Processor (`src/services/text-processor.js`)

**Responsibilities:**
- Clean text (remove Markdown, emojis, URLs, etc.)
- Intelligently chunk text by sentence boundaries
- Validate text length and content

**Key Functions:**
- `cleanText(text, options)`: Multi-stage text cleaning
  - Remove HTML tags
  - Remove Markdown formatting
  - Remove URLs
  - Remove emojis
  - Normalize whitespace
- `smartChunkText(text, maxChunkSize)`: Intelligent text chunking
  - Respects sentence boundaries
  - Falls back to word boundaries
  - Respects character limits
- `processText(text, options)`: Combined text processing with validation

**Design Pattern:** Utility functions with options objects

---

### 5. MD5 Utility (`src/utils/md5.js`)

**Responsibilities:**
- Provide MD5 hashing functionality
- Pure JavaScript implementation for Cloudflare Workers

**Key Function:**
- `md5Hash(message)`: Generate MD5 hash of input string

**Implementation:** Pure JavaScript MD5 algorithm compatible with Cloudflare Workers

---

## Data Flow

### Text to Speech Request Flow

```
1. HTTP POST /v1/audio/speech
   ↓
2. Worker Entry (src/index.js)
   - Parse JSON body
   - Get CORS headers
   ↓
3. TTS Service (src/services/tts.js)
   - Validate voice
   - Process text
   ↓
4. Text Processor (src/services/text-processor.js)
   - Clean text
   - Chunk into segments
   ↓
5. NanoAITTS Client (src/services/nano-ai-tts.js)
   a. Load voices (if not cached)
      - Check KV cache
      - Fetch from bot.n.cn if missing
   b. For each chunk:
      - Generate headers with auth tokens
      - POST to bot.n.cn TTS API
      - Get MP3 audio data
   c. Combine audio buffers
   ↓
6. Return Response
   - Content-Type: audio/mpeg
   - Body: Combined MP3 data
```

### Voice Loading and Caching

```
1. Request to /v1/audio/speech
   ↓
2. NanoAITTS.loadVoices()
   ↓
3. Check KV cache for 'robots_json'
   - If found and valid: Use cached data
   - If not found: Fetch from API
   ↓
4. Fetch from bot.n.cn/api/robot/platform
   ↓
5. Parse voices from response
   ↓
6. Store in KV with 24-hour TTL
   ↓
7. Return voices object
```

---

## Authentication and Security

### Header Generation (`NanoAITTS.getHeaders()`)

1. **device-platform**: Fixed value "Web"
2. **timestamp**: ISO8601 format (±08:00)
3. **access-token**: Generated MID (Mobile ID)
   - Derived from domain hash + unique hash + timestamp
4. **zm-token**: MD5 hash of concatenated headers
   - `MD5(device + timestamp + version + access-token + zm-ua)`
5. **zm-ver**: Fixed value "1.2"
6. **zm-ua**: MD5 hash of User-Agent
7. **User-Agent**: Chrome user agent string

### MID Generation

```javascript
generateMid() {
  const rt = String(this._e(DOMAIN)) + 
             String(this.generateUniqueHash()) + 
             String(Date.now() + Math.random() + Math.random());
  return rt.replace(/\./g, 'e').substring(0, 32);
}
```

---

## Concurrency and Limitations

### Cloudflare Worker Constraints

- **Execution timeout**: 30 seconds (CPU)
- **Subrequest limit**: 50 per request
- **Memory limit**: Varies by plan
- **Request body size**: 100 MB

### NanoAITTS Strategy

1. **Text Chunking**: Automatically splits long texts into chunks
2. **Concurrent Requests**: Limits concurrent API calls (default: 6)
3. **Batch Processing**: Processes chunks in batches to respect subrequest limits
4. **Audio Combination**: Simple MP3 concatenation (works for streaming format)

### Example Concurrency Flow

```
Text: 10,000 characters
Chunk size: 500 characters
Result: ~20 chunks

Batch 1: Chunks 1-6 (concurrent)
Batch 2: Chunks 7-12 (concurrent)
Batch 3: Chunks 13-18 (concurrent)
Batch 4: Chunks 19-20 (concurrent)

Total subrequests: 20 (within 50 limit)
```

---

## Caching Strategy

### Voice Cache (KV)

- **Key**: `robots_json`
- **Value**: Full API response from bot.n.cn
- **TTL**: 24 hours (86400 seconds)
- **Fallback**: Default voice list in code

### Response Cache (HTTP)

- **Cache-Control**: `public, max-age=3600` for audio responses
- **Benefit**: Browser/CDN caching of audio files

### Benefits

1. Reduces API calls to bot.n.cn
2. Faster voice list retrieval
3. Better user experience with cached audio
4. Complies with Cloudflare KV best practices

---

## Error Handling

### Strategy

1. **Input Validation**: Check input before processing
2. **Error Classification**: Different status codes for different errors
3. **Graceful Degradation**: Use default voices if cache fails
4. **User-Friendly Messages**: Clear error descriptions

### Error Types

| Status | Error | Recovery |
|--------|-------|----------|
| 400 | Invalid input | Validate and retry with correct parameters |
| 404 | Voice not found | Use `/v1/voices` to see available options |
| 500 | API failure | Check bot.n.cn availability, retry later |

---

## Text Processing Pipeline

### Cleaning Stages

1. **HTML Tags**: `<tag>` → removed
2. **Markdown**: `**bold**` → bold, `[link](url)` → link text
3. **URLs**: `https://...` → removed
4. **Emojis**: 😊 → removed
5. **Whitespace**: Multiple spaces/newlines → single space

### Chunking Logic

```
Input: "Sentence 1. Sentence 2. Sentence 3."
Split by delimiters: ["Sentence 1.", " ", "Sentence 2.", " ", "Sentence 3."]
Filter and process: ["Sentence 1.", "Sentence 2.", "Sentence 3."]

If chunk < maxSize:
  - Keep chunk as is
Else if word < maxSize:
  - Split by words
Else:
  - Use word as is (will exceed limit)
```

---

## API Design

### RESTful Principles

- Resources: `/v1/models`, `/v1/voices`, `/v1/audio/speech`
- HTTP Methods: GET for listing, POST for actions
- Status Codes: Semantic HTTP status codes
- Content Negotiation: Content-Type headers

### OpenAI Compatibility

The `/v1/audio/speech` endpoint is designed to be compatible with OpenAI's TTS API:

```python
# Works with OpenAI client library
from openai import OpenAI
client = OpenAI(base_url="https://your-worker.workers.dev")
response = client.audio.speech.create(
    model="DeepSeek",
    input="Hello",
    voice="DeepSeek"
)
```

---

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `API_KEY` | Protect sensitive endpoints | Optional |
| `MAX_TEXT_LENGTH` | Maximum text length | 10,000 |
| `CHUNK_SIZE` | Text chunk size | 500 |
| `MAX_CONCURRENCY` | Max concurrent requests | 6 |
| `DEFAULT_VOICE` | Default voice ID | DeepSeek |
| `ENVIRONMENT` | dev/production | development |

---

## Performance Optimization

### Strategies

1. **Caching**: Voice list cached in KV for 24 hours
2. **Concurrency**: Multiple API requests in parallel
3. **Chunking**: Splits long texts to manage response time
4. **Streaming**: MP3 format supports immediate playback
5. **Edge Deployment**: Cloudflare global network reduces latency

### Benchmarks

- Single chunk: 1-3 seconds
- 20-chunk request: 10-15 seconds
- Voice cache hit: <100ms
- Voice cache miss: 2-5 seconds

---

## Security Considerations

### Input Validation

- Text length limits (prevent DOS)
- Character encoding (UTF-8)
- HTML/Markdown stripping (prevent injection)
- Voice validation (only use valid voices)

### API Security

- Optional API key authentication
- CORS restrictions (configurable)
- No sensitive data in logs
- HTTPS only (Workers.dev enforces)

### Data Privacy

- Text processed only for TTS
- No text storage (only in request/response)
- Audio cached at edge (not logs)
- KV data auto-expires

---

## Testing Strategy

### Test Categories

1. **Unit Tests**: Text processing, hashing
2. **Integration Tests**: API endpoints
3. **E2E Tests**: Full workflows
4. **Error Tests**: Validation and error handling

### Test Tools

- JavaScript: Fetch API, manual assertions
- Python: `requests` library
- cURL: HTTP client

---

## Future Enhancements

Potential improvements for future versions:

1. **Streaming Audio**: Implement chunked transfer encoding
2. **Advanced Caching**: Cache individual TTS results
3. **Rate Limiting**: Built-in throttling
4. **Metrics/Analytics**: Track usage and performance
5. **Multi-Language Support**: Better i18n
6. **Custom Voice Training**: Support for user voices
7. **Audio Formats**: Support WAV, OGG, etc.
8. **Batch API**: Process multiple texts in one request
9. **Webhooks**: Async processing with callbacks
10. **Admin Dashboard**: Monitoring and management UI

---

## Known Limitations

1. **Maximum Duration**: 30 seconds worker timeout
2. **Maximum Subrequests**: 50 per request
3. **Text Length**: 10,000 characters maximum
4. **Audio Combination**: Simple concatenation (may have slight gaps)
5. **Voice List**: Dynamic loading from bot.n.cn

---

## References

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [KV Store API](https://developers.cloudflare.com/workers/runtime-apis/kv/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- Original Python NanoAITTS implementation

---

## Contributing

When contributing to this project:

1. Follow the existing architecture patterns
2. Add tests for new functionality
3. Document API changes
4. Update CHANGELOG if applicable
5. Ensure CORS and error handling are proper

## License

MIT
