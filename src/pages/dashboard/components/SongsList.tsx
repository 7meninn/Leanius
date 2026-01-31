import React, { useState, useMemo } from 'react';
import { Search, Trash2, Play, Music } from 'lucide-react';
import { useSongs } from '../../../hooks/useSongs';
import { usePlayer } from '../../../hooks/usePlayer';
import { useUI } from '../../../hooks/useUI';
import { Song } from '../../../types';
import { APP_CONFIG } from '../../../utils/constants';

/**
 * Songs List component - displays user's uploaded songs
 */
export const SongsList: React.FC = () => {
  const { songs, deleteSong, updateSongWeight, isLoading } = useSongs();
  const { selectSong, currentSong } = usePlayer();
  const { showToast, setActiveTab } = useUI();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    
    const query = searchQuery.toLowerCase();
    return songs.filter(
      song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const handleDelete = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong(songId);
        showToast('success', 'Song deleted successfully');
      } catch (error) {
        showToast('error', error instanceof Error ? error.message : 'Failed to delete song');
      }
    }
  };

  const handleWeightChange = async (songId: string, weight: number) => {
    try {
      await updateSongWeight(songId, weight);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to update weight');
    }
  };

  const handleSongClick = (song: Song) => {
    selectSong(song);
    setActiveTab('preview');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search */}
      <div className="p-4 border-b border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Songs List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && songs.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Loading songs...
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            {searchQuery ? 'No songs match your search' : 'No songs uploaded yet'}
          </div>
        ) : (
          filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              isActive={currentSong?.id === song.id}
              onSelect={() => handleSongClick(song)}
              onDelete={(e) => handleDelete(song.id, e)}
              onWeightChange={(weight) => handleWeightChange(song.id, weight)}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Song Card Component
interface SongCardProps {
  song: Song;
  isActive: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onWeightChange: (weight: number) => void;
}

const SongCard: React.FC<SongCardProps> = ({ song, isActive, onSelect, onDelete, onWeightChange }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isActive
          ? 'bg-blue-600/20 border-blue-500'
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Play Icon */}
        <div className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 ${
          isActive ? 'bg-blue-600' : 'bg-slate-700'
        }`}>
          {isActive ? (
            <Play className="h-5 w-5 text-white" />
          ) : (
            <Music className="h-5 w-5 text-slate-400" />
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{song.title}</h4>
          <p className="text-slate-400 text-sm truncate">{song.artist}</p>

          {/* Weight Slider */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-slate-500">Weight:</span>
            <input
              type="range"
              min={APP_CONFIG.FREQUENCY_WEIGHT_MIN}
              max={APP_CONFIG.FREQUENCY_WEIGHT_MAX}
              value={song.frequencyWeight}
              onChange={(e) => {
                e.stopPropagation();
                onWeightChange(Number(e.target.value));
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-xs text-slate-400 w-4">{song.frequencyWeight}x</span>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SongsList;
