import React, { useState } from 'react';
import { X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useSongs } from '../../../hooks/useSongs';
import { useUI } from '../../../hooks/useUI';

/**
 * Lyrics Confirmation Modal - confirms auto-fetched lyrics are correct
 */
export const LyricsConfirmation: React.FC = () => {
  const { pendingSong, confirmLyrics, isLoading, clearPendingSong } = useSongs();
  const { showLyricsConfirmation, setShowLyricsConfirmation, showToast } = useUI();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!showLyricsConfirmation || !pendingSong) return null;

  const handleConfirm = async (confirmed: boolean) => {
    setIsConfirming(true);
    try {
      await confirmLyrics(pendingSong.songId, confirmed);
      setShowLyricsConfirmation(false);
      if (confirmed) {
        showToast('success', 'Song added successfully!');
      } else {
        showToast('info', 'Song upload cancelled');
      }
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to process');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setShowLyricsConfirmation(false);
    clearPendingSong();
  };

  // Get first few lines of lyrics for preview
  const lyrics = pendingSong.lyrics || '';
  const lyricsPreview = lyrics
    .split('\n')
    .filter(line => line.trim())
    .slice(0, 5)
    .join('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Confirm Lyrics</h2>
        </div>

        {/* Description */}
        <p className="text-slate-300 mb-4">
          Does the song start like this? Please verify the lyrics are correct.
        </p>

        {/* Lyrics Preview */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
          <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">
            {lyricsPreview || 'No lyrics found'}
          </pre>
          {lyrics.split('\n').length > 5 && (
            <p className="text-slate-500 text-sm mt-2">... and more</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => handleConfirm(false)}
            disabled={isConfirming || isLoading}
            className="flex-1 py-3 px-4 border border-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                No, Wrong Lyrics
              </>
            )}
          </button>
          <button
            onClick={() => handleConfirm(true)}
            disabled={isConfirming || isLoading}
            className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Yes, Correct
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LyricsConfirmation;
