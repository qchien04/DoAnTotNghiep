import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse, pageResponse } from '../../utils/response';
import {
  RoommatePost,
  CreatePostWithRoomDto,
  CreatePostWithoutRoomDto,
  RoommateApplication,
  ApplyRoommateDto,
} from '@/shared/types/tenant';

export const roommateHandlers: Record<string, MockRouteHandler> = {
  // UC 30: Tìm kiếm phòng trọ và bài đăng ở ghép (kèm filter lối sống)
  'GET /api/tenant/posts/search': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const keyword = (queryParams.keyword || '').toLowerCase().trim();
    const district = queryParams.district;
    const minPrice = queryParams.minPrice ? Number(queryParams.minPrice) : undefined;
    const maxPrice = queryParams.maxPrice ? Number(queryParams.maxPrice) : undefined;
    const postType = queryParams.postType;

    if (minPrice && maxPrice && minPrice > maxPrice) {
      return errorResponse('Khoảng giá không hợp lệ (Giá tối thiểu lớn hơn giá tối đa)', '400');
    }

    let items = mockStorage.getCollection('roommatePosts').filter((p) => p.status === 'OPEN');

    if (keyword) {
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(keyword) ||
          p.areaName.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword)
      );
    }
    if (district) {
      items = items.filter((p) => p.district.toLowerCase() === district.toLowerCase());
    }
    if (minPrice) {
      items = items.filter((p) => p.sharePrice >= minPrice);
    }
    if (maxPrice) {
      items = items.filter((p) => p.sharePrice <= maxPrice);
    }
    if (postType && postType !== 'ALL') {
      items = items.filter((p) => p.postType === postType);
    }

    return successResponse(pageResponse(items, page, size));
  },

  // Chi tiết bài đăng ở ghép
  'GET /api/tenant/posts/:id': ({ params }) => {
    const post = mockStorage.findById('roommatePosts', params.id);
    if (!post) {
      return errorResponse('Không tìm thấy bài đăng', '404');
    }
    return successResponse(post);
  },

  // UC 31: Xem danh sách bài đăng ở ghép của bản thân
  'GET /api/tenant/posts/my-posts': () => {
    const items = mockStorage.getCollection('roommatePosts');
    return successResponse(items);
  },

  // UC 32: Đăng bài tìm người ở ghép - Trường hợp đã có phòng
  'POST /api/tenant/posts/existing-room': ({ body }) => {
    const dto = body as CreatePostWithRoomDto;
    if (!dto?.title || !dto?.sharePrice) {
      return errorResponse('Vui lòng nhập đầy đủ tiêu đề và giá share phòng', '400');
    }
    if (!dto?.lifestyle) {
      return errorResponse('Vui lòng hoàn thành bảng tiêu chí lối sống', '400');
    }

    const posts = mockStorage.getCollection('roommatePosts');
    const nextCode = `BG${String(posts.length + 1).padStart(2, '0')}`;

    const newPost: RoommatePost = {
      id: `post_${Date.now()}`,
      code: nextCode,
      title: dto.title,
      authorId: 'usr_current',
      authorName: 'Phạm Minh Đức',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      postType: 'HAS_ROOM',
      areaName: dto.roomAddress,
      district: dto.district || 'Cầu Giấy',
      city: dto.city || 'Hà Nội',
      sharePrice: Number(dto.sharePrice),
      totalRoomPrice: Number(dto.totalRoomPrice) || Number(dto.sharePrice) * 2,
      neededRoommates: Number(dto.neededRoommates) || 1,
      currentRoommates: 1,
      roomInfo: {
        roomId: dto.roomId,
        address: dto.roomAddress,
        amenities: dto.amenities || [],
        images: dto.images || [],
      },
      lifestyle: dto.lifestyle,
      description: dto.description || '',
      matchPercentage: 92,
      status: 'OPEN',
      pendingApplicantsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorage.insertItem('roommatePosts', newPost);
    return successResponse(newPost, 'Xuất bản bài đăng thành công!');
  },

  // UC 33: Đăng bài tìm người ở ghép - Chưa có phòng (Bán kính bản đồ)
  'POST /api/tenant/posts/virtual-room': ({ body }) => {
    const dto = body as CreatePostWithoutRoomDto;
    if (!dto?.title || !dto?.budgetMax || !dto?.centerAddress) {
      return errorResponse('Vui lòng nhập đầy đủ thông tin vị trí và ngân sách', '400');
    }

    const posts = mockStorage.getCollection('roommatePosts');
    const nextCode = `BG${String(posts.length + 1).padStart(2, '0')}`;

    const newPost: RoommatePost = {
      id: `post_${Date.now()}`,
      code: nextCode,
      title: dto.title,
      authorId: 'usr_current',
      authorName: 'Nguyễn Tiến Dũng',
      postType: 'SEARCHING_ROOM',
      areaName: dto.centerAddress,
      district: 'Hai Bà Trưng',
      city: 'Hà Nội',
      sharePrice: Number(dto.budgetMax),
      neededRoommates: Number(dto.neededRoommates) || 2,
      currentRoommates: 1,
      mapLocation: {
        centerAddress: dto.centerAddress,
        latitude: dto.latitude || 21.0056,
        longitude: dto.longitude || 105.8433,
        radiusKm: Number(dto.radiusKm) || 3.0,
      },
      lifestyle: dto.lifestyle,
      description: dto.description || '',
      matchPercentage: 85,
      status: 'OPEN',
      pendingApplicantsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorage.insertItem('roommatePosts', newPost);
    return successResponse(newPost, 'Đăng bài tìm nhóm thành công!');
  },

  // UC 34: Sửa bài đăng ở ghép
  'PUT /api/tenant/posts/:id': ({ params, body }) => {
    const post = mockStorage.findById('roommatePosts', params.id);
    if (!post) {
      return errorResponse('Không tìm thấy bài đăng', '404');
    }
    if (post.status === 'COMPLETED') {
      return errorResponse('Bài đăng đã chốt nhóm hoàn thành, không thể chỉnh sửa', '400');
    }

    const updated = mockStorage.updateItem('roommatePosts', post.id, body);
    return successResponse(updated, 'Cập nhật bài đăng thành công!');
  },

  // UC 35: Đóng / gỡ bài đăng ở ghép
  'POST /api/tenant/posts/:id/close': ({ params }) => {
    const post = mockStorage.findById('roommatePosts', params.id);
    if (!post) {
      return errorResponse('Không tìm thấy bài đăng', '404');
    }

    const updated = mockStorage.updateItem('roommatePosts', post.id, {
      status: 'CLOSED',
    });
    return successResponse(updated, 'Đã đóng nhận đơn cho bài viết!');
  },

  // UC 40: Hoàn thành chốt nhóm
  'POST /api/tenant/posts/:id/complete': ({ params }) => {
    const post = mockStorage.findById('roommatePosts', params.id);
    if (!post) {
      return errorResponse('Không tìm thấy bài đăng', '404');
    }

    const updated = mockStorage.updateItem('roommatePosts', post.id, {
      status: 'COMPLETED',
    });
    return successResponse(updated, 'Đã chốt nhóm và hoàn tất bài đăng ghép phòng!');
  },

  // UC 36: Nộp hồ sơ xin gia nhập nhóm ở ghép
  'POST /api/tenant/applications': ({ body }) => {
    const dto = body as ApplyRoommateDto;
    const post = mockStorage.findById('roommatePosts', dto.postId);
    if (!post) {
      return errorResponse('Không tìm thấy bài đăng để ứng tuyển', '404');
    }
    if (!dto.introMessage) {
      return errorResponse('Vui lòng nhập lời nhắn giới thiệu bản thân', '400');
    }

    const applications = mockStorage.getCollection('applications');
    const nextCode = `YCGN-${100 + applications.length + 1}`;

    const newApp: RoommateApplication = {
      id: `app_${Date.now()}`,
      code: nextCode,
      postId: post.id,
      postTitle: post.title,
      applicantId: 'usr_applicant_me',
      applicantName: 'Nguyễn Văn Hùng',
      birthYear: 2004,
      hometown: 'Hải Dương',
      occupationOrSchool: 'Sinh viên năm 3',
      phone: '0966555444',
      introMessage: dto.introMessage,
      lifestyle: dto.lifestyle,
      compatibilityScore: 94,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    mockStorage.insertItem('applications', newApp);

    // Cập nhật số ứng viên chờ duyệt trong bài
    mockStorage.updateItem('roommatePosts', post.id, {
      pendingApplicantsCount: (post.pendingApplicantsCount || 0) + 1,
    });

    return successResponse(newApp, 'Đã gửi hồ sơ tham gia nhóm thành công! Vui lòng chờ chủ phòng duyệt.');
  },

  // UC 37: Xem danh sách ứng viên xin gia nhập nhóm
  'GET /api/tenant/posts/:id/applications': ({ params }) => {
    const applications = mockStorage.getCollection('applications');
    const postApps = applications.filter((a) => a.postId === params.id || a.postTitle?.includes(params.id));
    return successResponse(postApps);
  },

  // UC 38: Phê duyệt thành viên vào nhóm
  'POST /api/tenant/applications/:id/approve': ({ params }) => {
    const app = mockStorage.findById('applications', params.id);
    if (!app) {
      return errorResponse('Không tìm thấy đơn ứng tuyển', '404');
    }

    const post = mockStorage.findById('roommatePosts', app.postId);
    if (post && post.currentRoommates >= (post.neededRoommates + 1)) {
      return errorResponse('Nhóm đã đủ số lượng thành viên tối đa', '400');
    }

    const updatedApp = mockStorage.updateItem('applications', app.id, {
      status: 'APPROVED',
    });

    if (post) {
      mockStorage.updateItem('roommatePosts', post.id, {
        currentRoommates: post.currentRoommates + 1,
        pendingApplicantsCount: Math.max(0, (post.pendingApplicantsCount || 1) - 1),
      });
    }

    return successResponse(
      updatedApp,
      `Đã duyệt thành viên ${app.applicantName} vào nhóm thành công!`
    );
  },

  // UC 39: Từ chối ứng viên
  'POST /api/tenant/applications/:id/reject': ({ params, body }) => {
    const app = mockStorage.findById('applications', params.id);
    if (!app) {
      return errorResponse('Không tìm thấy đơn ứng tuyển', '404');
    }

    const updatedApp = mockStorage.updateItem('applications', app.id, {
      status: 'REJECTED',
      rejectReason: body?.reason || 'Chưa phù hợp tiêu chí sinh hoạt',
    });

    return successResponse(updatedApp, 'Đã từ chối đơn xin gia nhập nhóm.');
  },
};
