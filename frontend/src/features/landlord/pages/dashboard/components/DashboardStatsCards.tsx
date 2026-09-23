import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Building,
  CheckCircle,
  AlertCircle,
  Users,
} from 'lucide-react';
import { LandlordDashboardData } from '@/shared/types/landlord';

interface DashboardStatsCardsProps {
  dashboard: LandlordDashboardData;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({ dashboard }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Doanh thu tháng */}
      <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
            Doanh thu tháng 10
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-stay-text">
          {(dashboard.monthlyRevenue ?? 0).toLocaleString()}{' '}
          <span className="text-sm font-semibold text-stay-text-secondary">VNĐ</span>
        </p>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-medium">
          <TrendingUp className="w-3.5 h-3.5" /> +8.4% so với tháng trước
        </p>
      </div>

      {/* Tỷ lệ lấp đầy */}
      <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
            Tỷ lệ lấp đầy phòng
          </span>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
            <Building className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-stay-text">{dashboard.occupancyRate}%</p>
        <p className="text-xs text-stay-text-secondary mt-2 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5 text-blue-500" /> {dashboard.occupiedRooms} /{' '}
          {dashboard.totalRooms} phòng đang ở (còn {dashboard.availableRooms} phòng trống)
        </p>
      </div>

      {/* Tiền nợ đọng */}
      <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
            Tiền cước nợ đọng
          </span>
          <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">
          {(dashboard.totalDebt ?? 0).toLocaleString()}{' '}
          <span className="text-sm font-semibold text-stay-text-secondary">VNĐ</span>
        </p>
        <p className="text-xs text-red-500 mt-2 font-medium">
          Có {(dashboard.overdueDebts || []).length} phòng đang quá hạn thanh toán
        </p>
      </div>

      {/* Khiếu nại chờ xử lý */}
      <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
            Báo hỏng chờ xử lý
          </span>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-amber-600">
          {dashboard.pendingComplaintsCount}{' '}
          <span className="text-sm font-semibold text-stay-text-secondary">vụ việc</span>
        </p>
        <p className="text-xs text-stay-text-secondary mt-2">Cần hẹn thợ bảo dưỡng thiết bị</p>
      </div>
    </div>
  );
};
