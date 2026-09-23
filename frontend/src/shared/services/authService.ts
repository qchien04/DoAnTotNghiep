import apiClient from './api';
import { ResponseData, PageResponse, PagingParams } from '@/shared/types/api';
import { AuthResponse, LoginPayload, RegisterPayload, User, HomeStats } from '@/shared/types/auth';

export const authService = {
  login: async (payload: LoginPayload): Promise<ResponseData<AuthResponse>> => {
    const res = await apiClient.post<ResponseData<AuthResponse>>('/api/v1/auth/login', payload);
    return res.data;
  },

  register: async (payload: RegisterPayload): Promise<ResponseData<User>> => {
    const res = await apiClient.post<ResponseData<User>>('/api/v1/auth/register', payload);
    return res.data;
  },

  refreshToken: async (refreshToken: string): Promise<ResponseData<AuthResponse>> => {
    const res = await apiClient.post<ResponseData<AuthResponse>>('/api/v1/auth/refresh-token', { refreshToken });
    return res.data;
  },

  logout: async (refreshToken?: string | null): Promise<ResponseData<string>> => {
    const res = await apiClient.post<ResponseData<string>>('/api/v1/auth/logout', { refreshToken });
    return res.data;
  },

  getMe: async (): Promise<ResponseData<User>> => {
    const res = await apiClient.get<ResponseData<User>>('/api/v1/auth/me');
    return res.data;
  },

  getHomeStats: async (): Promise<ResponseData<HomeStats>> => {
    const res = await apiClient.get<ResponseData<HomeStats>>('/api/v1/home/stats');
    return res.data;
  },

  getUsers: async (params?: PagingParams): Promise<ResponseData<PageResponse<User>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<User>>>('/api/v1/users', { params });
    return res.data;
  },
};
