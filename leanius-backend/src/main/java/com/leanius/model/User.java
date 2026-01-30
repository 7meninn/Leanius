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
 * User entity representing registered users in the system.
 * Users can upload up to 10 songs and get an API key for embedding.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email; // Gmail only, validated with regex

    private String passwordHash; // BCrypt hashed

    @Indexed(unique = true)
    private String apiKey; // Unique API key for embed endpoints

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @Builder.Default
    private boolean active = true;

    // Password reset fields
    private String resetToken;
    private LocalDateTime resetTokenExpiry;
}
