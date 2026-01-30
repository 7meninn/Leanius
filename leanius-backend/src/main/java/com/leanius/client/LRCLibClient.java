package com.leanius.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Client for LRCLib API to fetch song lyrics.
 * LRCLib is a free, legal lyrics API that provides synced lyrics.
 */
@Slf4j
@Component
public class LRCLibClient {

    private final WebClient webClient;

    @Value("${lrclib.base-url}")
    private String baseUrl;

    public LRCLibClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }

    /**
     * Fetch lyrics for a song by artist and title.
     */
    public LRCLibResponse getLyrics(String artist, String title) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/get")
                .queryParam("artist_name", artist)
                .queryParam("track_name", title)
                .build()
                .toUriString();

        log.debug("Fetching lyrics from LRCLib: {}", url);

        try {
            return webClient.get()
                    .uri(url)
                    .header("User-Agent", "Leanius/1.0")
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, response -> {
                        log.warn("LRCLib returned 4xx for '{}' by '{}'", title, artist);
                        return Mono.empty();
                    })
                    .onStatus(HttpStatusCode::is5xxServerError, response -> {
                        log.error("LRCLib server error");
                        return Mono.empty();
                    })
                    .bodyToMono(LRCLibResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            log.warn("Failed to fetch lyrics for '{}' by '{}': {}", title, artist, e.getMessage());
            return null;
        }
    }

    /**
     * Search for lyrics with fuzzy matching.
     */
    public LRCLibResponse[] searchLyrics(String query) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl + "/search")
                .queryParam("q", query)
                .build()
                .toUriString();

        log.debug("Searching lyrics on LRCLib: {}", query);

        try {
            return webClient.get()
                    .uri(url)
                    .header("User-Agent", "Leanius/1.0")
                    .retrieve()
                    .bodyToMono(LRCLibResponse[].class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            log.warn("Failed to search lyrics for '{}': {}", query, e.getMessage());
            return new LRCLibResponse[0];
        }
    }

    /**
     * Response DTO for LRCLib API.
     */
    @Data
    public static class LRCLibResponse {
        private Long id;
        private String name;
        private String trackName;
        private String artistName;
        private String albumName;
        private Integer duration;
        private Boolean instrumental;
        private String plainLyrics;
        private String syncedLyrics;
    }
}
