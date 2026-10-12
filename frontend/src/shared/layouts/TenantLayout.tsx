import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Receipt,
  Wrench,
  Users,
  Compass,
  LogOut,
  User,
  ShieldCheck,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  ThemeSwitcher,
  StayConnectLogo,
  Sidebar,
  NotificationDropdown,
  type MenuItemType,
} from '@/shared/components';
import { Avatar, Dropdown } from 'antd';

export const TenantLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const tenantMenuItems: MenuItemType[] = [
    {
      key: '/tenant/my-room',
      icon: <Home className="w-4 h-4 shrink-0" />,
      label: <Link to="/tenant/my-room">Phòng & Hợp đồng</Link>,
    },
    {
      key: '/tenant/bills',
      icon: <Receipt className="w-4 h-4 shrink-0" />,
      label: <Link to="/tenant/bills">Quản lý Hóa đơn</Link>,
    },
    {
      key: '/tenant/complaints',
      icon: <Wrench className="w-4 h-4 shrink-0" />,
      label: <Link to="/tenant/complaints">Khiếu nại & Báo hỏng</Link>,
    },
    {
      key: '/tenant/posts',
      icon: <Users className="w-4 h-4 shrink-0" />,
      label: <Link to="/tenant/posts">Bài đăng ở ghép</Link>,
    },
    {
      key: '/roommates',
      icon: <Compass className="w-4 h-4 shrink-0" />,
      label: <Link to="/roommates">Khám phá ở ghép</Link>,
    },
  ];

  // Determine current active key
  const currentKey =
    tenantMenuItems.find(
      (item) =>
        item &&
        'key' in item &&
        typeof item.key === 'string' &&
        location.pathname.startsWith(item.key)
    )?.key as string || '/tenant/my-room';



  const userMenuItems = [
    {
      key: 'info',
      label: (
        <div className="py-1">
          <p className="font-semibold text-sm text-stay-text">
            {user?.fullName || user?.username || 'Người thuê'}
          </p>
          <p className="text-xs text-stay-text-secondary truncate">
            {user?.email || 'tenant@stayconnect.vn'}
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
            Người thuê
          </span>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'profile',
      icon: <User className="w-4 h-4 text-stay-text-secondary" />,
      label: <Link to="/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: 'verify',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      label: <Link to="/verify">Xác thực danh tính</Link>,
    },
    {
      key: 'home',
      icon: <Compass className="w-4 h-4 text-stay-primary" />,
      label: <Link to="/">Về trang chủ sàn</Link>,
    },
    ...(user?.role === 'ROLE_LANDLORD'
      ? [
          {
            key: 'landlord-portal',
            icon: <Building2 className="w-4 h-4 text-amber-500" />,
            label: <Link to="/landlord">Chuyển sang Kênh chủ trọ</Link>,
          },
        ]
      : []),
    ...(user?.role === 'ROLE_ADMIN'
      ? [
          {
            key: 'admin-portal',
            icon: <ShieldAlert className="w-4 h-4 text-purple-500" />,
            label: <Link to="/admin">Chuyển sang Trang Admin</Link>,
          },
        ]
      : []),
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      label: <span className="text-red-500 font-medium">Đăng xuất</span>,
      onClick: () => logout(),
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-stay-bg-app text-stay-text">
      {/* Shared Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsible={true}
        width={260}
        collapsedWidth={80}
        menuItems={tenantMenuItems}
        selectedKey={currentKey}
        className="h-full shrink-0 z-30"
        header={
          !collapsed ? (
            <Link to="/tenant/my-room" className="flex items-center gap-2">
              <StayConnectLogo size="sm" />
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-stay-primary-subtle text-stay-primary border border-stay-primary/30">
                TENANT
              </span>
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <Home className="w-6 h-6 text-stay-primary" />
            </div>
          )
        }
        footer={
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stay-text-secondary hover:text-stay-primary hover:bg-stay-bg-app rounded-lg transition-colors"
          >
            <Compass className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Về trang chủ sàn</span>}
          </Link>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-stay-card-bg/90 backdrop-blur border-b border-stay-border px-4 sm:px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-stay-text">
              Không gian người thuê
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />

            <NotificationDropdown
              viewAllLink="/tenant/my-room"
              viewAllText="Xem tất cả thông báo người thuê"
            />

            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer p-1.5 pl-2.5 rounded-xl border border-stay-border hover:bg-stay-bg-app transition-colors">
                <Avatar
                  size={32}
                  style={{ backgroundColor: 'var(--stay-primary)', color: '#fff' }}
                >
                  {(user?.fullName || user?.username || 'T').charAt(0).toUpperCase()}
                </Avatar>
                <div className="text-left hidden md:block leading-tight">
                  <p className="text-xs font-semibold text-stay-text truncate max-w-[120px]">
                    {user?.fullName || user?.username || 'Người thuê'}
                  </p>
                  <p className="text-[10px] text-stay-primary font-bold">Người thuê</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
