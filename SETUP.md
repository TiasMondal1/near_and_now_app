# Setup Instructions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Expo CLI** (will be installed globally or via npx)
4. **iOS Simulator** (Mac only) or **Android Emulator**

## Installation Steps

1. **Navigate to the app directory:**
```bash
cd near_and_now_app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install Expo CLI globally (if not already installed):**
```bash
npm install -g expo-cli
```

4. **Start the development server:**
```bash
npm start
```

This will open Expo DevTools in your browser.

## Running on Devices

### iOS Simulator (Mac only)
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Physical Device

1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code shown in the terminal or browser
3. The app will load on your device

## Configuration

The app uses the same Supabase backend as the web application. The configuration is already set up in `services/supabase.ts`.

If you need to change the Supabase URL or keys, edit `services/supabase.ts`.

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Troubleshooting

### Metro Bundler Issues
If you encounter issues with Metro bundler, try:
```bash
npm start -- --reset-cache
```

### Node Modules Issues
If you have dependency issues:
```bash
rm -rf node_modules
npm install
```

### Expo Issues
Clear Expo cache:
```bash
expo start -c
```

## Notes

- The app connects to the same Supabase backend as the web app
- All color schemes and design match the web application
- The app uses AsyncStorage for local data persistence (cart, etc.)



