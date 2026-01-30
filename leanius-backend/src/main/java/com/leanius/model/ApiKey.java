package com.leanius.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * ApiKey entity for tracking API keys used in embed endpoints.
 * Each user gets one unique API key for their embed player.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "apiKeys")
public class ApiKey {

    @Id
    private String id;

    @Indexed
    private String userId; // Reference to User

    @Indexed(unique = true)
    private String key; // The actual API key string

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastUsed;

    /**
     * Daily request count for rate limiting.
     * Resets at midnight UTC.
     */
    @Builder.Default
    private int dailyRequestCount = 0;

    private LocalDateTime dailyCountResetAt;
}
