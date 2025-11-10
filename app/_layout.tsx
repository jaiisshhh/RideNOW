import { SplashScreen, Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "../src/context/AuthContext"; // 1. Import

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth(); // 3. Get auth state
  const router = useRouter();

  // 4. This is the "gatekeeper"
  useEffect(() => {
    if (isLoading) {
      // Still checking storage, do nothing
      return;
    }

    if (user) {
      // User is logged in, send them to the app
      router.replace("/(app)/(tabs)/home");
    } else {
      // User is not logged in, send them to the login screen
      router.replace("/login");
    }

    // Hide the splash screen once we've made a decision
    SplashScreen.hideAsync();
  }, [user, isLoading, router]); // Re-run when user or loading state changes

  // 5. While loading, show nothing (the splash screen is visible)
  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    // 2. Wrap the app in the provider
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
