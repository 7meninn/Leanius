package com.leanius.service;

import com.leanius.client.LRCLibClient;
import com.leanius.model.LyricLine;
import com.leanius.util.LyricsParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for fetching and processing lyrics.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LyricsService {

    private final LRCLibClient lrcLibClient;
    private final LyricsParser lyricsParser;

    /**
     * Fetch lyrics for a song from LRCLib API.
     */
    public LyricsData fetchLyrics(String artist, String title) {
        log.debug("Fetching lyrics for '{}' by '{}'", title, artist);
        
        LRCLibClient.LRCLibResponse response = lrcLibClient.getLyrics(artist, title);
        
        if (response == null) {
            log.warn("No lyrics found for '{}' by '{}'", title, artist);
            return new LyricsData(null, null, "UNSYNCED");
        }

        String rawLyrics = response.getPlainLyrics();
        List<LyricLine> syncedLyrics = null;
        String syncType = "UNSYNCED";

        if (response.getSyncedLyrics() != null && !response.getSyncedLyrics().isEmpty()) {
            syncedLyrics = lyricsParser.parseLRCFormat(response.getSyncedLyrics());
            syncType = "SYNCED";
            log.info("Found synced lyrics for '{}' by '{}' ({} lines)", title, artist, syncedLyrics.size());
        } else if (rawLyrics != null && !rawLyrics.isEmpty()) {
            log.info("Found unsynced lyrics for '{}' by '{}'", title, artist);
        }

        return new LyricsData(rawLyrics, syncedLyrics, syncType);
    }

    /**
     * Data class for lyrics fetch result.
     */
    public static class LyricsData {
        private final String rawLyrics;
        private final List<LyricLine> syncedLyrics;
        private final String syncType;

        public LyricsData(String rawLyrics, List<LyricLine> syncedLyrics, String syncType) {
            this.rawLyrics = rawLyrics;
            this.syncedLyrics = syncedLyrics;
            this.syncType = syncType;
        }

        public String getRawLyrics() {
            return rawLyrics;
        }

        public List<LyricLine> getSyncedLyrics() {
            return syncedLyrics;
        }

        public String getSyncType() {
            return syncType;
        }
    }
}
