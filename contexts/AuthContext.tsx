import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, enableNetwork } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User, UserRole } from '@/shared/types/auth.types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  logout: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Try to enable network first (in case it was disabled)
          try {
            await enableNetwork(db);
          } catch (networkError) {
            // Network might already be enabled, ignore
          }

          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          let userDoc;
          
          try {
            userDoc = await getDoc(userDocRef);
          } catch (firestoreError: any) {
            // If offline error, use fallback data
            if (firestoreError?.code === 'unavailable' || firestoreError?.message?.includes('offline')) {
              console.warn('Firestore is offline, using fallback user data');
              const email = firebaseUser.email || '';
              setUser({
                id: firebaseUser.uid,
                email: email,
                name: firebaseUser.displayName || email.split('@')[0],
                role: email === 'admin@gmail.com' ? 'administrator' : 'user',
                createdAt: firebaseUser.metadata.creationTime 
                  ? new Date(firebaseUser.metadata.creationTime) 
                  : new Date(),
              });
              setIsLoading(false);
              return;
            }
            throw firestoreError;
          }
          
          // Determine user role based on email
          const email = firebaseUser.email || '';
          let role: UserRole = email === 'admin@gmail.com' ? 'administrator' : 'user';
          let name = firebaseUser.displayName || email.split('@')[0] || 'User';
          let createdAt = firebaseUser.metadata.creationTime 
            ? new Date(firebaseUser.metadata.creationTime) 
            : new Date();
          
          if (userDoc.exists()) {
            // User document exists, get data from Firestore
            const userData = userDoc.data();
            role = userData.role || role;
            name = userData.name || name;
            
            // Safely convert createdAt from Firestore Timestamp to Date
            if (userData.createdAt) {
              if (userData.createdAt.toDate && typeof userData.createdAt.toDate === 'function') {
                // It's a Firestore Timestamp
                createdAt = userData.createdAt.toDate();
              } else if (userData.createdAt instanceof Date) {
                // It's already a Date object
                createdAt = userData.createdAt;
              } else if (typeof userData.createdAt === 'number') {
                // It's a timestamp number
                createdAt = new Date(userData.createdAt);
              } else if (typeof userData.createdAt === 'string') {
                // It's a date string
                createdAt = new Date(userData.createdAt);
              }
              // If none of the above, createdAt remains as the fallback value
            }
          }
          // Don't create user document automatically - let the name prompt handle it
          // This way we can detect if user is new and prompt them
          
          setUser({
            id: firebaseUser.uid,
            email: email,
            name: name,
            role: role,
            createdAt: createdAt,
          });
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          // Fallback to basic user data if Firestore fails
          const email = firebaseUser.email || '';
          setUser({
            id: firebaseUser.uid,
            email: email,
            name: firebaseUser.displayName || email.split('@')[0],
            role: email === 'admin@gmail.com' ? 'administrator' : 'user',
            createdAt: firebaseUser.metadata.creationTime 
              ? new Date(firebaseUser.metadata.creationTime) 
              : new Date(),
          });
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const updateUserName = async (name: string) => {
    if (!firebaseUser) {
      throw new Error('User not authenticated');
    }
    if (!name.trim()) {
      throw new Error('Name cannot be empty');
    }
    
    try {
      const trimmedName = name.trim();
      
      // Update user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(
        userDocRef,
        {
          name: trimmedName,
          email: firebaseUser.email,
          role: user?.role || (firebaseUser.email === 'admin@gmail.com' ? 'administrator' : 'user'),
          updatedAt: serverTimestamp(),
        },
        { merge: true } // Merge with existing document, don't overwrite
      );
      
      // Also update Firebase Auth profile displayName
      try {
        await updateProfile(firebaseUser, { displayName: trimmedName });
      } catch (error) {
        console.error('Error updating Firebase profile:', error);
        // Don't throw - Firestore save is more important
      }
      
      // Update local user state
      if (user) {
        setUser({
          ...user,
          name: trimmedName,
        });
      }
    } catch (error) {
      console.error('Error saving user name to Firestore:', error);
      throw error; // Re-throw so caller can handle it
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: !!user,
        hasRole,
        logout,
        updateUserName,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
