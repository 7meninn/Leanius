package com.leanius.util;

import com.leanius.exception.InvalidFileException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * Utility class for validating uploaded files.
 */
@Component
public class FileValidator {

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("mp3", "wav", "ogg", "flac");
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/wave",
            "audio/x-wav",
            "audio/ogg",
            "audio/flac",
            "audio/x-flac"
    );

    /**
     * Validate an audio file.
     */
    public void validateAudioFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is required");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("File size exceeds the maximum allowed limit of 100MB");
        }

        // Check file extension
        String extension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new InvalidFileException(
                    "Invalid file format. Allowed formats: " + String.join(", ", ALLOWED_EXTENSIONS));
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (contentType != null && !isValidAudioMimeType(contentType)) {
            throw new InvalidFileException("Invalid file type. Please upload an audio file.");
        }
    }

    /**
     * Check if the MIME type is valid for audio files.
     */
    public boolean isValidAudioMimeType(String mimeType) {
        if (mimeType == null) {
            return false;
        }
        return ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase()) || 
               mimeType.toLowerCase().startsWith("audio/");
    }

    /**
     * Get file extension from filename.
     */
    public String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1).toLowerCase();
    }

    /**
     * Get allowed file extensions.
     */
    public List<String> getAllowedExtensions() {
        return ALLOWED_EXTENSIONS;
    }

    /**
     * Get maximum file size in bytes.
     */
    public long getMaxFileSize() {
        return MAX_FILE_SIZE;
    }
}
