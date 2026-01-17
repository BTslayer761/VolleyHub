import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';

import { Auth, initializeAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// getReactNativePersistence exists at runtime in Firebase v12
// Using dynamic access to avoid TypeScript errors
const firebaseAuth = require('firebase/auth');
const getReactNativePersistence = firebaseAuth.getReactNativePersistence;


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

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
// This ensures auth state persists between app sessions
export const auth: Auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
// Note: Firestore automatically enables offline persistence in React Native
// Data is cached locally and synced when the app comes back online

export const db: Firestore = getFirestore(app);

export default app;
