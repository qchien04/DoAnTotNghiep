import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse, pageResponse } from '../../utils/response';
import { UpdateComplaintProgressDto } from '@/shared/types/landlord';

export const complaintHandlers: Record<string, MockRouteHandler> = {
  // UC 27: Xem danh sách phản ánh sự cố hỏng hóc
  'GET /api/landlord/complaints': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const status = queryParams.status;
    const buildingId = queryParams.buildingId;
    const type = queryParams.type;

    let items = mockStorage.getCollection('complaints');

    if (status && status !== 'ALL') {
      items = items.filter((c) => c.status === status);
    }
    if (buildingId) {
      items = items.filter((c) => c.buildingId === buildingId);
    }
    if (type && type !== 'ALL') {
      items = items.filter((c) => c.type === type);
    }

    return successResponse(pageResponse(items, page, size));
  },

  // Xem chi tiết khiếu nại
  'GET /api/landlord/complaints/:id': ({ params }) => {
    const complaint = mockStorage.findById('complaints', params.id);
    if (!complaint) {
      return errorResponse('Không tìm thấy khiếu nại', '404');
    }
    return successResponse(complaint);
  },

  // UC 28: Xử lý và cập nhật tiến độ khiếu nại
  'PUT /api/landlord/complaints/:id/progress': ({ params, body }) => {
    const complaint = mockStorage.findById('complaints', params.id);
    if (!complaint) {
      return errorResponse('Không tìm thấy khiếu nại', '404');
    }

    const dto = body as UpdateComplaintProgressDto;
    const updated = mockStorage.updateItem('complaints', complaint.id, {
      status: dto.status,
      responseNote: dto.responseNote,
    });

    return successResponse(updated, 'Cập nhật tiến độ xử lý khiếu nại thành công!');
  },
};
