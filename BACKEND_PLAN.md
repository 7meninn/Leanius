# Leanius Backend Implementation Plan

> **Status**: ✅ Complete & Ready for Implementation  
> **Last Updated**: January 31, 2026  
> **Framework**: Spring Boot 3.x + Java 17+  
> **Database**: MongoDB  
> **Lyrics API**: LRCLib API (Free, legal, synced lyrics)  
> **File Storage**: Azure Blob Storage  
> **Purpose**: Comprehensive specification for superior model to execute in a single shot

---

## 📋 Executive Summary

Leanius backend is a Spring Boot REST API that manages user authentication, song uploads, lyrics fetching, and embeddable player data. Users upload MP3/WAV/OGG/FLAC files (max 10 per account), the system fetches synced lyrics from LRCLib, stores metadata + lyrics + audio URLs, and serves data via REST APIs. The embed endpoint provides all song data in a single response for frontend sessionStorage caching.

---

## 1. PROJECT STRUCTURE

### Directory & Package Organization

```
leanius-backend/
├── src/
│   ├── main/
│   │   ├── java/com/leanius/
│   │   │   ├── LleanusApplication.java (Main Spring Boot entry point)
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── JwtConfig.java (JWT configuration)
│   │   │   │   ├── SecurityConfig.java (Spring Security setup)
│   │   │   │   ├── CorsConfig.java (CORS configuration)
│   │   │   │   ├── AzureStorageConfig.java (Azure Blob Storage config)
│   │   │   │   └── MongoConfig.java (MongoDB configuration)
│   │   │   │
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── SongController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── EmbedController.java
│   │   │   │   └── HealthController.java
│   │   │   │
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── SongService.java
│   │   │   │   ├── LyricsService.java
│   │   │   │   ├── AzureStorageService.java
│   │   │   │   ├── JwtService.java
│   │   │   │   └── ApiKeyService.java
│   │   │   │
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── SongRepository.java
│   │   │   │   └── ApiKeyRepository.java
│   │   │   │
│   │   │   ├── model/
│   │   │   │   ├── User.java
│   │   │   │   ├── Song.java
│   │   │   │   ├── LyricLine.java
│   │   │   │   └── ApiKey.java
│   │   │   │
│   │   │   ├── dto/
│   │   │   │   ├── SignupRequest.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── SongDTO.java
│   │   │   │   ├── LyricsConfirmationRequest.java
│   │   │   │   ├── UpdateProfileRequest.java
│   │   │   │   ├── ChangePasswordRequest.java
│   │   │   │   ├── ApiResponse.java (Standardized response)
│   │   │   │   └── EmbedSongsResponse.java
│   │   │   │
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   ├── DuplicateEmailException.java
│   │   │   │   ├── InvalidFileException.java
│   │   │   │   ├── SongLimitExceededException.java
│   │   │   │   └── LyricsNotFoundException.java
│   │   │   │
│   │   │   ├── security/
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   └── CustomUserDetailsService.java
│   │   │   │
│   │   │   ├── util/
│   │   │   │   ├── FileValidator.java
│   │   │   │   ├── LyricsParser.java
│   │   │   │   ├── RandomSessionTracker.java
│   │   │   │   └── Constants.java
│   │   │   │
│   │   │   └── client/
│   │   │       └── LRCLibClient.java (LRCLib API client)
│   │   │
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── logback-spring.xml
│   │
│   └── test/
│       └── java/com/leanius/
│           ├── service/
│           └── controller/
│
├── pom.xml (Maven dependencies)
└── README.md
```

### Key Structural Principles

✅ **Layered Architecture** - Controllers → Services → Repositories  
✅ **Separation of Concerns** - Business logic in services, data access in repos  
✅ **DTO Pattern** - Request/Response objects separate from entities  
✅ **Centralized Exception Handling** - Global error handler  
✅ **Security Layer** - JWT filters and auth services  
✅ **External Integrations** - Separate client for LRCLib API  
✅ **Configuration Externalization** - Environment-specific configs  

---

## 2. DATA MODELS (MongoDB Entities)

### User Model

```java
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    private String name;
    private String email; // Gmail only, unique
    private String passwordHash; // BCrypt hashed
    private String apiKey; // Unique API key for embed
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;
    
    // Getters, setters, constructors...
}
```

