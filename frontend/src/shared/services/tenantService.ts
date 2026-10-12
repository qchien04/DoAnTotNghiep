import apiClient from './api';
import { ResponseData, PageResponse } from '@/shared/types/api';
import {
  RoommatePost,
  UpdateRoommatePostDto,
  PostSearchParams,
  RoommateApplication,
  ApplyRoommateDto,
  LifestyleQuestionResponse,
  UserLifestyleProfileResponse,
  SaveLifestyleAnswersRequest,
  MyRoomDetails,
  TenantContractHistory,
  VietQRPaymentData,
  CreateTenantComplaintDto,
  RateComplaintDto,
} from '@/shared/types/tenant';
import { Bill, Complaint } from '@/shared/types/landlord';

export const normalizeRoommatePost = (raw: any): RoommatePost => {
  if (!raw) return raw;
  const id = String(raw.id || '');
  const code = raw.code || `BG${id.padStart(2, '0')}`;
  const images: string[] = raw.roomInfo?.images || raw.roomImages || [];

  return {
    id,
    code,
    title: raw.title || 'Bài đăng ở ghép',
    authorId: String(raw.authorId || ''),
    authorName: raw.authorName || 'Người dùng',
    authorAvatar: raw.authorAvatar,
    postType: raw.postType || 'HAS_ROOM',
    areaName: raw.areaName || raw.district || '',
    ward: raw.ward || '',
    district: raw.district || '',
    city: raw.city || 'Hà Nội',
    sharePrice: Number(raw.sharePrice) || 0,
    totalRoomPrice: raw.totalRoomPrice ? Number(raw.totalRoomPrice) : undefined,
    neededRoommates: raw.neededRoommates ?? 1,
    currentRoommates: raw.currentRoommates ?? 1,
    description: raw.description || '',
    matchPercentage: raw.matchPercentage,
    status: raw.status || 'OPEN',
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
    roomInfo: {
      roomId: raw.roomId ? String(raw.roomId) : undefined,
      roomName: raw.roomName,
      address: raw.areaName || '',
      amenities: raw.roomInfo?.amenities || [],
      images: Array.isArray(images) ? images : [],
    },
    lifestyle: raw.lifestyle || {
      genderPreference: raw.genderPreference || 'ANY',
      sleepTime: raw.sleepTime || 'BEFORE_24H',
      smoking: raw.isNoSmoking !== undefined ? !raw.isNoSmoking : false,
      petFriendly: Boolean(raw.isPetFriendly),
      cookingFrequency: raw.cookingFrequency || 'SOMETIMES',
      cleanlinessLevel: raw.cleanlinessLevel || 'VERY_CLEAN',
      personality: 'BALANCED',
      guestsAllowed: raw.guestAllowed || 'WEEKENDS_ONLY',
    },
  };
};

