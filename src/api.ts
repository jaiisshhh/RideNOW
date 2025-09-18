import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Log the base URL for debugging
console.log("API base URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 100000, // 10 seconds timeout
});

// Interceptor to add the auth token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
