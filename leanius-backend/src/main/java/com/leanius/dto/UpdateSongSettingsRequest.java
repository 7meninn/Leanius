package com.leanius.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating song settings (frequency weight and sync offset).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSongSettingsRequest {

    @Min(value = 1, message = "Frequency weight must be at least 1")
    @Max(value = 5, message = "Frequency weight cannot exceed 5")
    private int frequencyWeight;

    /**
     * Sync offset in milliseconds.
     * Positive = lyrics appear later, Negative = lyrics appear earlier.
     */
    private long syncOffset;
}
