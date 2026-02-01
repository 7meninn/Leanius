import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Music, Play, Square, Video } from 'lucide-react';
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
  videoUrl?: string;
}

interface EmbeddablePlayerProps {
  song: Song;
  autoPlay?: boolean;
  className?: string;
}

/**
 * Embeddable Lyrics Player - Production Version
 * 
 * This is the clean player that gets embedded on external sites.
 * Matches the visual style of the Dashboard PlayerPreview including:
 * - Video backgrounds (preloaded)
 * - Hover effects
 * - Staggered line animations
 * - Video indicator badge
 * - LIVE indicator
 * - Synced lyrics display
 */
export const EmbeddablePlayer: React.FC<EmbeddablePlayerProps> = ({
  song,
  autoPlay = false,
  className = '',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const lyrics = song.lyricsSync || [];
  const hasVideo = !!song.videoUrl;

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

  // Auto-scroll to keep current lyric visible
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex >= 0) {
      const container = lyricsContainerRef.current;
      const activeElement = container.querySelector(`[data-line="${currentLyricIndex}"]`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
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
    const handleCanPlayThrough = () => {
      setIsAudioReady(true);
    };

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

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !song.videoUrl) return;

    const handleVideoReady = () => {
      setIsVideoReady(true);
    };

    const handleVideoEnded = () => {
      // Loop the video
      video.currentTime = 0;
      video.play().catch(() => {});
    };

    video.addEventListener('canplaythrough', handleVideoReady);
    video.addEventListener('ended', handleVideoEnded);

    // Start loading the video
    video.load();

    return () => {
      video.removeEventListener('canplaythrough', handleVideoReady);
      video.removeEventListener('ended', handleVideoEnded);
    };
  }, [song.videoUrl]);

  // Auto-play when ready (audio ready, and video ready if there's a video)
  useEffect(() => {
    if (!autoPlay || !isAudioReady) return;
    
    // If there's a video, wait for it to be ready too
    if (hasVideo && !isVideoReady) return;

    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    // Try to play audio
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Audio started playing, also start video if present
          if (video && song.videoUrl) {
            video.play().catch(() => {});
          }
        })
        .catch(() => {
          // Auto-play was blocked by browser - user will need to click play
          setIsPlaying(false);
        });
    }
  }, [autoPlay, isAudioReady, isVideoReady, hasVideo, song.videoUrl]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    const video = videoRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      if (video) video.pause();
    } else {
      audio.play().then(() => {
        if (video && song.videoUrl) {
          video.play().catch(() => {});
        }
      }).catch(() => {
        // Play failed - likely user interaction required
      });
    }
  }, [isPlaying, song.videoUrl]);

  return (
    <div className={`flex flex-col glass rounded-xl overflow-hidden shadow-2xl relative ${className}`}>
      {/* Hidden Audio Element - preload auto for faster loading */}
      <audio ref={audioRef} src={song.audioUrl} preload="auto" />
      
      {/* Video Background Layer - behind everything */}
      {song.videoUrl && (
        <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ zIndex: 0 }}>
          <video
            ref={videoRef}
            src={song.videoUrl}
            muted
            loop
            playsInline
            preload="auto"
            className={`
              absolute inset-0 w-full h-full object-cover
              transition-opacity duration-1000 ease-out
              ${isVideoReady ? 'opacity-50' : 'opacity-0'}
            `}
          />
          {/* Subtle dark overlay for text readability */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/30 via-transparent to-[#0d1117]/40"
          />
        </div>
      )}
      
      {/* Fallback gradient background when no video */}
      {!song.videoUrl && (
        <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ zIndex: 0 }}>
          <div 
            className="absolute w-96 h-96 rounded-full blur-3xl opacity-10 animate-pulse"
            style={{
              background: 'radial-gradient(circle, #58a6ff 0%, transparent 70%)',
              top: '-10%',
              right: '-10%',
              animationDuration: '4s',
            }}
          />
          <div 
            className="absolute w-80 h-80 rounded-full blur-3xl opacity-8 animate-pulse"
            style={{
              background: 'radial-gradient(circle, #7ee787 0%, transparent 70%)',
              bottom: '-5%',
              left: '-5%',
              animationDuration: '5s',
              animationDelay: '1s',
            }}
          />
        </div>
      )}
      
      {/* Tab Bar with Glass Effect */}
      <div className="flex items-center justify-between glass-dark px-4 py-3 relative z-10">
        {/* Left side - Window controls + File tab */}
        <div className="flex items-center">
          {/* Window Controls */}
          <div className="flex gap-2 mr-4">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5)] hover-scale cursor-pointer transition-all duration-200" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5)] hover-scale cursor-pointer transition-all duration-200" />
            <div className="w-3 h-3 rounded-full bg-[#27ca40] shadow-[0_0_8px_rgba(39,202,64,0.5)] hover-scale cursor-pointer transition-all duration-200" />
          </div>
          
          {/* File Tab */}
          <div className="flex items-center gap-2 px-4 py-1.5 glass-light rounded-lg text-sm group hover:bg-white/10 transition-all duration-300">
            <Music className="w-4 h-4 text-[#7ee787] group-hover:animate-pulse" />
            <span className="text-[#c9d1d9]">{song.title.toLowerCase().replace(/\s+/g, '_')}.sync</span>
          </div>
        </div>
        
        {/* Right side - Video badge + LIVE badge + Run Button */}
        <div className="flex items-center gap-3">
          {/* Video indicator badge */}
          {song.videoUrl && (
            <div className="flex items-center gap-1.5 px-2 py-1 glass-light rounded-full">
              <Video className="w-3 h-3 text-[#a371f7]" />
              <span className="text-xs text-[#a371f7] font-medium">BG</span>
            </div>
          )}
          
          {/* LIVE Badge - only when playing */}
          {isPlaying && (
            <div className="flex items-center gap-2 px-3 py-1 glass-light rounded-full">
              <span className="w-2 h-2 bg-[#27ca40] rounded-full animate-pulse shadow-[0_0_8px_rgba(39,202,64,0.8)]" />
              <span className="text-xs text-[#7ee787] font-medium tracking-wider">LIVE</span>
            </div>
          )}
          
          {/* Run Button - VS Code style on the right */}
          <button
            onClick={togglePlayPause}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300
              ${isPlaying 
                ? 'bg-[#da3633] text-white hover:bg-[#f85149]' 
                : 'bg-[#238636] text-white hover:bg-[#2ea043]'
              }
            `}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Breadcrumb / Path with hover effects */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#161b22]/80 to-transparent border-b border-[#30363d]/50 text-xs relative z-10">
        <span className="text-[#58a6ff]">~</span>
        <span className="text-[#484f58]">/</span>
        <span className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors cursor-pointer">music</span>
        <span className="text-[#484f58]">/</span>
        <span className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors cursor-pointer">{song.artist}</span>
        <span className="text-[#484f58]">/</span>
        <span className="text-[#c9d1d9] font-medium">{song.title}</span>
      </div>

      {/* Lyrics Container */}
      <div 
        ref={lyricsContainerRef}
        className="flex-1 overflow-y-auto font-mono text-sm min-h-[300px] max-h-[500px] relative z-10"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#30363d transparent',
        }}
      >
        {lyrics.length > 0 ? (
          <div className="py-4">
            {/* Header comment with staggered animation */}
            <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '0ms' }}>
              <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">1</div>
              <div><span className="text-[#8b949e]">/**</span></div>
            </div>
            <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '50ms' }}>
              <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">2</div>
              <div>
                <span className="text-[#8b949e]"> * @title </span>
                <span className="text-[#a5d6ff]">{song.title}</span>
              </div>
            </div>
            <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '100ms' }}>
              <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">3</div>
              <div>
                <span className="text-[#8b949e]"> * @artist </span>
                <span className="text-[#a5d6ff]">{song.artist}</span>
              </div>
            </div>
            <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '150ms' }}>
              <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">4</div>
              <div><span className="text-[#8b949e]"> */</span></div>
            </div>
            <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '200ms' }}>
              <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">5</div>
              <div></div>
            </div>

            {/* Lyrics Lines with staggered animations */}
            {lyrics.map((line, index) => {
              const lineNumber = index + 6;
              const isActive = index === currentLyricIndex;
              const isPast = index < currentLyricIndex;
              const isFuture = index > currentLyricIndex;

              return (
                <div
                  key={index}
                  data-line={index}
                  className={`
                    flex px-4 py-1.5 transition-all duration-500 ease-out relative animate-line-enter
                    ${isActive 
                      ? 'bg-gradient-to-r from-[#58a6ff]/15 via-[#58a6ff]/10 to-transparent animate-line-glow' 
                      : 'hover:bg-white/5'
                    }
                  `}
                  style={{
                    animationDelay: `${250 + index * 30}ms`,
                  }}
                >
                  {/* Active line left border */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#58a6ff] via-[#7ee787] to-[#58a6ff] shadow-[0_0_10px_rgba(88,166,255,0.5)]" />
                  )}
                  
                  {/* Line Number */}
                  <div className={`
                    select-none pr-4 text-right w-12 flex-shrink-0 transition-all duration-300
                    ${isActive ? 'text-[#58a6ff] font-bold' : 'text-[#484f58]'}
                  `}>
                    {lineNumber}
                  </div>
                  
                  {/* Lyric Text */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Timestamp */}
                    <span className={`
                      text-xs flex-shrink-0 transition-all duration-300 font-medium
                      ${isActive 
                        ? 'text-[#7ee787] shadow-[0_0_10px_rgba(126,231,135,0.5)]' 
                        : isPast
                          ? 'text-[#6e7681]'
                          : 'text-[#58a6ff]/70'
                      }
                    `}>
                      [{formatTime(line.timestamp)}]
                    </span>
                    
                    {/* Lyric Content */}
                    <span className={`
                      transition-all duration-500
                      ${isActive 
                        ? 'text-[#ffa657] font-semibold text-base animate-text-glow' 
                        : isPast 
                          ? 'text-[#8b949e]' 
                          : isFuture 
                            ? 'text-[#e6edf3]' 
                            : 'text-[#c9d1d9]'
                      }
                    `}>
                      {line.text || <span className="text-[#7ee787]">~</span>}
                    </span>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <span className="w-2 h-2 bg-[#ffa657] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,166,87,0.8)] ml-auto" />
                    )}
                  </div>
                </div>
              );
            })}

            {/* Footer */}
            <div className="flex px-4 py-1 hover:bg-white/5 transition-colors">
              <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">
                {lyrics.length + 6}
              </div>
              <div></div>
            </div>
            <div className="flex px-4 py-1 hover:bg-white/5 transition-colors">
              <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">
                {lyrics.length + 7}
              </div>
              <div><span className="text-[#8b949e]">// End of lyrics</span></div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="flex px-4 py-1 animate-line-enter">
              <div className="text-[#484f58] select-none pr-4 text-right w-12">1</div>
              <div>
                <span className="text-[#ff7b72]">// </span>
                <span className="text-[#8b949e]">No lyrics available for this track</span>
              </div>
            </div>
            <div className="flex px-4 py-1 animate-line-enter" style={{ animationDelay: '100ms' }}>
              <div className="text-[#484f58] select-none pr-4 text-right w-12">2</div>
              <div>
                <span className="text-[#ff7b72]">// </span>
                <span className="text-[#8b949e]">Playing: {song.title}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 glass-dark text-xs relative z-10">
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">
            <span className="text-[#58a6ff]">Ln</span> {currentLyricIndex >= 0 ? currentLyricIndex + 6 : 1}, <span className="text-[#58a6ff]">Col</span> 1
          </span>
          <span className="text-[#8b949e] px-2 py-0.5 glass-light rounded">UTF-8</span>
          <span className="text-[#7ee787] px-2 py-0.5 glass-light rounded font-medium">LRC</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">{lyrics.length} lines</span>
        </div>
      </div>
    </div>
  );
};

export default EmbeddablePlayer;
