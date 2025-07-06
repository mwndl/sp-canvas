# SpCanvas - Spotify Visual Experience

A comprehensive visual companion for Spotify that displays Canvas videos, synchronized lyrics, and creates beautiful screensavers with your music.

## 🚀 How to use

### Option 1: Docker (Recommended)

#### 1. Setup with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd spcanvas
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
docker build -t spcanvas:latest .
docker run -d --name spcanvas -p 3000:3000 --env-file .env spcanvas:latest
```

4. Access `http://localhost:3000` in your browser
5. Click "Start Canvas" to begin the screensaver

#### Docker Commands

```bash
# View logs
docker logs -f spcanvas

# Stop container
docker stop spcanvas

# Start container
docker start spcanvas

# Remove container
docker rm spcanvas

# Update and restart
docker-compose down
docker-compose up -d --build
```

### Option 2: Local Development

#### 1. Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd spcanvas
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
- `movementMode`: Movement mode (`static`, `fade`, `dvd`) - Default: `fade`
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

# Screen Saver with static movement
http://localhost:3000/canvas?mode=screensaver&displayMode=album1&movementMode=static

# Portuguese language with debug mode
http://localhost:3000/canvas?lang=pt&debug=true
```

## 🎯 Features

### 🎵 **Music Visualization**
- ✅ **Spotify Canvas Videos**: Fullscreen display of official Canvas videos
- ✅ **Real-time Music Detection**: Automatically detects currently playing music
- ✅ **Specific Track Support**: Display Canvas for any Spotify track by ID
- ✅ **End-of-Track Polling**: Intelligent polling after music ends for immediate updates

### 📝 **Synchronized Lyrics**
- ✅ **Real-time Lyrics Sync**: Lyrics synchronized with music playback
- ✅ **Multiple Display Modes**: 5-line centered or left-aligned layouts
- ✅ **Instrumental Detection**: Smart detection and animation of instrumental sections
- ✅ **Gradual Loading**: "..." animation before first lyric appears
- ✅ **Auto-hide**: Lyrics automatically hide when music ends

### 🖼️ **Screensaver Modes**
- ✅ **Album Cover Display**: Beautiful album cover presentations
- ✅ **Clock Mode**: Elegant clock with timezone support
- ✅ **Movement Animations**: Fade, DVD bounce, or static modes
- ✅ **Fallback System**: Automatic fallback to clock when no music plays

### 🎨 **Visual Customization**
- ✅ **Background Modes**: Theme colors, fixed colors, or album covers
- ✅ **Track Information**: Artist, album, and song details overlay
- ✅ **Responsive Design**: Works on any screen size
- ✅ **Modern Interface**: Clean, professional UI

### ⚙️ **Advanced Features**
- ✅ **TOTP Authentication**: Secure Spotify API authentication
- ✅ **Multi-language Support**: English and Portuguese interfaces
- ✅ **Debug Mode**: Detailed logging and troubleshooting
- ✅ **Keyboard Controls**: ESC key to exit
- ✅ **Configurable Polling**: Customizable update intervals
- ✅ **Cache System**: Efficient API usage with intelligent caching

## 🔧 Technologies

- **Next.js 14** - React framework
- **TypeScript** - Static typing
- **Tailwind CSS** - Styling
- **Axios** - HTTP requests
- **OTPAuth** - TOTP authentication
- **Spotify Web API** - Music data

## 📱 How it works

SpCanvas uses a robust TOTP (Time-based One-Time Password) authentication implementation that exactly simulates how the Spotify Web Player works:

### 🎵 **Music Visualization Mode**
1. **Authentication**: Generates TOTP tokens to authenticate with Spotify API
2. **Music Detection**: Gets the currently playing music via Spotify Web API
3. **Canvas Fetching**: Searches for available Canvas for the music via Spotify's internal API
4. **Lyrics Sync**: Fetches synchronized lyrics and tracks player progress in real-time
5. **End-of-Track Detection**: Intelligently schedules polling after music ends
6. **Display**: Plays Canvas videos in fullscreen with synchronized lyrics overlay

### 🖼️ **Screensaver Mode**
1. **Display Selection**: Shows album covers, clock, or combination based on settings
2. **Movement**: Applies fade in/out, DVD bouncing, or static animations
3. **Fallback**: Automatically switches to clock when no music is playing
4. **Customization**: Supports timezone, date display, and track info overlays

### 📝 **Lyrics System**
1. **Real-time Sync**: Tracks player progress and highlights current lyrics
2. **Smart Detection**: Identifies instrumental sections and animates them
3. **Gradual Loading**: Shows "..." animation before first lyric appears
4. **Auto-hide**: Automatically hides lyrics when music ends

## 🎨 Interface

- **Home Screen**: Mode selection (Music Visualization/Screensaver) with comprehensive settings
- **Music Visualization Mode**: Canvas display with synchronized lyrics, track info, and background options
- **Screensaver Mode**: Album covers, clock, and movement animations
- **Controls**: ESC to exit, automatic transitions and fallbacks
- **Debug Panel**: Real-time logging and system status when debug mode is enabled

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
cd spcanvas
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
docker build -t spcanvas:latest .
docker run -d --name spcanvas -p 3000:3000 --env-file .env --restart unless-stopped spcanvas:latest
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
