import { useState, useCallback } from 'react';
import apiClient, { getErrorMessage } from '../utils/api';
import { ENDPOINTS, APP_CONFIG } from '../utils/constants';
import { VideoUploadResponse } from '../types';

interface UseVideoUploadReturn {
  uploadVideo: (songId: string, file: File) => Promise<string | null>;
  deleteVideo: (songId: string) => Promise<boolean>;
  isUploading: boolean;
  uploadError: string | null;
  clearError: () => void;
}

/**
 * Hook for video background upload and delete operations.
 * Handles API calls for video management on songs.
 */
export const useVideoUpload = (): UseVideoUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Upload a video file for a song.
   * @param songId The song ID to attach video to
   * @param file The video file (MP4, max 50MB)
   * @returns The video URL if successful, null if failed
   */
  const uploadVideo = useCallback(async (songId: string, file: File): Promise<string | null> => {
    // Validate file before uploading
    if (file.size > APP_CONFIG.MAX_VIDEO_SIZE) {
      setUploadError(`Video file must be less than ${APP_CONFIG.MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
      return null;
    }

    if (!(APP_CONFIG.ALLOWED_VIDEO_TYPES as readonly string[]).includes(file.type)) {
      setUploadError('Only MP4 videos are supported');
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<{ data: VideoUploadResponse }>(
        ENDPOINTS.SONGS.VIDEO_UPLOAD(songId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 300000, // 5 minutes for large video uploads
        }
      );

      return response.data.data?.videoUrl || null;
    } catch (err) {
      const message = getErrorMessage(err);
      setUploadError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Delete video from a song.
   * @param songId The song ID to remove video from
   * @returns true if successful, false if failed
   */
  const deleteVideo = useCallback(async (songId: string): Promise<boolean> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      await apiClient.delete(ENDPOINTS.SONGS.VIDEO_DELETE(songId));
      return true;
    } catch (err) {
      const message = getErrorMessage(err);
      setUploadError(message);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Clear the upload error.
   */
  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    uploadVideo,
    deleteVideo,
    isUploading,
    uploadError,
    clearError,
  };
};

export default useVideoUpload;
