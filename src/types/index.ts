// User types
export interface User {
  id: string;
  name: string;
  email: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

// Song types
export interface LyricLine {
  timestamp: number; // milliseconds
  text: string;
}

export interface Song {
  id: string;
  userId: string;
  title: string;
  artist: string;
  audioUrl: string;
  lyrics: string;
  lyricsSync: LyricLine[];
  frequencyWeight: number; // 1-5 multiplier for random selection
  syncOffset: number; // milliseconds offset for lyrics sync
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  email?: string;
}

export interface NewPasswordRequest {
  token: string;
  password: string;
}

export interface ProfileUpdateRequest {
  name?: string;
  email?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SongUploadRequest {
  title: string;
  artist: string;
  audioFile: File;
}

export interface SongUploadResponse {
  songId: string;
  lyrics: string;
  lyricsSync: LyricLine[];
}

export interface LyricsConfirmRequest {
  songId: string;
  confirmed: boolean;
}

export interface SongWeightUpdateRequest {
  weight: number;
}

// Embed types
export interface EmbedCheckResponse {
  valid: boolean;
  userId?: string;
}

export interface EmbedSongsResponse {
  songs: Song[];
}

// Playback Session (for random song selection)
export interface PlaybackSession {
  playedSongIds: string[];
  totalSongs: number;
}

// UI State types
export type DashboardTab = 'preview' | 'settings' | 'embed';

export type AuthModalType = 'login' | 'signup' | 'forgot-password' | null;

// Form types
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface SettingsFormData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UploadSongFormData {
  title: string;
  artist: string;
  audioFile: FileList;
}
