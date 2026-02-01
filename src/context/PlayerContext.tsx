import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { Song, LyricLine } from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { getCurrentLyricLine, getCurrentLyricIndex } from '../utils/lyrics';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number; // milliseconds
  duration: number; // milliseconds
  currentLyricLine: LyricLine | null;
  currentLyricIndex: number;
  lyricsAdjustment: Record<string, number>; // songId -> offset in ms
  audioRef: React.RefObject<HTMLAudioElement | null>;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  selectSong: (song: Song) => void;
  clearSong: () => void;
  adjustLyricTiming: (songId: string, offset: number) => void;
  getLyricOffset: (songId: string) => number;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

interface PlayerProviderProps {
  children: ReactNode;
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentLyricLine, setCurrentLyricLine] = useState<LyricLine | null>(null);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [lyricsAdjustment, setLyricsAdjustment] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LYRICS_ADJUSTMENT);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Save lyrics adjustments to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LYRICS_ADJUSTMENT, JSON.stringify(lyricsAdjustment));
  }, [lyricsAdjustment]);

  // Update current lyric based on playback time
  const updateCurrentLyric = useCallback(() => {
    if (!currentSong || !currentSong.lyricsSync) return;
    
    const offset = lyricsAdjustment[currentSong.id] || 0;
    const currentTimeMs = currentTime;
    
    const line = getCurrentLyricLine(currentSong.lyricsSync, currentTimeMs, offset);
    const index = getCurrentLyricIndex(currentSong.lyricsSync, currentTimeMs, offset);
    
    setCurrentLyricLine(line);
    setCurrentLyricIndex(index);
  }, [currentSong, currentTime, lyricsAdjustment]);

  useEffect(() => {
    updateCurrentLyric();
  }, [updateCurrentLyric]);

  // Animation frame loop for smooth time updates
  const startTimeUpdate = useCallback(() => {
    const update = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime * 1000);
        // Also update duration if not set yet (fallback for some audio formats)
        if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
          setDuration(prevDuration => {
            const newDuration = audioRef.current!.duration * 1000;
            // Only update if significantly different to avoid re-renders
            if (Math.abs(prevDuration - newDuration) > 100) {
              return newDuration;
            }
            return prevDuration;
          });
        }
      }
      animationFrameRef.current = requestAnimationFrame(update);
    };
    animationFrameRef.current = requestAnimationFrame(update);
  }, []);

  const stopTimeUpdate = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimeUpdate();
    };
  }, [stopTimeUpdate]);

  const play = useCallback(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.play();
      setIsPlaying(true);
      startTimeUpdate();
    }
  }, [currentSong, startTimeUpdate]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopTimeUpdate();
    }
  }, [stopTimeUpdate]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time / 1000; // Convert ms to seconds
      setCurrentTime(time);
    }
  }, []);

  const selectSong = useCallback((song: Song) => {
    // Stop current playback
    if (audioRef.current) {
      audioRef.current.pause();
      stopTimeUpdate();
    }
    
    setCurrentSong(song);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrentLyricLine(null);
    setCurrentLyricIndex(-1);
    
    // Initialize lyrics adjustment from song's syncOffset (from database)
    // This allows the saved offset to be loaded when selecting a song
    if (song.syncOffset !== undefined) {
      setLyricsAdjustment(prev => ({
        ...prev,
        [song.id]: song.syncOffset,
      }));
    }
  }, [stopTimeUpdate]);

  const clearSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      stopTimeUpdate();
    }
    
    setCurrentSong(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrentLyricLine(null);
    setCurrentLyricIndex(-1);
  }, [stopTimeUpdate]);

  const adjustLyricTiming = useCallback((songId: string, offset: number) => {
    setLyricsAdjustment(prev => ({
      ...prev,
      [songId]: offset,
    }));
  }, []);

  const getLyricOffset = useCallback((songId: string): number => {
    return lyricsAdjustment[songId] || 0;
  }, [lyricsAdjustment]);

  // Handle audio element events
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration * 1000);
    }
  }, []);

  const handleDurationChange = useCallback(() => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration * 1000);
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration * 1000);
    }
  }, []);

  const handleEnded = useCallback(() => {
    // Song ended - in preview mode, we could auto-repeat or stop
    setIsPlaying(false);
    stopTimeUpdate();
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [stopTimeUpdate]);

  // Set up audio element event listeners when song changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    // Check if duration is already available
    if (audio.duration && isFinite(audio.duration)) {
      setDuration(audio.duration * 1000);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [handleLoadedMetadata, handleDurationChange, handleCanPlay, handleEnded, currentSong]);

  const value: PlayerContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    currentLyricLine,
    currentLyricIndex,
    lyricsAdjustment,
    audioRef,
    play,
    pause,
    togglePlayPause,
    seek,
    selectSong,
    clearSong,
    adjustLyricTiming,
    getLyricOffset,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* Hidden audio element */}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.audioUrl}
          preload="metadata"
          style={{ display: 'none' }}
        />
      )}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};

export default PlayerContext;
