# Enable Firestore API in Firebase

## Quick Fix

The error you're seeing means Firestore API needs to be enabled in your Google Cloud project. Here's how to fix it:

## Step 1: Enable Firestore API

1. **Click this link** (or copy-paste into your browser):
   ```
   https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=volleyhub-c3e4f
   ```

2. **Click the "Enable" button** on the page

3. **Wait 2-3 minutes** for the API to be enabled across Google's systems

## Step 2: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **volleyhub-c3e4f**
3. Click on **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select a location (choose the closest to you, e.g., `asia-southeast1` for Singapore)
7. Click **Enable**

## Step 3: Set Firestore Rules (for Development)

After creating the database, go to **Rules** tab and set:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents (for development only)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **Warning**: These rules allow anyone to read/write. Only use for development!

For production, use proper security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 4: Retry the Script

After enabling Firestore:

```bash
npm run create-test-users
```

## Alternative: Use Firebase Console to Create Users

If you still have issues, you can create users manually:

1. Go to Firebase Console > Authentication > Users
2. Click "Add user" for each test user
3. Then go to Firestore Database > `users` collection
4. Create documents with the user's UID

## Troubleshooting

### Still getting permission errors?
- Wait 5-10 minutes after enabling the API
- Make sure you're logged into the correct Google account
- Check that you have owner/editor permissions on the project
- Try refreshing the Firebase Console

### Firestore not showing up?
- Make sure you've completed Step 2 (Create database)
- Check that you're in the correct Firebase project
- Try refreshing the page

### Script still failing?
- Check your internet connection
- Verify Firebase config in `scripts/create-test-users.js` matches your project
- Try running the script again after waiting a few minutes
