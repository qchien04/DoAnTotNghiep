import apiClient from '@/shared/services/api';
import { ResponseData, PageResponse } from '@/shared/types/api';
import { Room } from '@/shared/types/landlord';

export interface GeoZone {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface PublicRoomSearchRequest {
  keyword?: string;
  province?: string;
  district?: string;
  provinceId?: number;
  wardId?: number;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  amenityIds?: number[];
  amenitiesMask?: number;
  zones?: GeoZone[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export const publicRoomService = {
  searchRooms: async (req: PublicRoomSearchRequest): Promise<ResponseData<PageResponse<Room>>> => {
    const res = await apiClient.post<ResponseData<PageResponse<Room>>>('/api/v1/public/rooms/search', req);
    return res.data;
  },

  getRoomDetail: async (id: number | string): Promise<ResponseData<Room>> => {
    const res = await apiClient.get<ResponseData<Room>>(`/api/v1/public/rooms/${id}`);
    return res.data;
  },
};
