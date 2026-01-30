package com.leanius.controller;

import com.leanius.dto.*;
import com.leanius.exception.RateLimitExceededException;
import com.leanius.service.ApiKeyService;
import com.leanius.service.SongService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

/**
 * Controller for embed endpoints (public, API key authenticated).
 */
@Slf4j
@RestController
@RequestMapping("/embed")
@RequiredArgsConstructor
public class EmbedController {

    private static final int MAX_DAILY_REQUESTS = 1000;

    private final SongService songService;
    private final ApiKeyService apiKeyService;

    /**
     * Check if songs have changed since last fetch.
     * Used for caching strategy.
     */
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<EmbedCheckResponse>> checkChanges(@RequestParam("key") String apiKey) {
        // Validate API key
        String userId = apiKeyService.validateApiKey(apiKey);

        // Check rate limit
        if (apiKeyService.isRateLimitExceeded(apiKey, MAX_DAILY_REQUESTS)) {
            throw new RateLimitExceededException();
        }

        // Increment request count
        apiKeyService.incrementDailyCount(apiKey);

        // Get latest song update time
        LocalDateTime lastUpdate = songService.getLatestSongUpdateTime(userId);

        EmbedCheckResponse response = EmbedCheckResponse.builder()
                .hasChanges(lastUpdate != null)
                .lastUpdate(lastUpdate != null ? lastUpdate.toInstant(ZoneOffset.UTC) : null)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all songs for embed player.
     * Returns full data including audio URLs and synced lyrics.
     */
    @GetMapping("/songs")
    public ResponseEntity<ApiResponse<EmbedSongsResponse>> getSongs(@RequestParam("key") String apiKey) {
        // Validate API key
        String userId = apiKeyService.validateApiKey(apiKey);

        // Check rate limit
        if (apiKeyService.isRateLimitExceeded(apiKey, MAX_DAILY_REQUESTS)) {
            throw new RateLimitExceededException();
        }

        // Increment request count
        apiKeyService.incrementDailyCount(apiKey);

        // Get all songs
        List<SongDTO> songs = songService.getUserSongs(userId);
        LocalDateTime lastUpdate = songService.getLatestSongUpdateTime(userId);

        EmbedSongsResponse response = EmbedSongsResponse.builder()
                .userId(userId)
                .songs(songs)
                .totalSongs(songs.size())
                .lastUpdate(lastUpdate != null ? lastUpdate.toInstant(ZoneOffset.UTC) : Instant.now())
                .build();

        log.debug("Embed songs returned for user: {} ({} songs)", userId, songs.size());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
