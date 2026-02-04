import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmbeddablePlayer } from '../components/EmbeddablePlayer';
import apiClient from '../utils/api';
import { ENDPOINTS } from '../utils/constants';
import { Loader2, AlertCircle } from 'lucide-react';

interface EmbedSong {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  duration?: number;
  frequencyWeight: number;
  syncOffset: number;
  syncType?: string;
  syncedLyrics: Array<{ startTimeMs: number; text: string }>;
}

interface EmbedResponse {
  userId: string;
  songs: EmbedSong[];
  totalSongs: number;
  lastUpdate: string;
}

/**
 * Embed Page - Public page that renders the embeddable player
 * 
 * URL: /embed?key=API_KEY
 * 
 * This page is meant to be embedded in an iframe on external websites.
 * It fetches songs using the API key and displays a random song based on frequency weights.
 */
const EmbedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get('key');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<EmbedSong | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!apiKey) {
        setError('Missing API key. Please provide a valid API key in the URL.');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch songs using the embed endpoint
        const response = await apiClient.get<{ data: EmbedResponse }>(
          `${ENDPOINTS.EMBED.SONGS}?key=${apiKey}`
        );
        
        const data = response.data.data;
        
        if (!data.songs || data.songs.length === 0) {
          setError('No songs found. Please upload some songs first.');
          setIsLoading(false);
          return;
        }

        // Select a song based on frequency weights (weighted random)
        const selectedSong = selectWeightedRandomSong(data.songs);
        setCurrentSong(selectedSong);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch songs:', err);
        
        // Handle specific error messages
        if (err.response?.status === 401) {
          setError('Invalid API key. Please check your API key and try again.');
        } else if (err.response?.status === 429) {
          setError('Rate limit exceeded. Please try again later.');
        } else {
          setError('Failed to load songs. Please try again later.');
        }
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, [apiKey]);

  /**
   * Select a random song based on frequency weights.
   * Higher weight = higher chance of being selected.
   */
  const selectWeightedRandomSong = (songs: EmbedSong[]): EmbedSong => {
    // Calculate total weight
    const totalWeight = songs.reduce((sum, song) => sum + (song.frequencyWeight || 3), 0);
    
    // Generate random number between 0 and total weight
    let random = Math.random() * totalWeight;
    
    // Find the song that corresponds to this random number
    for (const song of songs) {
      random -= song.frequencyWeight || 3;
      if (random <= 0) {
        return song;
      }
    }
    
    // Fallback to first song
    return songs[0];
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading player...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-white font-semibold mb-2">Unable to Load Player</h2>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // No song selected (shouldn't happen, but just in case)
  if (!currentSong) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="text-slate-400">No song available</div>
      </div>
    );
  }

  // Transform the song data to match EmbeddablePlayer's expected format
  const transformedSong = {
    id: currentSong.id,
    title: currentSong.title,
    artist: currentSong.artist,
    audioUrl: currentSong.audioUrl,
    lyricsSync: currentSong.syncedLyrics?.map(line => ({
      timestamp: line.startTimeMs,
      text: line.text,
    })) || [],
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 relative">
      <div className="w-full max-w-md relative z-10">
        <EmbeddablePlayer 
          song={transformedSong}
          autoPlay={true}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default EmbedPage;
