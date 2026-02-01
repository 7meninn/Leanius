# Embed Player Styling Context

This document provides context for future styling improvements to the Leanius embed player.

---

## Overview

Leanius is an embeddable web music player SaaS that displays synced lyrics with video backgrounds. The player has a VS Code / code editor aesthetic.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + TailwindCSS v4
- Backend: Spring Boot 3.2.2 + Java 17 + MongoDB + Azure Blob Storage

---

## Key Files

### Frontend (Player Components)

| File | Purpose |
|------|---------|
| `src/components/EmbeddablePlayer.tsx` | **Main embed player** - The actual player embedded on external sites |
| `src/pages/EmbedPage.tsx` | Wrapper page that fetches songs and renders EmbeddablePlayer |
| `src/pages/dashboard/components/PlayerPreview.tsx` | Dashboard preview player (reference for styling) |
| `src/pages/dashboard/components/VideoBackground.tsx` | Reusable video background component |
| `src/index.css` | Global styles including glassmorphism classes |

### Backend (API)

| File | Purpose |
|------|---------|
| `leanius-backend/.../controller/EmbedController.java` | Public API for embed (`/api/v1/embed/songs`) |
| `leanius-backend/.../service/SongService.java` | Song data handling, includes `toSongDTO()` |
| `leanius-backend/.../dto/SongDTO.java` | Data transfer object with video fields |

---

## Current Player Features

### Visual Elements
- **Glassmorphism effect** - Semi-transparent backgrounds with blur
- **Video background** - Looping video behind lyrics (50% opacity)
- **VS Code aesthetic** - Window controls, file tabs, line numbers, breadcrumbs
- **Synced lyrics** - Highlighted current line with timestamps
- **Staggered animations** - Lines animate in sequentially

### Interactive Elements
- **Run/Stop button** - Green play, red stop (VS Code style)
- **LIVE badge** - Pulsing indicator when playing
- **Video badge** - Shows "BG" when video background is active
- **Hover effects** - Lines highlight on hover

---

## Glassmorphism CSS Classes

Located in `src/index.css`:

```css
.glass {
  background: rgba(13, 17, 23, 0.5);   /* 50% opacity */
  backdrop-filter: blur(12px);
  border: 1px solid rgba(48, 54, 61, 0.6);
}

.glass-dark {
  background: rgba(22, 27, 34, 0.6);   /* 60% opacity */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(48, 54, 61, 0.5);
}

.glass-light {
  background: rgba(48, 54, 61, 0.4);   /* 40% opacity */
  backdrop-filter: blur(8px);
  border: 1px solid rgba(139, 148, 158, 0.2);
}
```

---

## Color Palette (GitHub Dark Theme)

| Color | Hex | Usage |
|-------|-----|-------|
| Background | `#0d1117` | Main background |
| Surface | `#161b22` | Cards, panels |
| Border | `#30363d` | Borders, dividers |
| Text Primary | `#e6edf3` | Main text |
| Text Secondary | `#8b949e` | Muted text |
| Text Muted | `#484f58` | Line numbers |
| Blue | `#58a6ff` | Links, active states |
| Green | `#7ee787` | Success, timestamps |
| Orange | `#ffa657` | Active lyrics |
| Purple | `#a371f7` | Video indicator |
| Red | `#ff7b72` | Errors, stop button |

---

## Video Background Implementation

### EmbeddablePlayer (inline video)
```tsx
{song.videoUrl && (
  <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ zIndex: 0 }}>
    <video
      ref={videoRef}
      src={song.videoUrl}
      muted
      loop
      playsInline
      preload="auto"
      className={`
        absolute inset-0 w-full h-full object-cover
        transition-opacity duration-1000 ease-out
        ${isVideoReady ? 'opacity-50' : 'opacity-0'}
      `}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/30 via-transparent to-[#0d1117]/40" />
  </div>
)}
```

### Key Video States
- `isVideoReady` - Set to true when `canplaythrough` event fires
- Video syncs with audio (play/pause together)
- Opacity: 50% when ready, 0% while loading
- Gradient overlay for text readability

---

## Animations

### Line Entry Animation
```css
@keyframes line-enter {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-line-enter {
  animation: line-enter 0.3s ease-out forwards;
}
```

### Active Line Glow
```css
@keyframes line-glow {
  0%, 100% { box-shadow: inset 0 0 20px rgba(88, 166, 255, 0.1); }
  50% { box-shadow: inset 0 0 30px rgba(88, 166, 255, 0.15); }
}
```

---

## Potential Styling Improvements

### 1. Video Opacity/Visibility
- Current: 50% opacity
- Consider: Dynamic opacity based on content contrast
- Consider: Different overlay gradients

### 2. Lyric Highlighting
- Current: Orange text + blue left border + glow
- Consider: More dramatic highlight effect
- Consider: Smooth color transitions

### 3. Typography
- Current: Monospace font for code aesthetic
- Consider: Font size adjustments for different screen sizes
- Consider: Letter spacing for timestamps

### 4. Window Controls
- Current: Static colored dots
- Consider: Hover effects, click animations

### 5. Progress Indicator
- Current: No progress bar
- Consider: Thin progress bar at bottom
- Consider: Time elapsed display

### 6. Responsive Design
- Current: max-w-md container
- Consider: Fluid sizing for different embed dimensions
- Consider: Compact mode for small embeds

### 7. Theme Variants
- Current: Dark theme only
- Consider: Light theme option
- Consider: Custom color scheme via URL params

---

## API Data Structure

### Song object passed to EmbeddablePlayer
```typescript
interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;      // SAS-signed Azure URL
  videoUrl?: string;     // SAS-signed Azure URL (optional)
  lyricsSync?: Array<{
    timestamp: number;   // milliseconds
    text: string;
  }>;
}
```

### Embed URL Format
```
https://yourdomain.com/embed?key=API_KEY
```

---

## Testing the Embed

1. Start backend: `& "C:\Program Files\Apache\maven\bin\mvn.cmd" spring-boot:run`
2. Start frontend: `npm run dev`
3. Open embed URL: `http://localhost:5173/embed?key=YOUR_API_KEY`

Or use the test file (not committed):
```html
<iframe 
  src="http://localhost:5173/embed?key=YOUR_API_KEY" 
  width="400" 
  height="600"
  frameborder="0"
></iframe>
```

---

## Recent Changes (Session Summary)

1. **Fixed video not showing in embed** - Backend `toSongDTO()` wasn't including `videoUrl` field
2. **Removed FloatingParticles** from PlayerPreview
3. **Removed animated-gradient-border** from both players
4. **Updated glassmorphism CSS** to be more transparent (see through to video)
5. **Added video preloading** - Waits for both audio and video before autoplay
6. **Video syncs with audio** - Play/pause together, video loops independently
