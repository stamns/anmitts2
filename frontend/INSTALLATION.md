# Frontend Installation & Configuration Guide

## System Requirements

- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher (or yarn/pnpm)
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+

## Step-by-Step Installation

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- React 18 and ReactDOM
- TypeScript 5.3
- Vite 7.2
- Tailwind CSS 3.4
- Axios 1.6
- React Icons 4.12
- PostCSS and Autoprefixer
- Type definitions for Node and React

**Expected output**: 160+ packages installed

### 3. Environment Configuration

#### Create Local Environment File
```bash
cp .env.example .env.local
```

#### Edit `.env.local`
```bash
# Using nano
nano .env.local

# Or your favorite editor
# Add your API configuration:
VITE_API_URL=http://your-backend-api:8000
```

**Required Variables:**
- `VITE_API_URL` - Base URL of your TTS API (default: http://localhost:8000)

### 4. Verify Installation

#### Check TypeScript Compilation
```bash
npm run type-check
```

**Expected output**: No errors, clean completion

#### Test Production Build
```bash
npm run build
```

**Expected output:**
```
✓ 82 modules transformed
dist/index.html                   0.48 kB
dist/assets/index-*.css          ~13 kB (gzip: ~3 kB)
dist/assets/index-*.js          ~190 kB (gzip: ~64 kB)
✓ built in 1.71s
```

## Running the Application

### Development Mode
```bash
npm run dev
```

**Features:**
- Hot Module Replacement (HMR) - changes reflect instantly
- Development server on http://localhost:5173
- Full source maps for debugging
- Auto-opening in default browser

**Usage:**
1. Edit and save files in src/
2. Browser automatically refreshes
3. No need to restart server

### Production Mode Preview
```bash
npm run preview
```

This serves the production build locally for testing.

## Configuration Details

### Environment Variables

#### VITE_API_URL
- **Purpose**: Base URL for API calls
- **Default**: http://localhost:8000
- **Example**: 
  - Local: http://localhost:8000
  - Remote: https://api.example.com
  - Docker: http://api-container:8000

**Note**: Must include protocol (http/https)

### TypeScript Configuration

Strict mode enabled:
- `noImplicitAny`: true
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noImplicitReturns`: true
- `noFallthroughCasesInSwitch`: true

### Vite Configuration

- **Port**: 5173 (configurable in vite.config.ts)
- **Module Resolution**: bundler
- **Alias**: @ → src/
- **React Plugin**: @vitejs/plugin-react
- **Environment File**: .env, .env.local, .env.production

### Tailwind CSS Configuration

- **Content**: src/**/*.{js,ts,jsx,tsx}
- **Dark Mode**: class-based (add 'dark' to html)
- **Theme Extension**: Custom colors (primary, success, warning, danger)
- **Plugins**: None (easily extensible)

## Scripts Reference

```bash
npm run dev              # Start dev server with HMR
npm run build           # Production build
npm run preview         # Preview production build
npm run type-check      # TypeScript type checking
npm run lint            # Linting (placeholder for future)
npm audit fix           # Fix npm vulnerabilities
npm audit fix --force   # Force fix (use with caution)
```

## Troubleshooting Installation

### Issue: npm install fails
**Solution:**
```bash
# Clear cache
npm cache clean --force
rm package-lock.json node_modules -rf

# Reinstall
npm install
```

### Issue: Port 5173 already in use
**Solution:**
```bash
# Option 1: Use different port
npm run dev -- --port 3000

# Option 2: Kill process on port
lsof -ti:5173 | xargs kill -9
npm run dev
```

### Issue: node_modules corruption
**Solution:**
```bash
# Fresh install
rm -rf node_modules package-lock.json
npm install
```

### Issue: TypeScript errors during build
**Solution:**
```bash
# Check what's wrong
npm run type-check

# Fix errors in src/ files
# Common issues: unused imports, type mismatches

# Rebuild
npm run build
```

### Issue: Module not found errors
**Solution:**
```bash
# Ensure all dependencies are installed
npm install

# Check import paths are correct
# @ is alias for src/
# Relative imports should use ../../../

# Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

### Issue: API connection errors
**Solution:**
```bash
# Check .env.local has correct API URL
cat .env.local

# Verify API server is running
curl http://localhost:8000/api/voices

# Check browser console for detailed error
# Developer Tools → Console tab
```

## Development Best Practices

### File Naming
- Components: PascalCase (e.g., `TTSForm.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useTTS.ts`)
- Services: camelCase (e.g., `api.ts`)
- Types: Index or domain-based (e.g., `index.ts`)

### Import Paths
```typescript
// Good - using alias
import { TTSForm } from '@/components/TTSForm'
import { useTTS } from '@/hooks/useTTS'

// Acceptable - relative
import { VoiceSelector } from './VoiceSelector'
```

### Component Structure
```typescript
// 1. Imports
import { FC } from 'react'

// 2. Type definitions
interface MyComponentProps {
  // ...
}

// 3. Component
const MyComponent: FC<MyComponentProps> = ({ /* props */ }) => {
  return <div>Content</div>
}

// 4. Export
export const MyComponent
```

## Performance Tuning

### Bundle Size Optimization
```bash
npm run build

# Check bundle size
ls -lh dist/assets/
```

### Development Speed
- Vite provides instant HMR
- Changes save and reload instantly
- No rebuild needed during development

### Production Optimization
- Tree-shaking enabled
- Unused code removed
- CSS purged for unused classes
- JavaScript minified and gzipped

## Next Steps

1. **Configure API**: Update `.env.local` with your API URL
2. **Start Development**: Run `npm run dev`
3. **Test Application**: Enter text and test audio generation
4. **Check Console**: DevTools → Console for any errors
5. **Review Code**: Look at src/ to understand structure
6. **Customize**: Modify components to match your branding

## Deployment Preparation

### Pre-Deployment Checklist
- [ ] Run `npm run type-check` - no errors
- [ ] Run `npm run build` - successful build
- [ ] Test in browser: `npm run preview`
- [ ] Check `.env.local` is NOT committed
- [ ] Verify API URL is production-ready
- [ ] Test with production API server

### Build for Deployment
```bash
npm run build
# Output: dist/ directory ready for upload
```

### Deploy Steps
1. Run `npm run build`
2. Upload contents of `dist/` to your hosting
3. Configure server to serve `index.html` for all routes
4. Set environment variables on hosting platform

## Support & Documentation

- **Quick Start**: See QUICKSTART.md
- **Setup Summary**: See SETUP_SUMMARY.md
- **Main README**: See ../README.md
- **Component Code**: Check src/ files for inline comments
- **Types**: See src/types/index.ts for data structures

## Version Information

As of installation date:
- Node: 16.0.0+
- npm: 7.0.0+
- React: 18.3.1
- TypeScript: 5.3.3
- Vite: 7.2.7
- Tailwind CSS: 3.4.1

---

**Installation Date**: December 2024
**Status**: Ready for Development ✅
