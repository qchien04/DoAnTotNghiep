import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse, pageResponse } from '../../utils/response';
import { Tenant, CreateTenantDto } from '@/shared/types/landlord';

export const tenantHandlers: Record<string, MockRouteHandler> = {
  // UC 13: Xem danh sách khách đang thuê
  'GET /api/landlord/tenants': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const keyword = (queryParams.keyword || '').toLowerCase().trim();
    const buildingId = queryParams.buildingId;
    const roomId = queryParams.roomId;
    const linkStatus = queryParams.linkStatus;

    let items = mockStorage.getCollection('tenants');

    if (keyword) {
      items = items.filter(
        (t) =>
          t.fullName.toLowerCase().includes(keyword) ||
          t.phone.includes(keyword) ||
          (t.identityCard || t.idCardNumber || '').includes(keyword) ||
          (t.code || t.tenantCode || '').toLowerCase().includes(keyword)
      );
    }
    if (buildingId) {
      items = items.filter((t) => String(t.buildingId) === String(buildingId));
    }
    if (roomId) {
      items = items.filter((t) => String(t.roomId) === String(roomId) || t.roomName === roomId);
    }
    if (linkStatus && linkStatus !== 'ALL') {
      items = items.filter((t) => t.linkStatus === linkStatus);
    }

    return successResponse(pageResponse(items, page, size));
  },

  // UC 14: Thêm khách thuê vào phòng
  'POST /api/landlord/tenants': ({ body }) => {
    const dto = body as CreateTenantDto;

    if (!dto?.fullName || !dto?.phone || !dto?.identityCard || !dto?.roomId) {
      return errorResponse('Vui lòng nhập đầy đủ thông tin bắt buộc (*)', '400');
    }

    const tenants = mockStorage.getCollection('tenants');
    const duplicateCCCD = tenants.find(
      (t) => t.status === 'RENTING' && t.identityCard === dto.identityCard
    );
    if (duplicateCCCD) {
      return errorResponse(
        `Số CCCD này đang được ghi nhận ở phòng ${duplicateCCCD.roomName || 'khác'}`,
        '400'
      );
    }

    const room = mockStorage.findById('rooms', dto.roomId);
    const building = mockStorage.findById('buildings', dto.buildingId || room?.buildingId || '');

    const nextCode = `KT${String(tenants.length + 1).padStart(2, '0')}`;
    const newTenant: Tenant = {
      id: `tnt_${Date.now()}`,
      code: nextCode,
      fullName: dto.fullName,
      phone: dto.phone,
      identityCard: dto.identityCard,
      hometown: dto.hometown || 'Chưa cập nhật',
      gender: dto.gender || 'MALE',
      birthDate: dto.birthDate || '2000-01-01',
      buildingId: building?.id || '',
      buildingName: building?.name || 'Tòa nhà',
      roomId: room?.id || dto.roomId,
      roomName: room?.code || 'Phòng',
      isRepresentative: Boolean(dto.isRepresentative ?? (dto.roleInRoom === 'REPRESENTATIVE')),
      roleInRoom: (dto.isRepresentative ?? (dto.roleInRoom === 'REPRESENTATIVE')) ? 'REPRESENTATIVE' : 'MEMBER',
      linkStatus: 'UNLINKED',
      status: 'RENTING',
      createdAt: new Date().toISOString(),
    };

    mockStorage.insertItem('tenants', newTenant);

    // Cập nhật số lượng người ở phòng
    if (room) {
      mockStorage.updateItem('rooms', room.id, {
        currentTenantsCount: (room.currentTenantsCount || 0) + 1,
      });
    }

    return successResponse(newTenant, 'Thêm khách thuê thành công!');
  },

  // UC 15: Sửa thông tin khách thuê
  'PUT /api/landlord/tenants/:id': ({ params, body }) => {
    const tenant = mockStorage.findById('tenants', params.id);
    if (!tenant) {
      return errorResponse('Không tìm thấy hồ sơ khách thuê', '404');
    }

    if (body.phone && (!/^\d{10,11}$/.test(body.phone.trim()))) {
      return errorResponse('Số điện thoại không hợp lệ', '400');
    }

    const updated = mockStorage.updateItem('tenants', tenant.id, body);
    return successResponse(updated, 'Cập nhật thông tin khách thuê thành công!');
  },

  // UC 16: Xóa khách thuê khỏi phòng
  'DELETE /api/landlord/tenants/:id': ({ params }) => {
    const tenant = mockStorage.findById('tenants', params.id);
    if (!tenant) {
      return errorResponse('Không tìm thấy khách thuê', '404');
    }

    if (tenant.isRepresentative || tenant.roleInRoom === 'REPRESENTATIVE') {
      return errorResponse(
        'Khách thuê là người đại diện hợp đồng, không thể xóa trực tiếp! Vui lòng chỉ định người đại diện mới hoặc thực hiện thanh lý hợp đồng.',
        '400'
      );
    }

    mockStorage.deleteItem('tenants', tenant.id);

    // Giảm số người trong phòng
    const room = mockStorage.findById('rooms', tenant.roomId);
    if (room && room.currentTenantsCount) {
      mockStorage.updateItem('rooms', room.id, {
        currentTenantsCount: Math.max(0, room.currentTenantsCount - 1),
      });
    }

    return successResponse({ deletedId: tenant.id }, 'Đã xóa khách thuê khỏi phòng thành công!');
  },

  // UC 17: Mời liên kết tài khoản khách thuê
  'POST /api/landlord/tenants/invite-link': ({ body }) => {
    const { tenantId, searchKeyword } = body || {};
    const tenant = mockStorage.findById('tenants', tenantId);
    if (!tenant) {
      return errorResponse('Không tìm thấy thông tin khách thuê', '404');
    }

    const users = mockStorage.getCollection('users');
    const matchedUser = users.find(
      (u) =>
        u.phone === searchKeyword ||
        u.email === searchKeyword ||
        u.username === searchKeyword ||
        String(u.id) === searchKeyword
    );

    if (!matchedUser) {
      return errorResponse(
        'Không tìm thấy tài khoản người dùng với số điện thoại/email này. Khách thuê cần tải app và đăng ký tài khoản trước.',
        '404'
      );
    }

    const updated = mockStorage.updateItem('tenants', tenant.id, {
      linkedUserId: String(matchedUser.id),
      linkedUserName: `UID${matchedUser.id}`,
      linkStatus: 'PENDING',
    });

    return successResponse(
      updated,
      `Đã gửi lời mời liên kết tới tài khoản ${matchedUser.fullName} (UID${matchedUser.id})!`
    );
  },
};
