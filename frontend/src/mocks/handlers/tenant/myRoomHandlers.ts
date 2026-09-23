import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse } from '../../utils/response';
import { MyRoomDetails } from '@/shared/types/tenant';

export const myRoomHandlers: Record<string, MockRouteHandler> = {
  // UC 41: Tiếp nhận và xác nhận liên kết phòng trọ từ chủ trọ
  'POST /api/tenant/room-links/:id/accept': ({ params }) => {
    const tenant = mockStorage.findById('tenants', params.id);
    if (!tenant) {
      return errorResponse('Không tìm thấy lời mời liên kết phòng trọ', '404');
    }

    const updated = mockStorage.updateItem('tenants', tenant.id, {
      linkStatus: 'LINKED',
    });

    return successResponse(
      updated,
      `Đã chấp nhận liên kết với phòng ${tenant.roomName || 'P102'} - ${tenant.buildingName || 'Tòa nhà Ánh Dương'}!`
    );
  },

  // UC 42: Xem hợp đồng và thông tin phòng trọ đang ở
  'GET /api/tenant/my-room': () => {
    const contracts = mockStorage.getCollection('contracts');
    const rooms = mockStorage.getCollection('rooms');

    const activeContract = contracts.find((c) => c.status === 'ACTIVE') || contracts[1];
    const room = rooms.find((r) => r.id === activeContract?.roomId) || rooms[1];

    const data: MyRoomDetails = {
      hasLinkedRoom: true,
      room: {
        id: room.id,
        name: room.code,
        buildingName: room.buildingName || 'Tòa nhà Ánh Dương',
        address: 'Số 12 Ngõ 80 Cầu Giấy, Hà Nội',
        monthlyRent: room.price,
        deposit: room.deposit,
        area: room.area,
        roommates: [
          { name: 'Phạm Minh Đức', role: 'Đại diện hợp đồng', phone: '0977888999' },
          { name: 'Lê Văn Cường', role: 'Thành viên', phone: '0905111333' },
        ],
        amenities: room.amenities,
        landlord: {
          name: 'Nguyễn Văn Thành',
          phone: '0912345678',
          bankAccount: {
            bankName: 'MB Bank (Quân Đội)',
            accountNumber: '0912345678999',
            accountHolder: 'NGUYEN VAN THANH',
          },
        },
      },
      contract: activeContract
        ? {
            contractNumber: activeContract.contractNumber,
            startDate: activeContract.startDate,
            endDate: activeContract.endDate,
            monthlyRent: activeContract.monthlyRent,
            depositAmount: activeContract.depositAmount,
            initialElectricity: activeContract.initialElectricityReading,
            initialWater: activeContract.initialWaterReading,
            services: [
              { name: 'Điện sinh hoạt', price: 3800, unit: 'kWh' },
              { name: 'Nước sinh hoạt', price: 30000, unit: 'm3' },
              { name: 'Internet Wifi', price: 100000, unit: 'phòng' },
              { name: 'Vệ sinh & Rác', price: 50000, unit: 'người' },
            ],
          }
        : undefined,
    };

    return successResponse(data);
  },
};
