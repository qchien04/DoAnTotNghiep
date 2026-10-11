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
  broadcastAuthChange,
  subscribeAuthChange,
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
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (data: { oldPassword: string; newPassword: string; confirmPassword: string }) => Promise<boolean>;
  logout: () => Promise<void> | void;
  logoutAll: () => Promise<void> | void;
  clearError: () => void;
  syncFromStorage: () => void;
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

        broadcastAuthChange({
          type: 'LOGIN',
          token: accessToken,
          refreshToken,
          user,
        });

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
      // Nếu không lấy được profile thì phiên đã hỏng
      clearAuth();
      broadcastAuthChange({ type: 'LOGOUT' });
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updateProfile: async (data: Partial<User>): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.updateProfile(data as any);
      if (response.code === '00' && response.data) {
        setStoredUser(response.data);
        set({ user: response.data, isLoading: false, error: null });
        return true;
      } else {
        set({ isLoading: false, error: response.message || 'Cập nhật thất bại' });
        return false;
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errorDesc ||
        'Không thể cập nhật thông tin cá nhân';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  changePassword: async (data: { oldPassword: string; newPassword: string; confirmPassword: string }): Promise<boolean> => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.changePassword(data);
      if (response.code === '00') {
        set({ isLoading: false, error: null });
        return true;
      } else {
        set({ isLoading: false, error: response.message || 'Đổi mật khẩu thất bại' });
        return false;
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errorDesc ||
        'Đổi mật khẩu thất bại';
      set({ isLoading: false, error: message });
      return false;
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
      broadcastAuthChange({ type: 'LOGOUT' });
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  logoutAll: async (): Promise<void> => {
    try {
      await authService.logoutAll();
    } catch {
      // Ignore network errors
    } finally {
      clearAuth();
      broadcastAuthChange({ type: 'LOGOUT' });
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

  syncFromStorage: (): void => {
    const token = getToken();
    const user = getStoredUser();
    set({
      token,
      user,
      isAuthenticated: Boolean(token),
    });
  },
}));

// Lắng nghe tín hiệu đồng bộ giữa các tab trình duyệt
if (typeof window !== 'undefined') {
  subscribeAuthChange((msg) => {
    if (msg.type === 'LOGOUT') {
      useAuthStore.setState({ user: null, token: null, isAuthenticated: false, error: null });
    } else if (msg.type === 'LOGIN' || msg.type === 'REFRESH') {
      useAuthStore.setState({
        token: msg.token ?? getToken(),
        user: msg.user ?? getStoredUser(),
        isAuthenticated: Boolean(msg.token ?? getToken()),
      });
    }
  });

  // Hỗ trợ thêm window storage event làm fallback
  window.addEventListener('storage', () => {
    useAuthStore.getState().syncFromStorage();
  });
}
