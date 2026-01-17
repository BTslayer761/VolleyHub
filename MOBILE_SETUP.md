# Mobile App Setup Guide

Your VolleyHub app is already configured for mobile! Here's how to run and build it for iOS and Android.

## Quick Start - Running on Mobile

### Option 1: Using Expo Go (Easiest for Testing)

1. **Install Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Scan the QR code**:
   - **iOS**: Open Camera app and scan the QR code
   - **Android**: Open Expo Go app and scan the QR code

### Option 2: Using iOS Simulator (Mac only)

```bash
npm run ios
```

This will open the iOS Simulator and run your app.

### Option 3: Using Android Emulator

1. Make sure you have Android Studio installed with an emulator set up
2. Run:
   ```bash
   npm run android
   ```

## Building for Production

### Building with EAS (Expo Application Services) - Recommended

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Configure your project**:
   ```bash
   eas build:configure
   ```

4. **Build for iOS** (requires Apple Developer account):
   ```bash
   eas build --platform ios
   ```

5. **Build for Android**:
   ```bash
   eas build --platform android
   ```

### Building Locally (Advanced)

For local builds, you'll need to generate native projects:

```bash
npx expo prebuild
```

Then build using Xcode (iOS) or Android Studio (Android).

## Firebase Setup for Mobile

The Firebase web configuration works perfectly for mobile apps too! You can use the same `.env` file.

However, if you want to add mobile-specific Firebase apps:

### Adding iOS App to Firebase

1. Go to Firebase Console > Project Settings
2. Click "Add app" and select iOS
3. Enter your iOS bundle ID (found in `app.json` or set it)
4. Download `GoogleService-Info.plist`
5. Place it in your project root (it will be used during build)

### Adding Android App to Firebase

1. Go to Firebase Console > Project Settings
2. Click "Add app" and select Android
3. Enter your Android package name (found in `app.json`)
4. Download `google-services.json`
5. Place it in your project root (it will be used during build)

**Note**: For Expo managed workflow, the web config is sufficient. The mobile-specific files are only needed if you eject to bare workflow.

## Mobile-Specific Features

Your app already includes:
- ✅ Touch-optimized UI
- ✅ Keyboard handling (KeyboardAvoidingView)
- ✅ Safe area support
- ✅ Haptic feedback on tabs
- ✅ Portrait orientation lock
- ✅ Native navigation

## Testing Checklist

- [ ] Login works on mobile device
- [ ] Keyboard doesn't cover inputs
- [ ] Volleyball animation plays smoothly
- [ ] Screen shatter effect works
- [ ] Navigation transitions smoothly
- [ ] App works in both light and dark mode

## Troubleshooting

### "Unable to resolve module" errors
- Run `npm install` again
- Clear cache: `npx expo start -c`

### Firebase not working on mobile
- Make sure your `.env` file is in the root directory
- Restart the Expo server after adding `.env`
- Check that environment variables start with `EXPO_PUBLIC_`

### Build errors
- Make sure you have the latest Expo CLI: `npm install -g expo-cli`
- Clear build cache: `eas build --clear-cache`

## Next Steps

1. Test your app on a physical device using Expo Go
2. Set up Firebase Authentication (see `FIREBASE_SETUP.md`)
3. When ready, build for production using EAS Build
4. Submit to App Store / Google Play Store
