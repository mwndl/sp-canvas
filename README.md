# SpotSaver - Spotify Canvas Screensaver

An elegant screensaver that displays the Spotify Canvas of the currently playing music in fullscreen.

## 🚀 How to use

### 1. Setup

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

### 2. How to get the SP_DC cookie

1. Open [Spotify Web Player](https://open.spotify.com) in your browser
2. Log in to your account
3. Open developer tools (F12)
4. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
5. In the left panel, expand **Cookies** and click on `https://open.spotify.com`
6. Look for the cookie named `sp_dc`
7. Copy the cookie value (should start with "AQ" and have more than 50 characters)
8. Paste this value in the `.env` file

### 3. Run the project

```bash
npm run dev
```

4. Access `http://localhost:3000` in your browser
5. Click "Start Canvas" to begin the screensaver

## 🎯 Features

- ✅ Automatic TOTP authentication
- ✅ Search for currently playing music
- ✅ Fullscreen Canvas display
- ✅ Automatic transition between multiple Canvas
- ✅ Music information overlay
- ✅ ESC key control to exit
- ✅ Responsive and modern interface

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

## 📄 License

This project is open source and available under the MIT license.
