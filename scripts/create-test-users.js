/**
 * Script to create test users in Firebase
 * Run with: node scripts/create-test-users.js
 * 
 * This script creates 20 test users in Firebase Authentication
 * and stores their user data in Firestore
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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
  { email: 'admin@gmail.com', password: 'admin123', name: 'Admin User', role: 'administrator' },
  { email: 'user1@volleyhub.com', password: 'user123', name: 'Alice Johnson', role: 'user' },
  { email: 'user2@volleyhub.com', password: 'user123', name: 'Bob Smith', role: 'user' },
  { email: 'user3@volleyhub.com', password: 'user123', name: 'Charlie Brown', role: 'user' },
  { email: 'user4@volleyhub.com', password: 'user123', name: 'Diana Prince', role: 'user' },
  { email: 'user5@volleyhub.com', password: 'user123', name: 'Ethan Hunt', role: 'user' },
  { email: 'user6@volleyhub.com', password: 'user123', name: 'Fiona Chen', role: 'user' },
  { email: 'user7@volleyhub.com', password: 'user123', name: 'George Wilson', role: 'user' },
  { email: 'user8@volleyhub.com', password: 'user123', name: 'Hannah Lee', role: 'user' },
  { email: 'user9@volleyhub.com', password: 'user123', name: 'Ian Martinez', role: 'user' },
  { email: 'user10@volleyhub.com', password: 'user123', name: 'Julia Kim', role: 'user' },
  { email: 'user11@volleyhub.com', password: 'user123', name: 'Kevin Park', role: 'user' },
  { email: 'user12@volleyhub.com', password: 'user123', name: 'Lisa Anderson', role: 'user' },
  { email: 'user13@volleyhub.com', password: 'user123', name: 'Mike Davis', role: 'user' },
  { email: 'user14@volleyhub.com', password: 'user123', name: 'Nancy Taylor', role: 'user' },
  { email: 'user15@volleyhub.com', password: 'user123', name: 'Oliver White', role: 'user' },
  { email: 'user16@volleyhub.com', password: 'user123', name: 'Patricia Harris', role: 'user' },
  { email: 'user17@volleyhub.com', password: 'user123', name: 'Quinn Jackson', role: 'user' },
  { email: 'user18@volleyhub.com', password: 'user123', name: 'Rachel Green', role: 'user' },
  { email: 'user19@volleyhub.com', password: 'user123', name: 'Sam Thompson', role: 'user' },
  { email: 'user20@volleyhub.com', password: 'user123', name: 'Tina Wong', role: 'user' },
];

async function createTestUsers() {
  console.log('Starting to create test users...\n');
  console.log('⚠️  Note: Make sure Firestore is enabled in Firebase Console\n');

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  let firestoreError = false;

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
      try {
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
      } catch (firestoreErr) {
        // Handle Firestore-specific errors
        if (firestoreErr.code === 7 || firestoreErr.message?.includes('PERMISSION_DENIED') || firestoreErr.message?.includes('Firestore API')) {
          console.error(`❌ Firestore API Error for ${userData.email}:`);
          console.error('   Firestore API is not enabled. Please enable it first.');
          console.error('   Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=volleyhub-c3e4f');
          console.error('   See FIREBASE_FIRESTORE_SETUP.md for detailed instructions.\n');
          firestoreError = true;
          errorCount++;
          // Still created the auth user, so we'll note that
          console.log(`   ⚠️  Note: User ${userData.email} was created in Authentication but Firestore document failed.`);
        } else {
          throw firestoreErr;
        }
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User already exists: ${userData.email} - Skipping`);
        skippedCount++;
      } else if (error.code === 7 || error.message?.includes('PERMISSION_DENIED') || error.message?.includes('Firestore API')) {
        console.error(`❌ Firestore API Error: Firestore is not enabled.`);
        console.error('   Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=volleyhub-c3e4f');
        firestoreError = true;
        errorCount++;
        break; // Stop processing if Firestore is not available
      } else {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
        errorCount++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`✅ Successfully created: ${successCount} users`);
  console.log(`⚠️  Already existed (skipped): ${skippedCount} users`);
  if (errorCount > 0) {
    console.log(`❌ Errors: ${errorCount} users`);
  }
  
  if (firestoreError) {
    console.log('\n❌ FIRESTORE SETUP REQUIRED:');
    console.log('   1. Enable Firestore API: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=volleyhub-c3e4f');
    console.log('   2. Create Firestore database in Firebase Console');
    console.log('   3. Wait 2-3 minutes for changes to propagate');
    console.log('   4. Run this script again');
    console.log('\n   See FIREBASE_FIRESTORE_SETUP.md for detailed instructions.');
  } else {
    console.log('\n✨ Test users setup complete!');
  }
  
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@gmail.com / admin123');
  console.log('   Users: user1@volleyhub.com through user20@volleyhub.com / user123');
}

// Run the script
createTestUsers()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
