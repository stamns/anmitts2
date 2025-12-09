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
