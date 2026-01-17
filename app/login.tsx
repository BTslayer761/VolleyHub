import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ScreenShatter } from '@/components/screen-shatter';
import { ThemedText } from '@/components/themed-text';
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
      {/* Pastel yellow background */}
      <View style={styles.backgroundGradient}>
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
              <ThemedText style={[styles.label, { color: '#000000' }]}>Email</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: '#000000', 
                    borderColor: '#004080',
                    backgroundColor: 'rgba(255, 249, 196, 0.5)',
                  }
                ]}
                placeholder="Enter email"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: '#000000' }]}>Password</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: '#000000', 
                    borderColor: '#004080',
                    backgroundColor: 'rgba(255, 249, 196, 0.5)',
                  }
                ]}
                placeholder="Enter password"
                placeholderTextColor="#666666"
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
                  backgroundColor: loading ? 'rgba(255, 249, 196, 0.5)' : 'rgba(255, 249, 196, 0.5)',
                  borderColor: '#004080',
                  borderWidth: 1,
                  opacity: loading ? 0.6 : 1,
                }
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <ThemedText style={[styles.buttonText, { color: '#000000' }]}>Login</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#FFF9C4', // Pastel yellow
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
    color: '#000000',
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
