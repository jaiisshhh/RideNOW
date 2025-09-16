import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        if (token) {
          // User is logged in, go to the main app
          router.replace("/home");
        } else {
          // User is not logged in, go to the login screen
          router.replace("/home");
        }
      } catch (e) {
        console.error("Failed to check login status:", e);
        router.replace("/home");
      }
    };

    checkLoginStatus();
  }, []);

  // Show a loading spinner while we check
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
