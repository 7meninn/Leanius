package com.leanius.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO for embed songs endpoint.
 * Contains all data needed for the embedded player.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmbedSongsResponse {

    private String userId;
    private List<SongDTO> songs;
    private int totalSongs;
    private Instant lastUpdate;
}
