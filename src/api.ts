import axios from "axios";
import * as SecureStore from "expo-secure-store";

// ==========================================================
// 🔧 BASE CONFIGURATION
// ==========================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

// This URL is your base: e.g., http://192.168.1.5:8000/api/v1/app
const API_URL = "https://ridenow-backend-99w6.onrender.com/api/v1/app/";
console.log("API base URL:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 100000,
});

// ==========================================================
// 🔒 REQUEST INTERCEPTOR
// ==========================================================
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================================
// 🔁 RESPONSE INTERCEPTOR
// ==========================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // Calls /api/v1/app/users/refresh-token
        const { data } = await api.post("/users/refresh-token", {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          data.data;

        await SecureStore.setItemAsync("accessToken", newAccessToken);
        await SecureStore.setItemAsync("refreshToken", newRefreshToken);

        api.defaults.headers.common["Authorization"] =
          "Bearer " + newAccessToken;
        originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;

        failedQueue.forEach((prom) => prom.resolve(newAccessToken));
        failedQueue = [];

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ==========================================================
// 🧾 USER DOCUMENTS
// ==========================================================
// Calls /api/v1/app/users/documents
export const getDocumentsApi = () => api.get("/users/documents");

export const verifyAadharApi = (formData: FormData) =>
  api.post("/users/verify-aadhar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const verifyDLApi = (formData: FormData) =>
  api.post("/users/verify-dl", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ==========================================================
// 🚗 VEHICLES
// ==========================================================
// Calls /api/v1/app/vehicles/search
export const searchVehiclesApi = (params: {
  city: string;
  pickup: string;
  drop: string;
}) => api.get("/vehicles/search", { params }); // CORRECT

// Calls /api/v1/app/vehicles/<id>
export const getVehicleDetailsApi = (vehicleId: string) =>
  api.get(`/vehicles/${vehicleId}`); // CORRECT

// Calls /api/v1/app/vehicles/<id>/pricing
export const getVehiclePriceApi = (params: {
  vehicleId: string;
  pickup: string;
  drop: string;
}) =>
  api.get(`/vehicles/${params.vehicleId}/pricing`, {
    // CORRECT
    params: {
      pickup: params.pickup,
      drop: params.drop,
    },
  });

// ==========================================================
// 📅 BOOKINGS
// ==========================================================

// Calls /api/v1/app/vehicles/<id>/book
export const bookVehicleApi = (params: {
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}) =>
  api.post(`/vehicles/${params.vehicleId}/book`, {
    // CORRECT
    startDate: params.startDate,
    endDate: params.endDate,
    totalPrice: params.totalPrice,
  });

// ✅ FIXED: Calls /api/v1/app/vehicles/my-bookings
export const getUserBookingsApi = () => api.get("/vehicles/my-bookings");

// ✅ FIXED: Calls /api/v1/app/vehicles/<id>/end-booking
export const endBookingApi = (vehicleId: string) =>
  api.post(`/vehicles/${vehicleId}/end-booking`); // Changed to POST

// ==========================================================
// 👤 USER PROFILE
// ==========================================================
export const getUserProfileApi = () => api.get("/users/profile");
export const updateUserProfileApi = (data: any) =>
  api.put("/users/profile", data);

export default api;
