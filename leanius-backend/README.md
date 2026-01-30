# Leanius Backend

Spring Boot backend for the Leanius embeddable music player with real-time lyrics synchronization.

## Tech Stack

- **Java 17** + **Spring Boot 3.2.2**
- **MongoDB** - Database
- **Azure Blob Storage** - Audio file storage
- **JWT** - Authentication (never-expiring tokens)
- **LRCLib API** - Lyrics fetching

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- MongoDB (local or cloud)
- Azure Storage Account (for audio files)

## Quick Start

### 1. Clone and Navigate

```bash
cd leanius-backend
```

### 2. Set Environment Variables

Create a `.env` file or set these environment variables:

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/leanius
JWT_SECRET=your-256-bit-secret-key-here-minimum-32-characters
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# Optional (with defaults)
AZURE_STORAGE_CONTAINER=leanius-audio
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
SPRING_PROFILES_ACTIVE=dev
```

### 3. Run with Maven

```bash
# Development mode
mvn spring-boot:run

# Or build and run JAR
mvn clean package -DskipTests
java -jar target/leanius-backend-0.0.1-SNAPSHOT.jar
```

The server starts at `http://localhost:8080/api/v1`

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/signup` | No | Register (Gmail only) |
| POST | `/auth/login` | No | Login |
| POST | `/auth/logout` | JWT | Logout |
| POST | `/auth/reset-password` | No | Request password reset |

### User Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/profile` | JWT | Get user profile |
| PUT | `/user/profile` | JWT | Update profile |
| PUT | `/user/password` | JWT | Change password |
| GET | `/user/api-key` | JWT | Get/generate API key |
| POST | `/user/api-key/regenerate` | JWT | Regenerate API key |

### Songs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/songs/upload` | JWT | Upload song (multipart) |
| POST | `/songs/confirm-lyrics` | JWT | Confirm/reject lyrics |
| GET | `/songs` | JWT | Get user's songs |
| GET | `/songs/{id}` | JWT | Get single song |
| DELETE | `/songs/{id}` | JWT | Delete song |
| PUT | `/songs/{id}/weight` | JWT | Update frequency weight |

### Embed (Public API)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/embed/check?key=` | API Key | Check for changes |
| GET | `/embed/songs?key=` | API Key | Get all songs for embed |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/health/ready` | No | Readiness check |

## Request/Response Examples

### Signup

```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@gmail.com",
  "password": "securepassword123",
  "displayName": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "email": "user@gmail.com",
    "displayName": "John Doe"
  }
}
```

### Upload Song

```bash
POST /api/v1/songs/upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

file: <audio-file>
title: "Song Title"
artist: "Artist Name"
```

### Confirm Lyrics

```bash
POST /api/v1/songs/confirm-lyrics
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "songId": "65abc123...",
  "confirmed": true
}
```

### Get Embed Songs

```bash
GET /api/v1/embed/songs?key=your-api-key
```

Response:
```json
{
  "success": true,
  "data": {
    "songs": [
      {
        "id": "65abc123...",
        "title": "Song Title",
        "artist": "Artist Name",
        "audioUrl": "https://storage.blob.core.windows.net/...",
        "lyrics": [
          { "startTimeMs": 0, "text": "First line..." },
          { "startTimeMs": 3500, "text": "Second line..." }
        ],
        "frequencyWeight": 1.0
      }
    ],
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## Configuration

### application.yml

```yaml
server:
  port: 8080
  servlet:
    context-path: /api/v1

spring:
  data:
    mongodb:
      uri: ${MONGODB_URI}
  servlet:
    multipart:
      max-file-size: 100MB
      max-request-size: 100MB

jwt:
  secret: ${JWT_SECRET}
  expiration: 999999999999  # Never expires

azure:
  storage:
    connection-string: ${AZURE_STORAGE_CONNECTION_STRING}
    container-name: ${AZURE_STORAGE_CONTAINER:leanius-audio}
```

## Key Constraints

- **Gmail only registration** - Email must end with `@gmail.com`
- **Max 10 songs per user** - Enforced at upload time
- **Supported audio formats** - MP3, WAV, OGG, FLAC
- **Max file size** - 100MB per file
- **JWT tokens never expire** - Per project requirement
- **Rate limiting** - 1000 requests/day per API key on embed endpoints

## Project Structure

```
src/main/java/com/leanius/
├── LeaniusApplication.java       # Main entry point
├── config/
│   ├── SecurityConfig.java       # Spring Security
│   └── CorsConfig.java           # CORS settings
├── controller/
│   ├── AuthController.java       # /auth/**
│   ├── UserController.java       # /user/**
│   ├── SongController.java       # /songs/**
│   ├── EmbedController.java      # /embed/**
│   └── HealthController.java     # /health/**
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── SongService.java
│   ├── LyricsService.java
│   ├── AzureStorageService.java
│   └── ApiKeyService.java
├── repository/
│   ├── UserRepository.java
│   ├── SongRepository.java
│   └── ApiKeyRepository.java
├── model/
│   ├── User.java
│   ├── Song.java
│   ├── LyricLine.java
│   └── ApiKey.java
├── dto/                          # Request/Response DTOs
├── exception/                    # Custom exceptions
├── security/                     # JWT implementation
├── client/
│   └── LRCLibClient.java         # LRCLib API client
└── util/
    ├── FileValidator.java
    └── LyricsParser.java
```

## Development

### Run Tests

```bash
mvn test
```

### Build for Production

```bash
mvn clean package -Pprod
```

### Profiles

- `dev` - Development (default)
- `prod` - Production

## External APIs

### LRCLib API

Used for fetching synchronized lyrics. Free and legal API.

- Base URL: `https://lrclib.net/api`
- Endpoint: `GET /get?artist_name={artist}&track_name={title}`

## Troubleshooting

### Lombok Errors in IDE

The IDE may show errors for Lombok annotations (`@Data`, `@Builder`, etc.). These compile correctly with Maven. To fix IDE warnings:

1. Install Lombok plugin for your IDE
2. Enable annotation processing

### MongoDB Connection

Ensure MongoDB is running:

```bash
# Local MongoDB
mongod --dbpath /path/to/data

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Azure Storage

For local development without Azure, the service will gracefully handle missing configuration but file uploads will fail.

## License

Proprietary - Leanius
