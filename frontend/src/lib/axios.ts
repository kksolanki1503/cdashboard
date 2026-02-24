import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";
import { store } from "@/store";
import { refreshAccessToken, clearAuth } from "@/store/authSlice";

// Environment-based base URL configuration

const BaseURL = import.meta.env.VITE_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: BaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable cookies to be sent with requests (refresh token cookie)
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

// Process the failed queue
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request interceptor to add access token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth.accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If this is the refresh token endpoint failing, redirect to sign in
      if (originalRequest.url?.includes("/auth/refresh")) {
        store.dispatch(clearAuth());
        window.location.href = "/signin";
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dispatch refresh token action
        const result = await store.dispatch(refreshAccessToken()).unwrap();
        const newToken = result.data.accessToken;

        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Process the queued requests
        processQueue(null, newToken);

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to sign in
        processQueue(refreshError as Error, null);
        store.dispatch(clearAuth());
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
