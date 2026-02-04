import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2, Music, AlertCircle } from 'lucide-react';
import { useSongs } from '../../../hooks/useSongs';
import { useUI } from '../../../hooks/useUI';
import { uploadSongSchema, UploadSongFormData } from '../../../utils/validation';

/**
 * Upload Form component for adding new songs
 * Only allows songs with synced lyrics available on LRCLib
 */
export const UploadForm: React.FC = () => {
  const { uploadSong, isLoading } = useSongs();
  const { showToast, setShowLyricsConfirmation } = useUI();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadSongFormData>({
    resolver: zodResolver(uploadSongSchema),
  });

  const onSubmit = async (data: UploadSongFormData) => {
    setUploadError(null);
    try {
      await uploadSong(data.title, data.artist, data.audioFile[0]);
      setShowLyricsConfirmation(true);
      reset();
      setSelectedFileName(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload song';
      
      // Check if it's a synced lyrics not found error
      if (errorMessage.toLowerCase().includes('synced lyrics not available')) {
        setUploadError(errorMessage);
        showToast('error', 'This song doesn\'t have synced lyrics available');
      } else {
        showToast('error', errorMessage);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
    } else {
      setSelectedFileName(null);
    }
    // Clear previous error when user selects a new file
    setUploadError(null);
  };

  return (
    <div className="p-4 border-b border-[var(--border)]">
      <h3 className="text-lg font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
        <Upload className="h-5 w-5" />
        Add Song
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Title */}
        <div>
          <input
            {...register('title')}
            type="text"
            placeholder="Song Title"
            className="input-base text-sm"
            onChange={() => setUploadError(null)}
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Artist */}
        <div>
          <input
            {...register('artist')}
            type="text"
            placeholder="Artist Name"
            className="input-base text-sm"
            onChange={() => setUploadError(null)}
          />
          {errors.artist && (
            <p className="mt-1 text-xs text-red-500">{errors.artist.message}</p>
          )}
        </div>

        {/* Audio File */}
        <div>
          <label className="block">
            <div className="flex items-center justify-center px-3 py-4 border-2 border-dashed border-[var(--border)] rounded-[var(--radius-md)] cursor-pointer hover:border-[var(--ink)] transition-colors bg-[var(--bg-muted)]">
              <div className="text-center">
                <Music className="h-6 w-6 mx-auto text-[var(--muted)] mb-1" />
                <span className="text-sm text-[var(--muted)]">
                  {selectedFileName || 'Click to select audio file'}
                </span>
              </div>
              <input
                {...register('audioFile')}
                type="file"
                accept=".mp3,.wav,.ogg,.flac,audio/*"
                className="hidden"
                onChange={(e) => {
                  handleFileChange(e);
                  register('audioFile').onChange(e);
                }}
              />
            </div>
          </label>
          {errors.audioFile && (
            <p className="mt-1 text-xs text-red-500">{errors.audioFile.message}</p>
          )}
        </div>

        {/* Synced Lyrics Error Message */}
        {uploadError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-[var(--radius-md)] text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Synced lyrics not available</p>
              <p className="text-red-600 mt-1">
                This song doesn't have time-synced lyrics on LRCLib. 
                Try checking the exact song title and artist name spelling.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Checking lyrics...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Add Song
            </>
          )}
        </button>

        {/* Helper text */}
        <p className="text-xs text-[var(--muted)] text-center">
          Only songs with synced lyrics available can be added
        </p>
      </form>
    </div>
  );
};

export default UploadForm;
