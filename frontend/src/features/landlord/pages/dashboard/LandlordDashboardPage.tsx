import React from 'react';
import { useLandlordDashboard } from '@/shared/hooks';

import { Button, Skeleton } from '@/shared/components';
import { message } from 'antd';
import { DashboardStatsCards } from './components/DashboardStatsCards';
import { DashboardRevenueChart } from './components/DashboardRevenueChart';
import { DashboardOverdueTable } from './components/DashboardOverdueTable';

export const LandlordDashboardPage: React.FC = () => {
  const { dashboard, isLoading, refetch } = useLandlordDashboard();

  const handleRemindDebt = (roomName: string, phone: string) => {
    message.success(`Đã gửi tin nhắn SMS đôn đốc thanh toán tới phòng ${roomName} (${phone})!`);
  };

  const handleExportExcel = () => {
    message.loading({ content: 'Đang trích xuất dữ liệu kế toán...', key: 'export' });
    setTimeout(() => {
      message.success({
        content: 'Đã xuất file báo cáo tài chính thành công (BaoCao_T10_2026.xlsx)!',
        key: 'export',
      });
    }, 800);
  };

  if (isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-stay-text tracking-tight">Tổng quan</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} size="small">Làm mới</Button>
          <Button
            type="primary"
            size="small"
            onClick={handleExportExcel}
            className="bg-stay-primary hover:bg-stay-primary-hover"
          >
            Xuất Excel
          </Button>
        </div>
      </div>

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
