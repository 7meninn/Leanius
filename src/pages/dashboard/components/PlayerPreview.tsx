import React, { useRef, useEffect } from 'react';
import { Play, Pause, Music, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { usePlayer } from '../../../hooks/usePlayer';
import { formatTime } from '../../../utils/lyrics';

/**
 * Code Editor Style Lyrics Player
 * Features: Line numbers, syntax highlighting, glassmorphism, terminal aesthetic
 */
export const PlayerPreview: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    currentLyricIndex,
    togglePlayPause,
    seek,
    adjustLyricTiming,
    getLyricOffset,
  } = usePlayer();

  const lyricsContainerRef = useRef<HTMLDivElement>(null);

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

  if (!currentSong) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        {/* Empty State - Code Editor Style */}
        <div className="w-full max-w-2xl">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-2xl">
            {/* Tab Bar */}
            <div className="flex items-center bg-[#161b22] border-b border-[#30363d] px-4 py-2">
              <div className="flex gap-2 mr-4">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#0d1117] border border-[#30363d] rounded-t text-sm">
                <Music className="w-4 h-4 text-[#7ee787]" />
                <span className="text-[#c9d1d9]">no_song.lyrics</span>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="p-6 font-mono text-sm">
              <div className="flex">
                <div className="text-[#484f58] select-none pr-4 text-right w-12">1</div>
                <div className="text-[#8b949e]">
                  <span className="text-[#ff7b72]">// </span>
                  <span className="text-[#8b949e]">Select a song to preview</span>
                </div>
              </div>
              <div className="flex">
                <div className="text-[#484f58] select-none pr-4 text-right w-12">2</div>
                <div className="text-[#8b949e]">
                  <span className="text-[#ff7b72]">// </span>
                  <span className="text-[#8b949e]">Click on a song from the sidebar</span>
                </div>
              </div>
              <div className="flex">
                <div className="text-[#484f58] select-none pr-4 text-right w-12">3</div>
                <div className="text-[#8b949e]"></div>
              </div>
              <div className="flex">
                <div className="text-[#484f58] select-none pr-4 text-right w-12">4</div>
                <div>
                  <span className="text-[#ff7b72]">const</span>
                  <span className="text-[#c9d1d9]"> status </span>
                  <span className="text-[#ff7b72]">=</span>
                  <span className="text-[#a5d6ff]"> "waiting"</span>
                  <span className="text-[#c9d1d9]">;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const lyricOffset = getLyricOffset(currentSong.id);
  const lyrics = currentSong.lyricsSync || [];

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const handleOffsetChange = (delta: number) => {
    const newOffset = lyricOffset + delta;
    adjustLyricTiming(currentSong.id, newOffset);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Code Editor Container */}
      <div className="flex-1 flex flex-col bg-[#0d1117] border border-[#30363d] rounded-lg overflow-hidden shadow-2xl backdrop-blur-xl">
        
        {/* Tab Bar */}
        <div className="flex items-center justify-between bg-[#161b22] border-b border-[#30363d] px-4 py-2">
          <div className="flex items-center">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#0d1117] border border-[#30363d] border-b-0 rounded-t text-sm">
              <Music className="w-4 h-4 text-[#7ee787]" />
              <span className="text-[#c9d1d9]">{currentSong.title.toLowerCase().replace(/\s+/g, '_')}.sync</span>
            </div>
          </div>
          
          {/* Now Playing Badge */}
          <div className="flex items-center gap-2">
            {isPlaying && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-[#27ca40] rounded-full animate-pulse" />
                <span className="text-xs text-[#7ee787]">PLAYING</span>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb / Path */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22]/50 border-b border-[#30363d] text-xs">
          <span className="text-[#8b949e]">~/music</span>
          <span className="text-[#484f58]">/</span>
          <span className="text-[#8b949e]">{currentSong.artist}</span>
          <span className="text-[#484f58]">/</span>
          <span className="text-[#c9d1d9]">{currentSong.title}</span>
        </div>

        {/* Lyrics Container */}
        <div 
          ref={lyricsContainerRef}
          className="flex-1 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-[#30363d] scrollbar-track-transparent"
        >
          {lyrics.length > 0 ? (
            <div className="py-4">
              {/* Header comment */}
              <div className="flex px-4 py-1 hover:bg-[#161b22]/50">
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">1</div>
                <div>
                  <span className="text-[#8b949e]">/**</span>
                </div>
              </div>
              <div className="flex px-4 py-1 hover:bg-[#161b22]/50">
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">2</div>
                <div>
                  <span className="text-[#8b949e]"> * @title </span>
                  <span className="text-[#a5d6ff]">{currentSong.title}</span>
                </div>
              </div>
              <div className="flex px-4 py-1 hover:bg-[#161b22]/50">
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">3</div>
                <div>
                  <span className="text-[#8b949e]"> * @artist </span>
                  <span className="text-[#a5d6ff]">{currentSong.artist}</span>
                </div>
              </div>
              <div className="flex px-4 py-1 hover:bg-[#161b22]/50">
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">4</div>
                <div>
                  <span className="text-[#8b949e]"> */</span>
                </div>
              </div>
              <div className="flex px-4 py-1 hover:bg-[#161b22]/50">
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">5</div>
                <div></div>
              </div>

              {/* Lyrics Lines */}
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
                      flex px-4 py-1 transition-all duration-300
                      ${isActive 
                        ? 'bg-[#388bfd]/10 border-l-2 border-[#58a6ff]' 
                        : 'hover:bg-[#161b22]/50 border-l-2 border-transparent'
                      }
                    `}
                  >
                    {/* Line Number */}
                    <div className={`
                      select-none pr-4 text-right w-12 flex-shrink-0 transition-colors
                      ${isActive ? 'text-[#58a6ff]' : 'text-[#484f58]'}
                    `}>
                      {lineNumber}
                    </div>
                    
                    {/* Lyric Text */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Timestamp */}
                      <span className={`
                        text-xs flex-shrink-0 transition-colors
                        ${isActive ? 'text-[#7ee787]' : 'text-[#484f58]'}
                      `}>
                        [{formatTime(line.timestamp)}]
                      </span>
                      
                      {/* Lyric Content */}
                      <span className={`
                        transition-all duration-300
                        ${isActive 
                          ? 'text-[#f0883e] font-medium' 
                          : isPast 
                            ? 'text-[#8b949e]' 
                            : isFuture 
                              ? 'text-[#6e7681]' 
                              : 'text-[#c9d1d9]'
                        }
                      `}>
                        {line.text || '♪'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div className="flex px-4 py-1 hover:bg-[#161b22]/50">
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">
                  {lyrics.length + 6}
                </div>
                <div></div>
              </div>
              <div className="flex px-4 py-1 hover:bg-[#161b22]/50">
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">
                  {lyrics.length + 7}
                </div>
                <div>
                  <span className="text-[#8b949e]">// End of lyrics</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="flex px-4 py-1">
                <div className="text-[#484f58] select-none pr-4 text-right w-12">1</div>
                <div>
                  <span className="text-[#ff7b72]">// </span>
                  <span className="text-[#8b949e]">No lyrics available for this track</span>
                </div>
              </div>
              <div className="flex px-4 py-1">
                <div className="text-[#484f58] select-none pr-4 text-right w-12">2</div>
                <div>
                  <span className="text-[#ff7b72]">// </span>
                  <span className="text-[#8b949e]">Playing: {currentSong.title}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar / Mini Map */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-t border-[#30363d] text-xs">
          <div className="flex items-center gap-4">
            <span className="text-[#8b949e]">Ln {currentLyricIndex + 6}, Col 1</span>
            <span className="text-[#8b949e]">UTF-8</span>
            <span className="text-[#8b949e]">LRC</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#8b949e]">{lyrics.length} lines</span>
            {lyricOffset !== 0 && (
              <span className="text-[#f0883e]">
                Offset: {lyricOffset >= 0 ? '+' : ''}{(lyricOffset / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Player Controls - Terminal Style */}
      <div className="mt-4 bg-[#0d1117] border border-[#30363d] rounded-lg p-4">
        {/* Progress Bar */}
        <div className="mb-3">
          <div
            onClick={handleSeek}
            className="h-1.5 bg-[#21262d] rounded-full cursor-pointer group relative overflow-hidden"
          >
            {/* Buffered indicator (optional visual) */}
            <div className="absolute inset-0 bg-[#30363d] rounded-full" style={{ width: '100%' }} />
            
            {/* Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#58a6ff] to-[#388bfd] rounded-full transition-all"
              style={{ width: `${progress}%` }}
            >
              {/* Glow effect */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#58a6ff] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_#58a6ff]" />
            </div>
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between mt-1.5 text-xs font-mono text-[#8b949e]">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          {/* Left - Offset Controls */}
          {lyrics.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOffsetChange(-100)}
                className="px-2 py-1 bg-[#21262d] text-[#8b949e] rounded text-xs font-mono hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors border border-[#30363d]"
              >
                -0.1s
              </button>
              <span className="text-xs font-mono text-[#8b949e] min-w-[50px] text-center">
                {lyricOffset >= 0 ? '+' : ''}{(lyricOffset / 1000).toFixed(1)}s
              </span>
              <button
                onClick={() => handleOffsetChange(100)}
                className="px-2 py-1 bg-[#21262d] text-[#8b949e] rounded text-xs font-mono hover:bg-[#30363d] hover:text-[#c9d1d9] transition-colors border border-[#30363d]"
              >
                +0.1s
              </button>
            </div>
          )}
          {lyrics.length === 0 && <div />}

          {/* Center - Play Controls */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 bg-gradient-to-br from-[#238636] to-[#2ea043] rounded-full flex items-center justify-center hover:from-[#2ea043] hover:to-[#3fb950] transition-all shadow-lg shadow-[#238636]/20"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
            <button className="p-2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Right - Volume (placeholder) */}
          <div className="flex items-center gap-2 text-[#8b949e]">
            <Volume2 className="w-4 h-4" />
            <div className="w-20 h-1 bg-[#21262d] rounded-full">
              <div className="w-3/4 h-full bg-[#8b949e] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPreview;
