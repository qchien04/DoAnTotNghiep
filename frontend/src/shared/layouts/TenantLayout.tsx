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
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  ThemeSwitcher,
  RoomiLogo,
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
      key: '/tenant/profile',
      icon: <User className="w-4 h-4 shrink-0" />,
      label: <Link to="/tenant/profile">Hồ sơ cá nhân</Link>,
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

  const getPageTitle = (path: string) => {
    if (path.startsWith('/tenant/my-room')) return 'Phòng của tôi';
    if (path.startsWith('/tenant/bills')) return 'Hóa đơn tiền phòng';
    if (path.startsWith('/tenant/complaints')) return 'Khiếu nại & Báo hỏng';
    if (path.startsWith('/tenant/my-posts')) return 'Bài đăng ở ghép của tôi';
    if (path.startsWith('/tenant/profile')) return 'Hồ sơ cá nhân';
    if (path.startsWith('/roommates')) return 'Khám phá ở ghép';
    return 'Không gian người thuê';
  };
  const pageTitle = getPageTitle(location.pathname);

  const userMenuItems = [
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
            <Link to="/tenant/my-room" className="w-full flex flex-col items-center justify-center py-2 gap-1">
              <RoomiLogo size="md" />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                Không Gian Người Thuê
              </span>
            </Link>
          ) : (
            <div className="w-full flex items-center justify-center py-1">
              <Home className="w-7 h-7 text-blue-600" />
            </div>
          )
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-stay-card-bg/90 backdrop-blur border-b border-stay-border px-5 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Home className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stay-text">
                {pageTitle}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/25">
                Người thuê
              </span>
            </div>
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
                  <p className=" font-semibold text-stay-text truncate max-w-[120px]">
                    {user?.fullName || user?.username || 'Người thuê'}
                  </p>
                  <p className="text-[10px] text-stay-primary font-bold">Người thuê</p>
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
