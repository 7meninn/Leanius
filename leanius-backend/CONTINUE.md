# Leanius Backend - Continuation Guide

This file provides context for continuing development from where we left off.

## Current State (January 31, 2026)

### Completed
- ✅ Full Spring Boot 3.2.2 backend implementation (50 Java files)
- ✅ All models, repositories, services, controllers implemented
- ✅ JWT authentication (never-expiring tokens)
- ✅ Azure Blob Storage integration for audio files
- ✅ LRCLib API client for lyrics fetching
- ✅ Rate limiting on embed endpoints
- ✅ CORS configuration
- ✅ Maven wrapper (mvnw/mvnw.cmd) added
- ✅ README.md with full documentation
- ✅ **BUILD SUCCESS** - Compilation verified

### Project Structure
```
leanius-backend/
├── pom.xml                           # Maven config (Spring Boot 3.2.2, Java 17)
├── mvnw, mvnw.cmd                    # Maven wrapper scripts
├── README.md                         # Full documentation
├── .mvn/wrapper/                     # Maven wrapper config
└── src/main/java/com/leanius/
    ├── LeaniusApplication.java       # Entry point
    ├── config/                       # SecurityConfig, CorsConfig
    ├── controller/                   # Auth, User, Song, Embed, Health controllers
    ├── service/                      # Business logic services
    ├── repository/                   # MongoDB repositories
    ├── model/                        # User, Song, LyricLine, ApiKey entities
    ├── dto/                          # Request/Response DTOs
    ├── exception/                    # Custom exceptions + GlobalExceptionHandler
    ├── security/                     # JWT implementation
    ├── client/                       # LRCLibClient for external API
    └── util/                         # FileValidator, LyricsParser
```

## Maven Commands

**IMPORTANT:** Maven is installed at `C:\Program Files\Apache\maven\bin\mvn.cmd`

If `mvn` command doesn't work directly, use full path:
```powershell
# PowerShell
& 'C:\Program Files\Apache\maven\bin\mvn.cmd' <command>

# Or use the Maven wrapper (works without Maven installed)
.\mvnw.cmd <command>
```

### Common Commands
```bash
# Compile
mvn clean compile

# Run application
mvn spring-boot:run

# Build JAR (skip tests)
mvn clean package -DskipTests

# Run tests
mvn test

# Build for production
mvn clean package -Pprod
```

## Environment Variables Required

Create these before running:
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/leanius
JWT_SECRET=your-256-bit-secret-key-minimum-32-characters
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...

# Optional (have defaults)
AZURE_STORAGE_CONTAINER=leanius-audio
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
SPRING_PROFILES_ACTIVE=dev
```

## What To Do Next

### Option 1: Add Swagger/OpenAPI Documentation (Recommended)
Adds interactive API documentation at `/swagger-ui.html`

1. Add dependencies to `pom.xml`:
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

2. Create `config/OpenApiConfig.java`:
```java
@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI leaniusOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Leanius API")
                .description("Embeddable Music Player with Real-Time Lyrics")
                .version("1.0.0"));
    }
}
```

3. Add annotations to controllers for documentation

### Option 2: Add Unit Tests
Create tests in `src/test/java/com/leanius/`:
- `service/AuthServiceTest.java`
- `service/SongServiceTest.java`
- `controller/AuthControllerTest.java`
- etc.

### Option 3: Start Frontend Implementation
See `FRONTEND_PLAN.md` in project root for full frontend specifications.

Tech stack:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- React Query for API calls

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/signup` | No | Register (Gmail only) |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/logout` | JWT | Logout |
| GET | `/api/v1/user/profile` | JWT | Get profile |
| PUT | `/api/v1/user/profile` | JWT | Update profile |
| PUT | `/api/v1/user/password` | JWT | Change password |
| POST | `/api/v1/songs/upload` | JWT | Upload song |
| POST | `/api/v1/songs/confirm-lyrics` | JWT | Confirm lyrics |
| GET | `/api/v1/songs` | JWT | Get user's songs |
| DELETE | `/api/v1/songs/{id}` | JWT | Delete song |
| PUT | `/api/v1/songs/{id}/weight` | JWT | Update weight |
| GET | `/api/v1/embed/check?key=` | API Key | Check changes |
| GET | `/api/v1/embed/songs?key=` | API Key | Get songs |

## Key Constraints Implemented
- Gmail only registration (`@gmail.com`)
- Max 10 songs per user
- Supported formats: MP3, WAV, OGG, FLAC (max 100MB)
- JWT tokens never expire
- Rate limiting: 1000 requests/day per API key

## LSP Errors Note
IDE may show errors for Lombok annotations (`@Data`, `@Builder`, `@Slf4j`, `@RequiredArgsConstructor`). These are false positives - Lombok generates code at compile time. The build passes successfully.

## Related Files
- `BACKEND_PLAN.md` - Full backend specifications
- `FRONTEND_PLAN.md` - Frontend specifications
- `leanius-backend/README.md` - Backend documentation
