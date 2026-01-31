import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, Loader2, Music } from 'lucide-react';
import { useSongs } from '../../../hooks/useSongs';
import { useUI } from '../../../hooks/useUI';
import { uploadSongSchema, UploadSongFormData } from '../../../utils/validation';

/**
 * Upload Form component for adding new songs
 */
export const UploadForm: React.FC = () => {
  const { uploadSong, isLoading } = useSongs();
  const { showToast, setShowLyricsConfirmation } = useUI();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadSongFormData>({
    resolver: zodResolver(uploadSongSchema),
  });

  const onSubmit = async (data: UploadSongFormData) => {
    try {
      await uploadSong(data.title, data.artist, data.audioFile[0]);
      setShowLyricsConfirmation(true);
      reset();
      setSelectedFileName(null);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to upload song');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFileName(files[0].name);
    } else {
      setSelectedFileName(null);
    }
  };

  return (
    <div className="p-4 border-b border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
          )}
        </div>

        {/* Artist */}
        <div>
          <input
            {...register('artist')}
            type="text"
            placeholder="Artist Name"
            className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {errors.artist && (
            <p className="mt-1 text-xs text-red-400">{errors.artist.message}</p>
          )}
        </div>

        {/* Audio File */}
        <div>
          <label className="block">
            <div className="flex items-center justify-center px-3 py-4 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="text-center">
                <Music className="h-6 w-6 mx-auto text-slate-400 mb-1" />
                <span className="text-sm text-slate-400">
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
            <p className="mt-1 text-xs text-red-400">{errors.audioFile.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Add Song
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
