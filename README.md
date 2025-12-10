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
# 🎙️ anmitts2 Vue 3 TTS Web UI

Modern Vue 3 web frontend for anmitts2 Text-to-Speech (TTS) application. This is a complete replacement for the original Tkinter desktop UI, providing the same functionality in a responsive web interface.

## Features

### Core Functionality
- ✅ **Voice Selection**: Choose from multiple TTS voices from bot.n.cn
- ✅ **Text Input**: Support for up to 5000 characters with real-time counting
- ✅ **Parameter Control**: Adjustable speech rate (0.25x - 2.0x) and pitch (0.5 - 1.5)
- ✅ **Audio Playback**: Built-in HTML5 audio player with controls
- ✅ **Audio Download**: Save generated audio as MP3 files
- ✅ **Streaming Support**: Both standard and streaming generation modes

### Advanced Features
- 🎯 **Text Cleaning Options**:
  - Remove Markdown formatting
  - Remove Emoji characters
  - Remove URLs
  - Remove line breaks
  - Remove reference numbers
  - Custom keyword filtering

- 💾 **Data Persistence**:
  - Auto-save API configuration
  - Auto-save form data
  - Restore state on page reload

- 🎨 **Modern UI**:
  - Responsive design (desktop, tablet, mobile)
  - Smooth animations and transitions
  - Glass-morphism design elements
  - Professional color scheme

## Architecture

### Frontend
- **Framework**: Vue 3 (via CDN, no build step required)
- **Styling**: CSS 3 with gradient backgrounds and animations
- **Storage**: localStorage for persistent configuration
- **API Communication**: Fetch API for HTTP requests

### Backend Integration
- **Worker Class**: `TTSWorker` in `worker.py`
- **HTTP Handler**: `handle_request()` method for request processing
- **HTML Serving**: `get_html_content()` function for HTML delivery

## Installation

### 1. Clone or Download the Repository
```bash
cd /path/to/anmitts2
git clone <repository> .
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Application

#### Option A: Flask Development Server
```bash
python app.py
```
The application will be available at `http://localhost:5000`

#### Option B: Production Server (Gunicorn)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Option C: Docker
```bash
docker build -t anmitts2-ui .
docker run -p 5000:5000 anmitts2-ui
```

#### Option D: Direct Integration
```python
from worker import TTSWorker

worker = TTSWorker()
html = worker.get_html_content()
# Use html in your web framework
```

## Configuration

### API Setup

1. **API URL**: Enter your TTS API endpoint (e.g., `http://localhost:8000`)
2. **API Key**: Optional authentication key (depends on your API)

The settings are automatically saved to browser's localStorage.

### Supported API Endpoints

The application expects the following API endpoints:

```
POST /v1/audio/speech
  Request:
    {
      "input": "Text to convert",
      "voice": "voice_id",
      "speed": 1.0,
      "pitch": 1.0,
      "stream": false,
      "cleaning_options": {
        "removeMarkdown": false,
        "removeEmoji": false,
        "removeUrl": false,
        "removeLineBreaks": false,
        "removeRefNumber": false,
        "customKeywords": ""
      }
    }
  
  Response (audio/mpeg):
    Binary MP3 audio data

GET /v1/models
  Response:
    {
      "data": [
        {
          "id": "voice_id",
          "name": "Voice Name"
        },
        ...
      ]
    }
```

## Usage Guide

### Basic Usage

1. **Configure API**: Click on "⚙️ API 配置" to expand settings and enter your API endpoint
2. **Enter Text**: Type or paste text in the "📝 输入文本" section
3. **Select Voice**: Choose a voice from the dropdown menu
4. **Adjust Parameters**: Use sliders to set speech rate and pitch
5. **Generate Audio**: Click either:
   - "▶️ 生成语音 (标准)" for standard mode (generate then play)
   - "⚡ 生成语音 (流式)" for streaming mode (play while generating)
6. **Download**: Click "💾 下载音频" to save the audio file

### Advanced Options

#### Text Cleaning
Expand the "🧹 高级清理选项" section to enable text preprocessing:
- Automatically remove specific formatting or content types
- Add custom keywords to filter out

#### Pause Insertion
Click "插入停顿 (500ms)" to insert pause markers in your text:
- Format: `[pau:XXX]` where XXX is duration in milliseconds

#### Streaming Mode
For faster playback of long text:
- Audio plays as it's being generated
- Useful for real-time synthesis
- Buffers data for download capability

## Data Privacy

