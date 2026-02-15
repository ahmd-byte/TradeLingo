import { getAccessToken, clearAllAuth } from "../api/client";

const AUTH_STORAGE_KEY = "superbear_user";

export function isAuthenticated(): boolean {
  // Check for JWT access token first (primary auth)
  const token = getAccessToken();
  if (token) return true;

  // Fallback: check legacy localStorage user object
  const userValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!userValue) return false;

  try {
    const parsed = JSON.parse(userValue);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  clearAllAuth();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
