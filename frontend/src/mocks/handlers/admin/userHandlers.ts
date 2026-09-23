import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse, pageResponse } from '../../utils/response';
import { AdminUserItem, CreateAdminUserDto, ToggleLockUserDto } from '@/shared/types/admin';

export const userHandlers: Record<string, MockRouteHandler> = {
  // UC 47: Xem danh sách người dùng toàn hệ thống
  'GET /api/admin/users': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const keyword = (queryParams.keyword || '').toLowerCase().trim();
    const role = queryParams.role;
    const status = queryParams.status;

    let items = mockStorage.getCollection('users');

    if (keyword) {
      items = items.filter(
        (u) =>
          u.username.toLowerCase().includes(keyword) ||
          u.fullName.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword) ||
          (u.phone && u.phone.includes(keyword))
      );
    }
    if (role && role !== 'ALL') {
      items = items.filter((u) => u.role === role);
    }
    if (status && status !== 'ALL') {
      items = items.filter((u) => (u as any).status === status);
    }

    return successResponse(pageResponse(items, page, size));
  },

  // Chi tiết người dùng
  'GET /api/admin/users/:id': ({ params }) => {
    const user = mockStorage.findById('users', params.id);
    if (!user) {
      return errorResponse('Không tìm thấy người dùng', '404');
    }
    return successResponse(user);
  },

  // UC 48: Thêm mới tài khoản người dùng nội bộ
  'POST /api/admin/users': ({ body }) => {
    const dto = body as CreateAdminUserDto;
    if (!dto?.username || !dto?.fullName || !dto?.email) {
      return errorResponse('Vui lòng nhập đầy đủ các trường thông tin bắt buộc (*)', '400');
    }

    const users = mockStorage.getCollection('users');
    if (users.some((u) => u.username.toLowerCase() === dto.username.toLowerCase())) {
      return errorResponse('Tên đăng nhập đã tồn tại trong hệ thống', '400');
    }
    if (users.some((u) => u.email.toLowerCase() === dto.email.toLowerCase())) {
      return errorResponse('Email này đã được sử dụng', '400');
    }

    const newUser: AdminUserItem = {
      id: Date.now(),
      username: dto.username,
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone || '',
      role: dto.role || 'ROLE_TENANT',
      enabled: dto.enabled ?? true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    mockStorage.insertItem('users', newUser);
    return successResponse(newUser, 'Tạo tài khoản người dùng thành công!');
  },

  // UC 49: Sửa thông tin và phân quyền vai trò người dùng
  'PUT /api/admin/users/:id': ({ params, body }) => {
    const user = mockStorage.findById('users', params.id);
    if (!user) {
      return errorResponse('Không tìm thấy người dùng', '404');
    }

    const users = mockStorage.getCollection('users');
    if (
      body.email &&
      users.some(
        (u) => String(u.id) !== String(user.id) && u.email.toLowerCase() === body.email.toLowerCase()
      )
    ) {
      return errorResponse('Email đã tồn tại', '400');
    }

    const updated = mockStorage.updateItem('users', user.id, body);
    return successResponse(updated, 'Cập nhật tài khoản người dùng thành công!');
  },

  // UC 50: Khóa hoặc mở khóa tài khoản người dùng
  'POST /api/admin/users/:id/toggle-lock': ({ params, body }) => {
    const user = mockStorage.findById('users', params.id);
    if (!user) {
      return errorResponse('Không tìm thấy người dùng', '404');
    }

    // Không cho phép tự khóa tài khoản admin
    if (user.username === 'admin') {
      return errorResponse('Không thể tự khóa tài khoản quản trị tối cao đang sử dụng', '400');
    }

    const dto = body as ToggleLockUserDto;
    const isLocked = dto.locked;

    const updated = mockStorage.updateItem('users', user.id, {
      enabled: !isLocked,
      status: isLocked ? 'LOCKED' : 'ACTIVE',
      lockReason: isLocked ? dto.reason || 'Vi phạm điều khoản cộng đồng' : undefined,
      lockedAt: isLocked ? new Date().toISOString() : undefined,
    });

    return successResponse(
      updated,
      isLocked
        ? `Đã khóa tài khoản ${user.username} thành công.`
        : `Đã mở khóa tài khoản ${user.username} thành công.`
    );
  },
};
