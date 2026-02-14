const AUTH_STORAGE_KEY = "superbear_user";

export function isAuthenticated(): boolean {
  const userValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!userValue) {
    return false;
  }

  try {
    const parsed = JSON.parse(userValue);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

export function clearSession(): void {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
