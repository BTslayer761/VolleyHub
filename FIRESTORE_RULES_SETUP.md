# Fix Firestore Permission Error

## 🔴 Error: "Missing or insufficient permissions"

This error means your Firestore security rules are blocking access. Here's how to fix it:

## Quick Fix: Update Firestore Rules

### Step 1: Go to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **volleyhub-c3e4f**
3. Navigate to **Firestore Database** → **Rules**

### Step 2: Update Rules for Development

Copy and paste these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - allow authenticated users to read/write their own data
    match /users/{userId} {
      // Allow users to read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // Allow users to write their own data, or allow creation during signup
      allow write: if request.auth != null && 
        (request.auth.uid == userId || !exists(/databases/$(database)/documents/users/$(userId)));
    }
    
    // For development: Allow all authenticated users to read/write (remove in production!)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish Rules

1. Click **Publish** button
2. Wait a few seconds for rules to propagate

## Alternative: Test Mode (Development Only)

If you want to test quickly, you can use test mode rules (⚠️ **NOT for production**):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ WARNING**: These rules allow anyone to read/write. Only use for development!

## Production Rules (Recommended)

For production, use these more secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // Users can write their own data
      allow write: if request.auth != null && request.auth.uid == userId;
      // Allow creation during signup (when document doesn't exist yet)
      allow create: if request.auth != null;
    }
    
    // Add other collections here as needed
    // match /courts/{courtId} { ... }
    // match /bookings/{bookingId} { ... }
  }
}
```

## Verify Rules Are Working

After updating rules:

1. **Wait 1-2 minutes** for rules to propagate
2. **Restart your app** (reload in Expo)
3. **Try logging in** - the permission error should be gone

## Common Issues

### "Rules not updating"
- Make sure you clicked **Publish**
- Wait 1-2 minutes for propagation
- Try refreshing the Firebase Console

### "Still getting permission errors"
- Check that you're logged in (request.auth != null)
- Verify the user ID matches the document ID
- Check browser/app console for specific error details

### "Rules work but data not showing"
- Check that data actually exists in Firestore
- Verify the collection name matches (case-sensitive)
- Check that document IDs are correct

## Next Steps

1. ✅ Update Firestore rules (see Step 2 above)
2. ✅ Publish the rules
3. ✅ Wait 1-2 minutes
4. ✅ Restart your app
5. ✅ Test login/signup

Your Firestore permission error should now be fixed! 🎉
