package com.leanius.controller;

import com.leanius.dto.ApiResponse;
import com.leanius.dto.VideoUploadResponse;
import com.leanius.service.VideoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller for video background operations.
 * Handles video upload and deletion for songs.
 */
@Slf4j
@RestController
@RequestMapping("/songs/{songId}/video")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;

    /**
     * Upload video for a song.
     * POST /api/v1/songs/{songId}/video
     *
     * @param userDetails The authenticated user
     * @param songId The song ID
     * @param videoFile The video file (MP4, max 50MB)
     * @return VideoUploadResponse with video URL
     */
    @PostMapping
    public ResponseEntity<ApiResponse<VideoUploadResponse>> uploadVideo(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String songId,
            @RequestParam("file") MultipartFile videoFile
    ) {
        String userId = userDetails.getUsername();
        log.info("Video upload request for song: {} by user: {}", songId, userId);

        VideoUploadResponse response = videoService.uploadVideoForSong(
                videoFile,
                songId,
                userId
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Video uploaded successfully"));
    }

    /**
     * Delete video from a song.
     * DELETE /api/v1/songs/{songId}/video
     *
     * @param userDetails The authenticated user
     * @param songId The song ID
     * @return Success response
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteVideo(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String songId
    ) {
        String userId = userDetails.getUsername();
        log.info("Video delete request for song: {} by user: {}", songId, userId);

        videoService.deleteVideoForSong(songId, userId);

        return ResponseEntity.ok(ApiResponse.success("Video deleted successfully"));
    }
}