- **Local Storage**: All configuration is stored in your browser's localStorage
- **API Communication**: Audio synthesis requests are sent to your configured API endpoint
- **No Cloud Upload**: By default, no data is sent to external services unless configured
- **Audio Cleanup**: Generated audio is stored in browser memory and cleared when page unloads

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Edge | ✅ Full | Recommended |
| Firefox | ✅ Full | Full support |
| Safari | ✅ Full | iOS 14+ recommended |
| IE 11 | ❌ No | Not supported |

## Troubleshooting

### "请先配置 API 地址"
**Issue**: Cannot generate audio
**Solution**: 
1. Click "⚙️ API 配置" to expand settings
2. Enter your API endpoint URL (e.g., `http://localhost:8000`)
3. Optionally add API key if required

### Audio Won't Play
**Issue**: Player shows but no sound
**Possible Causes**:
1. Audio file is corrupted - try generating again
2. Browser doesn't support MP3 - try a different browser
3. Audio permissions disabled - check browser settings

### "API 错误: 404"
**Issue**: Cannot connect to API
**Solution**:
1. Verify the API URL is correct
2. Check that the API server is running
3. Verify CORS settings on your API server
4. Check browser console for detailed error messages

### Slow Performance
**Issue**: Lag or stuttering
**Solution**:
1. Use streaming mode for long text
2. Reduce text length
3. Adjust speech rate
4. Check browser's available memory

## Development

### Project Structure
```
anmitts2/
├── index.html          # Vue 3 frontend application
├── worker.py           # Worker class with HTML serving
├── app.py              # Flask example server
├── requirements.txt    # Python dependencies
├── README.md          # This file
└── Dockerfile         # Docker configuration
```

### Modifying the UI

The entire UI is defined in `index.html`. To customize:

1. **Styles**: Edit the `<style>` section for CSS changes
2. **Layout**: Edit the HTML structure in the template
3. **Functionality**: Edit the Vue data, computed properties, and methods

### Adding New Features

To add new features:

1. Add data properties in the `data()` function
2. Add computed properties if needed
3. Add methods for event handlers
4. Add corresponding UI elements in the HTML template
5. Save/load data in localStorage as needed

## API Integration

### For FastAPI Backend
```python
from fastapi import FastAPI
from worker import get_html_content

app = FastAPI()

@app.get("/")
async def serve_ui():
    html = get_html_content()
    return HTMLResponse(content=html)
```

### For Django Backend
```python
from django.http import HttpResponse
from worker import get_html_content

def serve_ui(request):
    html = get_html_content()
    return HttpResponse(html, content_type='text/html')
```

### For Starlette
```python
from starlette.applications import Starlette
from starlette.responses import HTMLResponse
from worker import get_html_content

async def homepage(request):
    html = get_html_content()
    return HTMLResponse(html)
```

## Testing

### Manual Testing Checklist
- [ ] Page loads without errors
- [ ] API configuration can be saved and persists
- [ ] Text input updates character count
- [ ] Voice dropdown loads voices
- [ ] Speed and pitch sliders work
- [ ] Standard mode generates and plays audio
- [ ] Streaming mode generates audio progressively
- [ ] Audio can be downloaded with correct filename
- [ ] Cleaning options toggle correctly
- [ ] Status messages appear and disappear
- [ ] Form data persists after page reload
- [ ] Works on mobile/tablet view
- [ ] Error messages show for invalid inputs

## Performance Optimization

### Frontend Optimization
- Vue 3 loaded via CDN for faster initial load
- CSS animations use GPU acceleration
- Audio playback uses browser's native player
- localStorage eliminates redundant API calls

### Backend Optimization
- Static HTML is cached after first load
- Use CDN for serving static assets
- Enable gzip compression on your web server
- Use production WSGI server (gunicorn, etc.)

## Security Considerations

1. **API Keys**: Store sensitive API keys securely
   - Use environment variables
   - Never commit keys to version control
   - Use HTTPS for API communication

2. **Content Security Policy**: Configure CSP headers if needed
3. **CORS**: Configure CORS on your API server to allow frontend domain
4. **Input Validation**: API should validate all inputs
5. **Rate Limiting**: Implement rate limits on API endpoints

## License

[Your License Here]

## Support

For issues, feature requests, or contributions, please:
1. Check the troubleshooting section
2. Review error messages in browser console (F12)
3. Submit issues to the repository

## Changelog

### Version 1.0.0 (Current)
- Initial Vue 3 implementation
- Full feature parity with Tkinter UI
- Responsive design
- Streaming audio support
- Text cleaning options
- Local storage persistence

## Credits

Built as a modern replacement for the anmitts2 Tkinter TTS application.

---

**Last Updated**: 2024
**Framework**: Vue 3
**Build Tool**: None (CDN-based, no build required)
