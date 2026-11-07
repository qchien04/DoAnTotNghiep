import apiClient from './api';
import { ResponseData, PageResponse } from '@/shared/types/api';
import { Amenity, CreateAmenityDto, AmenityFilterParams } from '@/shared/types/amenity';

export const amenityService = {
  // Public - Lấy toàn bộ danh mục tiện ích cho dropdown/checkbox
  getAllPublicAmenities: async (): Promise<ResponseData<Amenity[]>> => {
    const res = await apiClient.get<ResponseData<Amenity[]>>('/api/v1/public/amenities');
    return res.data;
  },

  // Admin - Lấy danh sách tiện ích có phân trang
  getAdminAmenities: async (params?: AmenityFilterParams): Promise<ResponseData<PageResponse<Amenity>>> => {
    const res = await apiClient.get<ResponseData<PageResponse<Amenity>>>('/api/v1/admin/amenities', { params });
    return res.data;
  },

  // Admin - Tạo mới
  createAmenity: async (dto: CreateAmenityDto): Promise<ResponseData<Amenity>> => {
    const res = await apiClient.post<ResponseData<Amenity>>('/api/v1/admin/amenities', dto);
    return res.data;
  },

  // Admin - Cập nhật
  updateAmenity: async (id: number | string, dto: CreateAmenityDto): Promise<ResponseData<Amenity>> => {
    const res = await apiClient.put<ResponseData<Amenity>>(`/api/v1/admin/amenities/${id}`, dto);
    return res.data;
  },

  // Admin - Xóa
  deleteAmenity: async (id: number | string): Promise<ResponseData<void>> => {
    const res = await apiClient.delete<ResponseData<void>>(`/api/v1/admin/amenities/${id}`);
    return res.data;
  },
};
