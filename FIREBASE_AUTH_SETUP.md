# Firebase Authentication Setup Guide

## ✅ What's Already Configured

Your Firebase project is set up with:
- Firebase Authentication enabled
- Firestore Database enabled
- AsyncStorage installed for auth persistence

## 🔧 Firebase Console Configuration Required

### Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **volleyhub-c3e4f**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. **Enable** the first toggle (Email/Password)
6. Click **Save**

### Step 2: Configure Authorized Domains (Optional for Development)

1. In **Authentication** → **Settings** → **Authorized domains**
2. Make sure these are listed:
   - `volleyhub-c3e4f.firebaseapp.com` (default)
   - `localhost` (for development)
   - Your custom domain (if any)

### Step 3: Verify Firestore Rules

1. Go to **Firestore Database** → **Rules**
2. For development, use these rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         // Allow users to read their own data
         allow read: if request.auth != null;
         // Allow users to write their own data, or allow creation during signup
         allow write: if request.auth != null && 
           (request.auth.uid == userId || !exists(/databases/$(database)/documents/users/$(userId)));
       }
     }
   }
   ```
3. Click **Publish**

### Step 4: Verify Authentication Settings

1. Go to **Authentication** → **Settings**
2. Check that:
   - **User actions** → **Email address** is enabled
   - **Email templates** are configured (default templates work fine)

## 📱 App Configuration

The app is configured to:
- ✅ Use Firebase Authentication with automatic persistence
- ✅ Store user data in Firestore `users` collection
- ✅ Automatically create user documents on first login
- ✅ Handle offline mode gracefully

## 🔍 Testing Authentication

1. **Sign Up**: Create a new account via the signup page
2. **Sign In**: Log in with existing credentials
3. **Persistence**: Close and reopen the app - you should stay logged in
4. **User Data**: Check Firestore `users` collection for user documents

## ⚠️ Common Issues

### "Email/Password sign-in is disabled"
- **Fix**: Enable Email/Password in Firebase Console → Authentication → Sign-in method

### "Permission denied" errors
- **Fix**: Update Firestore rules (see Step 3 above)

### Auth state not persisting
- **Fix**: Make sure `@react-native-async-storage/async-storage` is installed
- The app automatically uses AsyncStorage when available

### "User document not found"
- **Fix**: The app automatically creates user documents on first login
- Check Firestore rules allow writes

## 📝 User Roles

User roles are stored in Firestore:
- **Administrator**: Users with `role: 'administrator'` in Firestore
- **Regular User**: Users with `role: 'user'` in Firestore
- **Default**: Email `admin@gmail.com` is automatically set as administrator

## 🎯 Next Steps

1. ✅ Enable Email/Password authentication in Firebase Console
2. ✅ Set Firestore rules (see Step 3)
3. ✅ Test signup/login in the app
4. ✅ Verify user documents are created in Firestore

Your Firebase setup is now complete! 🎉