export const tenantService = {
  // 0. Khảo sát lối sống & Vector Profile
  getLifestyleQuestions: async (): Promise<ResponseData<LifestyleQuestionResponse[]>> => {
    const res = await apiClient.get<ResponseData<LifestyleQuestionResponse[]>>('/api/v1/tenant/lifestyle/questions');
    return res.data;
  },

  getUserLifestyleProfile: async (): Promise<ResponseData<UserLifestyleProfileResponse>> => {
    const res = await apiClient.get<ResponseData<UserLifestyleProfileResponse>>('/api/v1/tenant/lifestyle/profile');
    return res.data;
  },

  saveUserLifestyleProfile: async (data: SaveLifestyleAnswersRequest): Promise<ResponseData<UserLifestyleProfileResponse>> => {
    const res = await apiClient.put<ResponseData<UserLifestyleProfileResponse>>('/api/v1/tenant/lifestyle/profile', data);
    return res.data;
  },

  // 1. Bài đăng ở ghép (UC 30 - 35, 40)
  searchPosts: async (params?: PostSearchParams): Promise<ResponseData<PageResponse<RoommatePost>>> => {
    const res = await apiClient.get<any>('/api/v1/tenant/posts/search', { params });
    const rawData = res.data?.data;
    const rawList = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData?.items)
      ? rawData.items
      : Array.isArray(rawData?.content)
      ? rawData.content
      : [];

    const items = rawList.map(normalizeRoommatePost);
    return {
      ...res.data,
      data: {
        items,
        page: rawData?.page ?? rawData?.number ?? 0,
        size: rawData?.size ?? 10,
        totalElements: rawData?.totalElements ?? items.length,
        totalPages: rawData?.totalPages ?? 1,
        last: rawData?.last ?? true,
      },
    };
  },

  getMyPosts: async (): Promise<ResponseData<RoommatePost[]>> => {
    const res = await apiClient.get<any>('/api/v1/tenant/posts/my-posts');
    const rawList = Array.isArray(res.data?.data) ? res.data.data : [];
    return {
      ...res.data,
      data: rawList.map(normalizeRoommatePost),
    };
  },

  getPostById: async (id: string): Promise<ResponseData<RoommatePost>> => {
    const res = await apiClient.get<any>(`/api/v1/tenant/posts/${id}`);
    return {
      ...res.data,
      data: normalizeRoommatePost(res.data?.data),
    };
  },

  createPostWithRoom: async (dto: any): Promise<ResponseData<RoommatePost>> => {
    const payload = {
      ...dto,
      postType: 'HAS_ROOM',
      sharePrice: dto.sharePrice,
      totalRoomPrice: dto.totalRoomPrice || (dto.sharePrice ? dto.sharePrice * 2 : 3800000),
      neededRoommates: dto.neededRoommates || 1,
      genderPreference: dto.genderPreference || dto.lifestyle?.genderPreference || 'ANY',
      sleepTime: dto.sleepTime || dto.lifestyle?.sleepTime || 'BEFORE_24H',
      isNoSmoking: dto.isNoSmoking !== undefined ? dto.isNoSmoking : (dto.lifestyle?.smoking !== undefined ? !dto.lifestyle.smoking : true),
      isPetFriendly: dto.isPetFriendly !== undefined ? dto.isPetFriendly : Boolean(dto.lifestyle?.petFriendly),
      cookingFrequency: dto.cookingFrequency || dto.lifestyle?.cookingFrequency || 'DAILY',
      cleanlinessLevel: dto.cleanlinessLevel || dto.lifestyle?.cleanlinessLevel || 'VERY_CLEAN',
      guestAllowed: dto.guestAllowed || dto.lifestyle?.guestsAllowed || 'WEEKENDS_ONLY',
    };
    const res = await apiClient.post<any>('/api/v1/tenant/posts/existing-room', payload);
    return {
      ...res.data,
      data: normalizeRoommatePost(res.data?.data),
    };
  },

  createPostWithoutRoom: async (dto: any): Promise<ResponseData<RoommatePost>> => {
    const payload = {
      ...dto,
      postType: 'SEARCHING_ROOM',
      sharePrice: dto.sharePrice || dto.budgetMax || 2000000,
      roomAddress: dto.roomAddress || dto.centerAddress || 'Khu vực Hà Nội',
      district: dto.district || 'Cầu Giấy',
      city: dto.city || 'Hà Nội',
      neededRoommates: dto.neededRoommates || 1,
      genderPreference: dto.genderPreference || dto.lifestyle?.genderPreference || 'ANY',
      sleepTime: dto.sleepTime || dto.lifestyle?.sleepTime || 'BEFORE_24H',
      isNoSmoking: dto.isNoSmoking !== undefined ? dto.isNoSmoking : (dto.lifestyle?.smoking !== undefined ? !dto.lifestyle.smoking : true),
      isPetFriendly: dto.isPetFriendly !== undefined ? dto.isPetFriendly : Boolean(dto.lifestyle?.petFriendly),
      cookingFrequency: dto.cookingFrequency || dto.lifestyle?.cookingFrequency || 'DAILY',
      cleanlinessLevel: dto.cleanlinessLevel || dto.lifestyle?.cleanlinessLevel || 'VERY_CLEAN',
      guestAllowed: dto.guestAllowed || dto.lifestyle?.guestsAllowed || 'WEEKENDS_ONLY',
    };
    const res = await apiClient.post<any>('/api/v1/tenant/posts/virtual-room', payload);
    return {
      ...res.data,
      data: normalizeRoommatePost(res.data?.data),
    };
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
