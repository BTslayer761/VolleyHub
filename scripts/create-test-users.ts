/**
 * Script to create test users in Firebase
 * Run with: npx ts-node scripts/create-test-users.ts
 * 
 * This script creates 20 test users in Firebase Authentication
 * and stores their user data in Firestore
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UserRole } from '../shared/types/auth.types';

const firebaseConfig = {
  apiKey: "AIzaSyB4jB_dUghbB0JPAo6g7FTlGAWzn-MkyeE",
  authDomain: "volleyhub-c3e4f.firebaseapp.com",
  projectId: "volleyhub-c3e4f",
  storageBucket: "volleyhub-c3e4f.firebasestorage.app",
  messagingSenderId: "1015546927163",
  appId: "1:1015546927163:web:577f8c7e1d2f9226df241e",
  measurementId: "G-J7WNEFDV57"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test users data
const testUsers = [
  { email: 'admin@gmail.com', password: 'admin123', name: 'Admin User', role: 'administrator' as UserRole },
  { email: 'user1@volleyhub.com', password: 'user123', name: 'Alice Johnson', role: 'user' as UserRole },
  { email: 'user2@volleyhub.com', password: 'user123', name: 'Bob Smith', role: 'user' as UserRole },
  { email: 'user3@volleyhub.com', password: 'user123', name: 'Charlie Brown', role: 'user' as UserRole },
  { email: 'user4@volleyhub.com', password: 'user123', name: 'Diana Prince', role: 'user' as UserRole },
  { email: 'user5@volleyhub.com', password: 'user123', name: 'Ethan Hunt', role: 'user' as UserRole },
  { email: 'user6@volleyhub.com', password: 'user123', name: 'Fiona Chen', role: 'user' as UserRole },
  { email: 'user7@volleyhub.com', password: 'user123', name: 'George Wilson', role: 'user' as UserRole },
  { email: 'user8@volleyhub.com', password: 'user123', name: 'Hannah Lee', role: 'user' as UserRole },
  { email: 'user9@volleyhub.com', password: 'user123', name: 'Ian Martinez', role: 'user' as UserRole },
  { email: 'user10@volleyhub.com', password: 'user123', name: 'Julia Kim', role: 'user' as UserRole },
  { email: 'user11@volleyhub.com', password: 'user123', name: 'Kevin Park', role: 'user' as UserRole },
  { email: 'user12@volleyhub.com', password: 'user123', name: 'Lisa Anderson', role: 'user' as UserRole },
  { email: 'user13@volleyhub.com', password: 'user123', name: 'Mike Davis', role: 'user' as UserRole },
  { email: 'user14@volleyhub.com', password: 'user123', name: 'Nancy Taylor', role: 'user' as UserRole },
  { email: 'user15@volleyhub.com', password: 'user123', name: 'Oliver White', role: 'user' as UserRole },
  { email: 'user16@volleyhub.com', password: 'user123', name: 'Patricia Harris', role: 'user' as UserRole },
  { email: 'user17@volleyhub.com', password: 'user123', name: 'Quinn Jackson', role: 'user' as UserRole },
  { email: 'user18@volleyhub.com', password: 'user123', name: 'Rachel Green', role: 'user' as UserRole },
  { email: 'user19@volleyhub.com', password: 'user123', name: 'Sam Thompson', role: 'user' as UserRole },
  { email: 'user20@volleyhub.com', password: 'user123', name: 'Tina Wong', role: 'user' as UserRole },
];

async function createTestUsers() {
  console.log('Starting to create test users...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const userData of testUsers) {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const user = userCredential.user;

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ Created user: ${userData.name} (${userData.email}) - Role: ${userData.role}`);
      successCount++;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User already exists: ${userData.email}`);
        // Try to update Firestore document if user exists
        try {
          // Note: We can't get the UID without the user, so we'll skip Firestore update
          // The AuthContext will create the document on first login
        } catch (updateError) {
          console.error(`❌ Error updating user document: ${userData.email}`, updateError);
        }
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
        errorCount++;
      }
    }
  }

  console.log(`\n✅ Successfully created/verified: ${successCount} users`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} users`);
  }
  console.log('\nTest users creation complete!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@gmail.com / admin123');
  console.log('Users: user1@volleyhub.com through user20@volleyhub.com / user123');
}

// Run the script
createTestUsers()
  .then(() => {
    console.log('\nScript completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
