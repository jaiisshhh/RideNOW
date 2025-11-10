import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../src/api";
import { useAuth } from "../src/context/AuthContext"; // 1. We will use this now

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); // We still need this for the <Link> component
  const auth = useAuth(); // 2. Initialize the Auth Context

  const handleEmailLogin = async () => {
    console.log("Login attempt started");
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required.");
      console.log("Login validation failed: missing email or password");
      return;
    }
    setIsLoading(true);
    try {
      console.log("Sending login request", { email, password });

      // The API call is the same
      const res = await api.post("/users/login", { email, password });
      console.log("Received login response", res.data);

      // The backend returns { success: true, data: { user, accessToken, refreshToken } }
      if (res.data.success && res.data.data.accessToken) {
        // 3. THIS IS THE MAJOR CHANGE
        // We let the AuthContext handle everything:
        // - Storing tokens in SecureStore
        // - Storing the user object
        // - Updating the app state
        await auth.login(res.data.data);

        // 4. REMOVED navigation.
        // The root _layout.tsx is listening for auth.user
        // and will navigate automatically.
        // router.replace("/home"); <-- This is no longer needed
      } else {
        console.warn("Login failed: Unexpected response format", res.data);
        Alert.alert(
          "Login Failed",
          res.data.message || "Unexpected response from server."
        );
      }
    } catch (error: any) {
      console.error("Login error caught:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }

      Alert.alert(
        "Login Failed",
        error.response?.data?.message || error.message || "An error occurred."
      );
    } finally {
      setIsLoading(false);
      console.log("Login attempt ended");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Image source={require("../src/assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Welcome Back</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#888"
          value={email}
          onChangeText={(text) => {
            console.log("Email input changed:", text);
            setEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={(text) => {
            console.log("Password input changed");
            setPassword(text);
          }}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.dividerText}>or</Text>

        {/* Disabled Google login button (as in your file) */}
        <TouchableOpacity
          style={[styles.googleButton, { opacity: 0.6 }]}
          disabled={true}
        >
          <Ionicons
            name="logo-google"
            size={24}
            color="#EA4335"
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Login with Google</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- STYLES (Unchanged) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f8" },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 30 },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#0D47A1",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 55,
  },
  loginButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  dividerText: {
    marginVertical: 20,
    fontSize: 16,
    color: "#888",
  },
  googleButton: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    height: 55,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "#555",
    fontSize: 18,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "center",
  },
  signUpText: { color: "#666", fontSize: 14 },
  signUpLink: { color: "#0D47A1", fontWeight: "bold" },
});
