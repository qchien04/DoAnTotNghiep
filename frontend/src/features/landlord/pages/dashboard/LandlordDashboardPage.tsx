import React from 'react';
import { useLandlordDashboard } from '@/shared/hooks';

import { Skeleton } from '@/shared/components';
import { message } from 'antd';
import { DashboardStatsCards } from './components/DashboardStatsCards';
import { DashboardRevenueChart } from './components/DashboardRevenueChart';
import { DashboardOverdueTable } from './components/DashboardOverdueTable';

export const LandlordDashboardPage: React.FC = () => {
  const { dashboard, isLoading } = useLandlordDashboard();

  const handleRemindDebt = (roomName: string, phone: string) => {
    message.success(`Đã gửi tin nhắn SMS đôn đốc thanh toán tới phòng ${roomName} (${phone})!`);
  };

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* 4 KPI Cards */}
      <DashboardStatsCards dashboard={dashboard} />

      {/* Revenue Trend Chart & Quick Overview */}
      <DashboardRevenueChart revenueTrend={dashboard.revenueTrend} />

      {/* Overdue Debt Table */}
      <DashboardOverdueTable
        overdueDebts={dashboard.overdueDebts}
        onRemindDebt={handleRemindDebt}
      />
    </div>
  );
};
