import React from 'react';

import { LandlordDashboardData } from '@/shared/types/landlord';

interface DashboardRevenueChartProps {
  revenueTrend: LandlordDashboardData['revenueTrend'];
}

export const DashboardRevenueChart: React.FC<DashboardRevenueChartProps> = ({ revenueTrend }) => {
  return (
    <div className="p-5 rounded-lg bg-stay-card-bg border border-stay-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-stay-text">
          Doanh thu 6 tháng gần nhất
        </h2>
        <span className="text-xs text-stay-text-secondary">Đơn vị: triệu VNĐ</span>
      </div>

      <div className="h-56 flex items-end justify-between gap-6 pt-6 px-4">
        {(revenueTrend || []).map((item) => {
          const maxVal = 90000000;
          const heightPercent = Math.min(100, Math.round((item.revenue / maxVal) * 100));
          const millions = (item.revenue / 1000000).toFixed(1);
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-xs font-mono text-stay-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                {millions}M
              </span>
              <div
                style={{ height: `${Math.max(8, heightPercent)}%` }}
                className="w-full max-w-[40px] rounded-t bg-stay-primary/80 group-hover:bg-stay-primary transition-colors cursor-pointer"
              />
              <span className="text-xs font-mono text-stay-text mt-1">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
