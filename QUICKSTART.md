# Quick Start Guide - NanoAI TTS Frontend

## Setup in 5 Minutes

### 1. Prerequisites
- Node.js 16+ (check with `node --version`)
- npm or pnpm
- A running backend TTS API server

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Configure Environment
```bash
# Copy example to local file
cp .env.example .env.local

# Edit .env.local with your API URL
# VITE_API_URL=http://your-api-server:8000
```

### 4. Start Development Server
```bash
npm run dev
```

The app will automatically open at `http://localhost:5173`

## Development Workflow

### Run Development Server
```bash
npm run dev
```
- Auto-reload on file changes
- Full hot module replacement
- Source maps for debugging

### Type Checking
```bash
npm run type-check
```
Verify TypeScript compilation before building

### Build for Production
```bash
npm run build
```
Output goes to `dist/` directory

### Preview Production Build
```bash
npm run preview
```

## Common Tasks

### Environment Setup
Edit `.env.local` to configure:
- `VITE_API_URL` - Your backend API base URL

### Adding New Components
1. Create in `src/components/`
2. Export from component file
3. Import in parent component
4. Add TypeScript types if needed

### Adding API Endpoints
1. Add method to `src/services/api.ts`
2. Use in hooks or components via axios
3. Handle errors gracefully

### Styling with Tailwind
- Use utility classes directly in JSX
- Common classes: `bg-primary`, `text-white`, `rounded-lg`
- Responsive: `md:text-lg`, `sm:w-full`
- Dark mode: `dark:bg-gray-800`

## Project Structure Reference

```
frontend/src/
├── App.tsx              # Main app component
├── main.tsx             # Entry point
├── components/          # React components
│   ├── TTSForm.tsx
│   ├── VoiceSelector.tsx
│   └── AudioPlayer.tsx
├── services/            # API clients
│   └── api.ts
├── hooks/               # Custom hooks
│   └── useTTS.ts
├── types/               # TypeScript definitions
│   └── index.ts
└── styles/              # CSS files
    └── index.css
```

## Testing Locally

1. Start backend API (ensure it's running)
2. Update `.env.local` with API URL
3. Run `npm run dev`
4. Test in browser:
   - Enter text
   - Select voice
   - Click "生成并播放" (Generate and Play)
   - Should hear audio

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### API Connection Failed
- Check backend is running
- Verify URL in `.env.local`
- Check CORS configuration on backend
- Look at browser console for errors

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors
```bash
npm run type-check
```
Fix any errors reported

## Production Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

### Deploy to Other Platforms
1. Run `npm run build`
2. Upload `dist/` folder to your host
3. Configure routing to serve `index.html` for all routes

## Browser DevTools Tips

1. **React DevTools** - Inspect components
   - Chrome: Extensions → React DevTools
2. **Network Tab** - Check API calls
   - Monitor VITE_API_URL requests
   - Verify response is audio/mp3
3. **Console** - Check for errors
   - API failures logged
   - TypeScript errors surface here

## Performance Optimization

- Tree-shaking enabled in production
- CSS purged for unused classes
- JS minified and gzipped
- Assets optimized automatically

## Next Steps

1. Get API server running
2. Configure `.env.local`
3. Run `npm run dev`
4. Test voice selection and audio generation
5. Build with `npm run build` when ready
6. Deploy!

## Support

- Check `README.md` for detailed documentation
- Check `SETUP_SUMMARY.md` for technical details
- Check individual component files for code comments
- Review `src/types/index.ts` for data structures

---

**Ready to start?** Run: `npm run dev` 🚀
