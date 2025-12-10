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
