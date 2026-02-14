import api from "./api";
import type { TokenResponse, RegisterPayload, LoginPayload } from "../types/api";

/**
 * Register a new user.
 * On success the access_token is persisted to localStorage.
 */
export async function register(payload: RegisterPayload): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/register", payload);

  // Persist tokens
  localStorage.setItem("token", data.access_token);
  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }

  return data;
}

/**
 * Log in with email + password.
 * On success the access_token is persisted to localStorage.
 */
export async function login(email: string, password: string): Promise<TokenResponse> {
  const payload: LoginPayload = { email, password };
  const { data } = await api.post<TokenResponse>("/auth/login", payload);

  // Persist tokens
  localStorage.setItem("token", data.access_token);
  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }

  return data;
}

/**
 * Clear stored tokens (client-side logout).
 */
export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
}
