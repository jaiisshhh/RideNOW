import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../src/api";
import { useApi } from "../src/useApi"; // NEW: Import our custom hook

// NEW: Define API functions separately for clarity
const registerUserApi = (params: any) => api.post("/users/register", params);

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // NEW: State for validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const router = useRouter();

  // NEW: Use our custom hook for the signup API call
  const {
    data,
    error,
    isLoading,
    request: performSignup,
  } = useApi(registerUserApi);

  // NEW: useEffect to handle navigation after successful signup
  useEffect(() => {
    if (data?.success) {
      Alert.alert(
        "OTP Sent",
        "An OTP has been sent to your email. Please verify.",
        [
          {
            text: "OK",
            onPress: () =>
              router.push({ pathname: "/verify-otp", params: { email } }),
          },
        ]
      );
    }
  }, [data]);

  // NEW: Improved validation function that returns an error object
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    // The hook handles isLoading and error states automatically
    performSignup({ email, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <View>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
          onBlur={validateForm} // Optional: validate when user leaves the field
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
          onBlur={validateForm} // Optional: validate when user leaves the field
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      {/* NEW: Display API error from the hook */}
      {error && <Text style={styles.apiErrorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        disabled={isLoading}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// NEW: Added styles for inline errors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "red" },
  errorText: { color: "red", marginBottom: 10, marginLeft: 5 },
  apiErrorText: { color: "red", textAlign: "center", marginBottom: 10 },
  button: {
    backgroundColor: "#0D47A1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: "#6497c5" },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  linkText: {
    color: "#0D47A1",
    marginTop: 20,
    textAlign: "center",
    fontWeight: "600",
  },
});
