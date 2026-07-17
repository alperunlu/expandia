# Expandia — Empire Clash

iOS territory strategy game. Built with HTML/CSS/JS, wrapped with Expo + WebView for App Store distribution via EAS Build.

## Build & Publish (Cloud — no Mac needed)

### 1. Install
```bash
npm install
```

### 2. Bundle the game
```bash
npm run bundle
```

### 3. Login to Expo & init project
```bash
npx eas login                     # Login with your Expo account
npx eas init                      # Creates project on expo.dev, updates app.json
```

### 4. Build for iOS (cloud build)
```bash
npm run build:ios                 # or: npx eas build --platform ios --profile production
```

EAS Build will:
- Upload your project to Expo's servers
- Run `expo prebuild` (macOS) to generate the native Xcode project
- Build, sign, and return an `.ipa` file

### 5. Submit to App Store
```bash
npm run submit:ios                # or: npx eas submit --platform ios --profile production
```

Before submitting, update `eas.json` with your Apple credentials:
- `appleId` — your Apple Developer email
- `ascAppId` — App Store Connect app ID (numeric)
- `appleTeamId` — your Apple Team ID

## Local development
```bash
npm start                         # Starts Expo dev server
```

## Project structure
```
├── App.js                # Expo/React Native entry (WebView wrapper)
├── app.json              # Expo configuration
├── eas.json              # EAS Build configuration
├── game.html             # Game source (single HTML file)
├── assets/
│   ├── gameHtml.js       # Bundled game (auto-generated)
│   └── apple-touch-icon.png
├── resources/            # App icons & splash screens
├── scripts/              # Asset & bundle generators
└── www/                  # Legacy web assets
```

## App Store metadata
- **Bundle ID:** `com.alu.expandia`
- **Name:** Expandia
- **Category:** Games / Strategy
