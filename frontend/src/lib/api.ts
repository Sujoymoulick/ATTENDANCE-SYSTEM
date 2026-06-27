import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Helper to get a cookie value by name on the client side
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for cookie-based authentication
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach Bearer token to outgoing API requests
api.interceptors.request.use(
  (config) => {
    const token = getCookie("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle errors globally if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the error message is about network, or 401 Unauthorized
    if (error.response?.status === 401) {
      // Redirect or log out can be handled here or inside the AuthContext
    }
    return Promise.reject(error.response?.data || error);
  }
);
