import React, { useState, useMemo } from 'react';
import { Search, Trash2, Play, Music } from 'lucide-react';
import { useSongs } from '../../../hooks/useSongs';
import { usePlayer } from '../../../hooks/usePlayer';
import { useUI } from '../../../hooks/useUI';
import { Song } from '../../../types';

/**
 * Songs List component - displays user's uploaded songs
 */
export const SongsList: React.FC = () => {
  const { songs, deleteSong, isLoading } = useSongs();
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

  const handleSongClick = (song: Song) => {
    selectSong(song);
    setActiveTab('preview');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs..."
            className="input-base pl-10 text-sm"
          />
        </div>
      </div>

      {/* Songs List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && songs.length === 0 ? (
          <div className="text-center text-[var(--muted)] py-8">
            Loading songs...
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center text-[var(--muted)] py-8">
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
}

const SongCard: React.FC<SongCardProps> = ({ song, isActive, onSelect, onDelete }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-[var(--radius-md)] border cursor-pointer transition-all ${
        isActive
          ? 'bg-[var(--accent-soft)] border-[var(--accent)]'
          : 'bg-white border-[var(--border)] hover:border-[var(--ink)]'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Play Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isActive ? 'bg-[var(--ink)]' : 'bg-[var(--bg-muted)]'
        }`}>
          {isActive ? (
            <Play className="h-5 w-5 text-white" />
          ) : (
            <Music className="h-5 w-5 text-[var(--muted)]" />
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[var(--ink)] font-medium truncate">{song.title}</h4>
          <p className="text-[var(--muted)] text-sm truncate">{song.artist}</p>
        </div>

        {/* Delete Button */}
        <button
          onClick={onDelete}
          className="p-2 text-[var(--muted)] hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SongsList;
