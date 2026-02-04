package com.leanius.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Song entity representing an uploaded audio file with lyrics.
 * Each user can have up to 10 songs maximum.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "songs")
@CompoundIndex(name = "artist_title_idx", def = "{'artist': 1, 'title': 1}")
public class Song {

    @Id
    private String id;

    @Indexed
    private String userId; // Reference to User

    private String title;
    private String artist;

    private String audioUrl; // Azure Storage URL
    private long audioFileSize; // Bytes
    private String audioFormat; // mp3, wav, ogg, flac
    private long duration; // Milliseconds

    private String rawLyrics; // Full lyrics text (plain)
    private List<LyricLine> syncedLyrics; // Timed lyrics with timestamps

    /**
     * Sync type indicates whether lyrics have timestamps.
     * SYNCED = has timestamps, UNSYNCED = plain text only
     */
    private String syncType; // "SYNCED" or "UNSYNCED"

    /**
     * Frequency weight for random selection bias (1-5).
     * Higher weight = more likely to be selected.
     */
    @Builder.Default
    private int frequencyWeight = 3;

    /**
     * Lyrics sync offset in milliseconds.
     * Positive = lyrics appear later, Negative = lyrics appear earlier.
     * Used to fine-tune synchronization.
     */
    @Builder.Default
    private long syncOffset = 0;

    /**
     * Whether lyrics have been confirmed by the user.
     * Upload is not complete until lyrics are confirmed.
     */
    @Builder.Default
    private boolean lyricsConfirmed = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;
}
