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
 * Embeddable Lyrics Player - Responsive Glassmorphism Version
 * Scales beautifully from phone screens to billboards using container queries
 */
export const EmbeddablePlayer: React.FC<EmbeddablePlayerProps> = ({
  song,
  autoPlay = false,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

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

  // Auto-scroll to active lyric
  useEffect(() => {
    if (activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeLine = activeLyricRef.current;
      
      const scrollTop = activeLine.offsetTop - container.offsetTop - 20;
      
      container.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
    }
  }, [currentLyricIndex]);

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
              <div className="glass-meta-title">{song.title}</div>
              <div className="glass-meta-artist">{song.artist}</div>
            </div>
            
            <div className="glass-meta-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmbeddablePlayer;
