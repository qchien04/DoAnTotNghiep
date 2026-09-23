import { MockRouteHandler } from '../mockAdapter';
import { mockStorage } from '../db/storage';
import { successResponse, errorResponse, pageResponse } from '../utils/response';

export const authHandlers: Record<string, MockRouteHandler> = {
  // 1. Đăng nhập
  'POST /api/auth/login': ({ body }) => {
    const { username, password } = body || {};
    const users = mockStorage.getCollection('users');
    const user = users.find((u) => u.username === username);

    if (!user) {
      return errorResponse('Tài khoản không tồn tại trong hệ thống', '404');
    }

    if (!user.enabled || user.status === 'LOCKED') {
      return errorResponse(
        `Tài khoản đã bị khóa. Lý do: ${user.lockReason || 'Vi phạm điều khoản'}`,
        '403'
      );
    }

    // Demo password check: chấp nhận admin123 hoặc 123456
    const validPasswords = ['admin123', '123456', password];
    if (!validPasswords.includes(password)) {
      return errorResponse('Mật khẩu không chính xác', '400');
    }

    const token = `mock-jwt-token-for-${user.username}-${Date.now()}`;
    return successResponse({
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn: 86400,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        enabled: user.enabled,
      },
    });
  },

  // 2. Đăng ký tài khoản
  'POST /api/auth/register': ({ body }) => {
    const { username, fullName, email, phone, role } = body || {};
    const users = mockStorage.getCollection('users');

    if (users.some((u) => u.username === username)) {
      return errorResponse('Tên đăng nhập đã được sử dụng', '400');
    }
    if (users.some((u) => u.email === email)) {
      return errorResponse('Email đã được sử dụng', '400');
    }

    const newUser = {
      id: Date.now(),
      username,
      fullName: fullName || username,
      email,
      phone,
      role: role || 'ROLE_TENANT',
      enabled: true,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    mockStorage.insertItem('users', newUser);
    return successResponse(newUser, 'Đăng ký tài khoản thành công!');
  },

  // 3. Thông tin tài khoản hiện tại
  'GET /api/auth/me': ({ headers }) => {
    const authHeader = headers?.Authorization || headers?.authorization || '';
    const token = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : '';

    const users = mockStorage.getCollection('users');
    // Tìm user theo username mã hóa trong token mock
    const matchedUser = users.find((u) => token.includes(u.username)) || users[0];

    return successResponse({
      id: matchedUser.id,
      username: matchedUser.username,
      fullName: matchedUser.fullName,
      email: matchedUser.email,
      phone: matchedUser.phone,
      avatarUrl: matchedUser.avatarUrl,
      role: matchedUser.role,
      enabled: matchedUser.enabled,
    });
  },

  // 4. Thống kê trang chủ
  'GET /api/home/stats': () => {
    const users = mockStorage.getCollection('users');
    const buildings = mockStorage.getCollection('buildings');
    const roommatePosts = mockStorage.getCollection('roommatePosts');

    return successResponse({
      projectTitle: 'Hệ Thống Quản Lý Nhà Trọ Hỗ Trợ Ghép Người Ở Chung',
      description: 'Nền tảng kết nối chủ nhà, người thuê phòng và thuật toán ghép phòng theo độ tương thích lối sống.',
      studentName: 'Trần Quang Chiến',
      studentId: '20205051',
      instructorName: 'TS. Nguyễn Văn Hướng',
      systemStatus: 'ONLINE (MOCK ACTIVE)',
      totalUsers: users.length,
      features: {
        buildingsCount: `${buildings.length} Tòa nhà đang quản lý`,
        postsCount: `${roommatePosts.length} Tin đăng tìm người ở ghép`,
        activeMatchRate: '76.4% Tỷ lệ ghép phòng thành công',
      },
    });
  },

  // 5. Danh sách User (tương thích authService cũ)
  'GET /api/users': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const users = mockStorage.getCollection('users');

    return successResponse(pageResponse(users, page, size));
  },
};
