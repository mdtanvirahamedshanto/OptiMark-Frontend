import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("optimark_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // For FormData, let browser set Content-Type with boundary (required for multipart)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && (error.response?.status === 401 || error.response?.status === 403)) {
      const isAuthEndpoint = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/signup");
      if (!isAuthEndpoint) {
        localStorage.removeItem("optimark_token");
      }
    }
    return Promise.reject(error);
  }
);
