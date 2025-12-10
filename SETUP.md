# Setup Guide - anmitts2 Vue 3 TTS UI

Complete setup instructions for all deployment scenarios.

## Prerequisites

- Python 3.7 or higher
- pip package manager
- Git (optional, for cloning)
- Docker & Docker Compose (optional, for containerized deployment)

## Installation Methods

### Method 1: Quick Start with Docker (Recommended)

**Fastest way to get running!**

```bash
# 1. Navigate to project directory
cd anmitts2

# 2. Start with Docker Compose
docker-compose up

# 3. Open browser to http://localhost:5000
```

**To stop:**
```bash
docker-compose down
```

---

### Method 2: Python with Flask (Recommended for Development)

**Best for local development and testing.**

```bash
# 1. Create virtual environment (recommended)
python3 -m venv venv

# 2. Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run Flask development server
python app.py

# 5. Open browser to http://localhost:5000
```

**To stop:** Press `Ctrl+C`

---

### Method 3: Production Deployment with Gunicorn

**For production environments.**

```bash
# 1. Install Gunicorn
pip install gunicorn

# 2. Run production server
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app

# 3. Open browser to http://localhost:5000
```

**Advanced options:**
```bash
# With SSL (requires certificate files)
gunicorn -w 4 -b 0.0.0.0:443 \
  --certfile=/path/to/cert.pem \
  --keyfile=/path/to/key.pem \
  app:app

# With custom settings
gunicorn -w 8 -b 0.0.0.0:5000 \
  --timeout 180 \
  --max-requests 1000 \
  --max-requests-jitter 50 \
  app:app
```

---

### Method 4: Docker Build from Scratch

**For creating custom Docker images.**

```bash
# 1. Build Docker image
docker build -t anmitts2-tts-ui:latest .

# 2. Run Docker container
docker run -p 5000:5000 \
  -e FLASK_ENV=production \
  anmitts2-tts-ui:latest

# 3. Open browser to http://localhost:5000

# To stop:
docker stop <container_id>
```

---

### Method 5: Integration with Existing Python Framework

**For integrating into existing applications.**

#### FastAPI
```python
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from worker import get_html_content

app = FastAPI()

@app.get("/", response_class=HTMLResponse)
async def serve_ui():
    return get_html_content()
```

#### Django
```python
from django.http import HttpResponse
from django.views import View
from worker import get_html_content

class TTSUIView(View):
    def get(self, request):
        html = get_html_content()
        return HttpResponse(html, content_type='text/html')

# In urls.py:
urlpatterns = [
    path('', TTSUIView.as_view(), name='tts-ui'),
]
```

#### Starlette
```python
from starlette.applications import Starlette
from starlette.responses import HTMLResponse
from starlette.routing import Route
from worker import get_html_content

async def homepage(request):
    return HTMLResponse(get_html_content())

routes = [
    Route('/', homepage),
]

app = Starlette(routes=routes)
```

#### Flask (Simple)
```python
from flask import Flask
from worker import get_html_content

app = Flask(__name__)

@app.route('/')
def index():
    return get_html_content()

if __name__ == '__main__':
    app.run()
```

---

## Configuration

### API Configuration

The application needs a TTS API endpoint to work. Configure it in the UI:

1. Click "⚙️ API 配置" in the app
2. Enter your API URL (e.g., `http://localhost:8000`)
3. Optionally add API key if required
4. Settings auto-save to browser localStorage

### Environment Variables (for container deployment)

```bash
# Port
PORT=5000

# Flask environment
FLASK_ENV=production

# Optional: API defaults (if you want to pre-configure)
TTS_API_URL=http://localhost:8000
TTS_API_KEY=your-api-key
```

---

## Verification

### Test Installation

```bash
# 1. Run integration tests
python test_integration.py

# 2. Should see: "✓ All tests passed!"
```

### Test the Application

1. Open browser: http://localhost:5000
2. Configure API URL in the UI
3. Enter some test text
4. Select a voice
5. Click "生成语音 (标准)"
6. You should hear audio!

---

## Troubleshooting Setup

### "Port 5000 already in use"
```bash
# Option 1: Use different port with Flask
flask run --port 5001

# Option 2: Use different port with Gunicorn
gunicorn -b 0.0.0.0:5001 app:app

# Option 3: Kill process using port 5000
# On Linux/macOS:
lsof -ti:5000 | xargs kill -9

# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "ModuleNotFoundError: No module named 'flask'"
```bash
# Install requirements again
pip install -r requirements.txt
```

### "Connection refused" when accessing http://localhost:5000
1. Verify server is running (check console for errors)
2. Check that port 5000 is not blocked by firewall
3. Try accessing http://127.0.0.1:5000 instead
4. Check server logs for any error messages

### Virtual Environment Issues
```bash
# Deactivate current venv
deactivate

# Remove old venv
rm -rf venv

# Create new venv
python3 -m venv venv

# Activate
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate      # Windows

# Reinstall
pip install -r requirements.txt
```

### Docker Issues
```bash
# Remove stopped containers
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Restart services
docker-compose up
```

---

## Next Steps

1. **Read QUICKSTART.md** for basic usage
2. **Read README.md** for full documentation
3. **Configure your TTS API** in the application UI
4. **Start using** the application!

---

## Support

For issues:
1. Check the Troubleshooting section above
2. Review error messages in browser console (F12)
3. Check server logs
4. Verify API server is running and accessible

---

## Security Notes

### Before Production Deployment

1. **Enable HTTPS**: Use SSL/TLS certificates
2. **Protect API Keys**: Store securely, never commit to git
3. **CORS Configuration**: Configure CORS on API server
4. **Rate Limiting**: Implement rate limits on API
5. **Input Validation**: API should validate all inputs
6. **Access Control**: Use authentication if needed

### Example Nginx Configuration for HTTPS

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Performance Tuning

### For High Load

```bash
# Increase Gunicorn workers
gunicorn -w 16 -b 0.0.0.0:5000 app:app

# Use worker class optimized for I/O
gunicorn -w 8 -k gevent -b 0.0.0.0:5000 app:app

# Use Nginx as reverse proxy for load balancing
# (See example config above)
```

### For Low Resources (Raspberry Pi, etc.)

```bash
# Use single worker
gunicorn -w 1 -b 0.0.0.0:5000 app:app

# Or use simple Flask development server
python app.py
```

---

## Getting Help

**For installation issues:**
- Check Python version: `python --version` (should be 3.7+)
- Check pip: `pip --version`
- Check virtual env: `which python` or `where python`

**For runtime issues:**
- Check browser console: Press F12
- Check server logs: Look at terminal output
- Run integration tests: `python test_integration.py`

---

**Ready to deploy?** Choose your method above and get started! 🚀
