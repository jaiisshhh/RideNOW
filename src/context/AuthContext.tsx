import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api"; // Your api.ts file

// Define the shape of your auth data
interface AuthContextData {
  user: any | null; // You can create a 'User' interface for this
  accessToken: string | null;
  isLoading: boolean;
  login: (data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newUser: any) => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This effect runs ONCE when the app loads
  // It checks SecureStore for existing tokens (this is your "session persistence")
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedAccessToken = await SecureStore.getItemAsync("accessToken");
        const storedUser = await SecureStore.getItemAsync("user");

        if (storedAccessToken && storedUser) {
          // Set the token for all future API requests
          api.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedAccessToken}`;
          setAccessToken(storedAccessToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Failed to load auth data from storage", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // Login function
  const login = async (data: {
    user: any;
    accessToken: string;
    refreshToken: string;
  }) => {
    try {
      // 1. Set state
      setUser(data.user);
      setAccessToken(data.accessToken);

      // 2. Set the default auth header for api.ts
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.accessToken}`;

      // 3. Save to secure storage
      await SecureStore.setItemAsync("accessToken", data.accessToken);
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);
      await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    } catch (e) {
      console.error("Failed to save auth data", e);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // 1. Clear state
      setUser(null);
      setAccessToken(null);

      // 2. Clear default auth header
      delete api.defaults.headers.common["Authorization"];

      // 3. Clear from secure storage
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("user");
    } catch (e) {
      console.error("Failed to clear auth data", e);
    }
  };

  const updateUser = async (newUser: any) => {
    try {
      // 1. Update state
      setUser(newUser);
      // 2. Update secure storage
      await SecureStore.setItemAsync("user", JSON.stringify(newUser));
    } catch (e) {
      console.error("Failed to update user data", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isLoading, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to easily use the context
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
