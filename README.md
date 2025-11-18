# Near & Now - Mobile App

React Native mobile application for Near & Now e-commerce platform.

## Features

- 📱 Product browsing and search
- 🛒 Shopping cart management
- 💳 Order placement and tracking
- 👤 User authentication (OTP-based)
- 📍 Location-based services
- 🎨 Beautiful UI matching the web app design

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS) or Android Emulator (for Android)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Project Structure

```
near_and_now_app/
├── components/          # Reusable UI components
├── constants/           # Theme and color constants
├── context/             # React Context providers
├── navigation/          # Navigation configuration
├── screens/             # Screen components
├── services/            # API and service layer
└── utils/               # Utility functions
```

## Configuration

The app uses the same Supabase backend as the web application. Make sure your Supabase credentials are properly configured in `services/supabase.ts`.

## Color Scheme

- Primary: #059669 (Green-600)
- Secondary: #047857 (Green-700)
- Accent: #10b981 (Green-500)

## License

Same as the main project.



