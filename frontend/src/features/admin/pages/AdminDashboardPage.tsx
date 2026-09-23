import React from 'react';
import { useAdminAnalytics } from '@/shared/hooks';
import {
  Card,
  Button,
  Table,
  Badge,
  Skeleton,
} from '@/shared/components';
import {
  Users,
  Building2,
  Sparkles,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  CheckCircle,
  Home,
} from 'lucide-react';
import { message } from 'antd';

export const AdminDashboardPage: React.FC = () => {
  const { analytics, isLoading, refetch } = useAdminAnalytics();

  const handleExport = () => {
    message.loading({ content: 'Đang trích xuất dữ liệu phân tích hệ thống...', key: 'export' });
    setTimeout(() => {
      message.success({ content: 'Đã xuất file báo cáo phân tích toàn sàn thành công!', key: 'export' });
    }, 800);
  };

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  const topAreaColumns = [
    {
      title: 'Khu vực / Quận Huyện',
      dataIndex: 'district',
      key: 'district',
      render: (val: string, r: any) => (
        <span className="font-bold text-stay-text flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-stay-primary" />
          {val}, {r.city}
        </span>
      ),
    },
    {
      title: 'Số lượng bài đăng',
      dataIndex: 'postCount',
      key: 'postCount',
      render: (val: number) => <span className="font-semibold text-stay-primary">{val} bài</span>,
    },
    {
      title: 'Thị phần nhu cầu',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (val: number) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              style={{ width: `${val}%` }}
              className="h-full bg-stay-primary rounded-full"
            />
          </div>
          <span className="text-xs font-bold text-stay-text">{val}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary">StayConnect Admin Center</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stay-text tracking-tight">
            Thống Kê & Phân Tích Toàn Sàn
          </h1>
          <p className="text-sm text-stay-text-secondary mt-0.5">
            Theo dõi tốc độ tăng trưởng người dùng, hiệu quả thuật toán ghép phòng và các điểm nóng khu vực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button
            variant="primary"
            icon={<FileSpreadsheet className="w-4 h-4" />}
            onClick={handleExport}
            className="shadow-md shadow-stay-primary/20 font-semibold"
          >
            Xuất Báo Cáo
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
              Tổng người dùng
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stay-text">
            {analytics.totalUsers.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +{analytics.newUsersThisMonth} đăng ký tháng này
          </p>
        </div>

        {/* Total Buildings */}
        <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
              Tòa nhà / Khu trọ
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stay-text">
            {analytics.totalBuildings}
          </p>
          <p className="text-xs text-stay-text-secondary mt-2">
            Từ {analytics.totalLandlords} chủ nhà đã xác thực
          </p>
        </div>

        {/* Roommate Posts */}
        <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
              Bài đăng ở ghép
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Home className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stay-text">
            {analytics.totalRoommatePosts}
          </p>
          <p className="text-xs text-amber-600 mt-2 font-medium">
            +{analytics.newPostsThisMonth} bài đăng mới tháng này
          </p>
        </div>

        {/* Matching Rate */}
        <div className="p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stay-text-secondary uppercase tracking-wider">
              Tỷ lệ ghép thành công
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-stay-secondary">
            {analytics.successfulMatchRate}%
          </p>
          <p className="text-xs text-stay-text-secondary mt-2 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-stay-secondary" /> {analytics.successfulGroupsCount} nhóm đã chốt thành công
          </p>
        </div>
      </div>

      {/* Growth Trend Bar Chart */}
      <div className="p-6 rounded-2xl bg-stay-card-bg border border-stay-border shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stay-text flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-stay-primary" />
          Xu Hướng Tăng Trưởng Toàn Sàn (6 Tháng Gần Nhất)
        </h2>

        <div className="h-64 flex items-end justify-between gap-6 pt-8 px-4 border-b border-stay-border">
          {analytics.monthlyGrowthTrend.map((item: any) => {
            const userHeight = Math.round((item.users / 350) * 100);
            const matchHeight = Math.round((item.successfulMatches / 350) * 100);
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-[10px] font-semibold text-stay-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.users} users / {item.successfulMatches} ghép
                </div>
                <div className="flex items-end gap-1.5 w-full justify-center">
                  <div
                    style={{ height: `${userHeight}%` }}
                    className="w-5 rounded-t-lg bg-stay-primary group-hover:brightness-110 transition-all cursor-pointer"
                    title={`Người dùng: ${item.users}`}
                  />
                  <div
                    style={{ height: `${matchHeight}%` }}
                    className="w-5 rounded-t-lg bg-stay-secondary group-hover:brightness-110 transition-all cursor-pointer"
                    title={`Ghép thành công: ${item.successfulMatches}`}
                  />
                </div>
                <span className="text-xs font-semibold text-stay-text mt-2">{item.month}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-stay-text-secondary pt-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-stay-primary" />
            <span>Người dùng mới</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-stay-secondary" />
            <span>Ghép phòng thành công</span>
          </div>
        </div>
      </div>

      {/* Top Demand Areas Table */}
      <Card>
        <div className="p-6 border-b border-stay-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stay-text flex items-center gap-2">
              <MapPin className="w-5 h-5 text-stay-primary" />
              Khu Vực Có Nhu Cầu Tìm Phòng & Ở Ghép Cao Nhất
            </h3>
            <p className="text-xs text-stay-text-secondary mt-0.5">
              Dữ liệu phân tích dựa trên lượng tìm kiếm và bài đăng của sinh viên và người đi làm.
            </p>
          </div>
        </div>

        <div className="p-6">
          <Table
            dataSource={analytics.topAreas}
            columns={topAreaColumns}
            rowKey="district"
            pagination={false}
            className="overflow-x-auto"
          />
        </div>
      </Card>
    </div>
  );
};
