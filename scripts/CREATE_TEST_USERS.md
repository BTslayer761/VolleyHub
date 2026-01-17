# Creating Test Users in Firebase

## Option 1: Using the Script (Recommended)

Run the following command to create 20 test users:

```bash
npm run create-test-users
```

This will create:
- 1 administrator: `admin@gmail.com` / `admin123`
- 20 regular users: `user1@volleyhub.com` through `user20@volleyhub.com` / `user123`

## Option 2: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `volleyhub-c3e4f`
3. Navigate to **Authentication** > **Users**
4. Click **Add user** and create users manually
5. For each user, go to **Firestore Database** > **users** collection
6. Create a document with the user's UID and add:
   - `email`: user's email
   - `name`: user's display name
   - `role`: `'user'` or `'administrator'`
   - `createdAt`: timestamp

## Option 3: Using the Admin Panel (Future)

An admin panel can be added to the app to create users directly from the UI.

## Test Users Created

### Administrator
- Email: `admin@gmail.com`
- Password: `admin123`
- Role: `administrator`

### Regular Users (20 users)
- Emails: `user1@volleyhub.com` through `user20@volleyhub.com`
- Password: `user123` (for all)
- Role: `user`

## Notes

- The script will skip users that already exist
- User documents are automatically created in Firestore on first login if they don't exist
- The role is determined by email (`admin@gmail.com` = administrator) or stored in Firestore
