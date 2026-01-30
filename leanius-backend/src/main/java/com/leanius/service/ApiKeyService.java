package com.leanius.service;

import com.leanius.model.ApiKey;
import com.leanius.repository.ApiKeyRepository;
import com.leanius.exception.InvalidApiKeyException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * Service for API key management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;

    /**
     * Generate a new unique API key.
     */
    public String generateApiKey() {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String timestamp = Long.toHexString(System.currentTimeMillis());
        String raw = uuid + timestamp;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes()).substring(0, 32);
    }

    /**
     * Create API key record in database.
     */
    public void createApiKeyRecord(String userId, String key) {
        ApiKey apiKey = ApiKey.builder()
                .userId(userId)
                .key(key)
                .createdAt(LocalDateTime.now())
                .dailyRequestCount(0)
                .build();
        apiKeyRepository.save(apiKey);
        log.info("API key created for user: {}", userId);
    }

    /**
     * Validate an API key and return the associated user ID.
     */
    public String validateApiKey(String key) {
        ApiKey apiKey = apiKeyRepository.findByKey(key)
                .orElseThrow(() -> new InvalidApiKeyException());
        
        // Update last used timestamp
        apiKey.setLastUsed(LocalDateTime.now());
        apiKeyRepository.save(apiKey);
        
        return apiKey.getUserId();
    }

    /**
     * Get API key record by key.
     */
    public ApiKey getApiKeyByKey(String key) {
        return apiKeyRepository.findByKey(key)
                .orElseThrow(() -> new InvalidApiKeyException());
    }

    /**
     * Get API key for a user.
     */
    public String getApiKeyForUser(String userId) {
        return apiKeyRepository.findByUserId(userId)
                .map(ApiKey::getKey)
                .orElse(null);
    }

    /**
     * Increment daily request count (for rate limiting).
     */
    public void incrementDailyCount(String key) {
        ApiKey apiKey = apiKeyRepository.findByKey(key)
                .orElseThrow(() -> new InvalidApiKeyException());
        
        // Reset count if it's a new day
        LocalDateTime now = LocalDateTime.now();
        if (apiKey.getDailyCountResetAt() == null || 
            apiKey.getDailyCountResetAt().toLocalDate().isBefore(now.toLocalDate())) {
            apiKey.setDailyRequestCount(0);
            apiKey.setDailyCountResetAt(now);
        }
        
        apiKey.setDailyRequestCount(apiKey.getDailyRequestCount() + 1);
        apiKeyRepository.save(apiKey);
    }

    /**
     * Check if API key has exceeded daily rate limit.
     */
    public boolean isRateLimitExceeded(String key, int maxDailyRequests) {
        ApiKey apiKey = apiKeyRepository.findByKey(key)
                .orElseThrow(() -> new InvalidApiKeyException());
        
        // Reset count if it's a new day
        LocalDateTime now = LocalDateTime.now();
        if (apiKey.getDailyCountResetAt() == null || 
            apiKey.getDailyCountResetAt().toLocalDate().isBefore(now.toLocalDate())) {
            return false;
        }
        
        return apiKey.getDailyRequestCount() >= maxDailyRequests;
    }
}
