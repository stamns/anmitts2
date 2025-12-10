# NanoAITTS Worker - Quick Start Guide

Get up and running with NanoAITTS Worker in 5 minutes!

## Prerequisites

- Node.js 16+ and npm
- Cloudflare account (free tier is fine)
- git

## Step 1: Clone and Setup (1 minute)

```bash
git clone <repository>
cd nanoaitts-worker
npm install
```

## Step 2: Run Locally (1 minute)

```bash
npm run dev
```

You should see:
```
⛅ wrangler 3.28.0
👂 Listening on http://127.0.0.1:8787
```

## Step 3: Test It Works (1 minute)

In a new terminal, try the health check:

```bash
curl http://localhost:8787/api/health
```

You should get:
```json
{
  "status": "healthy",
  "service": "nanoaitts-worker",
  "voicesAvailable": 10,
  "timestamp": "2024-12-10T12:00:00Z"
}
```

## Step 4: Generate Speech (1 minute)

```bash
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input":"Hello, world!"}' \
  --output hello.mp3
```

Play the audio:
```bash
# macOS
open hello.mp3

# Linux
ffplay hello.mp3

# Windows
start hello.mp3
```

## Step 5: Deploy to Cloudflare (Optional, 1 minute)

```bash
# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

Your worker is now live at `https://nanoaitts-worker.<your-account>.workers.dev`!

## What's Next?

### Get Available Voices
```bash
curl http://localhost:8787/v1/voices | jq .data[].id
```

### Use Different Voice
```bash
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input":"你好世界","voice":"DeepSeek"}' \
  --output hello_zh.mp3
```

### Adjust Speed
```bash
curl -X POST http://localhost:8787/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input":"Fast speech","voice":"DeepSeek","speed":1.5}' \
  --output fast.mp3
```

### With Python

```python
import requests

response = requests.post(
    'http://localhost:8787/v1/audio/speech',
    json={'input': 'Hello from Python!'}
)

with open('output.mp3', 'wb') as f:
    f.write(response.content)
```

### With JavaScript

```javascript
const response = await fetch('http://localhost:8787/v1/audio/speech', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input: 'Hello from JavaScript!' })
});

const audio = await response.arrayBuffer();
// Use audio data...
```

## Full API Reference

The API has 5 endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Check service status |
| `/v1/models` | GET | List available models |
| `/v1/voices` | GET | List available voices |
| `/v1/audio/speech` | POST | Convert text to speech |
| `/v1/voices/refresh` | POST | Refresh voice cache |

## Common Parameters

For `/v1/audio/speech`:

```json
{
  "input": "Text to convert",      // Required
  "voice": "DeepSeek",              // Optional (default)
  "speed": 1.0,                     // 0.5 to 2.0
  "pitch": 1.0,                     // 0.5 to 2.0
  "stream": false                   // Not supported yet
}
```

## Troubleshooting

### Port already in use
```bash
# Use different port
wrangler dev --port 8788
```

### Can't connect to bot.n.cn
- Check your internet connection
- The service requires access to `bot.n.cn`
- If you're behind a VPN/proxy, it might be blocked

### No voices available
```bash
# Refresh the voice cache
curl -X POST http://localhost:8787/v1/voices/refresh
```

### Audio quality issues
- Try different voices: `curl http://localhost:8787/v1/voices`
- Ensure text is in UTF-8 encoding
- Check bot.n.cn availability

## Project Structure

```
src/
  index.js              ← Main Worker code
  services/
    tts.js             ← TTS logic
    nano-ai-tts.js     ← API client
    text-processor.js  ← Text cleaning
  utils/
    md5.js             ← MD5 hashing

tests/
  test.js              ← JS tests
  test_python.py       ← Python tests
  curl-examples.sh     ← cURL examples

wrangler.toml          ← Cloudflare config
package.json           ← Dependencies
README.md              ← Full guide
API_GUIDE.md           ← Complete API reference
DEPLOYMENT.md          ← Deployment guide
ARCHITECTURE.md        ← Technical details
```

## Useful Commands

```bash
# Start development server
npm run dev

# Deploy to Cloudflare
npm run deploy

# Deploy to development environment
wrangler deploy --env development

# View logs
wrangler tail

# List all deployments
wrangler deployments list
```

## Learn More

- **Full Guide**: [README.md](README.md)
- **API Reference**: [API_GUIDE.md](API_GUIDE.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)

## Support

1. Check the [README.md](README.md) for common questions
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for setup issues
3. See [API_GUIDE.md](API_GUIDE.md) for API questions
4. Check worker logs: `wrangler tail`

## Example Use Cases

### 1. Discord Bot
```python
import discord
import requests

@bot.command()
async def tts(ctx, *, text):
    response = requests.post(
        'https://your-worker.workers.dev/v1/audio/speech',
        json={'input': text}
    )
    await ctx.send(file=discord.File(io.BytesIO(response.content), 'audio.mp3'))
```

### 2. Web Application
```javascript
// React component example
async function TextToSpeech({ text }) {
  const response = await fetch('https://your-worker.workers.dev/v1/audio/speech', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: text })
  });
  
  const audio = await response.blob();
  const url = URL.createObjectURL(audio);
  const player = new Audio(url);
  player.play();
}
```

