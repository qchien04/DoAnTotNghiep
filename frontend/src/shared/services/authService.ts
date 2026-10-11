import apiClient from './api';
import { ResponseData, PageResponse, PagingParams } from '@/shared/types/api';
import { AuthResponse, LoginPayload, RegisterPayload, User, HomeStats } from '@/shared/types/auth';

export const authService = {
  login: async (payload: LoginPayload): Promise<ResponseData<AuthResponse>> => {
    const res = await apiClient.post<ResponseData<AuthResponse>>('/api/v1/auth/login', payload);
    return res.data;
  },

  sendRegisterOtp: async (email: string): Promise<ResponseData<void>> => {
    const res = await apiClient.post<ResponseData<void>>('/api/v1/auth/otp/send-register', { email });
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

  logoutAll: async (): Promise<ResponseData<void>> => {
    const res = await apiClient.post<ResponseData<void>>('/api/v1/auth/logout-all');
    return res.data;
  },

  changePassword: async (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ResponseData<void>> => {
    const res = await apiClient.post<ResponseData<void>>('/api/v1/auth/change-password', data);
    return res.data;
  },

  sendForgotPasswordOtp: async (email: string): Promise<ResponseData<void>> => {
    const res = await apiClient.post<ResponseData<void>>('/api/v1/auth/forgot-password/send-otp', { email });
    return res.data;
  },

  resetPassword: async (data: {
    email: string;
    otpCode: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ResponseData<void>> => {
    const res = await apiClient.post<ResponseData<void>>('/api/v1/auth/forgot-password/reset', data);
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

  getPublicRooms: async (): Promise<ResponseData<any[]>> => {
    const res = await apiClient.get<ResponseData<any[]>>('/api/v1/home/rooms');
    return res.data;
  },

  getUsers: async (params?: PagingParams): Promise<ResponseData<PageResponse<User>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<User>>>('/api/v1/users', { params });
    return res.data;
  },

  updateProfile: async (data: {
    fullName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<ResponseData<User>> => {
    const res = await apiClient.put<ResponseData<User>>('/api/v1/users/profile', data);
    return res.data;
  },
};
