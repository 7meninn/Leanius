# Leanius Frontend Implementation Plan

> **Status**: ✅ Complete & Ready for Implementation  
> **Last Updated**: January 31, 2026  
> **Framework**: React 18.3.1 + TypeScript + Vite + TailwindCSS v4 + shadcn/ui  
> **Purpose**: Comprehensive specification for superior model to execute in a single shot
> **Embed Strategy**: Azure Storage (Server-side, Option A)
> **Player Style**: 2D Beautiful UI (3D enhancement future phase)

---

## 📋 Executive Summary

Leanius is an embeddable music player SaaS with real-time lyrics synchronization. Users upload music with metadata, the system auto-fetches and syncs lyrics, and they get an embed code to paste on their website. The embedded player randomly selects songs from their library (with session-based repeat avoidance) and displays synced lyrics.

---

## 1. PRE-IMPLEMENTATION: Directory Structure

### Project Structure (Page-Based Architecture)

```
src/
├── pages/
│   ├── home/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── Hero.tsx
│   │       ├── HowItWorks.tsx
│   │       ├── Features.tsx
│   │       ├── Testimonials.tsx
│   │       ├── SocialProof.tsx
│   │       ├── AuthModals.tsx (contains Login, Signup, ForgotPassword)
│   │       └── Footer.tsx
│   │
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── components/
│   │       ├── Sidebar.tsx (Navigation: Preview, Settings, Embed, Logout)
│   │       ├── PreviewTab.tsx
│   │       ├── SettingsTab.tsx
│   │       ├── EmbedTab.tsx
│   │       ├── PlayerPreview.tsx (Center section player)
│   │       ├── UploadForm.tsx (Right sidebar - song upload)
│   │       ├── LyricsConfirmation.tsx (Modal after upload)
│   │       └── SongsList.tsx (Right sidebar - uploaded songs)
│   │
│   └── terms/
│       ├── page.tsx
│       └── components/
│           └── TermsContent.tsx
│
├── common/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx (Auth guard wrapper)
│   └── AuthRedirect.tsx (Redirect logged-in users from home)
│
├── context/
│   ├── AuthContext.tsx (User login state, token management)
│   ├── PlayerContext.tsx (Current playing song, playback state)
│   ├── SongsContext.tsx (User's song library)
│   └── UIContext.tsx (Modal states, sidebar tab selection)
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePlayer.ts
│   ├── useSongs.ts
│   ├── useLocalStorage.ts (For lyric timing persistence)
│   └── useAPI.ts
│
├── utils/
│   ├── api.ts (API client with axios/fetch)
│   ├── validation.ts (Form validation logic)
│   ├── constants.ts (API URLs, config)
│   ├── auth.ts (Token management, JWT handling)
│   └── lyrics.ts (Lyric sync utilities)
│
├── types/
│   └── index.ts (All TypeScript interfaces)
│
├── App.tsx
├── main.tsx
├── index.css (Tailwind imports)
└── routes.tsx (React Router configuration)
```

### Key Architectural Principles

✅ **Page-Based Organization** - Each page folder is self-contained and immediately recognizable  
✅ **Shared Components** - Common UI (Header, Footer, Layout) in `common/`  
✅ **State Management via Context** - Auth, Player, Songs, UI state centralized  
✅ **Custom Hooks** - Reusable logic extracted into hooks  
✅ **Single Routes Config** - Centralized routing in `routes.tsx`  
✅ **Type Safety** - All types in `types/index.ts`  
✅ **Local Storage** - For lyric timing persistence (smooth UX)

---

## 2. ROUTES & PAGES

### Route Configuration

```typescript
// routes.tsx - using react-router-dom
const routes = [
  {
    path: '/',
    element: <AuthRedirect><HomePage /></AuthRedirect>,
    // AuthRedirect redirects logged-in users to /dashboard
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
    // ProtectedRoute redirects unauthenticated users to /
  },
  {
    path: '/reset-password/:token',
    element: <ResetPasswordPage />,
  },
];
```

### Page Specifications

#### **Page 1: Home (`/`)**

**Layout**: Cal.com-inspired vertical flow with embedded auth forms

**Sections**:
1. **Header** - Logo, navigation links, Sign In button
2. **Hero Section** - Main headline + CTA buttons
3. **Social Proof** - "Trusted by..." company logos carousel
4. **How It Works** - 3-step walkthrough with visuals
5. **Features Section** - Feature cards grid
6. **Testimonials** - User reviews carousel
7. **Final CTA** - Sign up call-to-action
8. **Footer** - Links, social, company info

**Auth Forms** (Visible on same page, switchable):

