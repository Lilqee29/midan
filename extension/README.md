# Midan Chrome Extension

A Chrome extension that extracts action items from meeting notes and Google Meet transcripts.

## Features

- **Paste Notes**: Paste meeting notes directly into the extension popup
- **Google Meet Capture**: Automatically capture transcripts from Google Meet calls
- **API Key Auth**: Securely authenticate with your Midan account
- **Quick Results**: See extracted action items grouped by person

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension/` folder from this project

## Setup

1. Start the Midan web app (`npm run dev` in the `web/` folder)
2. Go to http://localhost:3000/settings
3. Generate an API key
4. Open the Midan extension popup
5. Enter your API key and click "Connect to Midan"

## Usage

### From Paste
1. Click the Midan extension icon
2. Paste your meeting notes into the text area
3. Click "Extract Action Items"
4. View results grouped by person

### From Google Meet
1. Join a Google Meet call
2. Open the transcript panel (CC button)
3. Click the Midan extension icon
4. Click "Capture from Meet"
5. Click "Extract Action Items"

## Development

The extension uses:
- **Manifest V3** - Latest Chrome extension format
- **Service Worker** - Background processing
- **Content Scripts** - Google Meet integration
- **Chrome Storage API** - Secure API key storage

## File Structure

```
extension/
├── manifest.json           # Extension configuration
├── popup/
│   ├── index.html         # Popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── background/
│   └── service-worker.js  # Background processing
├── content/
│   ├── meet-capture.js    # Google Meet transcript capture
│   └── meet-styles.css    # Meet overlay styles
└── icons/                 # Extension icons
```
