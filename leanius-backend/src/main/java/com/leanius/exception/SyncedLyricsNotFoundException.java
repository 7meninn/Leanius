package com.leanius.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when synced lyrics are not available for a song on LRCLib.
 * This prevents users from adding songs without synced lyrics.
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class SyncedLyricsNotFoundException extends RuntimeException {

    private final String artist;
    private final String title;

    public SyncedLyricsNotFoundException(String artist, String title) {
        super(String.format("Synced lyrics not available for '%s' by '%s'. Only songs with synced lyrics can be added.", title, artist));
        this.artist = artist;
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public String getTitle() {
        return title;
    }
}