**Indexes**:
- `email` (UNIQUE)
- `apiKey` (UNIQUE)

---

### Song Model

```java
@Document(collection = "songs")
public class Song {
    @Id
    private String id;
    
    private String userId; // Reference to User
    private String title;
    private String artist;
    private String audioUrl; // Azure Storage URL
    private long audioFileSize; // Bytes
    private String audioFormat; // mp3, wav, ogg, flac
    private long duration; // milliseconds
    
    private String rawLyrics; // Full lyrics text
    private List<LyricLine> syncedLyrics; // Timed lyrics
    private String syncType; // "SYNCED" or "UNSYNCED"
    
    private int frequencyWeight; // 1-5, for random selection bias
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Getters, setters, constructors...
}
```

### LyricLine Model

```java
public class LyricLine {
    private long startTimeMs; // Milliseconds (from LRCLib)
    private String text; // Lyric text
    
    // Getters, setters, constructors...
}
```

**Indexes**:
- `userId` (For querying user's songs)
- `artist` + `title` (For lyrics matching)

---

### ApiKey Model

```java
@Document(collection = "apiKeys")
public class ApiKey {
    @Id
    private String id;
    
    private String userId; // Reference to User
    private String key; // Unique API key
    private LocalDateTime createdAt;
    private LocalDateTime lastUsed;
    
    // Getters, setters, constructors...
}
```

**Indexes**:
- `key` (UNIQUE, frequently queried)
- `userId`

---

## 3. ROUTES & ENDPOINTS

### API Base URL
```
http://localhost:8080/api/v1
```

### Authentication Endpoints

```
POST   /auth/signup
  Body: {
    "name": "John Doe",
    "email": "user@gmail.com",
    "password": "SecurePass123"
  }
  Response: {
    "success": true,
    "data": {
      "userId": "...",
      "email": "...",
      "token": "jwt_token_here"
    },
    "message": "Signup successful"
  }

POST   /auth/login
  Body: {
    "email": "user@gmail.com",
    "password": "SecurePass123"
  }
  Response: {
    "success": true,
    "data": {
      "userId": "...",
      "token": "jwt_token_here"
    }
  }

POST   /auth/logout
  Headers: Authorization: Bearer {token}
  Response: {
    "success": true,
    "message": "Logout successful"
  }

POST   /auth/reset-password
  Body: {
    "email": "user@gmail.com"
  }
  Response: {
    "success": true,
    "message": "Reset link sent (frontend will handle)"
  }

POST   /auth/verify-reset-token/:token
  Response: {
    "success": true,
    "valid": true
  }
```

---

### User Endpoints

```
GET    /user/profile
  Headers: Authorization: Bearer {token}
  Response: {
    "success": true,
    "data": {
      "id": "...",
      "name": "...",
      "email": "...",
      "apiKey": "..."
    }
  }

PUT    /user/profile
  Headers: Authorization: Bearer {token}
  Body: {
    "name": "New Name"
  }
  Response: { "success": true, "data": {...} }

PUT    /user/password
  Headers: Authorization: Bearer {token}
  Body: {
    "currentPassword": "...",
    "newPassword": "..."
  }
  Response: { "success": true, "message": "Password changed" }
```

---

### Song Endpoints

```
POST   /songs/upload
  Headers: Authorization: Bearer {token}
  Body: multipart/form-data
    - file: <audio_file>
    - title: "Song Title"
    - artist: "Artist Name"
  Response: {
    "success": true,
    "data": {
      "songId": "...",
      "title": "...",
      "artist": "...",
      "lyricsPreview": "First few lines of lyrics...",
      "syncType": "SYNCED" or "UNSYNCED"
    },
    "message": "Upload successful. Please confirm lyrics."
  }

POST   /songs/confirm-lyrics
  Headers: Authorization: Bearer {token}
  Body: {
    "songId": "...",
    "confirmed": true  // or false to reject
  }
  Response: {
    "success": true,
    "message": "Song added to library" or "Upload rejected"
  }

GET    /songs
  Headers: Authorization: Bearer {token}
  Query: ?skip=0&limit=10
  Response: {
    "success": true,
    "data": [
      {
        "id": "...",
        "title": "...",
        "artist": "...",
        "duration": 240000,
        "frequencyWeight": 2,
        "syncType": "SYNCED"
      }
    ],
    "totalCount": 10
  }

DELETE /songs/:songId
  Headers: Authorization: Bearer {token}
  Response: { "success": true, "message": "Song deleted" }

PUT    /songs/:songId/weight
  Headers: Authorization: Bearer {token}
  Body: { "weight": 3 }  // 1-5
  Response: { "success": true, "data": {...} }
```

---

### Embed Endpoints

```
GET    /embed/check?key={apiKey}
  Query: key=api_key_here
  Response: {
    "success": true,
    "hasChanges": true,  // Whether songs have changed
    "lastUpdate": "2026-01-31T10:00:00Z"
  }

GET    /embed/songs?key={apiKey}
  Query: key=api_key_here
  Response: {
    "success": true,
    "data": {
      "userId": "...",
      "songs": [
        {
          "id": "...",
          "title": "...",
          "artist": "...",
          "audioUrl": "https://...",
          "syncedLyrics": [
            { "startTimeMs": 0, "text": "Lyric line" },
            { "startTimeMs": 2000, "text": "Next line" }
          ],
          "frequencyWeight": 2,
          "duration": 240000
        }
      ],
      "totalSongs": 10,
      "lastUpdate": "2026-01-31T10:00:00Z"
    }
  }
```

---

## 4. AUTHENTICATION & SECURITY

### JWT Token Strategy

**Token Structure**:
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "userId",
  "email": "user@gmail.com",
  "name": "User Name",
  "iat": 1704067200,
  "exp": 9999999999  // No expiry (as per requirement)
}
Signature: HMAC-SHA256(secret)
```

**No Token Expiry**: JWT tokens never expire (user must manually logout)

### Password Hashing

```java
// Using Spring Security's BCryptPasswordEncoder
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hashedPassword = encoder.encode(rawPassword);

