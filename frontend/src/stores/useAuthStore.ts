import { create } from 'zustand';
import { User, LoginPayload, RegisterPayload } from '@/shared/types/auth';
import { authService } from '@/shared/services/authService';
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  getStoredUser,
  setStoredUser,
  clearAuth,
} from '@/shared/utils/token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  fetchProfile: () => Promise<void>;
  logout: () => Promise<void> | void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: getToken(),
  isAuthenticated: Boolean(getToken()),
  isLoading: false,
  error: null,

  login: async (payload: LoginPayload): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(payload);
      if (response.code === '00' && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        setToken(accessToken);
        if (refreshToken) {
          setRefreshToken(refreshToken);
        }
        setStoredUser(user);

        set({
          token: accessToken,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.message || 'Đăng nhập không thành công',
        });
        return false;
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errorDesc ||
        'Tên đăng nhập hoặc mật khẩu không chính xác';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  register: async (payload: RegisterPayload): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(payload);
      if (response.code === '00') {
        set({ isLoading: false, error: null });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.message || 'Đăng ký thất bại',
        });
        return false;
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errorDesc ||
        'Không thể đăng ký tài khoản';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  fetchProfile: async (): Promise<void> => {
    try {
      const response = await authService.getMe();
      if (response.code === '00' && response.data) {
        setStoredUser(response.data);
        set({ user: response.data, isAuthenticated: true });
      }
    } catch {
      clearAuth();
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  logout: async (): Promise<void> => {
    const rfToken = getRefreshToken();
    try {
      if (rfToken) {
        await authService.logout(rfToken);
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      clearAuth();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  clearError: (): void => {
    set({ error: null });
  },
}));
