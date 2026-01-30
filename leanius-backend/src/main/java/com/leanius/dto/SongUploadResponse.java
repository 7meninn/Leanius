package com.leanius.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for song upload (before lyrics confirmation).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongUploadResponse {

    private String songId;
    private String title;
    private String artist;
    private String lyricsPreview; // First few lines of lyrics
    private String syncType; // "SYNCED" or "UNSYNCED"
    private boolean lyricsFound;
}
