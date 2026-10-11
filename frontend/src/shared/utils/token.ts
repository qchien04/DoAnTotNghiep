import { env } from '@/configs/env';
import { User } from '@/shared/types/auth';

const AUTH_SYNC_CHANNEL = 'stayconnect_auth_sync';

export interface AuthSyncMessage {
  type: 'LOGIN' | 'REFRESH' | 'LOGOUT';
  token?: string | null;
  refreshToken?: string | null;
  user?: User | null;
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(AUTH_SYNC_CHANNEL);
  } catch {
    broadcastChannel = null;
  }
}

export const broadcastAuthChange = (msg: AuthSyncMessage): void => {
  try {
    broadcastChannel?.postMessage(msg);
  } catch {
    // Ignore cross-origin or closed channel errors
  }
};

export const subscribeAuthChange = (callback: (msg: AuthSyncMessage) => void): (() => void) => {
  if (!broadcastChannel) return () => {};
  const handler = (e: MessageEvent<AuthSyncMessage>) => {
    callback(e.data);
  };
  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
};

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
