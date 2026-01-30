package com.leanius.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Response DTO for embed check endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmbedCheckResponse {

    private boolean hasChanges;
    private Instant lastUpdate;
}
