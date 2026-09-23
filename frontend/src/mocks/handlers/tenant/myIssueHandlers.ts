import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse } from '../../utils/response';
import { CreateTenantComplaintDto, RateComplaintDto } from '@/shared/types/tenant';

export const myIssueHandlers: Record<string, MockRouteHandler> = {
  // Lấy danh sách sự cố của tôi
  'GET /api/tenant/complaints': () => {
    const complaints = mockStorage.getCollection('complaints');
    return successResponse(complaints);
  },

  // UC 45: Gửi khiếu nại báo hỏng thiết bị phòng trọ
  'POST /api/tenant/complaints': ({ body }) => {
    const dto = body as CreateTenantComplaintDto;
    if (!dto?.title || !dto?.content) {
      return errorResponse('Vui lòng nhập đầy đủ tiêu đề và nội dung mô tả sự cố', '400');
    }

    const complaints = mockStorage.getCollection('complaints');
    const nextCode = `KN${String(complaints.length + 101)}`;

    const newComplaint: any = {
      id: `cmp_${Date.now()}`,
      code: nextCode,
      buildingId: 'bld_1',
      buildingName: 'Tòa nhà Ánh Dương',
      roomId: 'room_2',
      roomName: 'P102',
      senderName: 'Phạm Minh Đức',
      senderPhone: '0977888999',
      type: dto.type || 'COOLING',
      title: dto.title,
      content: dto.content,
      urgency: dto.urgency || 'HIGH',
      images: dto.images || [],
      status: 'NEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorage.insertItem('complaints', newComplaint);
    return successResponse(
      newComplaint,
      `Gửi báo hỏng thành công (Mã: ${nextCode}). Chủ trọ đã nhận được thông báo tức thời.`
    );
  },

  // UC 46: Theo dõi chi tiết tiến độ khiếu nại
  'GET /api/tenant/complaints/:id': ({ params }) => {
    const complaint = mockStorage.findById('complaints', params.id);
    if (!complaint) {
      return errorResponse('Không tìm thấy khiếu nại', '404');
    }
    return successResponse(complaint);
  },

  // UC 46: Chấm điểm độ hài lòng (1 - 5 sao)
  'POST /api/tenant/complaints/:id/rate': ({ params, body }) => {
    const complaint = mockStorage.findById('complaints', params.id);
    if (!complaint) {
      return errorResponse('Không tìm thấy khiếu nại', '404');
    }

    const dto = body as RateComplaintDto;
    const updated = mockStorage.updateItem('complaints', complaint.id, {
      rating: Number(dto.rating) || 5,
      ratingFeedback: dto.feedback || 'Rất hài lòng',
    });

    return successResponse(updated, 'Cảm ơn bạn đã đánh giá chất lượng dịch vụ sửa chữa!');
  },
};
