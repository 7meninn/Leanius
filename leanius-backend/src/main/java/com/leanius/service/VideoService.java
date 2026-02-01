package com.leanius.service;

import com.leanius.dto.VideoUploadResponse;
import com.leanius.exception.InvalidFileException;
import com.leanius.exception.ResourceNotFoundException;
import com.leanius.exception.UnauthorizedException;
import com.leanius.model.Song;
import com.leanius.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * Service for handling video background uploads and management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VideoService {

    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "video/mp4"
    );
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "mp4"
    );

    private final AzureStorageService azureStorageService;
    private final SongRepository songRepository;

    /**
     * Upload video for a song.
     * If song already has video, delete old video before uploading new one.
     *
     * @param videoFile The video file to upload
     * @param songId The song ID to attach video to
     * @param userId The user ID (for authorization)
     * @return VideoUploadResponse with video URL
     */
    public VideoUploadResponse uploadVideoForSong(MultipartFile videoFile, String songId, String userId) {
        // 1. Validate video file
        validateVideoFile(videoFile);

        // 2. Get song and verify ownership
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found"));

        if (!song.getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to upload video for this song");
        }

        // 3. Delete old video if exists
        if (song.getVideoUrl() != null && !song.getVideoUrl().isEmpty()) {
            try {
                azureStorageService.deleteVideoFile(song.getVideoUrl());
                log.info("Deleted old video for song: {}", songId);
            } catch (Exception e) {
                // Log but don't fail - proceed with new upload
                log.warn("Failed to delete old video for song {}: {}", songId, e.getMessage());
            }
        }

        // 4. Upload new video to Azure
        String videoUrl = azureStorageService.uploadVideoFile(videoFile, userId, songId);

        // 5. Update song with video metadata
        song.setVideoUrl(videoUrl);
        song.setVideoFileSize(videoFile.getSize());
        song.setVideoFormat("mp4");
        song.setUpdatedAt(LocalDateTime.now());
        songRepository.save(song);

        log.info("Video uploaded successfully for song: {}", songId);

        return VideoUploadResponse.builder()
                .songId(songId)
                .videoUrl(videoUrl)
                .videoFileSize(videoFile.getSize())
                .message("Video uploaded successfully")
                .build();
    }

    /**
     * Delete video from a song.
     *
     * @param songId The song ID
     * @param userId The user ID (for authorization)
     */
    public void deleteVideoForSong(String songId, String userId) {
        // 1. Get song and verify ownership
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new ResourceNotFoundException("Song not found"));

        if (!song.getUserId().equals(userId)) {
            throw new UnauthorizedException("You don't have permission to delete video for this song");
        }

        // 2. Check if video exists
        if (song.getVideoUrl() == null || song.getVideoUrl().isEmpty()) {
            throw new ResourceNotFoundException("No video found for this song");
        }

        // 3. Delete from Azure
        azureStorageService.deleteVideoFile(song.getVideoUrl());

        // 4. Update song
        song.setVideoUrl(null);
        song.setVideoFileSize(0);
        song.setVideoFormat(null);
        song.setUpdatedAt(LocalDateTime.now());
        songRepository.save(song);

        log.info("Video deleted successfully for song: {}", songId);
    }

    /**
     * Validate video file: size, MIME type, extension.
     *
     * @param file The video file to validate
     * @throws InvalidFileException if validation fails
     */
    private void validateVideoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Video file is required");
        }

        // Check file size (50MB max)
        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new InvalidFileException(
                    String.format("Video file too large. Maximum size is 50MB, got %.1fMB",
                            file.getSize() / (1024.0 * 1024.0))
            );
        }

        // Check MIME type
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            throw new InvalidFileException("Invalid video format. Only MP4 is supported.");
        }

        // Check file extension
        String filename = file.getOriginalFilename();
        if (filename != null) {
            String extension = getFileExtension(filename).toLowerCase();
            if (!ALLOWED_EXTENSIONS.contains(extension)) {
                throw new InvalidFileException("Invalid file extension. Only .mp4 is supported.");
            }
        }
    }

    /**
     * Get file extension from filename.
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
}
