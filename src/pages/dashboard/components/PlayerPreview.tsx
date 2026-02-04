import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Play, Square, Save, Loader2 } from 'lucide-react';
import { usePlayer } from '../../../hooks/usePlayer';
import { useSongsContext } from '../../../context/SongsContext';
import { formatTime } from '../../../utils/lyrics';

/**
 * Glassmorphism Lyrics Player Preview
 * Focused on the final embed look and feel.
 */
export const PlayerPreview: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    currentLyricIndex,
    togglePlayPause,
    adjustLyricTiming,
    getLyricOffset,
  } = usePlayer();

  const { updateSongSettings } = useSongsContext();
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  const [frequencyWeight, setFrequencyWeight] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalOffset, setOriginalOffset] = useState(0);
  const [originalWeight, setOriginalWeight] = useState(3);

  useEffect(() => {
    if (currentSong) {
      const savedWeight = currentSong.frequencyWeight || 3;
      const savedOffset = currentSong.syncOffset || 0;
      setFrequencyWeight(savedWeight);
      setOriginalWeight(savedWeight);
      setOriginalOffset(savedOffset);
      setHasUnsavedChanges(false);
    }
  }, [currentSong?.id]);

  useEffect(() => {
    if (currentSong) {
      const currentOffset = getLyricOffset(currentSong.id);
      const hasSettingsChanges = frequencyWeight !== originalWeight || currentOffset !== originalOffset;
      setHasUnsavedChanges(hasSettingsChanges);
    }
  }, [currentSong, frequencyWeight, originalWeight, originalOffset, getLyricOffset]);

  const lyrics = currentSong?.lyricsSync || [];

  const lyricState = useMemo(() => {
    if (!currentSong || lyrics.length === 0) {
      return { activeIndex: -1 };
    }

    if (currentLyricIndex < 0) {
      return { activeIndex: 0 };
    }

    return { activeIndex: currentLyricIndex };
  }, [currentSong, lyrics, currentLyricIndex]);

  // Auto-scroll to active lyric
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeLine = activeLyricRef.current;
      
      // Calculate the scroll position to position active lyric near the top
      const scrollTop = activeLine.offsetTop - container.offsetTop - 20;
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  }, [lyricState.activeIndex]);

  const handleOffsetChange = (delta: number) => {
    if (!currentSong) return;
    const newOffset = getLyricOffset(currentSong.id) + delta;
    adjustLyricTiming(currentSong.id, newOffset);
  };

  const handleSaveSettings = async () => {
    if (!currentSong || isSaving) return;

    setIsSaving(true);
    try {
      const currentOffset = getLyricOffset(currentSong.id);
      await updateSongSettings(currentSong.id, frequencyWeight, currentOffset);
      setOriginalWeight(frequencyWeight);
      setOriginalOffset(currentOffset);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentSong) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative">
        <div className="w-full max-w-2xl">
          <div className="glass-panel">
            <div className="relative z-10 px-6 py-8 text-center">
              <div className="glass-meta-title">Select a song to preview</div>
              <div className="glass-meta-artist">Pick a track from the sidebar to start playback.</div>
              <button className="glass-control mt-6" disabled>
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const lyricOffset = getLyricOffset(currentSong.id);

  return (
    <div className="h-full flex flex-col relative">
      <div className="glass-panel">
        <div className="relative z-10 p-[clamp(1rem,3cqi,2.5rem)]">
          <div className="glass-layout">
            {/* Lyrics Section - Left Side */}
            <div className="glass-left">
              <div ref={lyricsContainerRef} className="glass-lyrics glass-lyrics-scroll">
                {lyrics.length === 0 ? (
                  <div className="glass-lyric glass-lyric-active">
                    No lyrics available
                  </div>
                ) : (
                  lyrics.map((line, index) => {
                    const isActive = index === lyricState.activeIndex;
                    return (
                      <div
                        key={`${line.timestamp}-${index}`}
                        ref={isActive ? activeLyricRef : null}
                        className={`glass-lyric ${
                          isActive
                            ? 'glass-lyric-active'
                            : 'glass-lyric-next'
                        }`}
                      >
                        {line.text || '—'}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Controls & Meta Section - Right Side */}
            <div className="glass-right">
              <button
                onClick={togglePlayPause}
                className="glass-control"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Square className="fill-current" />
                ) : (
                  <Play className="fill-current" />
                )}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              
              <div>
                <div className="glass-meta-title">{currentSong.title}</div>
                <div className="glass-meta-artist">{currentSong.artist}</div>
              </div>
              
              <div className="glass-meta-time">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-white/90 border border-[var(--border)] rounded-[var(--radius-lg)] p-4">
        <div className="flex flex-col gap-4">
          {lyrics.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Sync Offset</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOffsetChange(-100)}
                  className="px-3 py-1.5 bg-[var(--bg-muted)] hover:bg-white text-[var(--muted-strong)] rounded text-xs font-mono transition-colors border border-[var(--border)]"
                >
                  -0.1s
                </button>
                <span className="text-sm font-mono text-[var(--ink)] min-w-[60px] text-center">
                  {lyricOffset >= 0 ? '+' : ''}{(lyricOffset / 1000).toFixed(1)}s
                </span>
                <button
                  onClick={() => handleOffsetChange(100)}
                  className="px-3 py-1.5 bg-[var(--bg-muted)] hover:bg-white text-[var(--muted-strong)] rounded text-xs font-mono transition-colors border border-[var(--border)]"
                >
                  +0.1s
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--muted)]">Play Frequency</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--muted)]">Less</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setFrequencyWeight(weight)}
                    className={`w-8 h-8 rounded text-xs font-mono transition-colors ${
                      frequencyWeight === weight
                        ? 'bg-[var(--ink)] text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--muted)] hover:bg-white hover:text-[var(--ink)] border border-[var(--border)]'
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
              <span className="text-xs text-[var(--muted)]">More</span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-[var(--border)]">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving || !hasUnsavedChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                hasUnsavedChanges && !isSaving
                  ? 'bg-[var(--ink)] text-white hover:bg-[var(--ink-strong)]'
                  : 'bg-[var(--bg-muted)] text-[var(--muted)] cursor-not-allowed border border-[var(--border)]'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPreview;
