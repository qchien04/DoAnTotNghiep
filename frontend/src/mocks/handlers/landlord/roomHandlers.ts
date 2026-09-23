import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse, pageResponse } from '../../utils/response';
import { Room, CreateRoomDto } from '@/shared/types/landlord';

export const roomHandlers: Record<string, MockRouteHandler> = {
  // UC 05: Xem danh sách phòng trọ
  'GET /api/landlord/rooms': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const buildingId = queryParams.buildingId;
    const floor = queryParams.floor ? Number(queryParams.floor) : undefined;
    const status = queryParams.status;
    const keyword = (queryParams.keyword || '').toLowerCase().trim();

    let items = mockStorage.getCollection('rooms');

    if (buildingId) {
      items = items.filter((r) => r.buildingId === buildingId);
    }
    if (floor !== undefined) {
      items = items.filter((r) => r.floor === floor);
    }
    if (status && status !== 'ALL') {
      items = items.filter((r) => r.status === status);
    }
    if (keyword) {
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(keyword) ||
          (r.code || r.roomCode || '').toLowerCase().includes(keyword) ||
          (r.buildingName && r.buildingName.toLowerCase().includes(keyword))
      );
    }

    return successResponse(pageResponse(items, page, size));
  },

  // Xem chi tiết 1 phòng
  'GET /api/landlord/rooms/:id': ({ params }) => {
    const room = mockStorage.findById('rooms', params.id);
    if (!room) {
      return errorResponse('Không tìm thấy thông tin phòng trọ', '404');
    }
    return successResponse(room);
  },

  // UC 06: Thêm phòng trọ mới
  'POST /api/landlord/rooms': ({ body }) => {
    const dto = body as CreateRoomDto;

    const rCode = dto?.code || dto?.roomCode;
    const rPrice = dto?.price || dto?.listedPrice;
    if (!rCode || !dto?.buildingId || !rPrice || !dto?.area) {
      return errorResponse('Vui lòng nhập đầy đủ các thông tin bắt buộc (*)', '400');
    }
    if (rPrice <= 0 || dto.area <= 0) {
      return errorResponse('Giá phòng và diện tích phải là số nguyên dương lớn hơn 0', '400');
    }

    const rooms = mockStorage.getCollection('rooms');
    const duplicateInBuilding = rooms.some(
      (r) => String(r.buildingId) === String(dto.buildingId) && (r.code || r.roomCode || '').toLowerCase() === rCode.toLowerCase()
    );
    if (duplicateInBuilding) {
      return errorResponse(`Mã phòng ${rCode} đã tồn tại trong tòa nhà này`, '400');
    }

    const building = mockStorage.findById('buildings', dto.buildingId);

    const newRoom: Room = {
      id: `room_${Date.now()}`,
      code: dto.code,
      name: dto.name || `Phòng ${dto.code}`,
      buildingId: dto.buildingId,
      buildingName: building?.name || 'Tòa nhà',
      floor: Number(dto.floor) || 1,
      area: Number(dto.area),
      price: Number(dto.price),
      deposit: Number(dto.deposit) || Number(dto.price),
      capacity: Number(dto.capacity) || 2,
      amenities: dto.amenities || [],
      description: dto.description || '',
      status: 'AVAILABLE',
      currentTenantsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorage.insertItem('rooms', newRoom);

    // Cập nhật số lượng phòng của tòa nhà
    if (building) {
      mockStorage.updateItem('buildings', building.id, {
        totalRooms: building.totalRooms + 1,
        availableRooms: building.availableRooms + 1,
      });
    }

    return successResponse(newRoom, `Tạo phòng ${newRoom.code} thành công!`);
  },

  // UC 07: Cập nhật thông tin phòng trọ
  'PUT /api/landlord/rooms/:id': ({ params, body }) => {
    const room = mockStorage.findById('rooms', params.id);
    if (!room) {
      return errorResponse('Phòng trọ không tồn tại', '404');
    }

    // Nếu đổi trạng thái thành AVAILABLE trong khi đang có hợp đồng
    if (body.status === 'AVAILABLE' && room.status === 'RENTED') {
      const contracts = mockStorage.getCollection('contracts');
      const activeContract = contracts.find(
        (c) => (c.roomId === room.id || c.roomName === room.code) && c.status === 'ACTIVE'
      );
      if (activeContract) {
        return errorResponse(
          'Phòng hiện đang có hợp đồng hoạt động, không thể chuyển sang trạng thái Còn trống',
          '400'
        );
      }
    }

    const updated = mockStorage.updateItem('rooms', room.id, body);
    return successResponse(updated, `Cập nhật phòng ${room.code} thành công!`);
  },

  // UC 08: Xóa phòng trọ
  'DELETE /api/landlord/rooms/:id': ({ params }) => {
    const room = mockStorage.findById('rooms', params.id);
    if (!room) {
      return errorResponse('Phòng trọ không tồn tại', '404');
    }

    // Kiểm tra hợp đồng hoặc hóa đơn cũ
    const contracts = mockStorage.getCollection('contracts');
    const bills = mockStorage.getCollection('bills');
    const hasHistory =
      contracts.some((c) => c.roomId === room.id || c.roomName === room.code) ||
      bills.some((b) => b.roomId === room.id || b.roomName === room.code);

    if (hasHistory) {
      return errorResponse(
        'Phòng đã có lịch sử thuê và hóa đơn, không thể xóa để bảo toàn dữ liệu kế toán. Vui lòng chuyển trạng thái phòng sang Ngừng sử dụng.',
        '400'
      );
    }

    mockStorage.deleteItem('rooms', room.id);

    // Giảm số phòng tòa nhà
    const building = mockStorage.findById('buildings', room.buildingId);
    if (building) {
      mockStorage.updateItem('buildings', building.id, {
        totalRooms: Math.max(0, building.totalRooms - 1),
        availableRooms: Math.max(0, building.availableRooms - 1),
      });
    }

    return successResponse({ deletedId: room.id }, 'Xóa phòng thành công!');
  },
};
