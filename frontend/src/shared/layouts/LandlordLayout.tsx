import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Receipt,
  Users,
  FileSignature,
  DollarSign,
  AlertTriangle,
  LogOut,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeSwitcher, StayConnectLogo, Sidebar, NotificationDropdown, type MenuItemType } from '@/shared/components';
import { Avatar, Dropdown } from 'antd';

export const LandlordLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const landlordMenuItems: MenuItemType[] = [
    {
      key: '/landlord',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord">Tổng quan</Link>,
    },
    {
      key: '/landlord/buildings',
      icon: <Building2 className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord/buildings">Quản lý Tòa nhà</Link>,
    },
    {
      key: '/landlord/rooms',
      icon: <DoorOpen className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord/rooms">Quản lý Phòng trọ</Link>,
    },
    {
      key: '/landlord/services',
      icon: <Receipt className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord/services">Cấu hình Dịch vụ</Link>,
    },
    {
      key: '/landlord/tenants',
      icon: <Users className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord/tenants">Quản lý Khách thuê</Link>,
    },
    {
      key: '/landlord/contracts',
      icon: <FileSignature className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord/contracts">Quản lý Hợp đồng</Link>,
    },
    {
      key: '/landlord/bills',
      icon: <DollarSign className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord/bills">Hóa đơn & Thu tiền</Link>,
    },
    {
      key: '/landlord/complaints',
      icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord/complaints">Khiếu nại & Báo hỏng</Link>,
    },
    {
      key: '/landlord/profile',
      icon: <User className="w-4 h-4 shrink-0" />,
      label: <Link to="/landlord/profile">Hồ sơ cá nhân</Link>,
    },
  ];

  const currentKey = landlordMenuItems.find(
    (item) => item && 'key' in item && typeof item.key === 'string' && item.key !== '/landlord' && location.pathname.startsWith(item.key)
  )?.key as string || '/landlord';

  const userMenuItems = [
    {
      key: 'info',
      label: (
        <div className="py-1">
          <p className="font-semibold text-sm text-stay-text">{user?.fullName || 'Nguyễn Văn Thành'}</p>
          <p className="text-xs text-slate-500">{user?.email || 'thanhlandlord@gmail.com'}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            Chủ trọ
          </span>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      label: <span className="text-red-500 font-medium">Đăng xuất</span>,
      onClick: () => logout(),
    },
  ];

  const getPageTitle = (path: string) => {
    if (path.startsWith('/landlord/buildings')) return 'Quản lý Tòa nhà';
    if (path.startsWith('/landlord/rooms')) return 'Quản lý Phòng trọ';
    if (path.startsWith('/landlord/services')) return 'Cấu hình Dịch vụ';
    if (path.startsWith('/landlord/tenants')) return 'Quản lý Khách thuê';
    if (path.startsWith('/landlord/contracts')) return 'Quản lý Hợp đồng';
    if (path.startsWith('/landlord/bills')) return 'Hóa đơn & Thu tiền';
    if (path.startsWith('/landlord/complaints')) return 'Khiếu nại & Báo hỏng';
    if (path.startsWith('/landlord/profile')) return 'Hồ sơ cá nhân';
    return 'Tổng quan';
  };
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="h-screen flex overflow-hidden bg-stay-bg-app text-stay-text">
      {/* Shared Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsible={true}
        width={260}
        collapsedWidth={80}
        menuItems={landlordMenuItems}
        selectedKey={currentKey}
        className="h-full shrink-0 z-30"
        header={
          !collapsed ? (
            <Link to="/landlord" className="flex items-center gap-2">
              <StayConnectLogo size="sm" />
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <Building2 className="w-6 h-6 text-stay-primary" />
            </div>
          )
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-stay-card-bg/90 backdrop-blur border-b border-stay-border px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-stay-text tracking-tight">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />

            <NotificationDropdown
              viewAllLink="/landlord/complaints"
              viewAllText="Xem tất cả khiếu nại & thông báo"
            />

            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer p-1.5 pl-2.5 rounded-xl border border-stay-border hover:bg-stay-bg-app transition-colors">
                <Avatar
                  size={32}
                  style={{ backgroundColor: 'var(--stay-primary)', color: '#fff' }}
                >
                  {(user?.fullName || 'Thành').charAt(0).toUpperCase()}
                </Avatar>
                <div className="text-left hidden md:block leading-tight">
                  <p className="text-xs font-semibold text-stay-text">{user?.fullName || 'Nguyễn Văn Thành'}</p>
                  <p className="text-[10px] text-amber-600 font-bold">Chủ trọ</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 px-5 py-4 w-full flex flex-col min-h-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
