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
