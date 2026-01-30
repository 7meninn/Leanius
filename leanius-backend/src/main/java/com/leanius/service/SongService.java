package com.leanius.service;

import com.leanius.dto.SongDTO;
import com.leanius.dto.SongUploadResponse;
import com.leanius.exception.InvalidFileException;
import com.leanius.exception.ResourceNotFoundException;
import com.leanius.exception.SongLimitExceededException;
import com.leanius.model.LyricLine;
import com.leanius.model.Song;
import com.leanius.repository.SongRepository;
import com.leanius.util.FileValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for song management operations.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SongService {

    private static final int MAX_SONGS_PER_USER = 10;
    private static final int LYRICS_PREVIEW_LINES = 4;

    private final SongRepository songRepository;
    private final AzureStorageService azureStorageService;
    private final LyricsService lyricsService;
    private final FileValidator fileValidator;

    /**
     * Upload a new song.
     */
    public SongUploadResponse uploadSong(MultipartFile file, String title, String artist, String userId) {
        // Check song limit
        long currentCount = songRepository.countByUserId(userId);
        if (currentCount >= MAX_SONGS_PER_USER) {
            throw new SongLimitExceededException();
        }

        // Validate file
        fileValidator.validateAudioFile(file);

        // Upload to Azure Storage
        String audioUrl = azureStorageService.uploadFile(file, userId);
        String format = fileValidator.getFileExtension(file.getOriginalFilename());

        // Create song record (not yet confirmed)
        Song song = Song.builder()
                .userId(userId)
                .title(title)
                .artist(artist)
                .audioUrl(audioUrl)
                .audioFileSize(file.getSize())
                .audioFormat(format)
                .duration(0) // Will be updated later or from metadata
                .frequencyWeight(3) // Default weight
                .lyricsConfirmed(false)
                .createdAt(LocalDateTime.now())
                .build();

        // Fetch lyrics from LRCLib
        try {
            LyricsService.LyricsData lyricsData = lyricsService.fetchLyrics(artist, title);
            song.setRawLyrics(lyricsData.getRawLyrics());
            song.setSyncedLyrics(lyricsData.getSyncedLyrics());
            song.setSyncType(lyricsData.getSyncType());
        } catch (Exception e) {
            log.warn("Could not fetch lyrics for '{}' by '{}': {}", title, artist, e.getMessage());
            song.setSyncType("UNSYNCED");
        }

        song = songRepository.save(song);
        log.info("Song uploaded: {} by {} for user {}", title, artist, userId);

        // Generate lyrics preview
        String lyricsPreview = getLyricsPreview(song.getSyncedLyrics(), song.getRawLyrics());

        return SongUploadResponse.builder()
                .songId(song.getId())
                .title(song.getTitle())
                .artist(song.getArtist())
                .lyricsPreview(lyricsPreview)
                .syncType(song.getSyncType())
                .lyricsFound(song.getSyncedLyrics() != null && !song.getSyncedLyrics().isEmpty())
                .build();
    }

    /**
     * Confirm or reject lyrics for a song.
     */
    public void confirmLyrics(String songId, String userId, boolean confirmed) {
        Song song = songRepository.findByIdAndUserId(songId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", "id", songId));

        if (confirmed) {
            song.setLyricsConfirmed(true);
            song.setUpdatedAt(LocalDateTime.now());
            songRepository.save(song);
            log.info("Lyrics confirmed for song: {}", songId);
        } else {
            // Delete song and file if rejected
            azureStorageService.deleteFile(song.getAudioUrl());
            songRepository.delete(song);
            log.info("Song upload rejected and deleted: {}", songId);
        }
    }

    /**
     * Get all songs for a user.
     */
    public List<SongDTO> getUserSongs(String userId) {
        return songRepository.findByUserIdAndLyricsConfirmed(userId, true)
                .stream()
                .map(this::toSongDTO)
                .collect(Collectors.toList());
    }

    /**
     * Delete a song.
     */
    public void deleteSong(String songId, String userId) {
        Song song = songRepository.findByIdAndUserId(songId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", "id", songId));

        azureStorageService.deleteFile(song.getAudioUrl());
        songRepository.delete(song);
        log.info("Song deleted: {} by user {}", songId, userId);
    }

    /**
     * Update song frequency weight.
     */
    public SongDTO updateSongWeight(String songId, String userId, int weight) {
        if (weight < 1 || weight > 5) {
            throw new InvalidFileException("Weight must be between 1 and 5");
        }

        Song song = songRepository.findByIdAndUserId(songId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Song", "id", songId));

        song.setFrequencyWeight(weight);
        song.setUpdatedAt(LocalDateTime.now());
        song = songRepository.save(song);

        log.info("Song weight updated: {} to {} by user {}", songId, weight, userId);
        return toSongDTO(song);
    }

    /**
     * Get the latest song update time for a user.
     */
    public LocalDateTime getLatestSongUpdateTime(String userId) {
        List<Song> songs = songRepository.findTopByUserIdOrderByUpdatedAtDesc(
                userId, PageRequest.of(0, 1));
        
        if (songs.isEmpty()) {
            return null;
        }
        
        Song latestSong = songs.get(0);
        return latestSong.getUpdatedAt() != null ? latestSong.getUpdatedAt() : latestSong.getCreatedAt();
    }

    /**
     * Get user song count.
     */
    public long getUserSongCount(String userId) {
        return songRepository.countByUserIdAndLyricsConfirmed(userId, true);
    }

    /**
     * Convert Song entity to SongDTO.
     */
    private SongDTO toSongDTO(Song song) {
        return SongDTO.builder()
                .id(song.getId())
                .title(song.getTitle())
                .artist(song.getArtist())
                .audioUrl(song.getAudioUrl())
                .duration(song.getDuration())
                .frequencyWeight(song.getFrequencyWeight())
                .syncType(song.getSyncType())
                .syncedLyrics(song.getSyncedLyrics())
                .build();
    }

    /**
     * Generate lyrics preview from synced or raw lyrics.
     */
    private String getLyricsPreview(List<LyricLine> syncedLyrics, String rawLyrics) {
        if (syncedLyrics != null && !syncedLyrics.isEmpty()) {
            return syncedLyrics.stream()
                    .limit(LYRICS_PREVIEW_LINES)
                    .map(LyricLine::getText)
                    .collect(Collectors.joining("\n"));
        }
        
        if (rawLyrics != null && !rawLyrics.isEmpty()) {
            String[] lines = rawLyrics.split("\n");
            StringBuilder preview = new StringBuilder();
            for (int i = 0; i < Math.min(lines.length, LYRICS_PREVIEW_LINES); i++) {
                if (i > 0) preview.append("\n");
                preview.append(lines[i]);
            }
            return preview.toString();
        }
        
        return "No lyrics available";
    }
}
