package com.leanius.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for video upload operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoUploadResponse {

    private String songId;
    private String videoUrl;
    private long videoFileSize;
    private String message;
}