**Signup Modal**:
```
Name
Email
Password
Confirm Password
☐ I agree to Terms & Conditions
[SIGN UP]
Have an account? → Switch to Login
```

**Login Modal**:
```
Email
Password
[LOGIN]
Forgot Password? → Switch to Reset
Need an account? → Switch to Signup
```

**Forgot Password Modal**:
```
Email
[SEND RESET LINK]
Back to Login
```

**Behavior**:
- Forms displayed side-by-side (Cal.com style) with hero on left, forms on right
- Switchable between Signup/Login/ForgotPassword modals
- If user is already logged in → redirect to `/dashboard`
- After successful login → redirect to `/dashboard`
- Forgot password → sends reset email with link to `/reset-password/:token`

---

#### **Page 2: Dashboard (`/dashboard`)**

**Layout**: 3-column design with left sidebar navigation

**Left Sidebar Navigation**:
```
🎵 LEANIUS (Logo/Brand) - top

🎵 PREVIEW    (Player testing & tweaking)
⚙️  SETTINGS   (User profile & password)
🔗 EMBED      (Embed instructions & code)
🚪 LOGOUT     (Direct logout, no confirm)
```

**Center Section** (changes based on selected tab):

**Tab 1: PREVIEW** (Default view)
- Shows audio player UI for testing
- Displays: Play/Pause button, Progress bar, Current playing lyric, Time display
- NO Next/Previous buttons (song repeats until another is selected)
- Real-time lyric timing adjustment with localStorage persistence
- Blank if no song selected
- Selected song repeats until user clicks another song from right sidebar

**Tab 2: SETTINGS**
- Form with fields:
  - Name (current value prefilled)
  - Email (current value prefilled, read-only or editable?)
  - Current Password
  - New Password
  - Confirm New Password
- [SAVE CHANGES] button
- Success/error messages

**Tab 3: EMBED**
- Section title: "How to Embed Your Leanius Player"
- Step-by-step instructions (3 steps)
- Code block with pre-integrated embed code:
  ```html
  <iframe 
    src="https://leanius.com/embed?key=USER_API_KEY_HERE" 
    width="400" 
    height="600">
  </iframe>
  ```
  (API key is auto-integrated, no regeneration needed)
- [COPY TO CLIPBOARD] button
- Visual example showing how it looks embedded

**Right Sidebar** (Always visible, 2 vertical sections):

**Section 1: Add Song Form**
- Title (text input)
- Artist (text input)
- Audio File (file upload)
- [ADD SONG] button
- After upload → **Lyrics Confirmation Modal**:
  ```
  "Does the song start like this?"
  [First few lines of auto-fetched lyrics]
  [YES]  [NO]
  ```
  - YES → Song added to library, stored on Azure
  - NO → Upload rejected, user can try another song

**Section 2: Uploaded Songs List** (Searchable, Scrollable)
- Search bar (filter by title or artist)
- List of songs:
  ```
  [Song Title]
  [Artist Name]
  [Frequency Weight Slider: 1x - 5x]
  [Delete Button]
  ```
- Click song to play in PREVIEW tab
- Each song card shows frequency weight for randomization bias
- Delete removes song from library

**Behavior**:
- Dashboard only accessible when authenticated (ProtectedRoute)
- Clicking PREVIEW tab shows player with right sidebar visible
- Clicking SETTINGS tab shows settings form, right sidebar still visible but may be disabled/secondary
- Clicking EMBED tab shows embed instructions, right sidebar still visible
- LOGOUT button triggers direct logout (no confirmation modal)
- localStorage stores lyric timing adjustments for each song

---

#### **Page 3: Terms & Conditions (`/terms`)**

- Static page with Terms & Conditions content
- Content to be added later
- Public page (no authentication required)
- Linked from signup form checkbox

---

#### **Page 4: Password Reset (`/reset-password/:token`)**

- Form with: New Password, Confirm Password
- [RESET PASSWORD] button
- After success → redirect to `/` with success message
- After failure/token expired → show error message with link back to login

---

## 3. EMBEDDING STRATEGY

### Architecture: Option A (Server-Side Data)

**Data Storage**:
- Audio files → Azure Storage
- Metadata, lyrics, sync info → Backend database (MongoDB)
- User credentials never exposed in embed

**Embed Flow**:
```
User generates unique API Key
    ↓
Backend creates embed code with API key embedded:
<iframe src="https://leanius.com/embed?key=embed_abc123" 
        width="400" height="600"></iframe>
    ↓
User pastes on their website
    ↓
Embed loads in iframe
    ↓
Embedded player makes API calls with key to fetch user's songs
    ↓
Backend validates key, serves only that user's songs
    ↓
Player randomly selects song (avoiding repeats in session)
    ↓
Displays audio with synced lyrics
```

