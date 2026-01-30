# Leanius - Lyrics Player Web Embed

Leanius is an embeddable web player that lets you create accounts, upload audio files, and automatically fetch lyrics using song metadata. Test and sync lyrics with music in real-time, then embed the player anywhere on your website to randomly play audio tracks with synchronized lyrics. Customize colors and styles to match your brand.

## Features

- **Account Creation & Management**: Create user accounts to manage your music library
- **Audio Upload**: Upload audio files to your personal library
- **Automatic Lyrics Fetching**: Automatically retrieves lyrics using song metadata
- **Lyrics Synchronization**: Real-time lyrics syncing with audio playback
- **Animation Testing**: Test and preview lyrics animation before embedding
- **Web Embed**: Embed the player anywhere on your website with a single snippet
- **Random Playback**: Randomly plays audio tracks from your library
- **Customizable Styling**: Change colors, fonts, and styles to match your website design
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/7meninn/Leanius.git
cd Leanius
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Usage

#### Creating an Account

1. Visit the Leanius app
2. Sign up with your email and password
3. Verify your account through email

#### Uploading Audio Files

1. Log in to your account
2. Navigate to the "Upload" section
3. Select audio files from your device
4. The system will automatically fetch lyrics using the file's metadata

#### Testing & Syncing Lyrics

1. Go to the "Test" section
2. Select an uploaded track
3. Play the track and adjust lyrics timing if needed
4. Preview the animation and syncing in real-time

#### Embedding the Player

1. Navigate to "Embed" section
2. Copy the embed code snippet
3. Paste it into your website's HTML:

```html
<iframe 
  src="https://leanius.app/embed?user=YOUR_USER_ID" 
  width="100%" 
  height="500" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

#### Customizing Styles

You can customize the player appearance using query parameters:

```html
<iframe 
  src="https://leanius.app/embed?user=YOUR_USER_ID&primaryColor=%23FF5733&backgroundColor=%23000000" 
  width="100%" 
  height="500" 
  frameborder="0" 
  allowfullscreen>
</iframe>
```

Available customization options:
- `primaryColor`: Main player color (hex code)
- `backgroundColor`: Player background color (hex code)
- `textColor`: Text color (hex code)
- `playlistMode`: Display mode ('grid', 'list', 'carousel')
- `autoplay`: Auto-play on load (true/false)

## Technical Stack

- **Frontend**: React, TypeScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Audio Processing**: Web Audio API
- **Lyrics Fetching**: Integration with lyrics APIs
- **Styling**: CSS-in-JS, TailwindCSS

## Project Structure

```
Leanius/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── styles/         # Global styles
│   └── types/          # TypeScript types
├── server/             # Backend server code
├── package.json
├── README.md
└── LICENSE
```

## API Endpoints

### User Management
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/user/profile` - Get user profile

### Audio & Lyrics
- `POST /api/upload` - Upload audio file
- `GET /api/tracks` - Get user's tracks
- `DELETE /api/tracks/:id` - Delete track
- `GET /api/lyrics/:trackId` - Get track lyrics
- `PUT /api/lyrics/:trackId` - Update lyrics timing

### Embedding
- `GET /api/embed/:userId` - Get embed configuration
- `PUT /api/embed/:userId` - Update embed settings

## Configuration

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_LYRICS_API_KEY=your_lyrics_api_key
DATABASE_URL=mongodb://localhost:27017/leanius
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

## Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
```

### Linting & Formatting

```bash
npm run lint
npm run format
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Advanced lyrics editor with precise timing controls
- [ ] Support for multiple lyrics providers
- [ ] Playlist collaboration features
- [ ] Analytics dashboard
- [ ] Social sharing features
- [ ] Mobile app (React Native)
- [ ] Offline playback support
- [ ] Advanced theme customization engine

## Known Issues

- Lyrics fetching may fail for very new or obscure songs
- Embedding player in cross-origin iframes may require CORS configuration
- Mobile Safari has limitations with Web Audio API

## Support

For support, email support@leanius.app or open an issue on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Special thanks to [lyrics-api] for lyrics data
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) documentation
- Community contributors and feedback

---

Made with ❤️ by the Leanius Team
