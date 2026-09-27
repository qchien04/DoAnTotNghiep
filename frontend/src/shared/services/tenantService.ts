import apiClient from './api';
import { ResponseData, PageResponse } from '@/shared/types/api';
import {
  RoommatePost,
  CreatePostWithRoomDto,
  CreatePostWithoutRoomDto,
  UpdateRoommatePostDto,
  PostSearchParams,
  RoommateApplication,
  ApplyRoommateDto,
  MyRoomDetails,
  TenantContractHistory,
  VietQRPaymentData,
  CreateTenantComplaintDto,
  RateComplaintDto,
} from '@/shared/types/tenant';
import { Bill, Complaint } from '@/shared/types/landlord';

export const tenantService = {
  // 1. Bài đăng ở ghép (UC 30 - 35, 40)
  searchPosts: async (params?: PostSearchParams): Promise<ResponseData<PageResponse<RoommatePost>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<RoommatePost>>>('/api/v1/tenant/posts/search', { params });
    return res.data;
  },

  getMyPosts: async (): Promise<ResponseData<RoommatePost[]>> => {
    const res = await apiClient.get<ResponseData<RoommatePost[]>>('/api/v1/tenant/posts/my-posts');
    return res.data;
  },

  getPostById: async (id: string): Promise<ResponseData<RoommatePost>> => {
    const res = await apiClient.get<ResponseData<RoommatePost>>(`/api/v1/tenant/posts/${id}`);
    return res.data;
  },

  createPostWithRoom: async (dto: CreatePostWithRoomDto): Promise<ResponseData<RoommatePost>> => {
    const res = await apiClient.post<ResponseData<RoommatePost>>('/api/v1/tenant/posts/existing-room', dto);
    return res.data;
  },

  createPostWithoutRoom: async (dto: CreatePostWithoutRoomDto): Promise<ResponseData<RoommatePost>> => {
    const res = await apiClient.post<ResponseData<RoommatePost>>('/api/v1/tenant/posts/virtual-room', dto);
    return res.data;
  },

  updatePost: async (id: string, dto: UpdateRoommatePostDto): Promise<ResponseData<RoommatePost>> => {
    const res = await apiClient.put<ResponseData<RoommatePost>>(`/api/v1/tenant/posts/${id}`, dto);
    return res.data;
  },

  closePost: async (id: string): Promise<ResponseData<RoommatePost>> => {
    const res = await apiClient.post<ResponseData<RoommatePost>>(`/api/v1/tenant/posts/${id}/close`);
    return res.data;
  },

  completePost: async (id: string): Promise<ResponseData<RoommatePost>> => {
    const res = await apiClient.post<ResponseData<RoommatePost>>(`/api/v1/tenant/posts/${id}/complete`);
    return res.data;
  },

  // 2. Ứng tuyển & Quản lý nhóm (UC 36 - 39)
  applyToGroup: async (dto: ApplyRoommateDto): Promise<ResponseData<RoommateApplication>> => {
    const res = await apiClient.post<ResponseData<RoommateApplication>>('/api/v1/tenant/applications', dto);
    return res.data;
  },

  getApplicationsByPostId: async (postId: string): Promise<ResponseData<RoommateApplication[]>> => {
    const res = await apiClient.get<ResponseData<RoommateApplication[]>>(`/api/v1/tenant/posts/${postId}/applications`);
    return res.data;
  },

  approveApplication: async (applicationId: string): Promise<ResponseData<RoommateApplication>> => {
    const res = await apiClient.post<ResponseData<RoommateApplication>>(
      `/api/v1/tenant/applications/${applicationId}/approve`
    );
    return res.data;
  },

  rejectApplication: async (applicationId: string, reason?: string): Promise<ResponseData<RoommateApplication>> => {
    const res = await apiClient.post<ResponseData<RoommateApplication>>(
      `/api/v1/tenant/applications/${applicationId}/reject`,
      { reason }
    );
    return res.data;
  },

  // 3. Phòng của tôi (UC 41 - 42)
  acceptRoomLink: async (invitationId: string | number): Promise<ResponseData<void>> => {
    const res = await apiClient.post<ResponseData<void>>(`/api/v1/tenant/room-links/${invitationId}/accept`);
    return res.data;
  },

  rejectRoomLink: async (invitationId: string | number, reason?: string): Promise<ResponseData<void>> => {
    const res = await apiClient.post<ResponseData<void>>(`/api/v1/tenant/room-links/${invitationId}/reject`, null, {
      params: { reason },
    });
    return res.data;
  },

  getMyRoomDetails: async (): Promise<ResponseData<MyRoomDetails>> => {
    const res = await apiClient.get<ResponseData<MyRoomDetails>>('/api/v1/tenant/my-room');
    return res.data;
  },

  getMyContracts: async (): Promise<ResponseData<TenantContractHistory[]>> => {
    const res = await apiClient.get<ResponseData<TenantContractHistory[]>>('/api/v1/tenant/contracts');
    return res.data;
  },

  // 4. Hóa đơn & VietQR (UC 43 - 44)
  getMyBills: async (): Promise<ResponseData<Bill[]>> => {
    const res = await apiClient.get<ResponseData<Bill[]>>('/api/v1/tenant/my-bills');
    return res.data;
  },

  getVietQRPayment: async (billId: string): Promise<ResponseData<VietQRPaymentData>> => {
    const res = await apiClient.get<ResponseData<VietQRPaymentData>>(`/api/v1/tenant/my-bills/${billId}/qr-payment`);
    return res.data;
  },

  confirmPaymentTransferred: async (billId: string): Promise<ResponseData<Bill>> => {
    const res = await apiClient.post<ResponseData<Bill>>(`/api/v1/tenant/my-bills/${billId}/pay-completed`);
    return res.data;
  },

  // 5. Báo hỏng sự cố (UC 45 - 46)
  getMyComplaints: async (): Promise<ResponseData<Complaint[]>> => {
    const res = await apiClient.get<ResponseData<Complaint[]>>('/api/v1/tenant/complaints');
    return res.data;
  },

  getComplaintById: async (id: string): Promise<ResponseData<Complaint>> => {
    const res = await apiClient.get<ResponseData<Complaint>>(`/api/v1/tenant/complaints/${id}`);
    return res.data;
  },

  submitComplaint: async (dto: CreateTenantComplaintDto): Promise<ResponseData<Complaint>> => {
    const res = await apiClient.post<ResponseData<Complaint>>('/api/v1/tenant/complaints', dto);
    return res.data;
  },

  rateComplaint: async (id: string, dto: RateComplaintDto): Promise<ResponseData<Complaint>> => {
    const res = await apiClient.post<ResponseData<Complaint>>(`/api/v1/tenant/complaints/${id}/rate`, dto);
    return res.data;
  },
};
