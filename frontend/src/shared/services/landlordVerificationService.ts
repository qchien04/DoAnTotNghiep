import { apiClient } from '@/shared/services/api';
import { ResponseData, PageResponse } from '@/shared/types/api';
import {
  LandlordVerificationResponse,
  LandlordVerificationOverviewStats,
  LandlordVerificationSubmitPayload,
  LandlordVerificationStatus,
} from '@/shared/types/landlordVerification';

export const landlordVerificationService = {
  /**
   * Chủ trọ nộp hồ sơ xác minh kèm các tài liệu (Sổ đỏ / Sổ hồng / Hợp đồng ủy quyền)
   */
  async submitVerification(payload: LandlordVerificationSubmitPayload): Promise<LandlordVerificationResponse> {
    const formData = new FormData();
    formData.append('verificationType', payload.verificationType);
    if (payload.propertyAddress) {
      formData.append('propertyAddress', payload.propertyAddress);
    }
    if (payload.documentNumber) {
      formData.append('documentNumber', payload.documentNumber);
    }
    if (payload.notes) {
      formData.append('notes', payload.notes);
    }
    payload.files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await apiClient.post<ResponseData<LandlordVerificationResponse>>(
      '/api/v1/landlord/verification/submit',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  },

  /**
   * Lấy trạng thái hồ sơ xác minh của chủ trọ hiện tại
   */
  async getStatus(): Promise<LandlordVerificationResponse> {
    const res = await apiClient.get<ResponseData<LandlordVerificationResponse>>(
      '/api/v1/landlord/verification/status'
    );
    return res.data.data;
  },

  /**
   * Quản trị viên lấy danh sách các hồ sơ xác minh chủ trọ
   */
  async getAdminVerifications(params?: {
    status?: LandlordVerificationStatus | 'ALL';
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<LandlordVerificationResponse>> {
    const queryParams: Record<string, any> = {};
    if (params?.status && params.status !== 'ALL') {
      queryParams.status = params.status;
    }
    if (params?.search) {
      queryParams.search = params.search;
    }
    queryParams.page = params?.page ?? 0;
    queryParams.size = params?.size ?? 10;

    const res = await apiClient.get<ResponseData<PageResponse<LandlordVerificationResponse>>>(
      '/api/v1/admin/verifications',
      { params: queryParams }
    );
    return res.data.data;
  },

  /**
   * Quản trị viên lấy số liệu thống kê tổng quan
   */
  async getOverviewStats(): Promise<LandlordVerificationOverviewStats> {
    const res = await apiClient.get<ResponseData<LandlordVerificationOverviewStats>>(
      '/api/v1/admin/verifications/overview'
    );
    return res.data.data;
  },

  /**
   * Quản trị viên xem chi tiết một hồ sơ xác minh
   */
  async getAdminVerificationDetail(id: number): Promise<LandlordVerificationResponse> {
    const res = await apiClient.get<ResponseData<LandlordVerificationResponse>>(
      `/api/v1/admin/verifications/${id}`
    );
    return res.data.data;
  },

  /**
   * Quản trị viên phê duyệt hồ sơ xác minh chủ trọ
   */
  async approveVerification(id: number): Promise<LandlordVerificationResponse> {
    const res = await apiClient.post<ResponseData<LandlordVerificationResponse>>(
      `/api/v1/admin/verifications/${id}/approve`
    );
    return res.data.data;
  },

  /**
   * Quản trị viên từ chối hồ sơ xác minh chủ trọ
   */
  async rejectVerification(id: number, reason: string): Promise<LandlordVerificationResponse> {
    const res = await apiClient.post<ResponseData<LandlordVerificationResponse>>(
      `/api/v1/admin/verifications/${id}/reject`,
      { reason }
    );
    return res.data.data;
  },
};

