import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ScreenShatter } from '@/components/screen-shatter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VolleyballAnimation } from '@/components/volleyball-animation';
import { auth } from '@/config/firebase';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVolleyball, setShowVolleyball] = useState(false);
  const [showShatter, setShowShatter] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, email, password);
      
      // If successful, start volleyball animation
      setLoading(false);
      setShowVolleyball(true);
    } catch (err: any) {
      setLoading(false);
      // Handle different Firebase error codes
      let errorMessage = 'Invalid email or password';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      }
      
      setError(errorMessage);
    }
  };

  const handleVolleyballHit = () => {
    // Trigger shatter animation
    setShowShatter(true);
  };

  const handleShatterComplete = () => {
    // Navigate immediately for smooth transition
    router.replace('/success');
  };

  return (
    <View style={styles.container}>
      {/* Volleyball-themed gradient background */}
      <View style={styles.backgroundGradient}>
        <View style={[styles.backgroundCircle, { backgroundColor: '#0066CC', opacity: 0.25 }]} />
        <View style={[styles.backgroundCircle, styles.backgroundCircle2, { backgroundColor: '#0066CC', opacity: 0.2 }]} />
        <View style={[styles.backgroundCircle, styles.backgroundCircle3, { backgroundColor: '#FFD700', opacity: 0.1 }]} />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ThemedView style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            VolleyHub
          </ThemedText>
          
          <ThemedView style={styles.form}>
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: textColor, 
                    borderColor: colorScheme === 'dark' ? '#444' : '#ddd',
                    backgroundColor: colorScheme === 'dark' ? '#222' : '#f9f9f9',
                  }
                ]}
                placeholder="Enter email"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </ThemedView>

            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: textColor, 
                    borderColor: colorScheme === 'dark' ? '#444' : '#ddd',
                    backgroundColor: colorScheme === 'dark' ? '#222' : '#f9f9f9',
                  }
                ]}
                placeholder="Enter password"
                placeholderTextColor={colorScheme === 'dark' ? '#666' : '#999'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </ThemedView>

            {error ? (
              <ThemedText style={[styles.error, { color: '#ff4444' }]}>
                {error}
              </ThemedText>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                { 
                  backgroundColor: loading ? '#ccc' : tintColor,
                  opacity: loading ? 0.6 : 1,
                }
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>Login</ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>

      {showVolleyball && (
        <VolleyballAnimation onHit={handleVolleyballHit} />
      )}

      {showShatter && (
        <ScreenShatter onComplete={handleShatterComplete} />
      )}
    </View>
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
    backgroundColor: '#FFD700',
  },
  backgroundCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
  },
  backgroundCircle2: {
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: -80,
    left: -80,
  },
  backgroundCircle3: {
    width: 200,
    height: 200,
    borderRadius: 100,
    top: '30%',
    right: -50,
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
