import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse } from '../../utils/response';
import { EnforceReportDto } from '@/shared/types/admin';

export const reportHandlers: Record<string, MockRouteHandler> = {
  // UC 55: Xem danh sách báo cáo vi phạm toàn sàn
  'GET /api/admin/reports': () => {
    const reports = mockStorage.getCollection('disputeReports');
    return successResponse(reports);
  },

  // Chi tiết 1 báo cáo
  'GET /api/admin/reports/:id': ({ params }) => {
    const report = mockStorage.findById('disputeReports', params.id);
    if (!report) {
      return errorResponse('Không tìm thấy báo cáo vi phạm', '404');
    }
    return successResponse(report);
  },

  // UC 56: Xử lý gỡ bài đăng vi phạm và kỷ luật tài khoản
  'POST /api/admin/reports/:id/enforce': ({ params, body }) => {
    const report = mockStorage.findById('disputeReports', params.id);
    if (!report) {
      return errorResponse('Không tìm thấy báo cáo vi phạm', '404');
    }

    const dto = body as EnforceReportDto;
    const actionsTaken: string[] = [];

    // Nếu gỡ bài đăng
    if (dto.removePost) {
      actionsTaken.push('Đã gỡ bỏ bài đăng vi phạm');
    }

    // Nếu khóa tài khoản đối tượng
    if (dto.lockTargetUser) {
      const users = mockStorage.getCollection('users');
      const targetUser = users.find(
        (u) => `UID${u.id}` === report.targetName || String(u.id) === report.targetId
      );
      if (targetUser) {
        mockStorage.updateItem('users', targetUser.id, {
          enabled: false,
          status: 'LOCKED',
          lockReason: dto.conclusionNote || 'Lừa đảo cọc',
          lockedAt: new Date().toISOString(),
        });
      }
      actionsTaken.push('Đã khóa tài khoản vi phạm vĩnh viễn');
    }

    const updated = mockStorage.updateItem('disputeReports', report.id, {
      status: 'RESOLVED',
      enforceActionsTaken: actionsTaken,
      conclusionNote: dto.conclusionNote,
    });

    return successResponse(
      updated,
      'Đã thực thi chế tài xử lý vi phạm và hoàn tất hồ sơ báo cáo!'
    );
  },
};
