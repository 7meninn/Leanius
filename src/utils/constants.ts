// API URLs and configuration constants

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_RESET_TOKEN: (token: string) => `/auth/verify-reset-token/${token}`,
  },
  // User
  USER: {
    PROFILE: '/user/profile',
    PASSWORD: '/user/password',
  },
  // Songs
  SONGS: {
    LIST: '/songs',
    UPLOAD: '/songs/upload',
    CONFIRM_LYRICS: '/songs/confirm-lyrics',
    DELETE: (songId: string) => `/songs/${songId}`,
    UPDATE_WEIGHT: (songId: string) => `/songs/${songId}/weight`,
    UPDATE_SETTINGS: (songId: string) => `/songs/${songId}/settings`,
  },
  // Embed
  EMBED: {
    CHECK: '/embed/check',
    SONGS: '/embed/songs',
  },
  // Health
  HEALTH: '/health',
} as const;

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Leanius',
  APP_TAGLINE: 'Embeddable Music Player with Real-Time Lyrics Sync',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/flac', 'audio/x-flac'],
  MIN_PASSWORD_LENGTH: 8,
  FREQUENCY_WEIGHT_MIN: 1,
  FREQUENCY_WEIGHT_MAX: 5,
  SEARCH_DEBOUNCE_MS: 300,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  LYRICS_ADJUSTMENT: 'lyricsAdjustment',
  USER_PREFERENCES: 'userPreferences',
  PLAYBACK_SESSION: 'playbackSession',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TERMS: '/terms',
  RESET_PASSWORD: '/reset-password/:token',
} as const;
// Trigger rebuild
