/// <reference types="vite/client" />
import axios from "axios";
import type { TokenResponse } from "./types";

// ============================================================
// Axios Client with JWT Interceptors
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const TOKEN_KEY = "superbear_access_token";
const REFRESH_TOKEN_KEY = "superbear_refresh_token";
const USER_KEY = "superbear_user";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60s — LLM calls can be slow
});

// ---- Token Management ----

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveTokens(tokenResponse: TokenResponse): void {
  localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
  if (tokenResponse.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokenResponse.refresh_token);
  }
}

export function saveUserData(userData: Record<string, unknown>): void {
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

export function getUserData(): Record<string, unknown> | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearAllAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ---- Request Interceptor: Attach Bearer Token ----

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---- Response Interceptor: Auto-refresh on 401 ----

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAllAuth();
        isRefreshing = false;
        window.dispatchEvent(new CustomEvent("auth:expired"));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<TokenResponse>(
          `${API_BASE_URL}/api/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const newTokens = response.data;
        saveTokens(newTokens);

        processQueue(null, newTokens.access_token);

        originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAllAuth();
        window.dispatchEvent(new CustomEvent("auth:expired"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
