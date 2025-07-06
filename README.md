# SpotSaver - Spotify Canvas Screensaver

An elegant screensaver that displays the Spotify Canvas of the currently playing music in fullscreen.

## 🚀 How to use

### Option 1: Docker (Recommended)

#### 1. Setup with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd spotsaver
```

2. Configure the environment variable:
   - Copy the example environment file:
   ```bash
   cp env.example .env
   ```
   - Edit `.env` and add your SP_DC cookie value

3. Build and run with Docker:
```bash
# Using the automated script
./docker-build.sh

# Or manually with docker-compose
docker-compose up -d

# Or manually with docker
docker build -t spotsaver:latest .
docker run -d --name spotsaver -p 3000:3000 --env-file .env spotsaver:latest
```

4. Access `http://localhost:3000` in your browser
5. Click "Start Canvas" to begin the screensaver

#### Docker Commands

```bash
# View logs
docker logs -f spotsaver

# Stop container
docker stop spotsaver

# Start container
docker start spotsaver

# Remove container
docker rm spotsaver

# Update and restart
docker-compose down
docker-compose up -d --build
```

### Option 2: Local Development

#### 1. Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd spotsaver
```

2. Install dependencies:
```bash
npm install
```

3. Configure the environment variable:
   - Create a `.env` file in the project root
   - Add your SP_DC variable:
   ```
   SP_DC=your_sp_dc_cookie_value_here
   ```

#### 2. How to get the SP_DC cookie

1. Open [Spotify Web Player](https://open.spotify.com) in your browser
2. Log in to your account
3. Open developer tools (F12)
4. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
5. In the left panel, expand **Cookies** and click on `https://open.spotify.com`
6. Look for the cookie named `sp_dc`
7. Copy the cookie value (should start with "AQ" and have more than 50 characters)
8. Paste this value in the `.env` file

#### 3. Run the project

```bash
npm run dev
```

4. Access `http://localhost:3000` in your browser
5. Click "Start Canvas" to begin the screensaver

## 🎛️ Advanced Configuration

### Query Parameters

You can customize the screensaver behavior using URL query parameters:

#### Standard Mode Parameters
- `showCanvas`: Show Spotify Canvas (`true`, `false`) - Default: `true`
- `showTrackInfo`: Show track info on Canvas (`true`, `false`) - Default: `true`
- `showLyrics`: Show synchronized lyrics (`true`, `false`) - Default: `false`
- `lyricsMode`: Lyrics display mode (`5lines`, `left`) - Default: `5lines`
- `searchMode`: Music detection mode (`auto`, `specific`) - Default: `auto`
- `trackId`: Specific Spotify track ID (when searchMode=specific)
- `pollingInterval`: Auto-update interval in seconds (1-60) - Default: `5`

#### Screen Saver Mode Parameters
- `displayMode`: Display mode (`album1`, `album2`, `clock`) - Default: `album1`
- `clockFormat`: Clock format (`12h`, `24h`) - Default: `12h`
- `timezone`: Timezone (e.g., `America/New_York`) - Default: `auto`
- `showDate`: Show date with clock (`true`, `false`) - Default: `true`
- `showTrackInfo`: Show track info with clock (`true`, `false`) - Default: `true`
- `movementMode`: Movement mode (`fade`, `dvd`) - Default: `fade`
- `fadeSpeed`: Fade speed in seconds (5-60) - Default: `15`

#### General Parameters
- `mode`: Operation mode (`standard`, `screensaver`) - Default: `standard`
- `lang`: Language (`en`, `pt`) - Default: `en`
- `debug`: Enable debug mode (`true`, `false`) - Default: `false`

### Examples

```bash
# Standard mode with lyrics enabled
http://localhost:3000/canvas?mode=standard&showLyrics=true&lyricsMode=left

# Screen Saver mode with clock
http://localhost:3000/canvas?mode=screensaver&displayMode=clock&clockFormat=24h&showDate=true

# Specific track with custom settings
http://localhost:3000/canvas?mode=standard&searchMode=specific&trackId=4iV5W9uYEdYUVa79Axb7Rh&showCanvas=true&showLyrics=true

# Screen Saver with DVD movement
http://localhost:3000/canvas?mode=screensaver&displayMode=album1&movementMode=dvd&fadeSpeed=10

# Portuguese language with debug mode
http://localhost:3000/canvas?lang=pt&debug=true
```

