import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../../src/context/AuthContext"; // 1. Import useAuth

// Note: We no longer need SecureStore or api here,
// as the AuthContext handles all of that.

export default function TabLayout() {
  const router = useRouter();
  const auth = useAuth(); // 2. Get the auth context

  // 3. Define the logout function
  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          // 4. Call the central auth.logout() function
          await auth.logout();

          // The root _layout.tsx will automatically
          // redirect the user to the /login screen.
        },
      },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // This keeps headers off for other tabs
        tabBarActiveTintColor: "#0D47A1",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      {/* Inbox Tab is removed */}

      <Tabs.Screen
        name="host"
        options={{
          title: "Host",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "add-circle" : "add-circle-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          // 5. Configure the profile tab's header
          title: "My Profile",
          headerShown: true, // <-- This turns the header ON for this tab
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={color}
            />
          ),
          // 6. Add the Edit and Logout buttons
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 10, marginRight: 15 }}>
              <TouchableOpacity onPress={() => router.push("/editProfile")}>
                <Ionicons name="create-outline" size={24} color="#0D47A1" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#C62828" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
