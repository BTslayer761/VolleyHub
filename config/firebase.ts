import { initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
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

const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth: Auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db: Firestore = getFirestore(app);

export default app;
