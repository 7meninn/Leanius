import React, { useRef, useEffect, useState } from 'react';
import { Play, Square, Music, Save, Loader2, Video, Trash2, Upload, AlertCircle } from 'lucide-react';
import { usePlayer } from '../../../hooks/usePlayer';
import { useSongsContext } from '../../../context/SongsContext';
import { useVideoUpload } from '../../../hooks/useVideoUpload';
import { formatTime } from '../../../utils/lyrics';
import { APP_CONFIG } from '../../../utils/constants';
import { VideoBackground } from './VideoBackground';

/**
 * Code Editor Style Lyrics Player with Glassmorphism
 * Features: Line numbers, syntax highlighting, glassmorphism, animations, video backgrounds
 * 
 * The Run button (top right like VS Code) is the primary play/pause control that works in both:
 * - Preview mode (dashboard) - for tweaking
 * - Production mode (embedded) - the only control users get
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
  
  const { updateSongSettings, updateSongVideoUrl } = useSongsContext();
  const { uploadVideo, deleteVideo, isUploading, uploadError, clearError } = useVideoUpload();

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const [frequencyWeight, setFrequencyWeight] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isDraggingRef = useRef(false);
  
  // Video state
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [hasVideoChanges, setHasVideoChanges] = useState(false);
  const [pendingVideoDelete, setPendingVideoDelete] = useState(false);
  const [videoValidationError, setVideoValidationError] = useState<string | null>(null);
  
  // Track original values to detect changes
  const [originalOffset, setOriginalOffset] = useState(0);
  const [originalWeight, setOriginalWeight] = useState(3);

  // Update local state when song changes
  useEffect(() => {
    if (currentSong) {
      const savedWeight = currentSong.frequencyWeight || 3;
      const savedOffset = currentSong.syncOffset || 0;
      setFrequencyWeight(savedWeight);
      setOriginalWeight(savedWeight);
      setOriginalOffset(savedOffset);
      setHasUnsavedChanges(false);
      // Reset video state
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      setHasVideoChanges(false);
      setPendingVideoDelete(false);
      setVideoValidationError(null);
      clearError();
    }
  }, [currentSong?.id, clearError]);
  
  // Check for unsaved changes (including video changes)
  useEffect(() => {
    if (currentSong) {
      const currentOffset = getLyricOffset(currentSong.id);
      const hasSettingsChanges = frequencyWeight !== originalWeight || currentOffset !== originalOffset;
      setHasUnsavedChanges(hasSettingsChanges || hasVideoChanges);
    }
  }, [currentSong, frequencyWeight, originalWeight, originalOffset, getLyricOffset, hasVideoChanges]);

  // Cleanup video preview URL when component unmounts or video changes
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

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

  // Handle video file selection
  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVideoValidationError(null);
    
    if (!file) return;
    
    // Validate file size
    if (file.size > APP_CONFIG.MAX_VIDEO_SIZE) {
      setVideoValidationError(`Video must be less than ${APP_CONFIG.MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
      return;
    }
    
    // Validate file type
    if (!(APP_CONFIG.ALLOWED_VIDEO_TYPES as readonly string[]).includes(file.type)) {
      setVideoValidationError('Only MP4 videos are supported');
      return;
    }
    
    // Revoke previous preview URL
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setSelectedVideoFile(file);
    setVideoPreviewUrl(previewUrl);
    setHasVideoChanges(true);
    setPendingVideoDelete(false);
  };

  // Handle video delete
  const handleVideoDelete = () => {
    // If there's a selected file, just clear it
    if (selectedVideoFile) {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      setHasVideoChanges(false);
      return;
    }
    
    // If song has existing video, mark for deletion
    if (currentSong?.videoUrl) {
      setPendingVideoDelete(true);
      setHasVideoChanges(true);
    }
  };

  // Cancel pending video delete
  const handleCancelVideoDelete = () => {
    setPendingVideoDelete(false);
    setHasVideoChanges(false);
  };

  if (!currentSong) {
    return (
      <div className="h-full flex flex-col items-center justify-center relative">
        {/* Empty State - Code Editor Style with Glassmorphism */}
        <div className="w-full max-w-2xl">
          <div className="glass rounded-xl overflow-hidden shadow-2xl relative">
            {/* Tab Bar */}
            <div className="flex items-center justify-between glass-dark px-4 py-3 relative z-10">
              {/* Left side - Window controls + File tab */}
              <div className="flex items-center">
                <div className="flex gap-2 mr-4">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.5)] hover-scale cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.5)] hover-scale cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-[#27ca40] shadow-[0_0_8px_rgba(39,202,64,0.5)] hover-scale cursor-pointer" />
                </div>
                
                <div className="flex items-center gap-2 px-4 py-1.5 glass-light rounded-lg text-sm">
                  <Music className="w-4 h-4 text-[#7ee787]" />
                  <span className="text-[#c9d1d9]">no_song.lyrics</span>
                </div>
              </div>
              
              {/* Right side - Disabled Run Button */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-[#21262d]/50 text-[#484f58] border border-[#30363d]/50 cursor-not-allowed">
                <Play className="w-4 h-4" />
                <span>Run</span>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="p-6 font-mono text-sm relative z-10">
              <div className="flex animate-line-enter" style={{ animationDelay: '0ms' }}>
                <div className="text-[#484f58] select-none pr-4 text-right w-12">1</div>
                <div className="text-[#8b949e]">
                  <span className="text-[#ff7b72]">// </span>
                  <span className="text-[#8b949e]">Select a song to preview</span>
                </div>
              </div>
              <div className="flex animate-line-enter" style={{ animationDelay: '100ms' }}>
                <div className="text-[#484f58] select-none pr-4 text-right w-12">2</div>
                <div className="text-[#8b949e]">
                  <span className="text-[#ff7b72]">// </span>
                  <span className="text-[#8b949e]">Click on a song from the sidebar</span>
                </div>
              </div>
              <div className="flex animate-line-enter" style={{ animationDelay: '200ms' }}>
                <div className="text-[#484f58] select-none pr-4 text-right w-12">3</div>
                <div className="text-[#8b949e]"></div>
              </div>
              <div className="flex animate-line-enter" style={{ animationDelay: '300ms' }}>
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

  // Determine which video URL to display (preview takes precedence)
  const displayVideoUrl = pendingVideoDelete 
    ? undefined 
    : (videoPreviewUrl || currentSong.videoUrl);

  // Progress bar seek - calculate position from click/drag
  const calculateSeekPosition = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    seek(newTime);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    calculateSeekPosition(e);
  };

  const handleProgressBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    calculateSeekPosition(e);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      calculateSeekPosition(moveEvent);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleOffsetChange = (delta: number) => {
    const newOffset = lyricOffset + delta;
    adjustLyricTiming(currentSong.id, newOffset);
  };

  const handleSaveSettings = async () => {
    if (!currentSong || isSaving) return;
    
    setIsSaving(true);
    try {
      // Handle video upload/delete first
      if (selectedVideoFile) {
        // Upload new video
        const newVideoUrl = await uploadVideo(currentSong.id, selectedVideoFile);
        if (newVideoUrl) {
          updateSongVideoUrl(currentSong.id, newVideoUrl, selectedVideoFile.size);
        }
      } else if (pendingVideoDelete && currentSong.videoUrl) {
        // Delete existing video
        const deleted = await deleteVideo(currentSong.id);
        if (deleted) {
          updateSongVideoUrl(currentSong.id, undefined);
        }
      }
      
      // Save sync settings
      const currentOffset = getLyricOffset(currentSong.id);
      await updateSongSettings(currentSong.id, frequencyWeight, currentOffset);
      
      // Update original values after successful save
      setOriginalWeight(frequencyWeight);
      setOriginalOffset(currentOffset);
      setHasUnsavedChanges(false);
      
      // Clear video state
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      setSelectedVideoFile(null);
      setVideoPreviewUrl(null);
      setHasVideoChanges(false);
      setPendingVideoDelete(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      
      {/* Code Editor Container with Glassmorphism */}
      <div className="flex-1 flex flex-col glass rounded-xl overflow-hidden shadow-2xl relative">
        {/* Video Background Layer - behind everything */}
        <VideoBackground 
          videoUrl={displayVideoUrl} 
          title={currentSong.title}
          showFallback={true}
        />
        
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
              <span className="text-[#c9d1d9]">{currentSong.title.toLowerCase().replace(/\s+/g, '_')}.sync</span>
            </div>
          </div>
          
          {/* Right side - Run Button + LIVE badge */}
          <div className="flex items-center gap-3">
            {/* Video indicator */}
            {displayVideoUrl && (
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
            
            {/* Run/Stop Button - VS Code style on the right */}
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

        {/* Breadcrumb / Path with subtle animation */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#161b22]/80 to-transparent border-b border-[#30363d]/50 text-xs relative z-10">
          <span className="text-[#58a6ff]">~</span>
          <span className="text-[#484f58]">/</span>
          <span className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors cursor-pointer">music</span>
          <span className="text-[#484f58]">/</span>
          <span className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors cursor-pointer">{currentSong.artist}</span>
          <span className="text-[#484f58]">/</span>
          <span className="text-[#c9d1d9] font-medium">{currentSong.title}</span>
        </div>

        {/* Lyrics Container with enhanced styling */}
        <div 
          ref={lyricsContainerRef}
          className="flex-1 overflow-y-auto font-mono text-sm relative z-10"
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
                <div>
                  <span className="text-[#8b949e]">/**</span>
                </div>
              </div>
              <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '50ms' }}>
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">2</div>
                <div>
                  <span className="text-[#8b949e]"> * @title </span>
                  <span className="text-[#a5d6ff]">{currentSong.title}</span>
                </div>
              </div>
              <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '100ms' }}>
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">3</div>
                <div>
                  <span className="text-[#8b949e]"> * @artist </span>
                  <span className="text-[#a5d6ff]">{currentSong.artist}</span>
                </div>
              </div>
              <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '150ms' }}>
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">4</div>
                <div>
                  <span className="text-[#8b949e]"> */</span>
                </div>
              </div>
              <div className="flex px-4 py-1 hover:bg-white/5 transition-colors animate-line-enter" style={{ animationDelay: '200ms' }}>
                <div className="text-[#484f58] select-none pr-4 text-right w-12 flex-shrink-0">5</div>
                <div></div>
              </div>

              {/* Lyrics Lines with enhanced animations */}
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
                      flex px-4 py-1.5 transition-all duration-500 ease-out relative
                      ${isActive 
                        ? 'bg-gradient-to-r from-[#58a6ff]/15 via-[#58a6ff]/10 to-transparent animate-line-glow' 
                        : 'hover:bg-white/5'
                      }
                    `}
                    style={{
                      animationDelay: `${250 + index * 30}ms`,
                    }}
                  >
                    {/* Active line left border with gradient */}
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
                      {/* Timestamp with glow on active */}
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
                      
                      {/* Lyric Content with text glow animation */}
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
                <div>
                  <span className="text-[#8b949e]">// End of lyrics</span>
                </div>
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
                  <span className="text-[#8b949e]">Playing: {currentSong.title}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar with Glass Effect */}
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
            {lyricOffset !== 0 && (
              <span className="text-[#f0883e] px-2 py-0.5 glass-light rounded neon-orange">
                Offset: {lyricOffset >= 0 ? '+' : ''}{(lyricOffset / 1000).toFixed(1)}s
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tweaking Controls - Simple, clean design matching app theme */}
      <div className="mt-4 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        {/* Progress Bar - Rebuilt from scratch */}
        <div className="mb-4">
          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            onMouseDown={handleProgressBarMouseDown}
            className="h-2 bg-slate-700 rounded-full cursor-pointer relative group"
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Seek knob - visible on hover */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between mt-2 text-xs font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Tweaking Controls */}
        <div className="flex flex-col gap-4">
          {/* Sync Offset - Only show if there are lyrics */}
          {lyrics.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Sync Offset</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOffsetChange(-100)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-mono transition-colors"
                >
                  -0.1s
                </button>
                <span className="text-sm font-mono text-blue-400 min-w-[60px] text-center">
                  {lyricOffset >= 0 ? '+' : ''}{(lyricOffset / 1000).toFixed(1)}s
                </span>
                <button
                  onClick={() => handleOffsetChange(100)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs font-mono transition-colors"
                >
                  +0.1s
                </button>
              </div>
            </div>
          )}
          
          {/* Play Frequency */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Play Frequency</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Less</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setFrequencyWeight(weight)}
                    className={`w-8 h-8 rounded text-xs font-mono transition-colors ${
                      frequencyWeight === weight
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-300'
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500">More</span>
            </div>
          </div>
          
          {/* Video Background Upload */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Video Background</span>
              <span className="text-xs text-slate-500">(MP4, max 50MB)</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Hidden file input */}
              <input
                ref={videoInputRef}
                type="file"
                accept=".mp4,video/mp4"
                onChange={handleVideoFileSelect}
                className="hidden"
              />
              
              {/* Show current state */}
              {pendingVideoDelete ? (
                // Pending delete state
                <div className="flex items-center gap-2">
                  <span className="text-xs text-red-400">Will be deleted</span>
                  <button
                    onClick={handleCancelVideoDelete}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : selectedVideoFile ? (
                // New video selected
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-400 truncate max-w-[120px]">
                    {selectedVideoFile.name}
                  </span>
                  <button
                    onClick={handleVideoDelete}
                    className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-colors"
                    title="Remove selected video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : currentSong.videoUrl ? (
                // Existing video
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    Video set
                  </span>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-xs transition-colors"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleVideoDelete}
                    className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition-colors"
                    title="Delete video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                // No video
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded text-xs transition-colors border border-purple-600/30"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Choose MP4
                </button>
              )}
            </div>
          </div>
          
          {/* Video validation/upload error */}
          {(videoValidationError || uploadError) && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-600/10 px-3 py-2 rounded border border-red-600/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{videoValidationError || uploadError}</span>
            </div>
          )}
          
          {/* Save Button */}
          <div className="flex justify-end pt-2 border-t border-slate-700">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving || isUploading || !hasUnsavedChanges}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                hasUnsavedChanges && !isSaving && !isUploading
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSaving || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isUploading ? 'Uploading video...' : 'Saving...'}</span>
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
