package com.leanius.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single line of synchronized lyrics.
 * Contains the timestamp (in milliseconds) and the lyric text.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LyricLine {

    private long startTimeMs; // Milliseconds from start of song
    private String text; // Lyric text for this line
}
