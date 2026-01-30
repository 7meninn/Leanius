package com.leanius.service;

import com.leanius.dto.AuthResponse;
import com.leanius.dto.ChangePasswordRequest;
import com.leanius.dto.LoginRequest;
import com.leanius.dto.SignupRequest;
import com.leanius.exception.AuthenticationException;
import com.leanius.exception.DuplicateEmailException;
import com.leanius.exception.ResourceNotFoundException;
import com.leanius.model.User;
import com.leanius.repository.UserRepository;
import com.leanius.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for authentication operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApiKeyService apiKeyService;

    /**
     * Register a new user.
     */
    public AuthResponse signup(SignupRequest request) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        // Generate API key
        String apiKey = apiKeyService.generateApiKey();

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .apiKey(apiKey)
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("User registered: {}", user.getEmail());

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getName());

        // Create API key record
        apiKeyService.createApiKeyRecord(user.getId(), apiKey);

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .token(token)
                .apiKey(apiKey)
                .build();
    }

    /**
     * Login an existing user.
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new AuthenticationException("Account is deactivated");
        }

        log.info("User logged in: {}", user.getEmail());

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getName());

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .token(token)
                .apiKey(user.getApiKey())
                .build();
    }

    /**
     * Change user password.
     */
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new AuthenticationException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getEmail());
    }

    /**
     * Initiate password reset (generates reset token).
     */
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        log.info("Password reset initiated for: {}", email);
        // Note: In production, send email with reset link containing the token
    }

    /**
     * Verify reset token is valid.
     */
    public boolean verifyResetToken(String token) {
        return userRepository.findByResetToken(token)
                .map(user -> user.getResetTokenExpiry() != null && 
                             user.getResetTokenExpiry().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    /**
     * Reset password using token.
     */
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new AuthenticationException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AuthenticationException("Reset token has expired");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Password reset completed for: {}", user.getEmail());
    }
}
