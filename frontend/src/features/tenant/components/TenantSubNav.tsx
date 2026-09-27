import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Receipt, Wrench, Users, PlusCircle } from 'lucide-react';
import { Button } from '@/shared/components';

interface TenantSubNavProps {
  activeTab?: 'room' | 'bills' | 'complaints' | 'posts';
}

export const TenantSubNav: React.FC<TenantSubNavProps> = () => {
  const navItems = [
    {
      to: '/tenant/my-room',
      label: 'Phòng & Hợp đồng',
      icon: Home,
      description: 'Phòng hiện tại & Lịch sử thuê',
    },
    {
      to: '/tenant/bills',
      label: 'Quản lý Hóa đơn',
      icon: Receipt,
      description: 'Hóa đơn định kỳ & VietQR',
    },
    {
      to: '/tenant/complaints',
      label: 'Khiếu nại & Báo hỏng',
      icon: Wrench,
      description: 'Báo sự cố & Đánh giá thợ',
    },
    {
      to: '/roommates/my-posts',
      label: 'Bài đăng ở ghép',
      icon: Users,
      description: 'Quản lý tin & Duyệt bạn',
    },
  ];

  return (
    <div className="bg-stay-card-bg/95 border-b border-stay-border sticky top-16 z-30 shadow-2xs backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5">
          {/* Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? 'bg-stay-primary text-white shadow-xs font-bold'
                        : 'text-stay-text-secondary hover:text-stay-primary hover:bg-stay-bg-app'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Action: Đăng tin */}
          <div className="flex items-center justify-end shrink-0">
            <Link to="/tenant/create-post">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold text-stay-primary border-stay-primary/30 hover:bg-stay-primary/5 flex items-center gap-1.5"
                icon={<PlusCircle className="w-4 h-4 text-stay-primary" />}
              >
                Đăng bài tìm bạn ở ghép
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
