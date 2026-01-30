package com.leanius.repository;

import com.leanius.model.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Song entity operations.
 */
@Repository
public interface SongRepository extends MongoRepository<Song, String> {

    List<Song> findByUserId(String userId);

    List<Song> findByUserIdAndLyricsConfirmed(String userId, boolean lyricsConfirmed);

    Page<Song> findByUserId(String userId, Pageable pageable);

    Optional<Song> findByIdAndUserId(String id, String userId);

    long countByUserId(String userId);

    long countByUserIdAndLyricsConfirmed(String userId, boolean lyricsConfirmed);

    void deleteByIdAndUserId(String id, String userId);

    /**
     * Find the most recent update time for a user's songs.
     * Used for embed caching check.
     */
    @Query(value = "{ 'userId': ?0, 'lyricsConfirmed': true }", sort = "{ 'updatedAt': -1 }")
    List<Song> findTopByUserIdOrderByUpdatedAtDesc(String userId, Pageable pageable);

    /**
     * Check if any songs have been updated since a given time.
     */
    boolean existsByUserIdAndUpdatedAtAfter(String userId, LocalDateTime since);
}
