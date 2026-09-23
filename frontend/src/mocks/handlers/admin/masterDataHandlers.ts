import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse } from '../../utils/response';
import {
  LifestyleCriterion,
  CreateLifestyleCriterionDto,
} from '@/shared/types/admin';

export const masterDataHandlers: Record<string, MockRouteHandler> = {
  // UC 51: Xem danh mục Master Data (Lối sống)
  'GET /api/admin/master-data': () => {
    const criteria = mockStorage.getCollection('lifestyleCriteria');
    return successResponse(criteria);
  },

  // UC 52: Thêm mới dữ liệu Master Data
  'POST /api/admin/master-data': ({ body }) => {
    const dto = body as CreateLifestyleCriterionDto;
    if (!dto?.code || !dto?.name) {
      return errorResponse('Vui lòng nhập đầy đủ mã và tên tiêu chí', '400');
    }

    const criteria = mockStorage.getCollection('lifestyleCriteria');
    if (criteria.some((c) => c.code.toLowerCase() === dto.code.toLowerCase())) {
      return errorResponse('Mã tiêu chí bị trùng lặp', '400');
    }

    const newCriterion: LifestyleCriterion = {
      id: `crit_${Date.now()}`,
      code: dto.code,
      name: dto.name,
      category: dto.category || 'HABIT',
      algorithmWeight: Number(dto.algorithmWeight) || 10,
      options: dto.options || ['Có', 'Không'],
      status: 'ACTIVE',
    };

    mockStorage.insertItem('lifestyleCriteria', newCriterion);
    return successResponse(newCriterion, 'Thêm mới tiêu chí thành công!');
  },

  // UC 53: Sửa dữ liệu Master Data
  'PUT /api/admin/master-data/:id': ({ params, body }) => {
    const criterion = mockStorage.findById('lifestyleCriteria', params.id);
    if (!criterion) {
      return errorResponse('Không tìm thấy tiêu chí', '404');
    }

    const updated = mockStorage.updateItem('lifestyleCriteria', criterion.id, body);
    return successResponse(updated, 'Cập nhật tiêu chí Master Data thành công!');
  },

  // UC 54: Tạm dừng / Xóa Master Data
  'DELETE /api/admin/master-data/:id': ({ params }) => {
    const criterion = mockStorage.findById('lifestyleCriteria', params.id);
    if (!criterion) {
      return errorResponse('Không tìm thấy tiêu chí', '404');
    }

    // Đổi trạng thái sang DEACTIVATED để giữ toàn vẹn dữ liệu các bài đăng cũ
    const updated = mockStorage.updateItem('lifestyleCriteria', criterion.id, {
      status: 'DEACTIVATED',
    });

    return successResponse(
      updated,
      'Đã tạm dừng tiêu chí Master Data. Bản ghi sẽ ẩn khỏi các form đăng bài mới nhưng giữ nguyên dữ liệu bài cũ.'
    );
  },
};