**Random Playback Logic**:
- Session-based: Track played songs in current session
- On "next song" → randomly pick from songs NOT played in current session
- When all songs played once → reset session, start fresh random selection
- Frequency weights applied: Higher weight = higher probability in random selection

**Example with weights**:
```
Song A: weight 1x (base probability)
Song B: weight 3x (3x more likely to be picked)
Song C: weight 1x (base probability)

Random pick probability:
Song A: 20% (1/5)
Song B: 60% (3/5)
Song C: 20% (1/5)
```

---

## 4. CONTENT: "What is Leanius" & "How It Works"

### Hero Section Content

```
🎵 Leanius - Embeddable Music Player with Real-Time Lyrics Sync

"The easiest way to embed a beautiful, synced lyrics music player 
on your website. Upload your music, we handle the rest."

Key Features:
- Upload once, sync anywhere
- Automatic lyrics fetching & perfect synchronization
- Randomized playback for discovery
- Beautiful, fully responsive player
- Works anywhere with a simple embed code
```

### How It Works Section (3-Step Walkthrough)

**Step 1: Upload & Organize**
```
Icon: 📤 Upload
Title: Upload Your Music
Description: 
- Upload your audio files to Leanius
- Add song metadata (title, artist)
- System auto-fetches lyrics from multiple sources
- Perfect lyrics timing synchronization done automatically
```

**Step 2: Generate Embed Code**
```
Icon: 🔑 Generate
Title: Generate Embed Code
Description:
- One-click embed code generation
- Your unique API key pre-integrated
- Copy the code to your clipboard
- Customize player appearance (future feature)
```

**Step 3: Embed Anywhere**
```
Icon: 🌐 Embed
Title: Embed on Your Website
Description:
- Paste the embed code on your website/blog
- Player randomly selects songs from your library
- Visitors enjoy beautiful synced lyrics playback
- No configuration needed on their end
```

---

## 5. DATA MODELS & API INTEGRATION

### Key Data Models (TypeScript Interfaces)

```typescript
// User
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Song
interface Song {
  id: string;
  userId: string;
  title: string;
  artist: string;
  audioUrl: string; // Azure Storage URL
  lyrics: string; // Raw lyrics text
  lyricsSync: LyricLine[]; // Synced lyrics with timings
  frequencyWeight: number; // 1-5 multiplier for random selection
  createdAt: Date;
}

// Lyric Line (for sync)
interface LyricLine {
  timestamp: number; // milliseconds
  text: string;
}

// Embed API Key
interface EmbedApiKey {
  userId: string;
  key: string; // unique API key
  createdAt: Date;
}

// Session State (for random playback)
interface PlaybackSession {
  playedSongIds: string[];
  totalSongs: number;
}
```

### API Integration Points

**Backend Endpoints** (to be implemented by backend team):

```
Authentication:
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password
POST   /api/auth/verify-reset-token

Songs:
POST   /api/songs (upload + create)
GET    /api/songs (get user's songs)
DELETE /api/songs/:id
PUT    /api/songs/:id/weight (update frequency weight)

Lyrics:
GET    /api/lyrics/:songId (get lyrics for preview)
POST   /api/lyrics/confirm (confirm auto-fetched lyrics)

Embed:
GET    /api/embed/key (get user's API key)
GET    /api/embed/songs?key=xxx (get songs for embedded player)

User:
GET    /api/user/profile
PUT    /api/user/profile
PUT    /api/user/password
```

### Frontend API Client Setup

```typescript
// utils/api.ts - using axios with auth interceptor
import axios from 'axios';

const API_BASE = process.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE,
});

// Auth interceptor for JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh/logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 6. STATE MANAGEMENT (Context API)

### Context Structures

**AuthContext**:
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}
```

**PlayerContext**:
```typescript
interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number; // milliseconds
  duration: number;
  currentLyricLine: LyricLine | null;
  lyricsAdjustment: { [songId: string]: number }; // stored in localStorage
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  selectSong: (song: Song) => void;
  getNextRandomSong: (songs: Song[], playedSongs: string[]) => Song;
  adjustLyricTiming: (songId: string, offset: number) => void;
}
```

**SongsContext**:
```typescript
interface SongsContextType {
  songs: Song[];
  isLoading: boolean;
  addSong: (title: string, artist: string, file: File) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
  updateSongWeight: (songId: string, weight: number) => Promise<void>;
  fetchSongs: () => Promise<void>;
}
```