### 3. Batch Processing
```bash
# Convert multiple texts to speech
for text in "Hello" "世界" "مرحبا"; do
  curl -X POST http://localhost:8787/v1/audio/speech \
    -H "Content-Type: application/json" \
    -d "{\"input\":\"$text\"}" \
    --output "audio_${text}.mp3"
done
```

## Next Steps

1. ✅ **Local Testing**: Done! Test in development
2. 📚 **Read the docs**: Check [README.md](README.md) and [API_GUIDE.md](API_GUIDE.md)
3. 🔧 **Customize**: Update settings in `wrangler.toml`
4. 🚀 **Deploy**: Use `npm run deploy` to go live
5. 🌐 **Integrate**: Add to your application

---

**Happy synthesizing! 🎵**

For questions, check the documentation files in the project root.
# Quick Start Guide - anmitts2 Vue 3 TTS UI

Get the application running in 5 minutes!

## ⚡ Fastest Way (Docker)

```bash
# 1. Install Docker and Docker Compose
# 2. Clone or download this repository
# 3. Run:
docker-compose up

# 4. Open browser: http://localhost:5000
```

That's it! 🎉

## 🐍 Python (No Docker)

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Installation

```bash
# 1. Navigate to project directory
cd anmitts2

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the server
python app.py

# 4. Open browser: http://localhost:5000
```

## 🚀 First Time Usage

1. **Configure API**
   - Click on "⚙️ API 配置" at the top
   - Enter your TTS API endpoint (e.g., `http://localhost:8000`)
   - Optionally add API key if required
   - Settings are auto-saved

2. **Test with Sample Text**
   - Click on the text input area
   - Type: "你好，这是一个测试。" (Hello, this is a test.)
   - Select a voice from the dropdown
   - Click "▶️ 生成语音 (标准)"
   - You should hear audio!

3. **Download Audio**
   - After generation, click "💾 下载音频"
   - Audio file will be downloaded as MP3

## 📋 Configuration

### API Setup

You need a TTS API server running. Options:

#### Option A: Local FastAPI Server
```bash
# Clone the FastAPI backend repo
git clone <fastapi-backend-repo>
cd backend
pip install -r requirements.txt
python -m app.main

# API will be at http://localhost:8000
```

#### Option B: Remote API
Enter your remote API URL in the configuration section.

#### Option C: Using bot.n.cn (Direct)
If your API is configured to proxy bot.n.cn:
- API URL: `http://your-api-server:8000`

## 🎤 Using the App

### Basic Workflow
1. Type text in the input area
2. Choose a voice
3. Adjust speed and pitch if needed
4. Click "生成语音" to generate
5. Audio player appears - click play to listen
6. Click "下载" to save the audio

### Advanced Features

#### Streaming Mode
- Faster for long texts
- Audio plays as it generates
- Less bandwidth usage
- Click "⚡ 生成语音 (流式)"

#### Text Cleaning
- Expand "🧹 高级清理选项"
- Enable options to remove:
  - Markdown formatting (#, **, etc.)
  - Emoji characters (😀, 🎉, etc.)
  - URLs (http://..., https://...)
  - Line breaks
  - Reference numbers ([1], [2], etc.)
  - Custom keywords

#### Pause Insertion
- Click "插入停顿 (500ms)" button
- Adds pause markers in text
- Adjust pause duration: `[pau:500]` (in milliseconds)

## 🔧 Troubleshooting

### "Cannot connect to API"
```
Problem: API error message
Solution:
1. Check API server is running
2. Verify API URL is correct
3. Check firewall/network settings
4. Open browser console (F12) for details
```

### "Audio not playing"
```
Problem: Player shows but no sound
Solution:
1. Try a different browser
2. Check browser audio permissions
3. Try standard mode instead of streaming
4. Refresh the page
```

### "Text won't generate"
```
Problem: Button disabled or no response
Solution:
1. Enter text in the input area
2. Select a voice
3. Check API is configured
4. Check browser console for errors
```

## 📱 Mobile Usage

The UI is fully responsive! Open on mobile:
- Portrait: Single column layout
- Landscape: Multi-column layout
- All features work on mobile

## 🔒 Security Notes

- API keys are stored in browser's localStorage
- Never share your configuration
- Use HTTPS for remote APIs
- API server should validate inputs

## 📚 More Help

For detailed documentation, see:
- `README.md` - Full feature documentation
- `IMPLEMENTATION_CHECKLIST.md` - What's implemented
- Browser console (F12) - Error messages and logs

## ❓ Common Questions

**Q: Do I need to build anything?**
A: No! Everything is ready to run out of the box.

**Q: Where is my data stored?**
A: In your browser's localStorage. Stays on your device.

**Q: Can I use this without internet?**
A: Only if your API server is local. Remote APIs need internet.

**Q: Does it work on mobile?**
A: Yes! Fully responsive design.

**Q: Can I self-host this?**
A: Yes! Use Docker or run with any Python web server.

**Q: Is my audio data sent to the cloud?**
A: Only to your configured API endpoint. You control where.

## 🆘 Getting Help

1. Check the README.md troubleshooting section
2. Look at browser console (F12 → Console tab)
3. Verify API server is running
4. Check API endpoint is correct
5. Try test API request: `curl http://your-api:8000/api/health`

---

**Ready to go?** Open your browser to http://localhost:5000 🎉
