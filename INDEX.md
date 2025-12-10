# NanoAITTS Worker - Project Index

Complete documentation and file guide for the NanoAITTS Worker project.

## 📖 Documentation Files

### Essential Reading

1. **[QUICKSTART.md](QUICKSTART.md)** ⭐ START HERE
   - 5-minute quick start guide
   - Basic setup and first test
   - Common use cases
   - **Time**: 5 minutes

2. **[README.md](README.md)** 📚 Complete User Guide
   - Project overview and features
   - Installation and setup
   - Development environment
   - API endpoints overview
   - Testing instructions
   - Troubleshooting
   - **Time**: 20 minutes

### Reference Documentation

3. **[API_GUIDE.md](API_GUIDE.md)** 🔌 Complete API Reference
   - Detailed endpoint documentation
   - Request/response formats
   - Parameter descriptions
   - Code examples (JavaScript, Python, cURL)
   - Error handling
   - Integration examples
   - **Time**: 30 minutes

4. **[DEPLOYMENT.md](DEPLOYMENT.md)** 🚀 Deployment Guide
   - Step-by-step deployment instructions
   - Cloudflare setup
   - KV namespace configuration
   - Production configuration
   - Monitoring and logging
   - Troubleshooting deployments
   - **Time**: 15 minutes

5. **[ARCHITECTURE.md](ARCHITECTURE.md)** 🏗️ Technical Architecture
   - System architecture overview
   - Component descriptions
   - Data flow diagrams
   - Authentication details
   - Concurrency strategy
   - Caching implementation
   - Performance notes
   - **Time**: 40 minutes

6. **[CHANGELOG.md](CHANGELOG.md)** 📝 Version History
   - Release notes
   - Feature changelog
   - Known issues
   - Performance characteristics
   - Future roadmap
   - Migration guides

## 💻 Source Code

### Main Application

```
src/
├── index.js                  # Worker entry point (380 lines)
│   ├── Request routing
│   ├── CORS handling
│   ├── Error responses
│   └── Endpoint handlers
│
├── services/
│   ├── tts.js               # TTS orchestration service (120 lines)
│   │   ├── Synthesis workflow
│   │   ├── Voice validation
│   │   └── Model/voice management
│   │
│   ├── nano-ai-tts.js       # NanoAITTS API client (280 lines)
│   │   ├── Header generation
│   │   ├── Authentication tokens
│   │   ├── Voice loading
│   │   ├── Audio generation
│   │   └── KV caching
│   │
│   └── text-processor.js    # Text utilities (130 lines)
│       ├── Text cleaning
│       ├── Smart chunking
│       └── Validation
│
└── utils/
    └── md5.js              # MD5 implementation (190 lines)
        └── Pure JS MD5 algorithm
```

### Configuration

```
Configuration Files:
├── wrangler.toml           # Cloudflare Workers config
├── package.json            # Node.js dependencies
└── .env.example           # Environment variables template
```

### Testing

```
tests/
├── test.js                # JavaScript tests
├── test_python.py         # Python test suite
└── curl-examples.sh       # cURL examples
```

## 📋 File Overview

### Root Level Files

| File | Purpose | Size |
|------|---------|------|
| `README.md` | User guide and overview | ~550 lines |
| `QUICKSTART.md` | 5-minute getting started | ~300 lines |
| `API_GUIDE.md` | Complete API reference | ~650 lines |
| `DEPLOYMENT.md` | Deployment instructions | ~450 lines |
| `ARCHITECTURE.md` | Technical documentation | ~600 lines |
| `CHANGELOG.md` | Version history and roadmap | ~450 lines |
| `INDEX.md` | This file | ~400 lines |
| `namitts2.txt` | Original Python implementation | ~500 lines |
| `package.json` | Node.js configuration | ~30 lines |
| `wrangler.toml` | Cloudflare config | ~30 lines |
| `.env.example` | Environment template | ~20 lines |
| `.gitignore` | Git ignore rules | ~50 lines |

### Source Code Files

| Path | Purpose | Lines |
|------|---------|-------|
| `src/index.js` | Worker entry point | 380 |
| `src/services/tts.js` | TTS service | 120 |
| `src/services/nano-ai-tts.js` | API client | 280 |
| `src/services/text-processor.js` | Text utilities | 130 |
| `src/utils/md5.js` | MD5 utility | 190 |

### Test Files