## 🎯 Features

- ✅ **Standard Mode**: Spotify Canvas display with synchronized lyrics
- ✅ **Screen Saver Mode**: Album covers, clock, and movement animations
- ✅ Automatic TOTP authentication with Spotify
- ✅ Real-time music detection and Canvas fetching
- ✅ Synchronized lyrics with multiple display modes
- ✅ Multiple background modes (theme color, fixed color, album cover)
- ✅ Clock display with timezone support and date options
- ✅ DVD movement and fade animations
- ✅ ESC key control to exit
- ✅ Responsive and modern interface
- ✅ Debug mode with detailed logging
- ✅ Multi-language support (English/Portuguese)
- ✅ Configurable polling intervals and fallbacks

## 🔧 Technologies

- **Next.js 14** - React framework
- **TypeScript** - Static typing
- **Tailwind CSS** - Styling
- **Axios** - HTTP requests
- **OTPAuth** - TOTP authentication
- **Spotify Web API** - Music data

## 📱 How it works

SpotSaver uses a robust TOTP (Time-based One-Time Password) authentication implementation that exactly simulates how the Spotify Web Player works:

### Standard Mode
1. **Authentication**: Generates TOTP tokens to authenticate with Spotify API
2. **Music Detection**: Gets the currently playing music via Spotify Web API
3. **Canvas Fetching**: Searches for available Canvas for the music via Spotify's internal API
4. **Lyrics Sync**: Fetches synchronized lyrics and tracks player progress
5. **Display**: Plays Canvas videos in fullscreen with lyrics overlay and music information

### Screen Saver Mode
1. **Display Selection**: Shows album covers, clock, or combination based on settings
2. **Movement**: Applies fade in/out or DVD bouncing animations
3. **Fallback**: Automatically switches to clock when no music is playing
4. **Customization**: Supports timezone, date display, and track info overlays

## 🎨 Interface

- **Home screen**: Mode selection (Standard/Screen Saver) with comprehensive settings
- **Standard Mode**: Canvas display with lyrics, track info, and background options
- **Screen Saver Mode**: Album covers, clock, and movement animations
- **Controls**: ESC to exit, automatic transitions and fallbacks

## 🔒 Security

- The SP_DC cookie is stored locally only
- No sensitive data is stored on the server
- Temporary authentication with TOTP tokens

## 🐛 Troubleshooting

### Authentication error
- Check if the SP_DC cookie is correct and up to date
- Make sure you're logged in to Spotify Web Player
- Try getting a new SP_DC cookie

### No Canvas available
- Not all songs have Canvas
- Check if there's music playing on Spotify
- Try with a different song

### Network error
- Check your internet connection
- Make sure Spotify Web Player is accessible

### Video compatibility issues
- Some Canvas videos returned by Spotify's CDN contain `movflags` parameters that are not compatible with older browsers

## 🐳 Docker

### Requirements
- Docker
- Docker Compose (optional, for easier management)

### Quick Start
```bash
# Clone and setup
git clone <repository-url>
cd spotsaver
cp env.example .env
# Edit .env with your SPOTIFY_SP_DC value

# Build and run
./docker-build.sh
```

### Production Deployment
```bash
# Using docker-compose
docker-compose up -d

# Using docker directly
docker build -t spotsaver:latest .
docker run -d --name spotsaver -p 3000:3000 --env-file .env --restart unless-stopped spotsaver:latest
```

### Environment Variables
- `SPOTIFY_SP_DC`: Your Spotify SP_DC cookie value (required)
- `PORT`: Custom port (optional, default: 3000)
- `NODE_ENV`: Environment (optional, default: production)

### Health Check
The container includes a health check that monitors the `/api/spotify/token` endpoint to ensure the application is running correctly.
- If videos fail to load, the system will automatically fallback to album cover display
- You can adjust the `timeout` parameter to control how long to wait before fallback
- Use `debug=true` to see detailed information about video loading attempts

### Debug mode
- Enable debug mode with `?debug=true` to see detailed logs
- Use `log_limit` parameter to control the number of logs kept in memory
- Debug panel shows video loading status, errors, and fallback reasons

## 📄 License

This project is open source and available under the MIT license.
