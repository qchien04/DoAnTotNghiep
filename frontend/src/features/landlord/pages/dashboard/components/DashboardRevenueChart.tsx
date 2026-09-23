import React from 'react';
import { TrendingUp } from 'lucide-react';
import { LandlordDashboardData } from '@/shared/types/landlord';

interface DashboardRevenueChartProps {
  revenueTrend: LandlordDashboardData['revenueTrend'];
}

export const DashboardRevenueChart: React.FC<DashboardRevenueChartProps> = ({ revenueTrend }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 p-6 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs">
        <h2 className="text-base font-bold text-stay-text mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-stay-primary" />
          Xu Hướng Doanh Thu 6 Tháng Gần Nhất
        </h2>
        <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-stay-border">
          {(revenueTrend || []).map((item) => {
            const heightPercent = Math.round((item.revenue / 90000000) * 100);
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-semibold text-stay-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  {(item.revenue / 1000000).toFixed(1)}Tr
                </div>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-stay-primary to-stay-secondary group-hover:brightness-110 transition-all cursor-pointer relative"
                />
                <span className="text-xs font-semibold text-stay-text mt-2">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tips Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-stay-primary/5 via-stay-card-bg to-stay-secondary/5 border border-stay-border shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stay-primary">
            Gợi ý quản trị
          </span>
          <h3 className="text-base font-bold text-stay-text mt-2">Tối ưu hóa doanh thu tòa nhà</h3>
          <p className="text-xs text-stay-text-secondary mt-2 leading-relaxed">
            Bạn có các phòng đang trống. Hãy đăng bài tìm kiếm người ở ghép hoặc cập nhật trạng thái phòng để khách hàng có thể tìm thấy ngay trên sàn.
          </p>
        </div>
        <div className="pt-4 border-t border-stay-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stay-text-secondary">Chu kỳ lập hóa đơn tiếp theo:</span>
            <span className="font-bold text-stay-text">01/11/2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
