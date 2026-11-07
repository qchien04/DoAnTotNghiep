import { apiClient } from './api';
import { ResponseData } from '@/shared/types/api';
import {
  RoomModerationItem,
  RoomModerationDetailResponse,
  RoomAuditLogItem,
} from '@/shared/types/roomModeration';

export const roomModerationService = {
  /**
   * Lấy danh sách tin đăng phòng trọ cần kiểm duyệt hoặc lọc theo trạng thái/điểm rủi ro
   */
  getModerationRooms: async (params?: {
    moderationStatus?: string;
    minRiskScore?: number;
  }): Promise<ResponseData<RoomModerationItem[]>> => {
    const res = await apiClient.get<ResponseData<RoomModerationItem[]>>('/api/v1/admin/rooms/moderation', {
      params,
    });
    return res.data;
  },

  /**
   * Xem chi tiết kiểm duyệt: Thông tin phòng, Điểm rủi ro từng dấu hiệu và Lịch sử chỉnh sửa
   */
  getRoomModerationDetail: async (roomId: number): Promise<ResponseData<RoomModerationDetailResponse>> => {
    const res = await apiClient.get<ResponseData<RoomModerationDetailResponse>>(
      `/api/v1/admin/rooms/${roomId}/moderation-detail`
    );
    return res.data;
  },

  /**
   * Xem danh sách toàn bộ nhật ký thay đổi thông tin và quyết định kiểm duyệt (Audit Log)
   */
  getRoomAuditLogs: async (roomId: number): Promise<ResponseData<RoomAuditLogItem[]>> => {
    const res = await apiClient.get<ResponseData<RoomAuditLogItem[]>>(
      `/api/v1/admin/rooms/${roomId}/audit-logs`
    );
    return res.data;
  },

  /**
   * Phê duyệt tin đăng phòng trọ hợp lệ
   */
  approveRoom: async (roomId: number): Promise<ResponseData<RoomModerationItem>> => {
    const res = await apiClient.post<ResponseData<RoomModerationItem>>(
      `/api/v1/admin/rooms/${roomId}/approve`
    );
    return res.data;
  },

  /**
   * Từ chối tin đăng phòng trọ kèm lý do chi tiết
   */
  rejectRoom: async (roomId: number, reason: string): Promise<ResponseData<RoomModerationItem>> => {
    const res = await apiClient.post<ResponseData<RoomModerationItem>>(
      `/api/v1/admin/rooms/${roomId}/reject`,
      { reason }
    );
    return res.data;
  },

  /**
   * Mở khóa tin đăng bị khóa do bản quyền hình ảnh (sau khi xác minh)
   */
  unlockRoom: async (roomId: number): Promise<ResponseData<RoomModerationItem>> => {
    const res = await apiClient.post<ResponseData<RoomModerationItem>>(
      `/api/v1/admin/rooms/${roomId}/unlock`
    );
    return res.data;
  },
};

