# Import Test Users into Firebase

There are **3 ways** to create and import 20 test users into Firebase:

## Method 1: Using the Node.js Script (Recommended) ⚡

The easiest way is to run the provided script:

```bash
npm run create-test-users
```

This script will:
- Create 20 users in Firebase Authentication
- Create corresponding user documents in Firestore with roles
- Skip users that already exist
- Show progress and summary

**Requirements:**
- Node.js installed
- Firebase project configured
- Internet connection

**What it creates:**
- 1 Administrator: `admin@gmail.com` / `admin123`
- 20 Regular Users: `user1@volleyhub.com` through `user20@volleyhub.com` / `user123`

## Method 2: Using the Admin Panel in the App 📱

1. **Log in as administrator** (`admin@gmail.com` / `admin123`)
2. **Navigate to** `/admin/create-users` in the app
3. **Tap "Create All Test Users"**
4. **Wait for completion** - you'll see progress in real-time

This method is great if you're already in the app and want a visual interface.

## Method 3: Manual Import via Firebase Console 🖥️

If the scripts don't work, you can manually create users:

### Step 1: Create Users in Firebase Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `volleyhub-c3e4f`
3. Navigate to **Authentication** > **Users**
4. Click **Add user** for each user:
   - Email: `user1@volleyhub.com` through `user20@volleyhub.com`
   - Password: `user123`
   - (Repeat for all 20 users)

### Step 2: Create User Documents in Firestore

For each user created:

1. Go to **Firestore Database** in Firebase Console
2. Navigate to the `users` collection
3. Click **Add document**
4. Use the user's **UID** (from Authentication) as the document ID
5. Add these fields:
   ```json
   {
     "email": "user1@volleyhub.com",
     "name": "Alice Johnson",
     "role": "user",
     "createdAt": [current timestamp],
     "updatedAt": [current timestamp]
   }
   ```

### Test Users List

| Email | Password | Name | Role |
|-------|----------|------|------|
| admin@gmail.com | admin123 | Admin User | administrator |
| user1@volleyhub.com | user123 | Alice Johnson | user |
| user2@volleyhub.com | user123 | Bob Smith | user |
| user3@volleyhub.com | user123 | Charlie Brown | user |
| user4@volleyhub.com | user123 | Diana Prince | user |
| user5@volleyhub.com | user123 | Ethan Hunt | user |
| user6@volleyhub.com | user123 | Fiona Chen | user |
| user7@volleyhub.com | user123 | George Wilson | user |
| user8@volleyhub.com | user123 | Hannah Lee | user |
| user9@volleyhub.com | user123 | Ian Martinez | user |
| user10@volleyhub.com | user123 | Julia Kim | user |
| user11@volleyhub.com | user123 | Kevin Park | user |
| user12@volleyhub.com | user123 | Lisa Anderson | user |
| user13@volleyhub.com | user123 | Mike Davis | user |
| user14@volleyhub.com | user123 | Nancy Taylor | user |
| user15@volleyhub.com | user123 | Oliver White | user |
| user16@volleyhub.com | user123 | Patricia Harris | user |
| user17@volleyhub.com | user123 | Quinn Jackson | user |
| user18@volleyhub.com | user123 | Rachel Green | user |
| user19@volleyhub.com | user123 | Sam Thompson | user |
| user20@volleyhub.com | user123 | Tina Wong | user |

## Troubleshooting

### Script fails with "Cannot find module"
- Make sure you're in the project root directory
- Run `npm install` first
- Try: `node scripts/create-test-users.js` directly

### "Email already in use" errors
- This is normal - the script skips existing users
- Users are only created if they don't exist

### Firestore permission errors
- Make sure Firestore is enabled in Firebase Console
- Check that your Firestore rules allow writes (for testing)

## Notes

- The script is **idempotent** - you can run it multiple times safely
- Existing users are skipped automatically
- User documents in Firestore are created automatically on first login if missing
- The role is determined by email (`admin@gmail.com` = administrator) or stored in Firestore
