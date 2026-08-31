import type { AuthUser } from "../api/authApi";

const TOKEN_KEY = "injibara_market_token";
const USER_KEY = "injibara_market_user";

export const saveAuth = (token: string, user: AuthUser) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Keep standard keys synchronized for backward compatibility
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem("token");
};

export const getUser = (): AuthUser | null => {
  const user = localStorage.getItem(USER_KEY) || localStorage.getItem("user");
  if (!user) {
    return null;
  }
  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const isAuthenticated = (): boolean => {
  return Boolean(getToken());
};