// Validation
boolean matches = encoder.matches(rawPassword, hashedPassword);
```

### API Key Generation

```
// Unique API key for embed (stored in ApiKey document)
// Format: base64(userId + random_string)
// Length: 32-64 characters
// Regeneration: No (per requirement - keep single key per user)
```

### Security Filters

```java
// JwtAuthenticationFilter
- Intercepts all /api/** requests (except public endpoints)
- Extracts JWT from Authorization header (Bearer token)
- Validates token signature
- Sets authenticated user in SecurityContext
- Public endpoints: /auth/signup, /auth/login, /auth/reset-password, /embed/**
```

### CORS Configuration

```java
// Enable CORS for frontend (http://localhost:3000 in dev, prod domain in production)
CorsConfiguration config = new CorsConfiguration();
config.setAllowedOrigins(Arrays.asList("http://localhost:3000", "https://yourdomain.com"));
config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
config.setAllowCredentials(true);
config.setAllowedHeaders(Arrays.asList("*"));
config.setMaxAge(3600L);
```

---

## 5. LYRICS FETCHING & SYNC

### LRCLib API Integration

**LRCLib Endpoint**:
```
GET https://lrclib.net/api/get?artist={artist}&track={title}&album={album}
```

**Response Format**:
```json
{
  "id": 12345,
  "name": "Song Title",
  "trackName": "Song Title",
  "artistName": "Artist Name",
  "albumName": "Album Name",
  "duration": 240,
  "plainLyrics": "Full lyrics text...",
  "syncedLyrics": "[00:00.00]Line 1\n[00:05.50]Line 2\n...",
  "syncType": "SYNCED"
}
```

### Backend Lyrics Processing

```java
// LyricsService.java
public LyricsData fetchLyrics(String artist, String title) {
    // 1. Call LRCLib API with title + artist
    LRCLibResponse response = lrcLibClient.getLyrics(artist, title);
    
    // 2. Parse synced lyrics (LRC format to objects)
    List<LyricLine> syncedLyrics = parseLRC(response.getSyncedLyrics());
    
    // 3. Return lyrics data
    return new LyricsData(
        response.getPlainLyrics(),  // raw lyrics
        syncedLyrics,               // synced lyrics with timestamps
        response.getSyncType()      // "SYNCED" or "UNSYNCED"
    );
}

// LRC Format Parsing
// Input: "[00:00.96]One, two, three, four\n[00:04.02]Ooh-ooh, ooh-ooh-ooh"
// Output: [
//   { startTimeMs: 960, text: "One, two, three, four" },
//   { startTimeMs: 4020, text: "Ooh-ooh, ooh-ooh-ooh" }
// ]
```

---

## 6. FILE UPLOAD & AZURE STORAGE

### Upload Flow

```
1. Frontend sends: multipart/form-data { file, title, artist }
2. Backend validates:
   - File size (reasonable limit, e.g., 100MB max)
   - File type (.mp3, .wav, .ogg, .flac only)
   - User song count (max 10 per account)
   - File MIME type verification
3. Generate unique filename: {userId}_{timestamp}_{randomString}.{ext}
4. Upload to Azure Blob Storage
5. Get public URL from Azure
6. Store in MongoDB:
   - audioUrl: Azure URL
   - title, artist, audioFileSize, audioFormat
7. Fetch lyrics from LRCLib
8. Return lyrics preview + syncType for user confirmation
9. After confirmation, lyrics are stored in database
```

### Azure Storage Service

```java
// AzureStorageService.java
public String uploadAudioFile(MultipartFile file, String userId) {
    // 1. Validate file
    FileValidator.validateAudioFile(file);
    
    // 2. Generate unique name
    String blobName = generateBlobName(userId, file.getOriginalFilename());
    
    // 3. Upload to Azure
    BlobClient blobClient = containerClient.getBlobClient(blobName);
    blobClient.upload(file.getInputStream(), file.getSize(), true);
    
    // 4. Return public URL
    return blobClient.getBlobUrl();
}

// File Validation
private void validateAudioFile(MultipartFile file) {
    String filename = file.getOriginalFilename();
    String mimeType = file.getContentType();
    
    // Check file size
    if (file.getSize() > 100 * 1024 * 1024) {
        throw new InvalidFileException("File too large");
    }
    
    // Check file extension
    String ext = getFileExtension(filename);
    if (!Arrays.asList("mp3", "wav", "ogg", "flac").contains(ext)) {
        throw new InvalidFileException("Invalid format");
    }
    
    // Check MIME type
    if (!isValidAudioMIME(mimeType)) {
        throw new InvalidFileException("Invalid MIME type");
    }
}
```

---

## 7. SONG LIMIT & CONSTRAINTS

### Per-Account Limits

```
- Maximum 10 songs per user
- Enforced at upload time
- Query: db.songs.countDocuments({ userId: "..." })
- If count >= 10, reject upload with error:
  {
    "success": false,
    "error": "SONG_LIMIT_EXCEEDED",
    "message": "You have reached the maximum limit of 10 songs. Please delete a song to upload another."
  }
```

### Supported Formats

- `.mp3` (audio/mpeg)
- `.wav` (audio/wav)
- `.ogg` (audio/ogg)
- `.flac` (audio/flac)

---

## 8. EMBED ENDPOINT & CACHING STRATEGY

### Embed Data Caching (Frontend + Backend)

**Flow**:
```
1. Frontend embed loads → calls /embed/check?key=apiKey
2. Backend returns:
   - hasChanges: boolean
   - lastUpdate: ISO timestamp
3. Frontend checks localStorage for lastUpdate:
   - If localStorage.lastUpdate >= server.lastUpdate
     → Use localStorage data (no new download)
   - Else:
     → Call /embed/songs?key=apiKey
     → Download all 10 songs + lyrics
     → Store in sessionStorage
     → Store lastUpdate in localStorage
4. Player uses sessionStorage data for playback
5. On reload, check again (same logic)
```

### Check Endpoint Logic

```java
@GetMapping("/embed/check")
public ResponseEntity<?> checkSongsChanged(@RequestParam String key) {
    // 1. Validate API key
    ApiKey apiKey = validateAndGetApiKey(key);
    
    // 2. Get user's latest song update time
    LocalDateTime lastUpdate = songService.getLatestSongUpdateTime(apiKey.getUserId());
    
    // 3. Return whether there are changes
    return ResponseEntity.ok(new ApiResponse(true, new CheckResponse(
        hasChanges: lastUpdate != null && lastUpdate.isAfter(oneHourAgo),
        lastUpdate: lastUpdate
    )));
}
```

### Embed Songs Endpoint Logic

```java
@GetMapping("/embed/songs")
public ResponseEntity<?> getEmbedSongs(@RequestParam String key) {
    // 1. Validate API key (lightweight check)
    ApiKey apiKey = validateAndGetApiKey(key);
    
    // 2. Fetch all songs for user (10 max)
    List<Song> songs = songService.getUserSongs(apiKey.getUserId());
    
    // 3. Transform to DTO with full data
    List<EmbedSongDTO> dtos = songs.stream()
        .map(this::toEmbedSongDTO)
        .collect(Collectors.toList());
    
    // 4. Return with metadata
    return ResponseEntity.ok(new ApiResponse(true, new EmbedResponse(
        userId: apiKey.getUserId(),
        songs: dtos,
        totalSongs: dtos.size(),
        lastUpdate: Instant.now()
    )));
}

// Response DTO includes all data needed for player
public class EmbedSongDTO {
    private String id;
    private String title;
    private String artist;
    private String audioUrl;
    private List<LyricLine> syncedLyrics;
    private int frequencyWeight;
    private long duration;
}
```

### Rate Limiting Strategy

```
// For embed endpoint (/embed/songs, /embed/check)
// Rate limit: 1000 requests per API key per day
// OR: 10 requests per IP per minute (to prevent abuse)

// Implementation: Use RateLimiter interceptor
@Component
public class EmbedRateLimitInterceptor extends HandlerInterceptorAdapter {
    private final RateLimiterService rateLimiterService;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String apiKey = request.getParameter("key");
        
        if (!rateLimiterService.allowRequest(apiKey)) {
            response.setStatus(429); // Too Many Requests
            return false;
        }
        return true;
    }
}
```

---

## 9. ERROR HANDLING

### Global Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<?> handleDuplicateEmail(DuplicateEmailException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ApiResponse(false, null, "Email already registered"));
    }
    
    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<?> handleInvalidFile(InvalidFileException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ApiResponse(false, null, ex.getMessage()));
    }
    
    @ExceptionHandler(SongLimitExceededException.class)
    public ResponseEntity<?> handleSongLimit(SongLimitExceededException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ApiResponse(false, null, "Maximum 10 songs per account"));
    }
    
    @ExceptionHandler(LyricsNotFoundException.class)
    public ResponseEntity<?> handleLyricsNotFound(LyricsNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, null, "Lyrics not found for this song"));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, null, ex.getMessage()));
    }
}
```

### Standard API Response Format

```java
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String error;
    private String message;
    
    // Constructor & getters/setters
}

// Example successful response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Example error response
{
  "success": false,
  "error": "INVALID_FILE",
  "message": "File format not supported"
}
```

---

## 10. LOGGING & MONITORING

### Logging Configuration

```yaml
# application.yml
logging:
  level:
    root: INFO
    com.leanius: DEBUG
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d %logger{36} - %msg%n"
  file:
    name: logs/app.log
    max-size: 10MB
    max-history: 30
```

### Logging Best Practices

```java
// Log important operations
logger.info("User signup: {}", email);
logger.debug("Song upload initiated for user: {}", userId);
logger.warn("Song limit exceeded for user: {}", userId);
logger.error("Azure upload failed", exception);

// Track performance
long startTime = System.currentTimeMillis();
// ... operation ...
long duration = System.currentTimeMillis() - startTime;
logger.debug("Lyrics fetch took {}ms", duration);
```

---

## 11. CONFIGURATION & ENVIRONMENT

### application.yml (Development)

```yaml
server:
  port: 8080
  servlet:
    context-path: /api/v1

spring:
  application:
    name: leanius
  
  data:
    mongodb:
      uri: mongodb://localhost:27017/leanius
  
  security:
    oauth2:
      jwt:
        secret: your-dev-secret-key-change-in-production
        expiration: 999999999999  # No expiry

azure:
  storage:
    connection-string: DefaultEndpointsProtocol=https;...
    container-name: leanius-audio

lrclib:
  base-url: https://lrclib.net/api

mail:
  smtp:
    host: smtp.gmail.com
    port: 587
    username: ${GMAIL_USERNAME}
    password: ${GMAIL_PASSWORD}
```

### application-prod.yml (Production)

```yaml
server:
  port: 8080

spring:
  data:
    mongodb:
      uri: ${MONGODB_URI}  # From environment
  
  security:
    oauth2:
      jwt:
        secret: ${JWT_SECRET}

azure:
  storage:
    connection-string: ${AZURE_STORAGE_CONNECTION_STRING}

lrclib:
  base-url: https://lrclib.net/api
```

### Environment Variables

```bash
# Development
MONGODB_URI=mongodb://localhost:27017/leanius
JWT_SECRET=dev-secret-key
AZURE_STORAGE_CONNECTION_STRING=...
GMAIL_USERNAME=your-email@gmail.com
GMAIL_PASSWORD=app-password

# Production
MONGODB_URI=...
JWT_SECRET=production-secret-key
AZURE_STORAGE_CONNECTION_STRING=...
GMAIL_USERNAME=...
GMAIL_PASSWORD=...
```

---

## 12. DEPENDENCIES (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
        <version>3.x.x</version>
    </dependency>
    
    <!-- Spring Security & JWT -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.12.x</version>
    </dependency>
    
    <!-- MongoDB -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>
    
    <!-- Azure Blob Storage -->
    <dependency>
        <groupId>com.azure</groupId>
        <artifactId>azure-storage-blob</artifactId>
        <version>12.x.x</version>
    </dependency>
    
    <!-- HTTP Client for LRCLib API -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
    
    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Lombok (optional, for boilerplate reduction) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 13. KEY SERVICES & THEIR RESPONSIBILITIES

### AuthService

```java
public interface AuthService {
    AuthResponse signup(SignupRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String userId);
    void resetPassword(String email);
    void updatePassword(String userId, ChangePasswordRequest request);
}
```

**Responsibilities**:
- Validate email format (Gmail only, regex: `.*@gmail\.com$`)
- Hash passwords using BCrypt
- Generate JWT tokens
- Check for duplicate emails
- Handle password reset flow

---

### SongService

```java
public interface SongService {
    SongUploadResponse uploadSong(MultipartFile file, SongUploadRequest request, String userId);
    void confirmLyrics(String songId, String userId, boolean confirmed);
    List<SongDTO> getUserSongs(String userId);
    void deleteSong(String songId, String userId);
    void updateSongWeight(String songId, String userId, int weight);
    LocalDateTime getLatestSongUpdateTime(String userId);
}
```

**Responsibilities**:
- Validate audio files (format, size, MIME type)
- Check song limit (max 10)
- Upload to Azure Storage
- Store metadata in MongoDB
- Coordinate with LyricsService

---

### LyricsService

```java
public interface LyricsService {
    LyricsData fetchLyrics(String artist, String title);
    List<LyricLine> parseLRCFormat(String lrcContent);
    String getLyricsPreview(List<LyricLine> lyrics, int lines);
}
```

**Responsibilities**:
- Call LRCLib API
- Parse LRC format to LyricLine objects
- Handle lyrics not found gracefully
- Cache successful lyrics fetches

---

### AzureStorageService

```java
public interface AzureStorageService {
    String uploadFile(MultipartFile file, String userId);
    void deleteFile(String blobUrl);
    String generatePresignedUrl(String blobName, int expirationMinutes);
}
```

**Responsibilities**:
- Upload files to Azure Blob Storage
- Generate public URLs
- Handle deletion
- Generate presigned URLs for temporary access

---

### ApiKeyService

```java
public interface ApiKeyService {
    String generateApiKey(String userId);
    String getApiKeyForUser(String userId);
    User validateApiKey(String apiKey);
    void revokeApiKey(String apiKey);
}
```

**Responsibilities**:
- Generate unique API keys
- Validate API keys
- Associate with users
- Track API key usage (for embed rate limiting)

---

## 14. IMPLEMENTATION CHECKLIST

### Phase 1: Setup & Configuration
- [ ] Create Spring Boot project with Maven
- [ ] Configure MongoDB connection
- [ ] Set up Azure Blob Storage client
- [ ] Configure JWT and Spring Security
- [ ] Set up CORS configuration
- [ ] Create application.yml files (dev, prod)

### Phase 2: Core Models & Repositories
- [ ] Create User, Song, LyricLine, ApiKey entities
- [ ] Create UserRepository, SongRepository, ApiKeyRepository
- [ ] Create MongoDB indexes
- [ ] Create DTOs (request/response objects)

### Phase 3: Authentication
- [ ] Implement AuthService
- [ ] Create JwtTokenProvider
- [ ] Create JwtAuthenticationFilter
- [ ] Implement AuthController (signup, login, logout)
- [ ] Create custom UserDetailsService
- [ ] Implement password hashing (BCrypt)

### Phase 4: User Management
- [ ] Create UserService
- [ ] Implement profile endpoints
- [ ] Implement password change endpoint
- [ ] Create UserController

### Phase 5: Lyrics Integration
- [ ] Create LRCLibClient (REST client for LRCLib API)
- [ ] Implement LyricsService
- [ ] Create LRC format parser
- [ ] Handle lyrics not found gracefully
- [ ] Cache lyrics successfully

### Phase 6: File Upload & Storage
- [ ] Configure Azure Storage client
- [ ] Create AzureStorageService
- [ ] Implement file validation (format, size, MIME)
- [ ] Implement upload flow
- [ ] Generate public URLs from Azure
- [ ] Test with actual audio files

### Phase 7: Song Management
- [ ] Create SongService
- [ ] Implement song upload endpoint
- [ ] Implement lyrics confirmation endpoint
- [ ] Implement get songs endpoint
- [ ] Implement delete song endpoint
- [ ] Implement frequency weight endpoint
- [ ] Create SongController
- [ ] Enforce 10 song limit

### Phase 8: Embed & API Keys
- [ ] Create ApiKeyService
- [ ] Implement API key generation
- [ ] Create EmbedController
- [ ] Implement /embed/check endpoint
- [ ] Implement /embed/songs endpoint
- [ ] Implement caching strategy
- [ ] Add rate limiting for embed endpoints

### Phase 9: Error Handling & Logging
- [ ] Create GlobalExceptionHandler
- [ ] Create custom exception classes
- [ ] Set up logging configuration
- [ ] Add comprehensive logging throughout

### Phase 10: Testing & Documentation
- [ ] Unit tests for services
- [ ] Integration tests for controllers
- [ ] API documentation (Swagger/OpenAPI)
- [ ] README with setup instructions
- [ ] Environment variable documentation

---

## 15. NOTES FOR IMPLEMENTATION

1. **No JWT Expiry**: Tokens never expire. User must manually logout. Consider adding logout blacklist if needed.

2. **Gmail Only**: Validate email pattern: `.*@gmail\.com$` (case-insensitive)

3. **Song Limit**: Hard limit of 10 songs per user. Enforce at service layer and check before upload.

4. **Lyrics Caching**: Cache LRCLib responses in database to avoid repeated API calls for the same song.

5. **Azure URLs**: Generate public blob URLs (SAS tokens optional). Ensure containers allow public read access.

6. **Embed Rate Limiting**: Implement simple rate limiter (Redis recommended for production, in-memory HashMap for MVP).

7. **Frequency Weights**: Stored in database with each Song. Frontend will apply these during random selection.

8. **Session Tracking**: Embed does NOT track sessions on backend. Frontend handles "no repeats in session" logic via sessionStorage.

9. **Password Reset**: Backend generates token/link, but frontend must handle display. Token validation endpoint returns `{ valid: true/false }`.

10. **Soft Delete (Future)**: Currently hard delete. Consider soft delete for audit trail later.

11. **Performance**: Add indexes on frequently queried fields (email, userId, apiKey).

12. **Monitoring**: Use Spring Boot Actuator for health checks, metrics, etc.

13. **Database Backups**: Set up MongoDB backups regularly in production.

14. **CORS**: Whitelist frontend URL explicitly. Don't use `*` in production.

---

**Document Status**: ✅ Ready for Superior Model Implementation

This specification is comprehensive and ready for a superior model to execute the entire backend in a single shot.
