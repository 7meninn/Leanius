package com.leanius.util;

import com.leanius.model.LyricLine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility class for parsing LRC format lyrics.
 */
@Slf4j
@Component
public class LyricsParser {

    // LRC format: [mm:ss.xx] or [mm:ss:xx] text
    private static final Pattern LRC_LINE_PATTERN = Pattern.compile("\\[(\\d{2}):(\\d{2})[.:](\\d{2,3})](.*)");

    /**
     * Parse LRC format lyrics into a list of LyricLine objects.
     * 
     * Example input:
     * [00:00.96]One, two, three, four
     * [00:04.02]Ooh-ooh, ooh-ooh-ooh
     * 
     * Example output:
     * [
     *   { startTimeMs: 960, text: "One, two, three, four" },
     *   { startTimeMs: 4020, text: "Ooh-ooh, ooh-ooh-ooh" }
     * ]
     */
    public List<LyricLine> parseLRCFormat(String lrcContent) {
        List<LyricLine> lyrics = new ArrayList<>();

        if (lrcContent == null || lrcContent.isEmpty()) {
            return lyrics;
        }

        String[] lines = lrcContent.split("\n");

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) {
                continue;
            }

            // Handle multiple timestamps on same line (e.g., [00:00.00][00:05.00]Text)
            List<Long> timestamps = new ArrayList<>();
            String text = line;

            Matcher matcher = LRC_LINE_PATTERN.matcher(line);
            while (matcher.find()) {
                try {
                    int minutes = Integer.parseInt(matcher.group(1));
                    int seconds = Integer.parseInt(matcher.group(2));
                    String msString = matcher.group(3);
                    int milliseconds;
                    
                    // Handle both [mm:ss.xx] (centiseconds) and [mm:ss.xxx] (milliseconds)
                    if (msString.length() == 2) {
                        milliseconds = Integer.parseInt(msString) * 10; // Convert centiseconds to ms
                    } else {
                        milliseconds = Integer.parseInt(msString);
                    }

                    long startTimeMs = (minutes * 60L * 1000L) + (seconds * 1000L) + milliseconds;
                    timestamps.add(startTimeMs);
                    text = matcher.group(4).trim();
                } catch (NumberFormatException e) {
                    log.warn("Failed to parse LRC timestamp: {}", line);
                }
            }

            // Skip metadata lines like [ti:Title] [ar:Artist] etc.
            if (text.isEmpty() || isMetadataLine(line)) {
                continue;
            }

            // Create a LyricLine for each timestamp
            for (Long timestamp : timestamps) {
                lyrics.add(LyricLine.builder()
                        .startTimeMs(timestamp)
                        .text(text)
                        .build());
            }
        }

        // Sort by timestamp
        lyrics.sort((a, b) -> Long.compare(a.getStartTimeMs(), b.getStartTimeMs()));

        log.debug("Parsed {} lyric lines from LRC content", lyrics.size());
        return lyrics;
    }

    /**
     * Check if a line is an LRC metadata line.
     */
    private boolean isMetadataLine(String line) {
        // Common metadata tags: [ti:], [ar:], [al:], [au:], [length:], [by:], [offset:], [re:], [ve:]
        return line.matches("\\[(ti|ar|al|au|length|by|offset|re|ve):.*]");
    }

    /**
     * Convert milliseconds to LRC format timestamp [mm:ss.xx].
     */
    public String toTimestamp(long milliseconds) {
        long totalSeconds = milliseconds / 1000;
        long minutes = totalSeconds / 60;
        long seconds = totalSeconds % 60;
        long centiseconds = (milliseconds % 1000) / 10;
        
        return String.format("[%02d:%02d.%02d]", minutes, seconds, centiseconds);
    }

    /**
     * Get a preview of lyrics (first N lines).
     */
    public String getPreview(List<LyricLine> lyrics, int lines) {
        if (lyrics == null || lyrics.isEmpty()) {
            return "No lyrics available";
        }

        StringBuilder preview = new StringBuilder();
        int count = Math.min(lyrics.size(), lines);
        
        for (int i = 0; i < count; i++) {
            if (i > 0) {
                preview.append("\n");
            }
            preview.append(lyrics.get(i).getText());
        }
        
        return preview.toString();
    }
}
