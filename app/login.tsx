import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

// Import the API client we created
import api from '../src/api';

// This is needed for the Google Auth Session to work properly
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // --- Google Sign-In Setup ---
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // These keys are now securely loaded from your .env file
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  // This effect hook handles the response from Google's login prompt
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  // --- Login Handlers ---

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email and password are required.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.post('/users/login', { email, password });

      if (res.data && res.data.data.accessToken) {
        const { user, accessToken, refreshToken } = res.data.data;
        
        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        await SecureStore.setItemAsync('userName', user.fullName);
        await SecureStore.setItemAsync('userEmail', user.email);
        
        router.replace('/home');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (googleToken: string) => {
    setIsLoading(true);
    try {
      const res = await api.post('/users/google-login', { token: googleToken });

      if (res.data && res.data.data.accessToken) {
        const { user, accessToken, refreshToken } = res.data.data;

        await SecureStore.setItemAsync('accessToken', accessToken);
        await SecureStore.setItemAsync('refreshToken', refreshToken);
        await SecureStore.setItemAsync('userName', user.fullName);
        await SecureStore.setItemAsync('userEmail', user.email);

        router.replace('/home');
      }
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.response?.data?.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for Sign-Up functionality
  const handleSignUp = () => {
    Alert.alert("Sign Up", "This feature requires a registration endpoint on the backend.");
    // In the future, you would navigate to a sign-up screen: router.push('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Welcome Back</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Login</Text>}
        </TouchableOpacity>
        
        <Text style={styles.dividerText}>or</Text>
        
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={() => promptAsync()}
          disabled={isLoading || !request}
        >
          <Ionicons name="logo-google" size={24} color="#EA4335" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#0D47A1',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerText: {
    marginVertical: 20,
    fontSize: 16,
    color: '#888',
  },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    height: 55,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#555',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpText: {
    marginTop: 30,
    color: '#555',
    fontSize: 16,
  },
  signUpLink: {
    color: '#0D47A1',
    fontWeight: 'bold',
  },
});