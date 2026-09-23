import { env } from '@/configs/env';
import { User } from '@/shared/types/auth';

export const getToken = (): string | null => {
  return localStorage.getItem(env.TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(env.TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(env.TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(env.REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(env.REFRESH_TOKEN_KEY, token);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem(env.REFRESH_TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(env.USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as User;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(env.USER_KEY, JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem(env.USER_KEY);
};

export const clearAuth = (): void => {
  removeToken();
  removeRefreshToken();
  removeStoredUser();
};
