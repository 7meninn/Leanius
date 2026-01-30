package com.leanius.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when lyrics cannot be found for a song.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class LyricsNotFoundException extends RuntimeException {

    public LyricsNotFoundException(String artist, String title) {
        super(String.format("Lyrics not found for '%s' by '%s'", title, artist));
    }

    public LyricsNotFoundException(String message) {
        super(message);
    }
}
