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

#### Basic Parameters
- `mode`: Screensaver mode (`static`, `fade`, `dvd`) - Default: `static`
- `fade`: Fade interval in milliseconds - Default: `3000`
- `auto`: Auto update (`true`, `false`) - Default: `true`
- `poll`: Polling interval in milliseconds - Default: `5000`
- `info`: Show track info on Canvas bottom (`true`, `false`) - Default: `true`
- `lang`: Language (`en`, `pt`) - Default: `en`

#### Debug Parameters
- `debug`: Enable debug mode (`true`, `false`) - Default: `false`
- `log_limit`: Maximum number of debug logs to keep (10-200) - Default: `50`
- `timeout`: Video loading timeout in milliseconds before fallback - Default: `1000`

#### Track Selection
- `trackid`: Specific Spotify track ID to display (disables auto-update)

### Examples

```bash
# Debug mode with extended timeout
http://localhost:3000/canvas?debug=true&timeout=3000&log_limit=100

# DVD screensaver mode
http://localhost:3000/canvas?mode=dvd&fade=2000

# Specific track with no auto-update
http://localhost:3000/canvas?trackid=4iV5W9uYEdYUVa79Axb7Rh&auto=false

# Portuguese language with fade mode
http://localhost:3000/canvas?lang=pt&mode=fade&info=false
```

## 🎯 Features

- ✅ Automatic TOTP authentication
- ✅ Search for currently playing music
- ✅ Fullscreen Canvas display
- ✅ Automatic transition between multiple Canvas
- ✅ Music information overlay
- ✅ ESC key control to exit
- ✅ Responsive and modern interface
- ✅ Debug mode with detailed logging
- ✅ Configurable video timeout and fallback
- ✅ Multiple screensaver modes (static, fade, DVD)

## 🔧 Technologies

- **Next.js 14** - React framework
- **TypeScript** - Static typing
- **Tailwind CSS** - Styling
- **Axios** - HTTP requests
- **OTPAuth** - TOTP authentication
- **Spotify Web API** - Music data

## 📱 How it works

SpotSaver uses a robust TOTP (Time-based One-Time Password) authentication implementation that exactly simulates how the Spotify Web Player works:

1. **Authentication**: Generates TOTP tokens to authenticate with Spotify API
2. **Music search**: Gets the currently playing music via Spotify Web API
3. **Canvas**: Searches for available Canvas for the music via Spotify's internal API
4. **Display**: Plays Canvas videos in fullscreen with music information

## 🎨 Interface

- **Home screen**: Instructions and start button
- **Canvas screen**: Fullscreen video with information overlay
- **Controls**: ESC to exit, automatic Canvas transition

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
