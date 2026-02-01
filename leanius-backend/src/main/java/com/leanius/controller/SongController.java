package com.leanius.controller;

import com.leanius.dto.*;
import com.leanius.service.SongService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Controller for song management endpoints.
 */
@RestController
@RequestMapping("/songs")
@RequiredArgsConstructor
public class SongController {

    private final SongService songService;

    /**
     * Upload a new song.
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<SongUploadResponse>> uploadSong(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("artist") String artist) {
        SongUploadResponse response = songService.uploadSong(file, title, artist, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response, "Upload successful. Please confirm lyrics."));
    }

    /**
     * Confirm or reject lyrics for an uploaded song.
     */
    @PostMapping("/confirm-lyrics")
    public ResponseEntity<ApiResponse<Void>> confirmLyrics(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody LyricsConfirmationRequest request) {
        songService.confirmLyrics(request.getSongId(), userDetails.getUsername(), request.getConfirmed());
        
        String message = request.getConfirmed() ? "Song added to library" : "Upload cancelled";
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    /**
     * Get all songs for the current user.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SongDTO>>> getUserSongs(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<SongDTO> songs = songService.getUserSongs(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(songs));
    }

    /**
     * Delete a song.
     */
    @DeleteMapping("/{songId}")
    public ResponseEntity<ApiResponse<Void>> deleteSong(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String songId) {
        songService.deleteSong(songId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Song deleted successfully"));
    }

    /**
     * Update song frequency weight.
     */
    @PutMapping("/{songId}/weight")
    public ResponseEntity<ApiResponse<SongDTO>> updateWeight(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String songId,
            @Valid @RequestBody UpdateWeightRequest request) {
        SongDTO song = songService.updateSongWeight(songId, userDetails.getUsername(), request.getWeight());
        return ResponseEntity.ok(ApiResponse.success(song, "Weight updated successfully"));
    }

    /**
     * Update song settings (frequency weight and sync offset).
     */
    @PutMapping("/{songId}/settings")
    public ResponseEntity<ApiResponse<SongDTO>> updateSettings(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String songId,
            @Valid @RequestBody UpdateSongSettingsRequest request) {
        SongDTO song = songService.updateSongSettings(songId, userDetails.getUsername(), 
                request.getFrequencyWeight(), request.getSyncOffset());
        return ResponseEntity.ok(ApiResponse.success(song, "Settings saved successfully"));
    }
}
