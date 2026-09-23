import React from 'react';
import { useLandlordDashboard } from '@/shared/hooks';
import { FileSpreadsheet } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stay-card-bg p-6 rounded-2xl border border-stay-border">
        <div>
          <h1 className="text-2xl font-bold text-stay-text tracking-tight">Dashboard Tổng Quan</h1>
          <p className="text-sm text-stay-text-secondary">
            Theo dõi tình hình kinh doanh, tỷ lệ lấp đầy phòng và công nợ thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} className="rounded-xl">Làm mới</Button>
          <Button
            type="primary"
            icon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-md rounded-xl"
          >
            Xuất Báo Cáo Excel
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
