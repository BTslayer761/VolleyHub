import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ScreenShatter } from '@/components/screen-shatter';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VolleyballAnimation } from '@/components/volleyball-animation';
import { auth } from '@/config/firebase';
import { Colors } from '@/constants/theme';
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
    // Navigate directly to main app tabs
    router.replace('/(tabs)');
  };

  /**
   * Development: Quick sign in as regular user
   * Automatically logs in with jarell@gmail.com / jarell
   */
  const handleDevSignInAsUser = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, 'jarell@gmail.com', 'jarell');
      setLoading(false);
      setShowVolleyball(true);
    } catch (err: any) {
      setLoading(false);
      // Handle different Firebase error codes with better error messages
      let errorMessage = 'Failed to sign in as user';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'User account jarell@gmail.com not found. Please create the account first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password for jarell@gmail.com';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else {
        errorMessage = `Sign in failed: ${err.message || 'Unknown error'}`;
      }
      
      setError(errorMessage);
      console.error('Dev sign in error:', err);
    }
  };

  /**
   * Development: Quick sign in as administrator
   * Automatically logs in with admin@gmail.com / admin123
   */
  const handleDevSignInAsAdmin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, 'admin@gmail.com', 'admin123');
      setLoading(false);
      setShowVolleyball(true);
    } catch (err: any) {
      setLoading(false);
      // Handle different Firebase error codes with better error messages
      let errorMessage = 'Failed to sign in as admin';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Admin account admin@gmail.com not found. Please create the account first.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password for admin@gmail.com';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else {
        errorMessage = `Sign in failed: ${err.message || 'Unknown error'}`;
      }
      
      setError(errorMessage);
      console.error('Dev sign in error:', err);
    }
  };

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const themeColors = Colors[colorScheme ?? 'light'];
  const borderColor = colorScheme === 'dark' ? '#444' : '#ddd';
  const inputBackgroundColor = colorScheme === 'dark' ? '#222' : '#f9f9f9';
  const placeholderColor = colorScheme === 'dark' ? '#666' : '#999';

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
            VolleyHub
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

            {error ? (
              <ThemedText style={[styles.error, { color: '#ff4444' }]}>
                {error}
              </ThemedText>
            ) : null}

            <TouchableOpacity
              style={[
                styles.button,
                { 
                  borderColor,
                  backgroundColor: inputBackgroundColor,
                  opacity: loading ? 0.6 : 1,
                }
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color={textColor} />
              ) : (
                <ThemedText style={[styles.buttonText, { color: textColor }]}>Login</ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signupLink}
              onPress={() => router.push('/signup')}
              activeOpacity={0.7}>
              <ThemedText style={styles.signupText}>Sign up</ThemedText>
            </TouchableOpacity>

            {/* Development Quick Sign In Buttons */}
            <View style={styles.devButtonsContainer}>
              <ThemedText style={styles.devLabel}>Development Mode:</ThemedText>
              <View style={styles.devButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.devButton,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#1e3a8a' : '#3b82f6',
                      borderColor: colorScheme === 'dark' ? '#3b82f6' : '#2563eb',
                      opacity: loading ? 0.6 : 1,
                    }
                  ]}
                  onPress={handleDevSignInAsUser}
                  activeOpacity={0.8}
                  disabled={loading}>
                  <ThemedText style={styles.devButtonText}>
                    {loading ? 'Signing in...' : 'Sign in as User'}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.devButton,
                    {
                      backgroundColor: colorScheme === 'dark' ? '#7c2d12' : '#dc2626',
                      borderColor: colorScheme === 'dark' ? '#dc2626' : '#b91c1c',
                      opacity: loading ? 0.6 : 1,
                    }
                  ]}
                  onPress={handleDevSignInAsAdmin}
                  activeOpacity={0.8}
                  disabled={loading}>
                  <ThemedText style={styles.devButtonText}>
                    {loading ? 'Signing in...' : 'Sign in as Admin'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {showVolleyball && (
        <VolleyballAnimation onHit={handleVolleyballHit} />
      )}

      {showVolleyball && (
        <VolleyballAnimation onHit={handleVolleyballHit} />
      )}

      {showShatter && (
        <ScreenShatter onComplete={handleShatterComplete} />
      )}
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
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signupLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  devButtonsContainer: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  devLabel: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  devButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  devButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
