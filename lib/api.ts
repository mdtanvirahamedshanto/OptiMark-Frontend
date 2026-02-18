import axios, { AxiosError } from "axios";

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
      const isAuthEndpoint = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/signup") || error.config?.url?.includes("/auth/register");
      if (!isAuthEndpoint) {
        localStorage.removeItem("optimark_token");
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

/** Extract user-friendly error message from API error (handles string or validation array). */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error && typeof error === "object" && "response" in error) {
    const err = error as AxiosError<{ detail?: string | { msg: string }[] }>;
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      return typeof first === "object" && first && "msg" in first ? String(first.msg) : String(first);
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
