import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import api from "../src/api";
import { useApi } from "../src/useApi"; // NEW: Import our custom hook

// NEW: Define API function separately
const verifyOtpApi = (params: any) => api.post("/users/verify-otp", params);

export default function VerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [otp, setOtp] = useState("");

  // NEW: Use our custom hook for the OTP API call
  const {
    data,
    error,
    isLoading,
    request: performVerifyOtp,
  } = useApi(verifyOtpApi);

  // NEW: useEffect to handle navigation on success
  useEffect(() => {
    if (data?.success) {
      Alert.alert(
        "Success",
        "Email verified successfully. You can now login.",
        [{ text: "OK", onPress: () => router.replace("/login") }]
      );
    }
  }, [data]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      // Simple validation
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }
    // The hook handles the rest
    performVerifyOtp({ email, otp });
  };

  return (
    // --- 2. WRAP your screen content ---
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        {/* Added a View here to make the wrapper work correctly */}
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
          />

          {error && <Text style={styles.apiErrorText}>{error}</Text>}

          <TouchableOpacity
            style={[
              styles.button,
              (!otp || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleVerifyOtp}
            disabled={!otp || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // NEW: Inner container to help with layout
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f6f8",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
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
});
