import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Play, Square } from 'lucide-react';
import { formatTime } from '../utils/lyrics';

interface LyricLine {
  timestamp: number;
  text: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  lyricsSync?: LyricLine[];
}

interface EmbeddablePlayerProps {
  song: Song;
  autoPlay?: boolean;
  className?: string;
}

/**
 * Embeddable Lyrics Player - Glassmorphism Version
 */
export const EmbeddablePlayer: React.FC<EmbeddablePlayerProps> = ({
  song,
  autoPlay = false,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [isAudioReady, setIsAudioReady] = useState(false);

  const lyrics = song.lyricsSync || [];

  // Update current lyric based on time
  useEffect(() => {
    if (lyrics.length === 0) return;

    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].timestamp / 1000) {
        index = i;
      } else {
        break;
      }
    }
    setCurrentLyricIndex(index);
  }, [currentTime, lyrics]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentLyricIndex(-1);
    };
    const handleCanPlayThrough = () => setIsAudioReady(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, []);

  // Auto-play when ready
  useEffect(() => {
    if (!autoPlay || !isAudioReady) return;

    const audio = audioRef.current;
    if (!audio) return;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }
  }, [autoPlay, isAudioReady]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  const lyricState = useMemo(() => {
    if (lyrics.length === 0) {
      return { activeIndex: -1 };
    }

    if (currentLyricIndex < 0) {
      return { activeIndex: 0 };
    }

    return { activeIndex: currentLyricIndex };
  }, [currentLyricIndex, lyrics]);

  const duration = audioRef.current?.duration || 0;
  return (
    <div className={`glass-panel ${className}`}>
      <audio ref={audioRef} src={song.audioUrl} preload="auto" />

      <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-8">
        <div className="glass-layout">
          <div className="glass-left">
            <div className="glass-lyrics glass-lyrics-scroll">
              {lyrics.length === 0 ? (
                <div className="glass-lyric glass-lyric-active text-3xl sm:text-4xl">
                  No lyrics available
                </div>
              ) : (
                lyrics.map((line, index) => (
                  <div
                    key={`${line.timestamp}-${index}`}
                    className={`glass-lyric text-2xl sm:text-3xl ${
                      index === lyricState.activeIndex
                        ? 'glass-lyric-active'
                        : 'glass-lyric-next'
                    } ${index === 0 ? '' : 'mt-5'}`}
                  >
                    {line.text || '—'}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-right">
            <button
              onClick={togglePlayPause}
              className="glass-control"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <div>
              <div className="glass-meta-title">{song.title}</div>
              <div className="glass-meta-artist">{song.artist}</div>
            </div>
            <div className="text-xs text-white/60">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddablePlayer;
