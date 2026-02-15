import apiClient, { saveTokens, saveUserData, clearAllAuth } from "./client";
import type {
  UserRegisterRequest,
  UserLoginRequest,
  TokenResponse,
  UserResponse,
} from "./types";

// ============================================================
// Authentication API
// ============================================================

/**
 * Register a new user
 */
export async function register(
  data: UserRegisterRequest,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>(
    "/api/auth/register",
    data,
  );
  const tokens = response.data;

  // Save tokens
  saveTokens(tokens);

  // Fetch and save user profile
  const user = await getMe();
  saveUserData(user as unknown as Record<string, unknown>);

  return tokens;
}

/**
 * Login with email and password
 */
export async function login(data: UserLoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/api/auth/login", data);
  const tokens = response.data;

  // Save tokens
  saveTokens(tokens);

  // Fetch and save user profile
  const user = await getMe();
  saveUserData(user as unknown as Record<string, unknown>);

  return tokens;
}

/**
 * Get current user profile
 */
export async function getMe(): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>("/api/auth/me");
  return response.data;
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post("/api/auth/logout");
  } catch {
    // Ignore errors on logout — clear locally regardless
  }
  clearAllAuth();
}

/**
 * Refresh the access token
 */
export async function refreshToken(
  refresh_token: string,
): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>("/api/auth/refresh", {
    refresh_token,
  });
  const tokens = response.data;
  saveTokens(tokens);
  return tokens;
}
