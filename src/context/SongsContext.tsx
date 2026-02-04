import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Song, LyricLine } from '../types';
import apiClient, { getErrorMessage, createFormData } from '../utils/api';
import { ENDPOINTS } from '../utils/constants';

interface PendingSong {
  songId: string;
  lyrics: string;
  lyricsSync: LyricLine[];
  syncType?: string;
  lyricsFound?: boolean;
}

interface SongsContextType {
  songs: Song[];
  isLoading: boolean;
  error: string | null;
  pendingSong: PendingSong | null;
  fetchSongs: () => Promise<void>;
  uploadSong: (title: string, artist: string, audioFile: File) => Promise<void>;
  confirmLyrics: (songId: string, confirmed: boolean) => Promise<void>;
  deleteSong: (songId: string) => Promise<void>;
  updateSongWeight: (songId: string, weight: number) => Promise<void>;
  updateSongSettings: (songId: string, frequencyWeight: number, syncOffset: number) => Promise<void>;
  clearPendingSong: () => void;
  clearError: () => void;
}

const SongsContext = createContext<SongsContextType | undefined>(undefined);

interface SongsProviderProps {
  children: ReactNode;
}

export const SongsProvider: React.FC<SongsProviderProps> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSong, setPendingSong] = useState<PendingSong | null>(null);

  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(ENDPOINTS.SONGS.LIST);
      const rawSongs = response.data.data || [];
      
      // Map backend response to frontend Song type
      const mappedSongs: Song[] = rawSongs.map((song: any) => ({
        id: song.id,
        userId: song.userId || '',
        title: song.title,
        artist: song.artist,
        audioUrl: song.audioUrl,
        lyrics: song.lyrics || '',
        // Map syncedLyrics (backend) to lyricsSync (frontend)
        // Map startTimeMs (backend) to timestamp (frontend)
        lyricsSync: (song.syncedLyrics || []).map((line: any) => ({
          timestamp: line.startTimeMs,
          text: line.text,
        })),
        frequencyWeight: song.frequencyWeight || 3,
        syncOffset: song.syncOffset || 0,
        createdAt: song.createdAt || '',
      }));
      
      setSongs(mappedSongs);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadSong = useCallback(async (title: string, artist: string, audioFile: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = createFormData({
        title,
        artist,
        file: audioFile,  // Backend expects 'file', not 'audioFile'
      });

      const response = await apiClient.post(ENDPOINTS.SONGS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes for large file uploads (FLAC files can be slow)
      });

      const { songId, lyricsPreview, syncType, lyricsFound } = response.data.data;
      
      // Store pending song for lyrics confirmation
      // Backend returns 'lyricsPreview' not 'lyrics'
      setPendingSong({ 
        songId, 
        lyrics: lyricsPreview || '', 
        lyricsSync: [], // Backend doesn't return full sync data at upload stage
        syncType,
        lyricsFound 
      });
    } catch (err) {
      setError(getErrorMessage(err));
      throw new Error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const confirmLyrics = useCallback(async (songId: string, confirmed: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post(ENDPOINTS.SONGS.CONFIRM_LYRICS, { songId, confirmed });
      
      // If confirmed, refresh songs list to include new song
      if (confirmed) {
        await fetchSongs();
      }
      
      // Clear pending song
      setPendingSong(null);
    } catch (err) {
      setError(getErrorMessage(err));
      throw new Error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [fetchSongs]);

  const deleteSong = useCallback(async (songId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.delete(ENDPOINTS.SONGS.DELETE(songId));
      
      // Remove song from local state
      setSongs(prev => prev.filter(song => song.id !== songId));
    } catch (err) {
      setError(getErrorMessage(err));
      throw new Error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSongWeight = useCallback(async (songId: string, weight: number) => {
    setError(null);
    try {
      await apiClient.put(ENDPOINTS.SONGS.UPDATE_WEIGHT(songId), { weight });
      
      // Update local state
      setSongs(prev => prev.map(song => 
        song.id === songId ? { ...song, frequencyWeight: weight } : song
      ));
    } catch (err) {
      setError(getErrorMessage(err));
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const updateSongSettings = useCallback(async (songId: string, frequencyWeight: number, syncOffset: number) => {
    setError(null);
    try {
      await apiClient.put(ENDPOINTS.SONGS.UPDATE_SETTINGS(songId), { frequencyWeight, syncOffset });
      
      // Update local state
      setSongs(prev => prev.map(song => 
        song.id === songId ? { ...song, frequencyWeight, syncOffset } : song
      ));
    } catch (err) {
      setError(getErrorMessage(err));
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const clearPendingSong = useCallback(() => {
    setPendingSong(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: SongsContextType = {
    songs,
    isLoading,
    error,
    pendingSong,
    fetchSongs,
    uploadSong,
    confirmLyrics,
    deleteSong,
    updateSongWeight,
    updateSongSettings,
    clearPendingSong,
    clearError,
  };

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>;
};

export const useSongsContext = (): SongsContextType => {
  const context = useContext(SongsContext);
  if (context === undefined) {
    throw new Error('useSongsContext must be used within a SongsProvider');
  }
  return context;
};

export default SongsContext;
