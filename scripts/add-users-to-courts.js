/**
 * Script to add first 20 users to all courts in FCFS order
 * Run with: node scripts/add-users-to-courts.js
 * 
 * This script:
 * - Gets all courts from Firestore
 * - Gets the first 20 users from Firestore
 * - Creates bookings for each user to each court SEQUENTIALLY (one at a time)
 * - Adds small delays between bookings so they appear in real-time on Expo Go
 * - For indoor courts: respects maxSlots (first users get slots, rest go to waitlist)
 * - For outdoor courts: creates RSVP bookings for all users
 * - All bookings are created in FCFS order (by createdAt timestamp)
 */

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, doc, addDoc, query, orderBy, Timestamp, where, getDoc } = require('firebase/firestore');

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

// Helper function to convert Firestore Timestamp to Date
function timestampToDate(timestamp) {
  if (!timestamp) return new Date();
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
}

// Helper function to add delay between operations (for real-time visibility)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addUsersToCourts() {
  try {
    console.log('Starting to add users to courts...');
    console.log('⚠️  Note: Make sure Firestore is enabled and rules allow writes');
    
    // Sign in as admin to have permissions
    try {
      await signInWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
      console.log('✅ Signed in as admin');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        console.log('⚠️  Could not sign in as admin. Proceeding without auth (make sure Firestore rules allow writes).');
      } else {
        throw error;
      }
    }
    
    // Get all courts
    console.log('\n📋 Fetching courts...');
    const courtsRef = collection(db, 'courts');
    const courtsQuery = query(courtsRef, orderBy('date', 'asc'));
    const courtsSnapshot = await getDocs(courtsQuery);
    
    const courts = [];
    courtsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      courts.push({
        id: docSnap.id,
        type: data.type,
        name: data.name,
        maxSlots: data.maxSlots,
        bookingMode: data.bookingMode || 'priority',
      });
    });
    
    if (courts.length === 0) {
      console.log('⚠️  No courts found in Firestore. Please create some courts first.');
      return;
    }
    
    console.log(`✅ Found ${courts.length} court(s)`);
    
    // Get first 20 users (excluding admin)
    console.log('\n👥 Fetching users...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const allUsers = [];
    usersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.role !== 'administrator') {
        allUsers.push({
          id: docSnap.id,
          email: data.email || docSnap.id,
          name: data.name || 'User',
        });
      }
    });
    
    // Sort by email and take first 20
    const users = allUsers
      .sort((a, b) => (a.email || a.id).localeCompare(b.email || b.id))
      .slice(0, 20);
    
    if (users.length === 0) {
      console.log('⚠️  No users found in Firestore. Please create test users first using: npm run create-test-users');
      return;
    }
    
    console.log(`✅ Found ${users.length} user(s) (first 20 non-admin users)`);
    
    // Get existing bookings to check for duplicates
    console.log('\n📖 Checking existing bookings...');
    const bookingsRef = collection(db, 'bookings');
    const bookingsSnapshot = await getDocs(bookingsRef);
    
    const existingBookings = new Set();
    bookingsSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const key = `${data.courtId}_${data.userId}`;
      existingBookings.add(key);
    });
    
    console.log(`✅ Found ${existingBookings.size} existing booking(s)`);
    
    // Process each court
    const bookingsRefForWrite = collection(db, 'bookings');
    let totalCreated = 0;
    let totalSkipped = 0;
    let totalWaitlisted = 0;
    
    for (const court of courts) {
      console.log(`\n🏐 Processing court: ${court.name} (${court.type})`);
      
      if (court.type === 'outdoor') {
        // Outdoor court: Add all users as RSVP sequentially (FCFS order)
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          const bookingKey = `${court.id}_${user.id}`;
          if (existingBookings.has(bookingKey)) {
            console.log(`  ⚠️  Booking already exists: ${user.name}`);
            totalSkipped++;
            continue;
          }
          
          try {
            // Add delay between bookings for real-time visibility (500ms)
            if (i > 0) {
              await delay(500);
            }
            
            await addDoc(bookingsRefForWrite, {
              userId: user.id,
              courtId: court.id,
              isGoing: true,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
            console.log(`  ✅ Added: ${user.name} (${i + 1}/${users.length})`);
            totalCreated++;
            existingBookings.add(bookingKey); // Track to avoid duplicates in same run
          } catch (error) {
            console.error(`  ❌ Error adding ${user.name}:`, error.message);
          }
        }
      } else if (court.type === 'indoor') {
        // Indoor court: Respect maxSlots, rest go to waitlist
        const maxSlots = court.maxSlots || 12;
        const bookingMode = court.bookingMode || 'priority';
        
        // Get existing confirmed bookings for this court
        const existingCourtBookings = [];
        bookingsSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.courtId === court.id && data.slotIndex !== undefined && data.status === 'confirmed') {
            existingCourtBookings.push({
              id: docSnap.id,
              slotIndex: data.slotIndex,
            });
          }
        });
        
        const currentSlotsFilled = existingCourtBookings.length;
        const maxSlotIndex = existingCourtBookings.reduce((max, b) => {
          return b.slotIndex !== undefined && b.slotIndex > max ? b.slotIndex : max;
        }, -1);
        
        console.log(`  📊 Current slots filled: ${currentSlotsFilled}/${maxSlots}`);
        
        let nextSlotIndex = maxSlotIndex + 1;
        let usersAdded = 0;
        
        // Process users sequentially (one at a time) for FCFS order
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          const bookingKey = `${court.id}_${user.id}`;
          if (existingBookings.has(bookingKey)) {
            console.log(`  ⚠️  Booking already exists: ${user.name}`);
            totalSkipped++;
            continue;
          }
          
          // Add delay between bookings for real-time visibility (500ms)
          if (i > 0) {
            await delay(500);
          }
          
          const slotsAvailable = (currentSlotsFilled + usersAdded) < maxSlots;
          let bookingStatus;
          let slotIndex;
          
          if (bookingMode === 'fcfs') {
            // FCFS: assign slot if available, else waitlist
            if (slotsAvailable) {
              bookingStatus = 'confirmed';
              slotIndex = nextSlotIndex++;
            } else {
              bookingStatus = 'waitlisted';
            }
          } else {
            // Priority: pending if space, else waitlist
            if (slotsAvailable) {
              bookingStatus = 'pending';
            } else {
              bookingStatus = 'waitlisted';
            }
          }
          
          try {
            const bookingData = {
              userId: user.id,
              courtId: court.id,
              status: bookingStatus,
              createdAt: Timestamp.now(), // Sequential timestamps ensure FCFS order
            };
            
            if (slotIndex !== undefined) {
              bookingData.slotIndex = slotIndex;
              bookingData.updatedAt = Timestamp.now();
            }
            
            await addDoc(bookingsRefForWrite, bookingData);
            
            if (bookingStatus === 'waitlisted') {
              console.log(`  📋 Waitlisted: ${user.name} (${i + 1}/${users.length})`);
              totalWaitlisted++;
            } else if (slotIndex !== undefined) {
              console.log(`  ✅ Added: ${user.name} (Slot ${slotIndex + 1}, ${i + 1}/${users.length})`);
              totalCreated++;
              usersAdded++;
            } else {
              console.log(`  ⏳ Pending: ${user.name} (${i + 1}/${users.length})`);
              totalCreated++;
              usersAdded++;
            }
            
            existingBookings.add(bookingKey); // Track to avoid duplicates in same run
          } catch (error) {
            console.error(`  ❌ Error adding ${user.name}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${totalCreated} booking(s)`);
    console.log(`📋 Waitlisted: ${totalWaitlisted} user(s)`);
    console.log(`⚠️  Already existed (skipped): ${totalSkipped} booking(s)`);
    console.log('\n✨ Script completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error.code === 'permission-denied') {
      console.error('\n⚠️  PERMISSION_DENIED: Update Firestore rules to allow writes.');
      console.error('See FIRESTORE_RULES_SETUP.md for instructions.');
    } else if (error.code === 'unavailable') {
      console.error('\n⚠️  Firestore is offline. Make sure Firestore is enabled in Firebase Console.');
      console.error('See FIREBASE_FIRESTORE_SETUP.md for instructions.');
    }
    process.exit(1);
  }
}

// Run the script
addUsersToCourts()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
