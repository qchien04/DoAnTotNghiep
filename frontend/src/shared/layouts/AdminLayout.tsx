import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users2,
  SlidersHorizontal,
  FileWarning,
  LogOut,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeSwitcher, RoomiLogo, Sidebar, NotificationDropdown, type MenuItemType } from '@/shared/components';
import { Avatar, Dropdown } from 'antd';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const currentKey = location.pathname.startsWith('/admin/rooms/moderation')
    ? '/admin/rooms/moderation'
    : location.pathname.startsWith('/admin/verifications')
    ? '/admin/verifications'
    : location.pathname.startsWith('/admin/users')
    ? '/admin/users'
    : location.pathname.startsWith('/admin/master-data')
      ? '/admin/master-data'
      : location.pathname.startsWith('/admin/reports')
        ? '/admin/reports'
        : location.pathname.startsWith('/admin/profile')
          ? '/admin/profile'
          : '/admin';

  const adminMenuItems: MenuItemType[] = [
    {
      key: '/admin',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      label: <Link to="/admin">Dashboard Quản trị</Link>,
    },
    {
      key: '/admin/rooms/moderation',
      icon: <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />,
      label: <Link to="/admin/rooms/moderation">Kiểm duyệt phòng trọ</Link>,
    },
    {
      key: '/admin/verifications',
      icon: <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />,
      label: <Link to="/admin/verifications">Duyệt xác minh chủ trọ</Link>,
    },
    {
      key: '/admin/users',
      icon: <Users2 className="w-4 h-4 shrink-0" />,
      label: <Link to="/admin/users">Quản lý Người dùng</Link>,
    },
    {
      key: '/admin/master-data',
      icon: <SlidersHorizontal className="w-4 h-4 shrink-0" />,
      label: <Link to="/admin/master-data">Master Data Hệ thống</Link>,
    },
    {
      key: '/admin/reports',
      icon: <FileWarning className="w-4 h-4 shrink-0" />,
      label: <Link to="/admin/reports">Báo cáo & Vi phạm sàn</Link>,
    },
    {
      key: '/admin/profile',
      icon: <User className="w-4 h-4 shrink-0" />,
      label: <Link to="/admin/profile">Hồ sơ cá nhân</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      label: <span className="text-red-500 font-medium">Đăng xuất</span>,
      onClick: () => logout(),
    },
  ];

  const getPageTitle = (path: string) => {
    if (path.startsWith('/admin/rooms/moderation')) return 'Kiểm duyệt phòng trọ';
    if (path.startsWith('/admin/verifications')) return 'Duyệt xác minh chủ trọ';
    if (path.startsWith('/admin/users')) return 'Quản lý Người dùng';
    if (path.startsWith('/admin/master-data')) return 'Master Data Hệ thống';
    if (path.startsWith('/admin/reports')) return 'Báo cáo & Vi phạm sàn';
    if (path.startsWith('/admin/profile')) return 'Hồ sơ cá nhân';
    return 'Dashboard Quản trị';
  };
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="h-screen flex overflow-hidden bg-stay-bg-app text-stay-text">
      {/* Shared Sidebar Component (wraps Ant Design Sider & Menu) */}
      <Sidebar
        collapsed={collapsed}
        onCollapse={setCollapsed}
        collapsible={true}
        width={260}
        collapsedWidth={80}
        menuItems={adminMenuItems}
        selectedKey={currentKey}
        className="h-full shrink-0 z-30"
        header={
          !collapsed ? (
            <Link to="/admin" className="w-full flex flex-col items-center justify-center py-2 gap-1">
              <RoomiLogo size="md" />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                Admin Portal
              </span>
            </Link>
          ) : (
            <div className="w-full flex items-center justify-center py-1">
              <Shield className="w-7 h-7 text-purple-600" />
            </div>
          )
        }
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-stay-card-bg/90 backdrop-blur border-b border-stay-border px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stay-text tracking-tight">
                {pageTitle}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/25">
                Quản trị hệ thống
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />

            <NotificationDropdown
              viewAllLink="/admin/reports"
              viewAllText="Xem tất cả báo cáo vi phạm"
            />

            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer p-1.5 pl-2.5 rounded-xl border border-stay-border hover:bg-stay-bg-app transition-colors">
                <Avatar
                  size={32}
                  style={{ backgroundColor: '#9333ea', color: '#fff' }}
                >
                  {(user?.fullName || 'Admin').charAt(0).toUpperCase()}
                </Avatar>
                <div className="text-left hidden md:block leading-tight">
                  <p className=" font-semibold text-stay-text">{user?.fullName || 'Quản Trị Viên'}</p>
                  <p className="text-[10px] text-purple-600 font-bold">Quản trị viên</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 px-5 py-4 w-full flex flex-col min-h-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