**UIContext**:
```typescript
interface UIContextType {
  activeTab: 'preview' | 'settings' | 'embed';
  setActiveTab: (tab: 'preview' | 'settings' | 'embed') => void;
  showLyricsConfirmation: boolean;
  setShowLyricsConfirmation: (show: boolean) => void;
  pendingLyrics: string; // for confirmation modal
  setPendingLyrics: (lyrics: string) => void;
}
```

---

## 7. CUSTOM HOOKS

### useAuth Hook

```typescript
const useAuth = () => {
  const { user, isAuthenticated, login, signup, logout, updateProfile, changePassword } 
    = useContext(AuthContext);
  
  return { user, isAuthenticated, login, signup, logout, updateProfile, changePassword };
};
```

### usePlayer Hook

```typescript
const usePlayer = () => {
  const { currentSong, isPlaying, currentTime, duration, currentLyricLine, play, pause, seek, selectSong, getNextRandomSong, adjustLyricTiming } 
    = useContext(PlayerContext);
  
  return { currentSong, isPlaying, currentTime, duration, currentLyricLine, play, pause, seek, selectSong, getNextRandomSong, adjustLyricTiming };
};
```

### useLocalStorage Hook

```typescript
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  });

  const setValue = (value: T) => {
    setStoredValue(value);
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  return [storedValue, setValue] as const;
};

// Usage: const [lyricsAdjustment, setLyricsAdjustment] = useLocalStorage('lyricsAdjustment', {});
```

---

## 8. FORMS & VALIDATION

### Form Validation Strategy

Use **react-hook-form** + **zod** for validation:

```typescript
// Signup Validation Schema
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, 'Must agree to terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login Validation Schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password required'),
});

// Add Song Validation Schema
const addSongSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  file: z.instanceof(File).refine(
    (file) => ['audio/mpeg', 'audio/wav', 'audio/ogg'].includes(file.type),
    'Invalid audio format'
  ),
});
```

---

## 9. UI COMPONENTS (shadcn/ui Integration)

### Components to Use

**From shadcn/ui**:
```
- Button
- Input
- Form (react-hook-form wrapper)
- Card
- Dialog/Modal
- Tabs
- Slider (for frequency weight)
- SearchInput / Input with search icon
- Textarea (for password form)
- Checkbox
- Select
- Progress (for audio progress bar)
```

### Custom Components Needed

```typescript
// pages/home/components/Hero.tsx
export const Hero = () => {}

// pages/home/components/HowItWorks.tsx
export const HowItWorks = () => {}

// pages/home/components/Features.tsx
export const Features = () => {}

// pages/home/components/AuthModals.tsx
export const AuthModals = () => {}

// pages/dashboard/components/PlayerPreview.tsx
export const PlayerPreview = () => {}

// pages/dashboard/components/UploadForm.tsx
export const UploadForm = () => {}

// pages/dashboard/components/SongsList.tsx
export const SongsList = () => {}

// pages/dashboard/components/LyricsConfirmation.tsx
export const LyricsConfirmation = () => {}

// pages/dashboard/components/SettingsTab.tsx
export const SettingsTab = () => {}

// pages/dashboard/components/EmbedTab.tsx
export const EmbedTab = () => {}
```

---

## 10. ROUTING SETUP

### React Router Configuration

```typescript
// routes.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthRedirect><HomePage /></AuthRedirect>,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
  },
  {
    path: '/reset-password/:token',
    element: <ResetPasswordPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

// In main.tsx
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

---

## 11. AUTHENTICATION FLOW

### JWT Token Management

```typescript
// utils/auth.ts
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
  // Optionally set token expiry for reminder
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isTokenExpired = (token: string): boolean => {
  // Decode JWT and check expiry
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
};
```

### Authentication Guard Components

```typescript
// common/ProtectedRoute.tsx
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/" />;
  
  return <>{children}</>;
};

// common/AuthRedirect.tsx
export const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
};
```

---

## 12. STYLING & THEME

### TailwindCSS Configuration

- Use **TailwindCSS v4** with `@tailwindcss/vite` plugin
- Dark theme (slate palette) as primary
- Color scheme:
  ```
  Primary: blue-600
  Secondary: slate-900 / slate-800
  Accent: emerald-600
  Borders: slate-700 / slate-600
  Text: slate-300 / slate-400
  ```

### Design System

```css
/* index.css */
@import "tailwindcss";

/* Custom theme variables if needed */
@layer base {
  :root {
    /* Can add CSS variables here if needed */
  }
}

