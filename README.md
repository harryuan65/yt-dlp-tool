# yt-dlp Desktop App (WIP)

As a content creator, a UI would be handy for frequent use of yt-dlp. However, the UIs I found online are either Windows-only or not-so-good experience. Trying to make myself one.

A user-friendly desktop application for yt-dlp and ffmpeg, designed for users without programming backgrounds. Features a modern dark theme interface similar to VSCode.

## Features

- **Video Download**: Download videos from YouTube and other supported platforms
- **Audio Extraction**: Extract audio in MP3 or WAV format
- **File Conversion**: Convert between different image, video, and audio formats
- **Folder Management**: Easy access to download and output folders
- **Real-time Progress**: Live download and conversion progress updates
- **Auto Tool Detection**: Automatically checks for required tools (yt-dlp, ffmpeg)
- **Cross-platform**: Works on macOS, Windows, and Linux

## System Requirements

- **macOS**: 10.14 or later
- **Windows**: 10 or later
- **Linux**: Most modern distributions
- **Node.js**: 16.0 or later
- **yt-dlp**: Latest version
- **ffmpeg**: Latest version

## Installation

### 1. Install Required Tools

#### macOS (using Homebrew)

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install yt-dlp
brew install yt-dlp

# Install ffmpeg
brew install ffmpeg
```

#### Windows (using Chocolatey)

```powershell
# Install Chocolatey (if not already installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install yt-dlp
choco install yt-dlp

# Install ffmpeg
choco install ffmpeg
```

#### Linux (Ubuntu/Debian)

```bash
# Install yt-dlp
sudo apt update
sudo apt install yt-dlp

# Install ffmpeg
sudo apt install ffmpeg
```

### 2. Install Application Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ytdlp-desktop-app

# Install Node.js dependencies
npm install
```

### 3. Run the Application

#### Development Mode

```bash
npm run electron-dev
```

#### Production Mode

```bash
# Build the application
npm run build

# Run Electron app
npm run electron
```

#### Package Application

```bash
npm run electron-pack
```

## Usage

### Video Download

1. Launch the application
2. Go to the "Download" tab
3. Paste the video URL
4. Choose download options:
   - **Custom Video Options**: Detect and select specific video/audio formats
   - **Audio Only**: Extract audio in MP3 or WAV format
5. Select download location
6. Click "Download" to start

### File Conversion

1. Go to the "Convert" tab
2. Drag and drop files or click to select
3. Choose conversion type (Image/Video/Audio)
4. Select output format
5. Choose output directory
6. Click "Convert" to start

### Folder Management

- Click "Open Folder" buttons to quickly access download or output directories
- Default paths are automatically set to system Downloads folder

## Project Structure

```
ytdlp-desktop-app/
├── public/
│   ├── electron.js          # Electron main process
│   ├── preload.js           # Preload script
│   └── index.html           # HTML template
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx
│   │   ├── DownloadTab/
│   │   │   └── DownloadTab.tsx
│   │   ├── ConvertTab.tsx
│   │   ├── FileDropZone.tsx
│   │   ├── StatusPanel.tsx
│   │   └── ...
│   ├── types/
│   │   └── global.d.ts      # TypeScript definitions
│   ├── utils/
│   │   └── command.js       # Command utilities
│   ├── App.tsx              # Main application component
│   └── index.tsx            # React entry point
├── package.json
└── README.md
```

## Technology Stack

- **Electron**: Desktop application framework
- **React**: UI framework with TypeScript
- **Styled Components**: CSS-in-JS styling solution
- **yt-dlp**: Video download tool
- **ffmpeg**: Audio/video processing tool

## Development

### Key Files

- `public/electron.js`: Electron main process, handles window management and system interactions
- `public/preload.js`: Preload script, provides secure APIs to renderer process
- `src/App.tsx`: Main application component, manages state and component coordination
- `src/components/`: Various UI components
- `src/utils/command.js`: Command building utilities for yt-dlp and ffmpeg

### Adding Features

1. Create new components in `src/components/`
2. Import and use components in `src/App.tsx`
3. For system interactions, add IPC handlers in `public/electron.js`
4. Expose secure APIs in `public/preload.js`
5. Update TypeScript definitions in `src/types/global.d.ts`

## Known Issues

- File conversion currently processes files individually (not batch processing)
- Some complex video formats may require specific ffmpeg configurations
- Large file downloads may take time depending on internet speed

## License

MIT License

## Disclaimer

This project is currently not open for external contributions. The application is in active development and the codebase may undergo significant changes.

## Support

For issues and questions, please check the existing issues or create a new one with detailed information about your problem.
