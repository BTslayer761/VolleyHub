import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, enableNetwork, disableNetwork } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User, UserRole } from '@/shared/types/auth.types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  logout: () => Promise<void>;
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
          
          let role: UserRole = 'user';
          let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
          let createdAt = firebaseUser.metadata.creationTime 
            ? new Date(firebaseUser.metadata.creationTime) 
            : new Date();
          
          if (userDoc.exists()) {
            // User document exists, get role from Firestore
            const userData = userDoc.data();
            role = userData.role || (firebaseUser.email === 'admin@gmail.com' ? 'administrator' : 'user');
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
          } else {
            // User document doesn't exist, create it
            // Determine role based on email (admin@gmail.com is administrator)
            role = firebaseUser.email === 'admin@gmail.com' ? 'administrator' : 'user';
            
            try {
              await setDoc(userDocRef, {
                email: firebaseUser.email,
                name: name,
                role: role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } catch (setDocError: any) {
              // If offline, continue with fallback data
              if (setDocError?.code === 'unavailable' || setDocError?.message?.includes('offline')) {
                console.warn('Cannot create user document while offline');
              } else {
                throw setDocError;
              }
            }
          }
          
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
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