@layer components {
  /* Custom component classes */
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
  }
  
  .card {
    @apply bg-slate-800 border border-slate-700 rounded-lg p-4;
  }
}
```

---

## 13. LOCAL STORAGE STRATEGY

### Persistent Data

```typescript
// localStorage keys
'authToken' - JWT authentication token
'lyricsAdjustment' - { [songId]: offsetInMs }
'userPreferences' - theme, layout preferences (future)
'playbackSession' - { playedSongIds: [], totalSongs: number }

// Example usage in PlayerContext
const getLyricsAdjustment = (songId: string): number => {
  const adjustments = JSON.parse(localStorage.getItem('lyricsAdjustment') || '{}');
  return adjustments[songId] || 0;
};

const saveLyricsAdjustment = (songId: string, offset: number) => {
  const adjustments = JSON.parse(localStorage.getItem('lyricsAdjustment') || '{}');
  adjustments[songId] = offset;
  localStorage.setItem('lyricsAdjustment', JSON.stringify(adjustments));
};
```

---

## 14. PERFORMANCE CONSIDERATIONS

- **Code Splitting**: Lazy load dashboard and terms pages
- **Image Optimization**: Use WebP for hero images, optimize SVGs
- **Bundle Size**: Tree-shake unused shadcn/ui components
- **Audio Loading**: Stream audio from Azure Storage, don't load fully into memory
- **Lyrics Sync**: Use requestAnimationFrame for smooth real-time lyric updates
- **Search Performance**: Debounce search in songs list (300ms)

---

## 15. ENVIRONMENT VARIABLES

```bash
# .env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Leanius
VITE_AZURE_STORAGE_URL=https://yourstorage.blob.core.windows.net
```

---

## 16. DEPENDENCIES TO ADD

```json
{
  "react-router-dom": "^6.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "axios": "^1.x",
  "@radix-ui/react-*": "latest",
  "shadcn-ui": "latest"
}
```

---

## 17. IMPLEMENTATION CHECKLIST

### Phase 1: Core Setup
- [ ] Install dependencies (react-router-dom, react-hook-form, zod, axios, shadcn/ui)
- [ ] Set up directory structure (pages/, common/, context/, hooks/, utils/, types/)
- [ ] Create routes configuration
- [ ] Set up AuthContext, PlayerContext, SongsContext, UIContext
- [ ] Create ProtectedRoute and AuthRedirect wrappers

### Phase 2: Homepage
- [ ] Build Hero section
- [ ] Build HowItWorks section
- [ ] Build Features section
- [ ] Build Testimonials carousel
- [ ] Build AuthModals (Signup, Login, ForgotPassword)
- [ ] Style with TailwindCSS

### Phase 3: Authentication
- [ ] Create signup form with validation
- [ ] Create login form with validation
- [ ] Create forgot password form
- [ ] Create password reset page
- [ ] Create Terms & Conditions page
- [ ] Implement JWT token management

### Phase 4: Dashboard
- [ ] Build 3-column layout (sidebar, center, right)
- [ ] Build left sidebar navigation
- [ ] Build PREVIEW tab with player UI
- [ ] Build SETTINGS tab with form
- [ ] Build EMBED tab with instructions
- [ ] Build upload form component
- [ ] Build lyrics confirmation modal
- [ ] Build songs list with search & scroll
- [ ] Implement localStorage for lyric timing

### Phase 5: Player & Logic
- [ ] Implement audio playback controls
- [ ] Implement real-time lyric sync
- [ ] Implement random song selection with frequency weights
- [ ] Implement session-based repeat avoidance
- [ ] Test player preview UI

### Phase 6: Integration & Polish
- [ ] Connect API endpoints
- [ ] Test all forms and validation
- [ ] Test authentication flows
- [ ] Test player functionality
- [ ] Responsive design testing
- [ ] Performance optimization
- [ ] Error handling & user feedback

---

## 18. NOTES FOR IMPLEMENTATION

1. **Auth Token Refresh**: Implement token refresh logic if backend returns refresh tokens
2. **Error Handling**: Show user-friendly error messages for all API failures
3. **Loading States**: Add skeleton loaders during data fetching
4. **Responsive Design**: Ensure mobile-friendly layout (3-column dashboard may stack on mobile)
5. **Accessibility**: Use semantic HTML, ARIA labels, keyboard navigation
6. **Future Enhancements**: 
   - 3D player visualization
   - Player customization (colors, layout)
   - Playlist creation
   - Social sharing
   - Analytics dashboard

---

**Document Status**: ✅ Ready for Superior Model Implementation

This specification is comprehensive and detailed enough for a superior model to execute the entire frontend in a single shot. All pages, components, flows, and technical decisions are documented.
