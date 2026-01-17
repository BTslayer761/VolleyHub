import { getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// Your Firebase configuration
// Replace these values with your Firebase project config
// You can find these in Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyB4jB_dUghbB0JPAo6g7FTlGAWzn-MkyeE",
    authDomain: "volleyhub-c3e4f.firebaseapp.com",
    projectId: "volleyhub-c3e4f",
    storageBucket: "volleyhub-c3e4f.firebasestorage.app",
    messagingSenderId: "1015546927163",
    appId: "1:1015546927163:web:577f8c7e1d2f9226df241e",
    measurementId: "G-J7WNEFDV57"
};

// Initialize Firebase App (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Authentication with platform-specific persistence
// For Web: Use browser localStorage (handled automatically by getAuth)
// For React Native: Use AsyncStorage if available
let auth: Auth;

// Check if we're on web (has window and localStorage)
const isWeb = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

if (isWeb) {
    // Web environment: use getAuth (automatically uses localStorage)
    auth = getAuth(app);
} else {
    // React Native environment: try to use AsyncStorage
    try {
        // Dynamically import AsyncStorage and getReactNativePersistence
        // This avoids errors on web where these aren't available
        const ReactNativeAsyncStorage = require('@react-native-async-storage/async-storage').default;
        const firebaseAuth = require('firebase/auth');
        const getReactNativePersistence = firebaseAuth.getReactNativePersistence;
        
        if (getReactNativePersistence && ReactNativeAsyncStorage) {
            try {
                auth = initializeAuth(app, {
                    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
                });
            } catch (error: any) {
                // If already initialized, use getAuth
                if (error.code === 'auth/already-initialized') {
                    auth = getAuth(app);
                } else {
                    throw error;
                }
            }
        } else {
            // Fallback to getAuth if persistence not available
            auth = getAuth(app);
        }
    } catch (error) {
        // Fallback to getAuth if anything fails
        auth = getAuth(app);
    }
}

export { auth };

// Initialize Firestore
// Note: Firestore automatically enables offline persistence in React Native
// Data is cached locally and synced when the app comes back online
export const db: Firestore = getFirestore(app);

export default app;
