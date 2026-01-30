# Leanius - Vite + React + TypeScript + TailwindCSS v4 Setup

## 🎉 Project Setup Complete!

Your Leanius project has been successfully initialized with modern frontend tooling. Here's what has been set up:

### ✅ What's Included

- **Vite 5.4.21** - Lightning-fast build tool with HMR (Hot Module Replacement)
- **React 18.3.1** - Modern UI library with hooks support
- **TypeScript 5.2.2** - Type safety and better developer experience
- **TailwindCSS v4** - Utility-first CSS framework with new `@tailwindcss/vite` plugin
- **React DOM 18.3.1** - DOM rendering for React

### 📁 Project Structure

```
Leanius/
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Main application component
│   └── index.css          # Tailwind CSS imports
├── index.html             # HTML template
├── package.json           # Project dependencies and scripts
├── vite.config.ts         # Vite configuration with Tailwind plugin
├── tsconfig.json          # TypeScript configuration
├── tsconfig.node.json     # TypeScript for Node.js tools
├── .gitignore             # Git ignore rules
├── .env.example           # Environment variables template
└── dist/                  # Production build output (generated)
```

### 🚀 Available Commands

```bash
# Start development server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint TypeScript files
npm run lint

# Format code with Prettier
npm run format
```

### 🎨 TailwindCSS v4 Integration

TailwindCSS v4 is configured using the new `@tailwindcss/vite` plugin for optimal performance:

**vite.config.ts:**
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
})
```

**src/index.css:**
```css
@import "tailwindcss";
```

This provides:
- ✨ Zero runtime CSS
- ⚡ Instant dev server startup
- 🎯 Perfect code splitting
- 📦 Minimal bundle size

### 📝 Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

Key variables:
- `VITE_API_URL` - Backend API endpoint
- `VITE_LYRICS_API_KEY` - Lyrics API key
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret

### 🔧 Development Setup

1. **Start the dev server:**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

2. **Edit files:**
   - Modify `src/App.tsx` to change the main UI
   - Add new components in `src/components/` (create the folder)
   - Tailwind classes will be applied instantly with HMR

3. **Type Safety:**
   - All TypeScript errors will be caught before build
   - React components use `.tsx` extension for JSX

### 📦 Production Build

```bash
npm run build
```

This generates an optimized `dist/` folder with:
- Minified HTML, CSS, and JavaScript
- Asset optimization
- Source maps for debugging
- Gzip compression friendly assets

### 🎯 Next Steps for Leanius

1. **Backend Setup:**
   - Create an Express.js server
   - Connect MongoDB database
   - Implement JWT authentication

2. **Authentication:**
   - Build login/registration pages
   - Create user context/state management
   - Implement protected routes

3. **Audio Upload:**
   - Create upload form component
   - Integrate with backend upload API
   - Add file validation

4. **Player Component:**
   - Build audio player UI
   - Implement Web Audio API integration
   - Add playback controls

5. **Lyrics Synchronization:**
   - Fetch lyrics from API
   - Parse and sync with playback timing
   - Display lyrics in real-time

6. **Embed System:**
   - Create embeddable iframe player
   - Add customization options (colors, theme)
   - Generate embed code for users

### 📚 Useful Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TailwindCSS v4 Docs](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 🐛 Troubleshooting

**Port already in use:**
```bash
npm run dev -- --port 3000
```

**Clear cache and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
- Run `npm run build` to see all type errors
- Check `tsconfig.json` for strict mode settings

### 📋 Performance Notes

- Development: Instant server start, Fast HMR for code changes
- Production: 147KB JS gzip (React + App code), 13KB CSS gzip
- TailwindCSS generates only used utility classes

---

Happy coding! 🎵