| Path | Purpose | Lines |
|------|---------|-------|
| `tests/test.js` | JavaScript tests | ~300 |
| `tests/test_python.py` | Python tests | ~400 |
| `tests/curl-examples.sh` | cURL examples | ~200 |

## 🗂️ Quick Navigation

### I want to...

**...get started quickly** → [QUICKSTART.md](QUICKSTART.md)

**...understand the full system** → [README.md](README.md)

**...integrate with the API** → [API_GUIDE.md](API_GUIDE.md)

**...deploy to production** → [DEPLOYMENT.md](DEPLOYMENT.md)

**...understand the architecture** → [ARCHITECTURE.md](ARCHITECTURE.md)

**...check what's new** → [CHANGELOG.md](CHANGELOG.md)

**...read the original code** → [namitts2.txt](namitts2.txt)

### I need to...

**...install the project** → See [QUICKSTART.md - Step 1](QUICKSTART.md#step-1-clone-and-setup-1-minute)

**...run it locally** → See [QUICKSTART.md - Step 2](QUICKSTART.md#step-2-run-locally-1-minute)

**...test the API** → See [README.md - Testing](README.md#testing)

**...set up KV caching** → See [DEPLOYMENT.md - Step 2](DEPLOYMENT.md#step-2-create-cloudflare-kv-namespaces-optional-but-recommended)

**...configure environment variables** → See [DEPLOYMENT.md - Step 4](DEPLOYMENT.md#step-4-configure-environment-variables-optional)

**...understand authentication** → See [ARCHITECTURE.md - Authentication and Security](ARCHITECTURE.md#authentication-and-security)

**...fix an issue** → See [README.md - Troubleshooting](README.md#troubleshooting)

## 🔍 Code Navigation

### Entry Point
**File**: `src/index.js`
- Main request handler: `fetch(request, env, ctx)`
- Response helpers: `jsonResponse()`, `errorResponse()`
- Endpoint handlers:
  - `handleHealthCheck()`
  - `handleModels()`
  - `handleVoices()`
  - `handleSpeech()`
  - `handleRefreshVoices()`

### TTS Service
**File**: `src/services/tts.js`
- Main service class: `TTSService`
- Methods:
  - `synthesize()` - Convert text to speech
  - `getModels()` - List models
  - `getVoices()` - List voices
  - `validateVoice()` - Validate voice exists
  - `refreshVoices()` - Refresh cache

### NanoAITTS Client
**File**: `src/services/nano-ai-tts.js`
- API client class: `NanoAITTS`
- Authentication:
  - `getHeaders()` - Generate request headers
  - `generateMid()` - Generate unique ID
  - `generateUniqueHash()` - Generate hash
  - `md5()` - Hash function
- Voice management:
  - `loadVoices()` - Load voices from API
  - `getVoices()` - Get voice list
  - `_parseVoices()` - Parse API response
- Audio generation:
  - `getAudio()` - Get single audio
  - `getAudioBatch()` - Get multiple audio (parallel)
  - `_combineAudioBuffers()` - Combine MP3s

### Text Processor
**File**: `src/services/text-processor.js`
- Cleaning function: `cleanText()`
  - HTML tag removal
  - Markdown removal
  - URL removal
  - Emoji removal
  - Whitespace normalization
- Chunking function: `smartChunkText()`
  - Sentence-based splitting
  - Fallback to word splitting
  - Character limit respecting
- Validation function: `processText()`
  - Input validation
  - Text length checking
  - Combined cleaning + chunking

### MD5 Utility
**File**: `src/utils/md5.js`
- Pure JS MD5: `md5Hash(message)`
  - No dependencies
  - Cloudflare Worker compatible

## 📦 Dependencies

### Runtime
- **Node.js**: 16+
- **Cloudflare Workers**: Latest

### Build
- **wrangler**: ^3.28.0 (CLI)
- **@cloudflare/workers-types**: ^4.20240604.0 (TypeScript definitions)

### No Runtime Dependencies
All cryptography and utilities are implemented in pure JavaScript with Web Crypto API.

## 🔧 Configuration

### Cloudflare Configuration
**File**: `wrangler.toml`
- Worker name and entry point
- KV namespace bindings
- Environment-specific settings
- Build configuration
- CPU and timeout limits

### Environment Variables
**File**: `.env.example`
- `API_KEY` - Optional API key
- `MAX_TEXT_LENGTH` - Text limit (default: 10,000)
- `CHUNK_SIZE` - Chunk size (default: 500)
- `MAX_CONCURRENCY` - Concurrent requests (default: 6)
- `DEFAULT_VOICE` - Default voice ID
- And more...

### Package Configuration
**File**: `package.json`
- Project metadata
- Scripts (dev, deploy, test)
- Dependencies

## 🧪 Testing

### JavaScript Tests
**File**: `tests/test.js`
- Health check test
- Models endpoint test
- Voices endpoint test
- Speech synthesis test
- Long text chunking test
- Input validation test
- CORS support test
- Error handling test
- Run with: `node tests/test.js`

### Python Tests
**File**: `tests/test_python.py`
- CLI client: `NanoAITTSClient`
- Health check test
- Models test
- Voices test
- Simple synthesis test
- Parameter tests
- Long text test
- Error handling test
- File saving test
- OpenAI client compatibility test
- Run with: `python3 tests/test_python.py`

### cURL Examples
**File**: `tests/curl-examples.sh`
- Health check
- Get models
- Get voices
- Simple synthesis
- Chinese text synthesis
- Custom speed synthesis
- Custom pitch synthesis
- Long text synthesis
- Input validation tests
- CORS preflight
- Error tests
- Audio file saving
- Run with: `./tests/curl-examples.sh`

## 🚀 Development Workflow

### 1. Local Development
```bash
npm run dev          # Start local server
npm run test         # Run tests
```

### 2. Code Changes
- Edit files in `src/` directory
- All syntax is validated
- ES6+ modules supported

### 3. Testing
- Use `tests/test.js` for JavaScript
- Use `tests/test_python.py` for Python
- Use `tests/curl-examples.sh` for cURL

### 4. Deployment
```bash
npm run deploy       # Deploy to production
```

## 📊 Project Statistics

### Code
- **Total Lines of Code**: ~1,100
- **Source Files**: 5
- **Test Files**: 3
- **Configuration Files**: 3
- **Documentation Files**: 7

### Documentation
- **Total Documentation Lines**: ~4,000
- **README**: ~550 lines
- **QUICKSTART**: ~300 lines
- **API_GUIDE**: ~650 lines
- **DEPLOYMENT**: ~450 lines
- **ARCHITECTURE**: ~600 lines
- **CHANGELOG**: ~450 lines

## 🔗 External References

### APIs
- **bot.n.cn**: TTS backend service
  - Voice list: `https://bot.n.cn/api/robot/platform`
  - TTS endpoint: `https://bot.n.cn/api/tts/v1`

### Technologies
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## ✅ Checklist for Different Tasks

### Setting Up for Development
- [ ] Read [QUICKSTART.md](QUICKSTART.md)
- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Test with curl: `curl http://localhost:8787/api/health`

### Understanding the System
- [ ] Read [README.md](README.md)
- [ ] Review [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] Look at code in `src/`
- [ ] Check [API_GUIDE.md](API_GUIDE.md)

### Deploying to Production
- [ ] Read [DEPLOYMENT.md](DEPLOYMENT.md)
- [ ] Follow all steps
- [ ] Set up KV namespaces
- [ ] Configure environment variables
- [ ] Test deployed instance

### Integrating the API
- [ ] Review [API_GUIDE.md](API_GUIDE.md)
- [ ] Check example code for your language
- [ ] Test locally first
- [ ] Integrate into your app
- [ ] Test in production

### Contributing Code
- [ ] Understand [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] Follow existing patterns
- [ ] Add tests for new features
- [ ] Update documentation
- [ ] Check for syntax errors

## 📧 Support Resources

### Documentation
- **README**: General overview
- **QUICKSTART**: Quick setup
- **API_GUIDE**: API reference
- **DEPLOYMENT**: Production setup
- **ARCHITECTURE**: Technical details
- **CHANGELOG**: Version info

### Troubleshooting
- **README**: Common issues
- **DEPLOYMENT**: Deployment issues
- **ARCHITECTURE**: Design questions

### Examples
- **QUICKSTART**: Basic examples
- **API_GUIDE**: Complete examples
- **tests/**: Practical test code

## 📄 License & Attribution

- **License**: MIT
- **Original Code**: Python NanoAITTS implementation
- **Backend**: bot.n.cn API service
- **Platform**: Cloudflare Workers

---

**Last Updated**: 2024-12-10
**Version**: 1.0.0
**Status**: Ready for Production

For questions or issues, refer to the appropriate documentation file above.
