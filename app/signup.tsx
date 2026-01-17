import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/config/firebase';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const themeColors = Colors[colorScheme ?? 'light'];
  const borderColor = colorScheme === 'dark' ? '#444' : '#ddd';
  const inputBackgroundColor = colorScheme === 'dark' ? '#222' : '#f9f9f9';
  const placeholderColor = colorScheme === 'dark' ? '#666' : '#999';

  const handleSignup = async () => {
    setError('');

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Create user with Firebase
      await createUserWithEmailAndPassword(auth, email, password);
      
      // If successful, navigate back to login with slide transition
      setLoading(false);
      router.replace('/login');
    } catch (err: any) {
      setLoading(false);
      // Handle different Firebase error codes
      let errorMessage = 'Failed to create account';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      }

      setError(errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Background with decorative volleyballs */}
      <View style={[styles.backgroundGradient, { backgroundColor }]}>
        {/* Decorative volleyballs */}
        <Image
          source={require('@/assets/images/volleyball.png')}
          style={styles.volleyball1}
          contentFit="contain"
        />
        <Image
          source={require('@/assets/images/volleyball.png')}
          style={styles.volleyball2}
          contentFit="contain"
        />
        <Image
          source={require('@/assets/images/volleyball.png')}
          style={styles.volleyball3}
          contentFit="contain"
        />
        <Image
          source={require('@/assets/images/volleyball.png')}
          style={styles.volleyball4}
          contentFit="contain"
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Sign Up
          </ThemedText>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: textColor, 
                    borderColor,
                    backgroundColor: inputBackgroundColor,
                  }
                ]}
                placeholder="Enter email"
                placeholderTextColor={placeholderColor}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: textColor, 
                    borderColor,
                    backgroundColor: inputBackgroundColor,
                  }
                ]}
                placeholder="Enter password"
                placeholderTextColor={placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirm Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: textColor, 
                    borderColor,
                    backgroundColor: inputBackgroundColor,
                  }
                ]}
                placeholder="Confirm password"
                placeholderTextColor={placeholderColor}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {error ? (
              <ThemedText style={[styles.error, { color: '#ff4444' }]}>
                {error}
              </ThemedText>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                { 
                  backgroundColor: themeColors.tint,
                  opacity: loading ? 0.6 : 1,
                }
              ]}
              onPress={handleSignup}
              activeOpacity={0.8}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  volleyball1: {
    position: 'absolute',
    top: 80,
    right: 30,
    width: 80,
    height: 80,
    opacity: 0.6,
  },
  volleyball2: {
    position: 'absolute',
    top: 200,
    left: 20,
    width: 60,
    height: 60,
    opacity: 0.5,
  },
  volleyball3: {
    position: 'absolute',
    bottom: 150,
    right: 50,
    width: 100,
    height: 100,
    opacity: 0.7,
  },
  volleyball4: {
    position: 'absolute',
    bottom: 80,
    left: 40,
    width: 70,
    height: 70,
    opacity: 0.55,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    zIndex: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 48,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  error: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
