import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse } from '../../utils/response';
import { UtilityService, CreateServiceDto } from '@/shared/types/landlord';

export const serviceHandlers: Record<string, MockRouteHandler> = {
  // UC 09: Xem bảng giá dịch vụ
  'GET /api/landlord/services': () => {
    const services = mockStorage.getCollection('services');
    return successResponse(services);
  },

  // UC 10: Thêm mới dịch vụ tiện ích
  'POST /api/landlord/services': ({ body }) => {
    const dto = body as CreateServiceDto;
    if (!dto?.name || !dto?.price || dto.price <= 0) {
      return errorResponse('Vui lòng nhập tên dịch vụ và đơn giá lớn hơn 0', '400');
    }

    const services = mockStorage.getCollection('services');
    if (services.some((s) => s.name.toLowerCase() === dto.name.toLowerCase())) {
      return errorResponse('Dịch vụ này đã tồn tại', '400');
    }

    const nextCode = `DV${String(services.length + 1).padStart(2, '0')}`;
    const newService: UtilityService = {
      id: `srv_${Date.now()}`,
      code: nextCode,
      name: dto.name,
      category: dto.category || 'OTHER',
      unit: dto.unit || 'Tháng',
      price: Number(dto.price),
      chargingType: dto.chargingType || 'PER_ROOM',
      appliedScope: dto.appliedScope || 'Tất cả',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    mockStorage.insertItem('services', newService);
    return successResponse(newService, 'Lưu dịch vụ thành công!');
  },

  // UC 11: Sửa đơn giá và thông tin dịch vụ
  'PUT /api/landlord/services/:id': ({ params, body }) => {
    const service = mockStorage.findById('services', params.id);
    if (!service) {
      return errorResponse('Không tìm thấy dịch vụ', '404');
    }

    if (body.price !== undefined && body.price < 0) {
      return errorResponse('Đơn giá không hợp lệ', '400');
    }

    const updated = mockStorage.updateItem('services', service.id, body);
    return successResponse(
      updated,
      'Cập nhật đơn giá dịch vụ thành công! Đơn giá mới sẽ áp dụng từ kỳ tính tiền tiếp theo.'
    );
  },

  // UC 12: Xóa dịch vụ tiện ích
  'DELETE /api/landlord/services/:id': ({ params }) => {
    const service = mockStorage.findById('services', params.id);
    if (!service) {
      return errorResponse('Không tìm thấy dịch vụ', '404');
    }

    // Kiểm tra ràng buộc hợp đồng
    const contracts = mockStorage.getCollection('contracts');
    const isUsedInActiveContracts = contracts.some(
      (c) => c.status === 'ACTIVE' && c.includedServices?.includes(service.name)
    );

    if (isUsedInActiveContracts) {
      return errorResponse(
        'Dịch vụ đang được sử dụng trong các hợp đồng thuê phòng, không thể xóa! Vui lòng chuyển trạng thái sang Tạm ngừng.',
        '400'
      );
    }

    mockStorage.deleteItem('services', service.id);
    return successResponse({ deletedId: service.id }, 'Đã xóa dịch vụ thành công!');
  },
};
