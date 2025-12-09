# NanoAI TTS Frontend

A modern React + TypeScript + Vite frontend for the NanoAI Text-to-Speech application. This web interface replicates the functionality of the original Tkinter desktop application with a responsive, user-friendly design.

## Features

- **Voice Selection**: Choose from available TTS voices with dynamic voice list refresh
- **Text Input**: Enter text with real-time character counting (up to 1000 characters)
- **Audio Generation**: Generate high-quality MP3 audio from text
- **Playback Controls**: Play, pause, stop audio playback
- **Audio Download**: Save generated audio files locally
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between dark and light themes
- **Real-time Status**: Visual indicators for playback state and system status
- **Error Handling**: User-friendly error messages and recovery

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Package Manager**: npm/pnpm

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── TTSForm.tsx          # Main form component
│   │   ├── VoiceSelector.tsx    # Voice selection dropdown
│   │   └── AudioPlayer.tsx      # Audio playback controls
│   ├── services/
│   │   └── api.ts              # API service for backend communication
│   ├── hooks/
│   │   └── useTTS.ts           # Custom TTS logic hook
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── styles/
│   │   └── index.css           # Global styles and Tailwind imports
│   ├── App.tsx                 # Main application component
│   └── main.tsx                # React entry point
├── index.html                  # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── .env.example               # Example environment variables
└── package.json               # Project dependencies

```

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm/pnpm installed

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API configuration:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your backend API URL:
```env
VITE_API_URL=http://localhost:8000
```

## Development

Start the development server with hot module replacement:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Building

Build the application for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Type Checking

Run TypeScript type checking:
```bash
npm run type-check
```

## Preview

Preview the production build locally:
```bash
npm run preview
```

## Deployment

### Vercel Deployment

1. Configure `vercel.json` with your project settings
2. Install Vercel CLI:
```bash
npm i -g vercel
```

3. Deploy:
```bash
vercel
```

### Other Platforms

The application can be deployed to any static hosting service that supports:
- Single Page Applications (SPA)
- Route rewriting to `index.html`

## Environment Variables

The following environment variables are supported:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000` |

## API Integration

The frontend communicates with the backend API using the following endpoints:

### Get Voices
```
GET /api/voices
Response: { data: Voice[] }
```

### Generate Audio
```
POST /api/tts
Request: { text: string, voice: string }
Response: Audio file (arraybuffer)
```

## Component Documentation

### TTSForm
Main form component that combines all features.

**Props:**
- `voices`: Available voices list
- `selectedVoice`: Currently selected voice tag
- `onVoiceChange`: Callback when voice is changed
- `text`: Input text
- `onTextChange`: Text change callback
- `playbackState`: Current playback state
- `isLoading`: Loading indicator
- `error`: Error message
- `audioSize`: Size of generated audio
- `onGenerateAndPlay`: Generate and play callback
- `onGenerateAndDownload`: Generate and download callback
- `onPause`: Pause playback callback
- `onStop`: Stop playback callback
- `onRefreshVoices`: Refresh voices callback

### VoiceSelector
Dropdown for voice selection with refresh button.

### AudioPlayer
Audio playback controls with status indicator.

## Hooks

### useTTS
Custom hook that encapsulates all TTS logic including:
- Voice list management
- Audio generation
- Playback control
- Error handling
- File downloading

**Returned values:**
```typescript
{
  voices: Voice[]
  selectedVoice: string
  setSelectedVoice: (voice: string) => void
  text: string
  setText: (text: string) => void
  playbackState: PlaybackState
  isLoading: boolean
  error: string | null
  setError: (error: string | null) => void
  audioSize: number
  playAudio: (text?: string) => void
  pausePlayback: () => void
  stopPlayback: () => void
  downloadAudio: (text?: string) => void
  refreshVoices: () => void
}
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Performance

- Tree-shaking enabled for production builds
- Code splitting for optimized bundle size
- Lazy loading of components
- Minimal dependencies for fast loading

## License

MIT

## Contributing

Contributions are welcome! Please follow the existing code style and create pull requests with clear descriptions.

## Support

For issues or questions, please refer to the main project repository or contact the development team.
