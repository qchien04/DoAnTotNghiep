import React from 'react';
import { LandlordDashboardData } from '@/shared/types/landlord';

interface DashboardStatsCardsProps {
  dashboard: LandlordDashboardData;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ dashboard }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Doanh thu tháng */}
      <div className="p-4 rounded-lg bg-stay-card-bg border border-stay-border">
        <span className="text-xs font-medium text-stay-text-secondary">
          Doanh thu tháng này
        </span>
        <p className="text-2xl font-semibold text-stay-text mt-1 tracking-tight">
          {(dashboard.monthlyRevenue ?? 0).toLocaleString()} <span className="text-sm font-normal text-stay-text-secondary">đ</span>
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
          +8.4% so với tháng trước
        </p>
      </div>

      {/* Tỷ lệ lấp đầy */}
      <div className="p-4 rounded-lg bg-stay-card-bg border border-stay-border">
        <span className="text-xs font-medium text-stay-text-secondary">
          Tỷ lệ lấp đầy
        </span>
        <p className="text-2xl font-semibold text-stay-text mt-1 tracking-tight">
          {dashboard.occupancyRate}%
        </p>
        <p className="text-xs text-stay-text-secondary mt-2">
          {dashboard.occupiedRooms}/{dashboard.totalRooms} phòng đang thuê
        </p>
      </div>

      {/* Tiền nợ đọng */}
      <div className="p-4 rounded-lg bg-stay-card-bg border border-stay-border">
        <span className="text-xs font-medium text-stay-text-secondary">
          Nợ cước chưa thu
        </span>
        <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1 tracking-tight">
          {(dashboard.totalDebt ?? 0).toLocaleString()} <span className="text-sm font-normal text-stay-text-secondary">đ</span>
        </p>
        <p className="text-xs text-stay-text-secondary mt-2">
          {(dashboard.overdueDebts || []).length} phòng quá hạn
        </p>
      </div>

      {/* Khiếu nại chờ xử lý */}
      <div className="p-4 rounded-lg bg-stay-card-bg border border-stay-border">
        <span className="text-xs font-medium text-stay-text-secondary">
          Báo hỏng chưa xử lý
        </span>
        <p className="text-2xl font-semibold text-stay-text mt-1 tracking-tight">
          {dashboard.pendingComplaintsCount}
        </p>
        <p className="text-xs text-stay-text-secondary mt-2">
          yêu cầu từ khách thuê
        </p>
      </div>
    </div>
  );
};
