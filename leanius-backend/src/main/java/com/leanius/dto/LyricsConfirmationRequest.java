package com.leanius.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for confirming or rejecting lyrics after upload.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LyricsConfirmationRequest {

    @NotBlank(message = "Song ID is required")
    private String songId;

    @NotNull(message = "Confirmation status is required")
    private Boolean confirmed;
}
