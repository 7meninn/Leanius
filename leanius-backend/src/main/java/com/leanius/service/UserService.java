package com.leanius.service;

import com.leanius.dto.UpdateProfileRequest;
import com.leanius.dto.UserProfileResponse;
import com.leanius.exception.ResourceNotFoundException;
import com.leanius.model.User;
import com.leanius.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service for user profile management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SongService songService;

    /**
     * Get user profile by ID.
     */
    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        long songCount = songService.getUserSongCount(userId);

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .apiKey(user.getApiKey())
                .songCount((int) songCount)
                .build();
    }

    /**
     * Update user profile.
     */
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }

        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        log.info("Profile updated for user: {}", user.getEmail());

        long songCount = songService.getUserSongCount(userId);

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .apiKey(user.getApiKey())
                .songCount((int) songCount)
                .build();
    }

    /**
     * Get user by ID.
     */
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    /**
     * Get user by API key.
     */
    public User getUserByApiKey(String apiKey) {
        return userRepository.findByApiKey(apiKey)
                .orElseThrow(() -> new ResourceNotFoundException("User", "apiKey", apiKey));
    }
}
