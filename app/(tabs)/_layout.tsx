import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/AuthContext';
import { NamePromptModal } from '@/components/name-prompt-modal';
import { db } from '@/config/firebase';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, updateUserName, firebaseUser } = useAuth();
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [hasCheckedName, setHasCheckedName] = useState(false);

  useEffect(() => {
    // Check if user needs to set their name when they enter the app
    const checkUserInFirebase = async () => {
      if (firebaseUser && !hasCheckedName) {
        try {
          // Check if user document exists in Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userName = userData.name || '';
            const emailPrefix = firebaseUser.email?.split('@')[0] || '';
            
            // Only prompt if name is empty or just the email prefix
            // If user exists in Firebase and has a valid name, don't prompt
            const hasValidName = userName && userName.trim() !== '' && userName !== emailPrefix;
            
            if (!hasValidName) {
              setShowNamePrompt(true);
            }
          } else {
            // User doesn't exist in Firebase users collection, prompt them
            setShowNamePrompt(true);
          }
          setHasCheckedName(true);
        } catch (error) {
          console.error('Error checking user in Firebase:', error);
          // On error, don't prompt (safer default)
          setHasCheckedName(true);
        }
      } else if (!firebaseUser) {
        setHasCheckedName(false);
        setShowNamePrompt(false);
      }
    };

    checkUserInFirebase();
  }, [firebaseUser, hasCheckedName]);

  const handleSaveName = async (name: string) => {
    try {
      await updateUserName(name);
      setShowNamePrompt(false);
    } catch (error) {
      console.error('Error updating user name:', error);
      // Don't close modal on error so user can try again
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="courts"
          options={{
            title: 'Courts',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="sportscourt.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
          }}
        />
      </Tabs>

      {/* Name Prompt Modal - Shows when user enters app without a name */}
      <NamePromptModal
        visible={showNamePrompt}
        currentName={user?.name}
        onSave={handleSaveName}
      />
    </>
  );
}
