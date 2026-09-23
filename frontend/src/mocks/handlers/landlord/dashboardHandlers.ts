import { MockRouteHandler } from '../../mockAdapter';
import { mockStorage } from '../../db/storage';
import { successResponse } from '../../utils/response';
import { LandlordDashboardData } from '@/shared/types/landlord';

export const dashboardHandlers: Record<string, MockRouteHandler> = {
  // UC 29: Dashboard thống kê chủ trọ
  'GET /api/landlord/dashboard': () => {
    const rooms = mockStorage.getCollection('rooms');
    const bills = mockStorage.getCollection('bills');
    const complaints = mockStorage.getCollection('complaints');

    const totalRooms = rooms.length || 50;
    const occupiedRooms = rooms.filter((r) => r.status === 'RENTED').length;
    const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE').length;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100) || 92;

    const overdueBills = bills.filter((b) => b.status === 'OVERDUE' || b.status === 'PENDING');
    const totalDebt = overdueBills.reduce((sum, b) => sum + (b.remainingAmount || b.totalAmount), 0) || 8657000;

    const pendingComplaintsCount = complaints.filter(
      (c) => c.status === 'NEW' || c.status === 'PROCESSING'
    ).length;

    const overdueDebts = [
      {
        roomName: 'P202',
        buildingName: 'Tòa nhà Ánh Dương',
        tenantName: 'Hoàng Văn Tuấn',
        phone: '0904333222',
        debtAmount: 3950000,
        daysLate: 3,
      },
      {
        roomName: 'P304',
        buildingName: 'Bách Khoa Plaza',
        tenantName: 'Vũ Đình Trọng',
        phone: '0981999888',
        debtAmount: 4707000,
        daysLate: 5,
      },
    ];

    const data: LandlordDashboardData = {
      monthlyRevenue: 85600000,
      occupancyRate,
      totalBuildings: 3,
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalDebt,
      pendingComplaintsCount,
      overdueDebts,
      revenueTrend: [
        { month: 'T05', revenue: 78000000 },
        { month: 'T06', revenue: 80500000 },
        { month: 'T07', revenue: 82100000 },
        { month: 'T08', revenue: 84000000 },
        { month: 'T09', revenue: 85000000 },
        { month: 'T10', revenue: 85600000 },
      ],
    };

    return successResponse(data);
  },
};
