import React, { useRef, useEffect, useState } from 'react';

interface VideoBackgroundProps {
  /** Azure Blob URL for the video background */
  videoUrl?: string;
  /** Song title for accessibility */
  title: string;
  /** Whether to show the fallback animated gradient when no video */
  showFallback?: boolean;
}

/**
 * Video Background Component
 * 
 * Displays a looped, muted video behind the lyrics player.
 * Designed to be visible through the glassmorphism overlay while maintaining text readability.
 * 
 * Features:
 * - Autoplay, muted, looped video playback
 * - 50% opacity for good visibility through glass effect
 * - Smooth fade-in transition on load
 * - Subtle gradient fallback when no video
 * - Handles video load errors gracefully
 */
export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  videoUrl,
  title,
  showFallback = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reset states when video URL changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [videoUrl]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    const handleCanPlay = () => {
      setIsLoaded(true);
      // Ensure video plays (some browsers need this)
      video.play().catch(() => {
        // Autoplay might be blocked, but video will still show first frame
        console.log('Video autoplay blocked, showing static frame');
      });
    };

    const handleError = () => {
      console.error('Failed to load video background');
      setHasError(true);
    };

    // Ensure looping works reliably across all browsers
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(() => {
        console.log('Video replay blocked');
      });
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  // Show video background if URL exists and no error
  if (videoUrl && !hasError) {
    return (
      <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ zIndex: 0 }}>
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-label={`Background video for ${title}`}
          className={`
            absolute inset-0 w-full h-full object-cover
            transition-opacity duration-1000 ease-out
            ${isLoaded ? 'opacity-50' : 'opacity-0'}
          `}
        />
        {/* Subtle dark overlay for text readability - very light */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/30 via-transparent to-[#0d1117]/40"
          aria-hidden="true"
        />
      </div>
    );
  }

  // Fallback: Subtle animated gradient background (no video)
  if (showFallback) {
    return (
      <div className="absolute inset-0 overflow-hidden rounded-xl" style={{ zIndex: 0 }}>
        {/* Subtle gradient orbs - reduced opacity */}
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
    );
  }

  return null;
};

export default VideoBackground;
