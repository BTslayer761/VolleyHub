# Firebase Setup Instructions

## Step 1: Install Firebase Package

Run this command in your terminal:

```bash
npm install firebase
```

## Step 2: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click on the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app yet:
   - Click the `</>` (Web) icon
   - Register your app with a nickname (e.g., "VolleyHub Web")
   - Copy the configuration values

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

1. Run your app: `npm start`
2. Try logging in with the email/password you created
3. The volleyball animation should play on successful login!

## Troubleshooting

- **"Firebase: Error (auth/invalid-api-key)"**: Make sure your `.env` file has the correct API key
- **"Firebase: Error (auth/network-request-failed)"**: Check your internet connection
- **Environment variables not loading**: Make sure your `.env` file is in the root directory and restart your Expo server

## Security Note

⚠️ **Important**: The `.env` file is already in `.gitignore` to prevent committing your Firebase credentials. Never commit your Firebase API keys to version control!
