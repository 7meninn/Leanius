package com.leanius.dto;

import com.leanius.model.LyricLine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for song data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongDTO {

    private String id;
    private String title;
    private String artist;
    private String audioUrl;
    private long duration;
    private int frequencyWeight;
    private String syncType;
    private List<LyricLine> syncedLyrics;
}
