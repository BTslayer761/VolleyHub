import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, Firestore } from 'firebase/firestore';
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
    const loadUserData = async (firebaseUser: FirebaseUser) => {
      // Determine user role based on email
      const email = firebaseUser.email || '';
      const role: UserRole = email === 'admin@gmail.com' ? 'administrator' : 'user';
      
      // Try to load user profile from Firestore
      let userName = firebaseUser.displayName || email.split('@')[0] || '';
      
      try {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          userName = userData.name || userName;
        }
        // Don't create user document automatically - let the name prompt handle it
        // This way we can detect if user is new and prompt them
      } catch (error) {
        console.error('Error loading user data from Firestore:', error);
        // Fallback to displayName or email prefix
      }
      
      setUser({
        id: firebaseUser.uid,
        email: email,
        name: userName,
        role: role,
        createdAt: firebaseUser.metadata.creationTime 
          ? new Date(firebaseUser.metadata.creationTime) 
          : new Date(),
      });
    };

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        await loadUserData(firebaseUser);
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
          updatedAt: new Date().toISOString(),
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
