import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse, pageResponse } from '../../utils/response';
import { Building, CreateBuildingDto } from '@/shared/types/landlord';

export const buildingHandlers: Record<string, MockRouteHandler> = {
  // UC 01: Xem danh sách tòa nhà
  'GET /api/landlord/buildings': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const keyword = (queryParams.keyword || '').toLowerCase().trim();
    const floors = queryParams.floors ? Number(queryParams.floors) : undefined;

    let items = mockStorage.getCollection('buildings');

    if (keyword) {
      items = items.filter(
        (b) =>
          b.name.toLowerCase().includes(keyword) ||
          (b.address || b.addressDetail || '').toLowerCase().includes(keyword) ||
          (b.code || b.buildingCode || '').toLowerCase().includes(keyword)
      );
    }

    if (floors) {
      items = items.filter((b) => b.totalFloors === floors);
    }

    return successResponse(pageResponse(items, page, size));
  },

  // Xem chi tiết 1 tòa nhà
  'GET /api/landlord/buildings/:id': ({ params }) => {
    const building = mockStorage.findById('buildings', params.id);
    if (!building) {
      return errorResponse('Không tìm thấy tòa nhà', '404');
    }
    return successResponse(building);
  },

  // UC 02: Thêm mới tòa nhà
  'POST /api/landlord/buildings': ({ body }) => {
    const dto = body as CreateBuildingDto;
    if (!dto?.name || !dto?.address) {
      return errorResponse('Vui lòng nhập đầy đủ các trường bắt buộc (*)', '400');
    }

    const buildings = mockStorage.getCollection('buildings');
    if (buildings.some((b) => b.name.toLowerCase() === dto.name.toLowerCase())) {
      return errorResponse('Tên tòa nhà này đã tồn tại trong hệ thống', '400');
    }

    const nextNumber = buildings.length + 1;
    const autoCode = `TN${String(nextNumber).padStart(2, '0')}`;

    const newBuilding: Building = {
      id: `bld_${Date.now()}`,
      code: autoCode,
      name: dto.name,
      province: dto.province || 'Hà Nội',
      district: dto.district || 'Cầu Giấy',
      ward: dto.ward || '',
      address: dto.address,
      totalFloors: Number(dto.totalFloors) || 1,
      totalRooms: 0,
      occupiedRooms: 0,
      availableRooms: 0,
      amenities: dto.amenities || [],
      rules: dto.rules || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockStorage.insertItem('buildings', newBuilding);
    return successResponse(newBuilding, 'Thêm mới tòa nhà thành công!');
  },

  // UC 03: Cập nhật thông tin tòa nhà
  'PUT /api/landlord/buildings/:id': ({ params, body }) => {
    const building = mockStorage.findById('buildings', params.id);
    if (!building) {
      return errorResponse('Tòa nhà không tồn tại', '404');
    }

    const buildings = mockStorage.getCollection('buildings');
    if (
      body.name &&
      buildings.some(
        (b) => b.id !== building.id && b.name.toLowerCase() === body.name.toLowerCase()
      )
    ) {
      return errorResponse('Tên tòa nhà này đã tồn tại', '400');
    }

    const updated = mockStorage.updateItem('buildings', building.id, body);
    return successResponse(updated, 'Cập nhật thông tin tòa nhà thành công!');
  },

  // UC 04: Xóa tòa nhà khỏi hệ thống
  'DELETE /api/landlord/buildings/:id': ({ params }) => {
    const building = mockStorage.findById('buildings', params.id);
    if (!building) {
      return errorResponse('Tòa nhà không tồn tại', '404');
    }

    // Kiểm tra tòa nhà có phòng đang có người thuê không
    const rooms = mockStorage.getCollection('rooms');
    const roomsInBuilding = rooms.filter((r) => r.buildingId === building.id);
    const hasOccupiedRooms = roomsInBuilding.some((r) => r.status === 'RENTED');

    if (hasOccupiedRooms) {
      return errorResponse(
        'Không thể xóa tòa nhà đang có phòng và khách thuê! Vui lòng thanh lý hợp đồng và xóa phòng trước.',
        '400'
      );
    }

    // Xóa các phòng thuộc tòa nhà (nếu phòng trống)
    roomsInBuilding.forEach((r) => mockStorage.deleteItem('rooms', r.id));
    mockStorage.deleteItem('buildings', building.id);

    return successResponse({ deletedId: building.id }, 'Xóa tòa nhà thành công!');
  },
};
