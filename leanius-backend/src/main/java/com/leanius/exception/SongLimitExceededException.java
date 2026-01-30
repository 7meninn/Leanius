package com.leanius.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when user tries to upload more than 10 songs.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class SongLimitExceededException extends RuntimeException {

    public SongLimitExceededException() {
        super("You have reached the maximum limit of 10 songs. Please delete a song to upload another.");
    }

    public SongLimitExceededException(String message) {
        super(message);
    }
}
