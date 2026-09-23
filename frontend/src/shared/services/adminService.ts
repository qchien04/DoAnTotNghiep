import apiClient from './api';
import { ResponseData, PageResponse } from '@/shared/types/api';
import {
  AdminUserItem,
  CreateAdminUserDto,
  UpdateAdminUserDto,
  ToggleLockUserDto,
  AdminUserFilterParams,
  LifestyleCriterion,
  CreateLifestyleCriterionDto,
  UpdateLifestyleCriterionDto,
  DisputeReport,
  EnforceReportDto,
  AdminAnalyticsData,
} from '@/shared/types/admin';

export const adminService = {
  // 1. Quản lý người dùng (UC 47 - 50)
  getUsers: async (params?: AdminUserFilterParams): Promise<ResponseData<PageResponse<AdminUserItem>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<AdminUserItem>>>('/api/admin/users', { params });
    return res.data;
  },

  getUserById: async (id: string | number): Promise<ResponseData<AdminUserItem>> => {
    const res = await apiClient.get<ResponseData<AdminUserItem>>(`/api/admin/users/${id}`);
    return res.data;
  },

  createUser: async (dto: CreateAdminUserDto): Promise<ResponseData<AdminUserItem>> => {
    const res = await apiClient.post<ResponseData<AdminUserItem>>('/api/admin/users', dto);
    return res.data;
  },

  updateUser: async (id: string | number, dto: UpdateAdminUserDto): Promise<ResponseData<AdminUserItem>> => {
    const res = await apiClient.put<ResponseData<AdminUserItem>>(`/api/admin/users/${id}`, dto);
    return res.data;
  },

  toggleLockUser: async (id: string | number, dto: ToggleLockUserDto): Promise<ResponseData<AdminUserItem>> => {
    const res = await apiClient.post<ResponseData<AdminUserItem>>(`/api/admin/users/${id}/toggle-lock`, dto);
    return res.data;
  },

  // 2. Master Data (UC 51 - 54)
  getMasterData: async (): Promise<ResponseData<LifestyleCriterion[]>> => {
    const res = await apiClient.get<ResponseData<LifestyleCriterion[]>>('/api/admin/master-data');
    return res.data;
  },

  createCriterion: async (dto: CreateLifestyleCriterionDto): Promise<ResponseData<LifestyleCriterion>> => {
    const res = await apiClient.post<ResponseData<LifestyleCriterion>>('/api/admin/master-data', dto);
    return res.data;
  },

  updateCriterion: async (id: string, dto: UpdateLifestyleCriterionDto): Promise<ResponseData<LifestyleCriterion>> => {
    const res = await apiClient.put<ResponseData<LifestyleCriterion>>(`/api/admin/master-data/${id}`, dto);
    return res.data;
  },

  deleteCriterion: async (id: string): Promise<ResponseData<LifestyleCriterion>> => {
    const res = await apiClient.delete<ResponseData<LifestyleCriterion>>(`/api/admin/master-data/${id}`);
    return res.data;
  },

  // 3. Báo cáo vi phạm (UC 55 - 56)
  getDisputeReports: async (): Promise<ResponseData<DisputeReport[]>> => {
    const res = await apiClient.get<ResponseData<DisputeReport[]>>('/api/admin/reports');
    return res.data;
  },

  getReportById: async (id: string): Promise<ResponseData<DisputeReport>> => {
    const res = await apiClient.get<ResponseData<DisputeReport>>(`/api/admin/reports/${id}`);
    return res.data;
  },

  enforceReportAction: async (id: string, dto: EnforceReportDto): Promise<ResponseData<DisputeReport>> => {
    const res = await apiClient.post<ResponseData<DisputeReport>>(`/api/admin/reports/${id}/enforce`, dto);
    return res.data;
  },

  // 4. Dashboard thống kê sàn (UC 57)
  getAnalytics: async (): Promise<ResponseData<AdminAnalyticsData>> => {
    const res = await apiClient.get<ResponseData<AdminAnalyticsData>>('/api/admin/analytics');
    return res.data;
  },
};
