# NanoAI TTS - Text to Speech Application

A comprehensive Text-to-Speech (TTS) application with both desktop and web interfaces, powered by the NanoAI TTS engine.

## Project Structure

```
project/
├── frontend/                    # React + TypeScript + Vite web frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API services
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript definitions
│   │   ├── styles/              # CSS and Tailwind styles
│   │   └── App.tsx              # Main app component
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── README.md
├── namitts2.txt                 # Original Tkinter desktop application
├── vercel.json                  # Vercel deployment configuration
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## Features

### Web Frontend (React + TypeScript + Vite)
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Voice Selection**: Dynamic dropdown to choose from available TTS voices
- **Text Input**: Textarea with character counting (max 1000 chars)
- **Audio Generation**: Generate MP3 audio from input text
- **Playback Controls**: Play, pause, stop, and download generated audio
- **Real-time Status**: Visual indicators for application state
- **Dark/Light Theme**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: User-friendly error messages and recovery

### Desktop Application (Tkinter - Original)
- Same TTS functionality as web version
- Direct audio playback with pygame
- File save dialog for downloading audio
- Voice refresh capability
- System tray integration ready

## Technology Stack

### Frontend
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API calls
- **React Icons**: Icon library

### Backend Integration
- HTTP REST API for TTS generation
- Voice list management via API
- Audio file streaming

## Getting Started

### Prerequisites
- Node.js 16+ and npm/pnpm
- (Optional) Python 3.7+ for running the Tkinter desktop app

### Quick Start - Web Frontend

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your API configuration:
```env
VITE_API_URL=http://your-api-url:8000
```

5. Start development server:
```bash
npm run dev
```

6. Open `http://localhost:5173` in your browser

### Build for Production

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

### Deploy to Vercel

1. Update `vercel.json` with your project settings
2. Install Vercel CLI: `npm install -g vercel`
3. Deploy: `vercel`

## Architecture

### Frontend Architecture

The frontend follows a modular, component-based architecture:

```
App (Main Component)
├── TTSForm (Main Form)
│   ├── TextInput Area
│   ├── VoiceSelector (Dropdown + Refresh)
│   └── AudioPlayer (Controls + Status)
└── Theme Toggle Button

useTTS Hook (State Management)
├── Voice Management
├── Audio Generation
├── Playback Control
└── File Download

API Service (Axios)
├── getVoices()
└── generateAudio()
```

### Data Flow

1. User enters text and selects voice
2. Clicks "Generate and Play" or "Generate and Save"
3. Frontend calls API service
4. API service sends request to backend via Axios
5. Backend generates audio and returns MP3 data
6. Frontend plays audio or triggers download
7. Status updates reflect current state

## API Endpoints

The frontend expects the following API endpoints:

### Get Available Voices
```
GET /api/voices
Response: {
  "data": [
    { "tag": "DeepSeek", "name": "DeepSeek (默认)", "iconUrl": "" }
  ]
}
```

### Generate Audio
```
POST /api/tts
Request: {
  "text": "Your text here",
  "voice": "DeepSeek"
}
Response: Binary MP3 audio data
```

## Environment Variables

### Frontend Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

## Development

### Code Style
- Follow TypeScript strict mode
- Use functional components with hooks
- Keep components small and reusable
- Name files with PascalCase for components
- Use camelCase for functions and variables

### Adding New Features

1. Create new component in `src/components/`
2. Add TypeScript types in `src/types/`
3. If needed, add new API methods in `src/services/api.ts`
4. Add hooks in `src/hooks/` for complex logic
5. Update component styles with Tailwind classes
6. Test in development mode

### Testing

While automated tests aren't included in the initial setup, you should:
- Test voice selection and switching
- Test text input with various character counts
- Test audio generation and playback
- Test error scenarios
- Test responsive design on different screen sizes
- Test dark/light theme toggle

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Performance Considerations

- Vite provides instant HMR (Hot Module Replacement)
- Production build includes tree-shaking and minification
- Code splitting for optimal bundle size
- Lazy loading of components
- Minimal dependencies for fast loading

## Troubleshooting

### Audio Not Playing
- Check API URL in `.env.local`
- Verify backend server is running
- Check browser console for errors

### Voice List Not Loading
- Ensure backend `/api/voices` endpoint is accessible
- Check CORS configuration on backend
- Verify network request in browser DevTools

### Build Errors
- Clear `node_modules` and `package-lock.json`
- Run `npm install` again
- Check TypeScript errors with `npm run type-check`

## Contributing

Guidelines for contributing:
1. Create a feature branch from `main`
2. Follow existing code style
3. Write clean, commented code
4. Test thoroughly before submitting PR
5. Update documentation as needed

## License

MIT License - See LICENSE file for details

## Support & Contact

For issues, questions, or suggestions, please refer to the project repository or contact the development team.

## Roadmap

Planned features:
- [ ] Voice quality selection
- [ ] Speed/rate adjustment
- [ ] Pitch control
- [ ] Audio visualization
- [ ] History of generated audio
- [ ] Batch text processing
- [ ] Multiple language support
- [ ] User accounts and preferences
- [ ] Cloud storage integration
