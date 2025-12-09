# TTS API - FastAPI Backend

A FastAPI-based REST API backend for text-to-speech conversion using NanoAI TTS service. This service handles voice synthesis, caches available voices, and provides streaming MP3 audio responses.

## Features

- 🎙️ Text-to-speech conversion with multiple voice options
- 📡 REST API with Swagger documentation
- 🔄 Voice list caching (robots.json)
- 🚀 Async/await support for high performance
- 🔐 CORS middleware for frontend integration
- 📝 Comprehensive logging and error handling
- 🏥 Health check endpoint
- 🎯 Clean project structure

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── services/
│   │   ├── __init__.py
│   │   └── tts_service.py      # TTS core logic (NanoAITTS)
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic data models
│   └── routes/
│       ├── __init__.py
│       └── tts.py              # TTS API routes
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
├── pyproject.toml              # Project configuration
└── README.md                   # This file
```

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip or uv (package manager)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On Unix or MacOS
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   # Using pip
   pip install -r requirements.txt
   
   # Or using uv (faster)
   uv pip install -r requirements.txt
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running Locally

**Development mode with auto-reload:**
```bash
python -m app.main
```

The server will start at `http://localhost:8000`

**Using uvicorn directly:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### 1. Health Check
```
GET /api/health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "TTS API",
  "version": "1.0.0"
}
```

### 2. Get Available Voices
```
GET /api/voices
```
**Response:**
```json
{
  "voices": {
    "DeepSeek": {
      "name": "DeepSeek Voice",
      "iconUrl": "https://example.com/icon.png"
    },
    "VoiceId2": {
      "name": "Voice Name",
      "iconUrl": "https://example.com/icon.png"
    }
  },
  "count": 2
}
```

### 3. Text-to-Speech Conversion
```
POST /api/tts
Content-Type: application/json

{
  "text": "Hello, this is a test message",
  "voice": "DeepSeek"
}
```

**Response:** MP3 audio stream
- **Content-Type:** audio/mpeg
- **Status:** 200 OK

**Error Response (400):**
```json
{
  "error": "Text cannot be empty",
  "status_code": 400
}
```

**Error Response (500):**
```json
{
  "error": "Failed to generate audio: Connection timeout",
  "status_code": 500
}
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
HOST=0.0.0.0              # Server host address
PORT=8000                 # Server port
ENV=development           # Environment (development/production)

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://example.com

# TTS Configuration
TTS_CACHE_FILE=robots.json  # Voice list cache file

# Logging
LOG_LEVEL=INFO
```

## Deployment

### Docker Deployment

**Create Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and run:**
```bash
docker build -t tts-api .
docker run -p 8000:8000 --env-file .env tts-api
```

### Vercel Deployment

1. **Create vercel.json:**
   ```json
   {
     "buildCommand": "pip install -r requirements.txt",
     "outputDirectory": ".",
     "functions": {
       "api/**/*.py": {
         "memory": 512,
         "maxDuration": 60
       }
     }
   }
   ```

2. **Restructure for Vercel serverless:**
   ```
   api/
   └── index.py  # FastAPI app wrapped for serverless
   ```

3. **Deploy:**
   ```bash
   vercel deploy
   ```

### Heroku Deployment

1. **Create Procfile:**
   ```
   web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

2. **Create runtime.txt:**
   ```
   python-3.11.0
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Configuration for Frontend Integration

### For Vercel Frontend

Update your frontend's API base URL and CORS settings:

**Frontend .env:**
```env
VITE_API_URL=https://your-api-domain.com
```

**Backend CORS (backend/.env):**
```env
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
```

## Testing the API

### Using curl

**Get voices:**
```bash
curl -X GET "http://localhost:8000/api/voices"
```

**Convert text to speech:**
```bash
curl -X POST "http://localhost:8000/api/tts" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world",
    "voice": "DeepSeek"
  }' \
  --output speech.mp3
```

### Using Python requests

```python
import requests

# Get voices
response = requests.get("http://localhost:8000/api/voices")
voices = response.json()

# Convert text to speech
response = requests.post(
    "http://localhost:8000/api/tts",
    json={
        "text": "Hello world",
        "voice": "DeepSeek"
    }
)

# Save audio to file
with open("output.mp3", "wb") as f:
    f.write(response.content)
```

## Troubleshooting

### Connection Timeout
- Check if the NanoAI API (bot.n.cn) is accessible
- Verify network connectivity and firewall settings
- Check server logs for detailed error messages

### Voice List Empty
- First run requires internet connection to fetch voices
- Check `robots.json` file exists and contains valid data
- Clear cache and restart to refetch voices

### CORS Errors
- Verify frontend URL is in `CORS_ORIGINS`
- Check browser console for specific CORS error messages
- Ensure trailing slashes are consistent

## Performance Considerations

- Voice list is cached locally (robots.json) for faster startup
- Async/await support handles concurrent requests efficiently
- MP3 audio is streamed directly to reduce memory usage
- Connection timeout set to 30 seconds for API requests

## Security

- Input validation using Pydantic schemas
- Text length limited to 5000 characters
- Error messages don't expose internal details
- CORS restricts cross-origin requests appropriately

## License

MIT License - See LICENSE file for details

## Support

For issues, feature requests, or questions:
1. Check API documentation at `/docs`
2. Review server logs for detailed error information
3. Verify configuration in `.env` file
4. Test with curl or Postman to isolate frontend issues
