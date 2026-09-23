import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  Users2,
  SlidersHorizontal,
  FileWarning,
  Home,
  LogOut,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeSwitcher, StayConnectLogo, Sidebar, NotificationDropdown, type MenuItemType } from '@/shared/components';
import { Avatar, Dropdown } from 'antd';

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const currentKey = location.pathname.startsWith('/admin/users')
    ? '/admin/users'
    : location.pathname.startsWith('/admin/master-data')
    ? '/admin/master-data'
    : location.pathname.startsWith('/admin/reports')
    ? '/admin/reports'
    : '/admin';

  const adminMenuItems: MenuItemType[] = [
    {
      key: '/admin',
      icon: <BarChart3 className="w-4 h-4 shrink-0" />,
      label: <Link to="/admin">Dashboard Quản trị</Link>,
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
  ];

  const userMenuItems = [
    {
      key: 'info',
      label: (
        <div className="py-1">
          <p className="font-semibold text-sm text-stay-text">{user?.fullName || 'Quản Trị Viên'}</p>
          <p className="text-xs text-slate-500">{user?.email || 'admin@trotot.vn'}</p>
          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
            Quản trị viên
          </span>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'home',
      icon: <Home className="w-4 h-4" />,
      label: <Link to="/">Về trang chủ sàn</Link>,
    },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      label: <span className="text-red-500 font-medium">Đăng xuất</span>,
      onClick: () => logout(),
    },
  ];

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
            <Link to="/admin" className="flex items-center gap-2">
              <StayConnectLogo size="sm" />
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 border border-purple-500/20">
                ADMIN
              </span>
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          )
        }
        footer={
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stay-text-secondary hover:text-stay-primary hover:bg-stay-bg-app rounded-lg transition-colors"
          >
            <Home className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Quay lại trang người dùng</span>}
          </Link>
        }
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-stay-card-bg/90 backdrop-blur border-b border-stay-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-stay-text">
              Quản trị hệ thống
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-medium">
              <ShieldAlert className="w-3 h-3" /> Quyền Quản Trị Tối Cao
            </span>
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
                  <p className="text-xs font-semibold text-stay-text">{user?.fullName || 'Quản Trị Viên'}</p>
                  <p className="text-[10px] text-purple-600 font-bold">Quản trị viên</p>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
