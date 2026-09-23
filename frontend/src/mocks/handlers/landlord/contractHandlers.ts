import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse, pageResponse } from '../../utils/response';
import {
  RentalContract,
  CreateContractDto,
  TerminateContractDto,
  TerminateContractResult,
} from '@/shared/types/landlord';

export const contractHandlers: Record<string, MockRouteHandler> = {
  // UC 18: Xem danh sách hợp đồng
  'GET /api/landlord/contracts': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const buildingId = queryParams.buildingId;
    const status = queryParams.status;
    const keyword = (queryParams.keyword || '').toLowerCase().trim();

    let items = mockStorage.getCollection('contracts');

    if (buildingId) {
      items = items.filter((c) => c.buildingId === buildingId);
    }
    if (status && status !== 'ALL') {
      items = items.filter((c) => c.status === status);
    }
    if (keyword) {
      items = items.filter(
        (c) =>
          (c.contractNumber || c.contractCode || '').toLowerCase().includes(keyword) ||
          (c.tenantName || c.representativeTenantName || '').toLowerCase().includes(keyword) ||
          (c.roomName || c.roomCode || '')?.toLowerCase().includes(keyword)
      );
    }

    return successResponse(pageResponse(items, page, size));
  },

  // UC 19: Tạo hợp đồng thuê phòng mới
  'POST /api/landlord/contracts': ({ body }) => {
    const dto = body as CreateContractDto;

    const room = mockStorage.findById('rooms', dto.roomId);
    if (!room) {
      return errorResponse('Không tìm thấy phòng trọ được chọn', '404');
    }
    if (room.status === 'RENTED') {
      return errorResponse('Phòng này hiện đang có người thuê', '400');
    }

    const tenant = mockStorage.findById('tenants', dto.tenantId || dto.representativeTenantId || '');
    if (!tenant) {
      return errorResponse('Không tìm thấy thông tin khách đại diện', '404');
    }

    const building = mockStorage.findById('buildings', dto.buildingId || room.buildingId);

    const year = new Date().getFullYear();
    const contractNumber = `HĐ-${year}-${room.code}`;

    const startDate = new Date(dto.startDate);
    const duration = Number(dto.durationMonths) || 12;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + duration);

    const newContract: RentalContract = {
      id: `ctr_${Date.now()}`,
      contractNumber,
      buildingId: building?.id || room.buildingId,
      buildingName: building?.name || 'Tòa nhà',
      roomId: room.id,
      roomName: room.code,
      tenantId: tenant.id,
      tenantName: tenant.fullName,
      tenantPhone: tenant.phone,
      startDate: dto.startDate,
      endDate: endDate.toISOString().split('T')[0],
      durationMonths: duration,
      monthlyRent: Number(dto.monthlyRent) || room.price,
      depositAmount: Number(dto.depositAmount) || room.deposit,
      paymentCycleDay: Number(dto.paymentCycleDay) || 5,
      initialElectricityReading: Number(dto.initialElectricityReading) || 0,
      initialWaterReading: Number(dto.initialWaterReading) || 0,
      includedServices: dto.includedServices || ['Điện sinh hoạt', 'Nước sinh hoạt', 'Wifi'],
      status: 'ACTIVE',
      termsNote: dto.termsNote || '',
      createdAt: new Date().toISOString(),
    };

    mockStorage.insertItem('contracts', newContract);

    // Cập nhật trạng thái phòng sang RENTED
    mockStorage.updateItem('rooms', room.id, {
      status: 'RENTED',
    });

    // Cập nhật số phòng tòa nhà
    if (building) {
      mockStorage.updateItem('buildings', building.id, {
        occupiedRooms: building.occupiedRooms + 1,
        availableRooms: Math.max(0, building.availableRooms - 1),
      });
    }

    return successResponse(newContract, `Tạo hợp đồng ${contractNumber} thành công!`);
  },

  // UC 20: Cập nhật điều khoản & gia hạn hợp đồng
  'PUT /api/landlord/contracts/:id': ({ params, body }) => {
    const contract = mockStorage.findById('contracts', params.id);
    if (!contract) {
      return errorResponse('Không tìm thấy hợp đồng', '404');
    }
    if (contract.status === 'TERMINATED') {
      return errorResponse('Hợp đồng đã thanh lý, không thể sửa đổi', '400');
    }

    const updated = mockStorage.updateItem('contracts', contract.id, body);
    return successResponse(updated, 'Cập nhật điều khoản hợp đồng thành công!');
  },

  // UC 21: Thanh lý hợp đồng và xử lý trả phòng
  'POST /api/landlord/contracts/:id/terminate': ({ params, body }) => {
    const contract = mockStorage.findById('contracts', params.id);
    if (!contract) {
      return errorResponse('Không tìm thấy hợp đồng', '404');
    }

    const dto = body as TerminateContractDto;

    // Giả lập tính toán quyết toán điện nước & hư hại
    const elecDiff = Math.max(0, (dto.finalElectricityReading || 0) - contract.initialElectricityReading);
    const waterDiff = Math.max(0, (dto.finalWaterReading || 0) - contract.initialWaterReading);
    const utilityCost = elecDiff * 3800 + waterDiff * 30000;

    const totalDamages = (dto.damageDeductions || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    const refundAmount = contract.depositAmount - utilityCost - totalDamages;

    // Cập nhật hợp đồng thành TERMINATED
    mockStorage.updateItem('contracts', contract.id, {
      status: 'TERMINATED',
    });

    // Trả phòng về AVAILABLE
    const room = mockStorage.findById('rooms', contract.roomId);
    if (room) {
      mockStorage.updateItem('rooms', room.id, {
        status: 'AVAILABLE',
        currentTenantsCount: 0,
      });
    }

    // Cập nhật số phòng trống của tòa nhà
    const building = mockStorage.findById('buildings', contract.buildingId);
    if (building) {
      mockStorage.updateItem('buildings', building.id, {
        occupiedRooms: Math.max(0, building.occupiedRooms - 1),
        availableRooms: building.availableRooms + 1,
      });
    }

    const result: TerminateContractResult = {
      contractNumber: contract.contractNumber,
      initialDeposit: contract.depositAmount,
      finalUtilityCost: utilityCost,
      totalDamagesCost: totalDamages,
      refundAmount,
      netRefundAmount: refundAmount,
      settlementDate: new Date().toISOString().split('T')[0],
    };

    return successResponse(result, 'Xác nhận hoàn tất nghiệm thu và thanh lý hợp đồng!');
  },
};
