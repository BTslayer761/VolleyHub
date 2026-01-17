# Migrating Courts to Firebase Firestore

## ✅ What's Been Done

The court service has been migrated from in-memory mock data to Firebase Firestore with **real-time updates**!

### Changes Made:

1. **Updated `lib/services/court-service.ts`**:
   - Replaced in-memory storage with Firestore
   - Added real-time subscription functions (`subscribeToCourts`, `subscribeToCourt`)
   - Handles Firestore Timestamp ↔ Date conversions
   - Maintains the same interface (no breaking changes)

2. **Updated `app/(tabs)/courts.tsx`**:
   - Now uses real-time Firestore listeners instead of manual refresh
   - Courts update automatically when data changes
   - No need to manually refresh - changes appear instantly!

3. **Real-time Features**:
   - ✅ Courts list updates automatically when new courts are added
   - ✅ Court updates (status changes, etc.) appear instantly
   - ✅ Court deletions are reflected immediately
   - ✅ Works across all users/devices in real-time

## 🔧 Firestore Rules Required

Make sure your Firestore rules include the `courts` collection. See `FIRESTORE_RULES_SETUP.md` for the complete rules.

### Quick Rules for Courts:

```javascript
match /courts/{courtId} {
  // Anyone authenticated can read courts
  allow read: if request.auth != null;
  // Only administrators can create, update, or delete courts
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'administrator';
}
```

## 📊 Firestore Data Structure

Courts are stored in the `courts` collection with this structure:

```javascript
{
  name: string,
  type: 'outdoor' | 'indoor',
  location: string,
  date: Timestamp,           // Firestore Timestamp
  startTime: string,        // e.g., "18:00"
  endTime: string,          // e.g., "20:00"
  description?: string,
  
  // Outdoor court fields
  status?: 'available' | 'rain' | 'cat1' | 'closed' | 'cancelled',
  
  // Indoor court fields
  maxSlots?: number,
  bookingMode?: 'fcfs' | 'priority',
  deadline?: Timestamp,      // Firestore Timestamp (for priority mode)
  
  createdAt: Timestamp       // Firestore Timestamp
}
```

## 🚀 How Real-Time Updates Work

1. **When a court is created/updated/deleted**:
   - Firestore triggers the real-time listener
   - All connected users receive the update instantly
   - No page refresh needed!

2. **Subscription Management**:
   - Subscriptions are automatically cleaned up when components unmount
   - Filters (type, date) update the subscription query automatically
   - Efficient - only listens to relevant data

## 📝 Migration Notes

### Existing Mock Data

The old mock courts data is no longer used. If you had test courts in the mock service, you'll need to:

1. **Create them in Firestore** (via the app's "Post Court" button)
2. **Or import them** using the admin panel at `/admin/create-users`

### Date Handling

- Dates are stored as Firestore Timestamps
- Automatically converted to JavaScript Date objects when reading
- Automatically converted to Timestamps when writing

## 🎯 Next Steps

1. ✅ Update Firestore rules (see `FIRESTORE_RULES_SETUP.md`)
2. ✅ Test creating a court - it should appear instantly
3. ✅ Test updating court status - changes should appear in real-time
4. ✅ Test with multiple devices/users - changes sync across all

## 🔍 Testing Real-Time Updates

1. Open the app on two devices (or two browser tabs)
2. Log in as admin on one device
3. Create a new court
4. **Watch it appear instantly** on the other device! 🎉

Your courts are now fully real-time! 🚀
