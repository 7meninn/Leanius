import { LyricLine } from '../types';

/**
 * Find the current lyric line based on playback time
 */
export const getCurrentLyricLine = (
  lyrics: LyricLine[],
  currentTime: number,
  offset: number = 0
): LyricLine | null => {
  if (!lyrics || lyrics.length === 0) return null;
  
  const adjustedTime = currentTime + offset;
  
  // Find the last lyric line that should be displayed
  let currentLine: LyricLine | null = null;
  
  for (const line of lyrics) {
    if (line.timestamp <= adjustedTime) {
      currentLine = line;
    } else {
      break;
    }
  }
  
  return currentLine;
};

/**
 * Get the index of the current lyric line
 */
export const getCurrentLyricIndex = (
  lyrics: LyricLine[],
  currentTime: number,
  offset: number = 0
): number => {
  if (!lyrics || lyrics.length === 0) return -1;
  
  const adjustedTime = currentTime + offset;
  
  let currentIndex = -1;
  
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].timestamp <= adjustedTime) {
      currentIndex = i;
    } else {
      break;
    }
  }
  
  return currentIndex;
};

/**
 * Parse LRC format lyrics into LyricLine array
 */
export const parseLrcLyrics = (lrcText: string): LyricLine[] => {
  const lines: LyricLine[] = [];
  const lrcRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/g;
  
  let match;
  while ((match = lrcRegex.exec(lrcText)) !== null) {
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    const milliseconds = match[3].length === 2 
      ? parseInt(match[3], 10) * 10 
      : parseInt(match[3], 10);
    
    const timestamp = (minutes * 60 + seconds) * 1000 + milliseconds;
    const text = match[4].trim();
    
    if (text) {
      lines.push({ timestamp, text });
    }
  }
  
  return lines.sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Format milliseconds to MM:SS display
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format milliseconds to MM:SS.mm for precise display
 */
export const formatTimePrecise = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
};

/**
 * Get upcoming lyrics (next N lines after current)
 */
export const getUpcomingLyrics = (
  lyrics: LyricLine[],
  currentTime: number,
  offset: number = 0,
  count: number = 3
): LyricLine[] => {
  const currentIndex = getCurrentLyricIndex(lyrics, currentTime, offset);
  const startIndex = currentIndex + 1;
  
  if (startIndex >= lyrics.length) return [];
  
  return lyrics.slice(startIndex, startIndex + count);
};

/**
 * Get previous lyrics (last N lines before current)
 */
export const getPreviousLyrics = (
  lyrics: LyricLine[],
  currentTime: number,
  offset: number = 0,
  count: number = 2
): LyricLine[] => {
  const currentIndex = getCurrentLyricIndex(lyrics, currentTime, offset);
  const startIndex = Math.max(0, currentIndex - count);
  
  if (currentIndex <= 0) return [];
  
  return lyrics.slice(startIndex, currentIndex);
};
