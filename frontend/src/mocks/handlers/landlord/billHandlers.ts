import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse, errorResponse, pageResponse } from '../../utils/response';
import { Bill, CreateBillDto, ConfirmPaymentDto } from '@/shared/types/landlord';

export const billHandlers: Record<string, MockRouteHandler> = {
  // UC 22: Xem danh sách hóa đơn theo kỳ cước
  'GET /api/landlord/bills': ({ queryParams }) => {
    const page = Number(queryParams.page) || 1;
    const size = Number(queryParams.size) || 10;
    const billingMonth = queryParams.billingMonth;
    const buildingId = queryParams.buildingId;
    const status = queryParams.status;

    let items = mockStorage.getCollection('bills');

    if (billingMonth) {
      items = items.filter((b) => b.billingMonth === billingMonth);
    }
    if (buildingId) {
      items = items.filter((b) => b.buildingId === buildingId);
    }
    if (status && status !== 'ALL') {
      items = items.filter((b) => b.status === status);
    }

    return successResponse(pageResponse(items, page, size));
  },

  // UC 23: Ghi chỉ số điện nước và lập hóa đơn mới
  'POST /api/landlord/bills': ({ body }) => {
    const dto = body as CreateBillDto;
    const room = mockStorage.findById('rooms', dto.roomId || '');
    if (!room) {
      return errorResponse('Không tìm thấy phòng trọ', '404');
    }

    // Lấy chỉ số điện nước cũ từ hóa đơn gần nhất hoặc hợp đồng
    const bills = mockStorage.getCollection('bills');
    const previousBill = bills.find((b) => b.roomId === room.id);
    const oldElec = previousBill ? (previousBill.newElectricity ?? 1420) : 1420;
    const oldWater = previousBill ? (previousBill.newWater ?? 85) : 85;
    const newElec = Number(dto.newElectricity ?? dto.currentElectricIndex ?? oldElec);
    const newWater = Number(dto.newWater ?? dto.currentWaterIndex ?? oldWater);

    if (newElec < oldElec) {
      return errorResponse('Chỉ số điện mới không được nhỏ hơn chỉ số cũ', '400');
    }
    if (newWater < oldWater) {
      return errorResponse('Chỉ số nước mới không được nhỏ hơn chỉ số cũ', '400');
    }

    const elecUsage = newElec - oldElec;
    const waterUsage = newWater - oldWater;

    const elecCost = elecUsage * 3800;
    const waterCost = waterUsage * 30000;
    const roomRent = Number(room.price || room.listedPrice || 0);
    const wifiCost = 100000;
    const trashCost = 100000;

    const items = [
      { itemName: `Tiền thuê phòng ${room.code}`, name: `Tiền thuê phòng ${room.code}`, quantity: 1, unit: 'tháng', unitPrice: roomRent, amount: roomRent, totalPrice: roomRent },
      { itemName: 'Tiền điện sinh hoạt', name: 'Tiền điện sinh hoạt', quantity: elecUsage, unit: 'kWh', unitPrice: 3800, amount: elecCost, totalPrice: elecCost },
      { itemName: 'Tiền nước sinh hoạt', name: 'Tiền nước sinh hoạt', quantity: waterUsage, unit: 'm3', unitPrice: 30000, amount: waterCost, totalPrice: waterCost },
      { itemName: 'Internet Wifi', name: 'Internet Wifi', quantity: 1, unit: 'phòng', unitPrice: 100000, amount: wifiCost, totalPrice: wifiCost },
      { itemName: 'Vệ sinh & Rác', name: 'Vệ sinh & Rác', quantity: 2, unit: 'người', unitPrice: 50000, amount: trashCost, totalPrice: trashCost },
    ];

    const totalAmount = roomRent + elecCost + waterCost + wifiCost + trashCost;

    const billingMonthVal = dto.billingMonth || dto.billingPeriod || '10/2026';
    const monthStr = billingMonthVal.replace('/', '');
    const billNumber = `HD-${monthStr}-${room.code}`;

    const newBill: Bill = {
      id: `bill_${Date.now()}`,
      billNumber,
      buildingId: room.buildingId,
      buildingName: room.buildingName,
      roomId: room.id,
      roomName: room.code,
      tenantName: previousBill?.tenantName || 'Khách đại diện',
      billingMonth: billingMonthVal,
      oldElectricity: oldElec,
      newElectricity: newElec,
      electricityUsage: elecUsage,
      oldWater: oldWater,
      newWater: newWater,
      waterUsage,
      roomRent,
      items,
      totalAmount,
      paidAmount: 0,
      remainingAmount: totalAmount,
      dueDate: dto.dueDate || '2026-11-05',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    mockStorage.insertItem('bills', newBill);
    return successResponse(newBill, `Phát hành hóa đơn ${billNumber} thành công!`);
  },

  // UC 24: Cập nhật điều chỉnh hóa đơn
  'PUT /api/landlord/bills/:id': ({ params, body }) => {
    const bill = mockStorage.findById('bills', params.id);
    if (!bill) {
      return errorResponse('Không tìm thấy hóa đơn', '404');
    }
    if (bill.status === 'PAID') {
      return errorResponse('Hóa đơn đã thanh toán, không thể chỉnh sửa', '400');
    }

    const newElec = body.newElectricity ?? bill.newElectricity;
    const newWater = body.newWater ?? bill.newWater;
    const elecUsage = newElec - bill.oldElectricity;
    const waterUsage = newWater - bill.oldWater;
    const elecCost = elecUsage * 3800;
    const waterCost = waterUsage * 30000;
    const totalAmount = bill.roomRent + elecCost + waterCost + 100000 + 100000;

    const updated = mockStorage.updateItem('bills', bill.id, {
      ...body,
      newElectricity: newElec,
      newWater: newWater,
      electricityUsage: elecUsage,
      waterUsage,
      totalAmount,
      remainingAmount: totalAmount - bill.paidAmount,
    });

    return successResponse(updated, 'Cập nhật điều chỉnh hóa đơn thành công!');
  },

  // UC 25: Hủy hóa đơn
  'POST /api/landlord/bills/:id/cancel': ({ params, body }) => {
    const bill = mockStorage.findById('bills', params.id);
    if (!bill) {
      return errorResponse('Không tìm thấy hóa đơn', '404');
    }
    if (!body?.reason) {
      return errorResponse('Vui lòng nhập lý do hủy hóa đơn', '400');
    }

    const updated = mockStorage.updateItem('bills', bill.id, {
      status: 'CANCELLED',
      cancellationReason: body.reason,
    });

    return successResponse(updated, 'Đã hủy hóa đơn thành công!');
  },

  // UC 26: Xác nhận thanh toán hóa đơn (Gạch nợ)
  'POST /api/landlord/bills/:id/confirm-payment': ({ params, body }) => {
    const bill = mockStorage.findById('bills', params.id);
    if (!bill) {
      return errorResponse('Không tìm thấy hóa đơn', '404');
    }

    const dto = body as ConfirmPaymentDto;
    const paidAmount = Number(dto.amount) || bill.totalAmount;
    const isFull = paidAmount >= bill.totalAmount;

    const updated = mockStorage.updateItem('bills', bill.id, {
      status: isFull ? 'PAID' : 'PARTIAL',
      paidAmount: (bill.paidAmount || 0) + paidAmount,
      remainingAmount: Math.max(0, bill.totalAmount - paidAmount),
      paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
      paymentDate: dto.paymentDate || new Date().toISOString().split('T')[0],
      paymentNote: dto.note || '',
    });

    return successResponse(
      updated,
      isFull
        ? 'Xác nhận thanh toán toàn bộ hóa đơn thành công!'
        : `Xác nhận thanh toán một phần (Còn nợ: ${(bill.totalAmount - paidAmount).toLocaleString()} VNĐ)`
    );
  },
};
