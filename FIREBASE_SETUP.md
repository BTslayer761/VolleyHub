# Firebase Setup Instructions

## Step 1: Install Firebase Package

Run this command in your terminal:

```bash
npm install firebase
```

## Step 2: Get Your Firebase Configuration

### For Mobile App (Recommended)

Since you're building a mobile app, you can use the **Web** app configuration - it works perfectly for React Native/Expo apps!

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click the `</>` (Web) icon to add a web app
7. Register your app with a nickname (e.g., "VolleyHub Mobile")
8. Copy the configuration values (you'll see a `firebaseConfig` object)

**Note**: The web config works for both iOS and Android in Expo. You don't need separate iOS/Android apps unless you're using native Firebase features.

## Step 3: Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** in the left sidebar
2. Click on **Sign-in method** tab
3. Click on **Email/Password**
4. Enable the first toggle (Email/Password)
5. Click **Save**

## Step 4: Set Up Environment Variables

1. Create a `.env` file in the root of your project (same level as `package.json`)
2. Add your Firebase configuration:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase config values.

## Step 5: Update Firebase Config File

Open `config/firebase.ts` and make sure it's using the environment variables correctly (it should already be set up).

## Step 6: Create Test Users

1. In Firebase Console, go to **Authentication** > **Users**
2. Click **Add user**
3. Enter an email and password
4. Click **Add user**

You can now use this email/password to test login in your app!

## Step 7: Test the Login

### On Mobile Device (Recommended)

1. **Install Expo Go** on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Scan the QR code** with Expo Go app

4. **Test login** with the email/password you created

5. **Watch the volleyball animation** play on successful login!

### On Simulator/Emulator

- **iOS**: `npm run ios`
- **Android**: `npm run android`

Then test the login flow.

## Troubleshooting

- **"Firebase: Error (auth/invalid-api-key)"**: Make sure your `.env` file has the correct API key
- **"Firebase: Error (auth/network-request-failed)"**: Check your internet connection
- **Environment variables not loading**: Make sure your `.env` file is in the root directory and restart your Expo server

## Do I Need Firebase Hosting?

**No!** Firebase Hosting is only for web apps. Since you're building a **mobile app** with Expo/React Native, you don't need Firebase Hosting.

### What You Actually Need:

✅ **Firebase Authentication** - For user login (already set up!)  
❌ **Firebase Hosting** - Only for web apps, not needed for mobile  
❓ **Firebase Firestore/Realtime Database** - Optional, only if you need to store user data  
❓ **Firebase Storage** - Optional, only if you need to store files/images  

### For Your Mobile App:

Your app runs natively on iOS/Android devices, so it doesn't need hosting. The app code is bundled into the mobile app itself.

## Security Note

⚠️ **Important**: The `.env` file is already in `.gitignore` to prevent committing your Firebase credentials. Never commit your Firebase API keys to version control!
