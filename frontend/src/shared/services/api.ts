import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@/configs/env';
import {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
  setStoredUser,
  clearAuth,
} from '@/shared/utils/token';
import { ResponseData } from '@/shared/types/api';
import { AuthResponse } from '@/shared/types/auth';

export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Bearer Token vào mọi Request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Biến quản lý trạng thái refresh token và hàng đợi request đang chờ
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Xử lý phản hồi và bắt lỗi 401 Unauthorized tự động Refresh Token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest) {
      const url = originalRequest.url || '';
      // Tránh lặp vô tận nếu chính API login / refresh-token bị lỗi 401
      if (
        url.includes('/api/v1/auth/refresh-token') ||
        url.includes('/api/v1/auth/login') ||
        url.includes('/api/auth/login') ||
        originalRequest._retry
      ) {
        clearAuth();
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.replace('/login');
        }
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuth();
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.replace('/login');
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đã có tiến trình refresh đang chạy, xếp request vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi trực tiếp axios instance mới để tránh interceptor lặp
        const refreshResponse = await axios.post<ResponseData<AuthResponse>>(
          `${env.API_BASE_URL}/api/v1/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const resData = refreshResponse.data;
        if (resData.code === '00' && resData.data) {
          const { accessToken, refreshToken: newRefreshToken, user } = resData.data;
          setToken(accessToken);
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
          }
          if (user) {
            setStoredUser(user);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error(resData.message || 'Phiên làm việc hết hạn');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuth();
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.replace('/login');
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
