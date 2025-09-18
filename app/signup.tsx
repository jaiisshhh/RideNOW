import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../src/api";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const isFormValid = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return false;
    }
    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    try {
      const res = await api.post("/users/register", { email, password });

      console.log("Signup response:", res.data);

      if (res.data && res.data.success) {
        Alert.alert(
          "OTP Sent",
          "An OTP has been sent to your email. Please verify.",
          [
            {
              text: "OK",
              onPress: () =>
                router.push({
                  pathname: "/verify-otp",
                  params: { email }, // Pass email for OTP verification screen
                }),
            },
          ]
        );
      } else {
        Alert.alert("Signup Failed", res.data.message || "An error occurred.");
      }
    } catch (error: any) {
      console.log("Signup error:", error);
      let message = "An error occurred.";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      Alert.alert("Signup Failed", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[
          styles.button,
          (!email || !password || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleSignup}
        disabled={!email || !password || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity disabled={isLoading} onPress={() => router.back()}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

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
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
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
