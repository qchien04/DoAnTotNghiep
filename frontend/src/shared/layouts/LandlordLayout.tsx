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
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeSwitcher, RoomiLogo, Sidebar, NotificationDropdown, type MenuItemType } from '@/shared/components';
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
      key: '/landlord/verification',
      icon: <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />,
      label: (
        <Link to="/landlord/verification" className="flex items-center justify-between">
          <span>Xác minh chủ trọ</span>
          {user?.landlordVerified ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              Đã duyệt
            </span>
          ) : user?.landlordVerificationStatus === 'PENDING' ? (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
              Chờ duyệt
            </span>
          ) : null}
        </Link>
      ),
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
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      label: <span className="text-red-500 font-medium">Đăng xuất</span>,
      onClick: () => logout(),
    },
  ];

  const getPageTitle = (path: string) => {
    if (path.startsWith('/landlord/verification')) return 'Xác minh chủ trọ';
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
            <Link to="/landlord" className="w-full flex flex-col items-center justify-center py-2 gap-1">
              <RoomiLogo size="md" />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Kênh Chủ Trọ
              </span>
            </Link>
          ) : (
            <div className="w-full flex items-center justify-center py-1">
              <Building2 className="w-7 h-7 text-emerald-600" />
            </div>
          )
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-stay-card-bg/90 backdrop-blur border-b border-stay-border px-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-stay-text tracking-tight">
                {pageTitle}
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/25">
                Kênh Chủ Trọ
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />

            <NotificationDropdown
              viewAllLink="/landlord/complaints"
              viewAllText="Xem tất cả"
            />

            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer p-1.5 pl-2.5 rounded-xl hover:bg-stay-bg-app transition-colors">
                <Avatar
                  size={32}
                  style={{ backgroundColor: 'var(--stay-primary)', color: '#fff' }}
                >
                  {(user?.fullName || 'T').charAt(0).toUpperCase()}
                </Avatar>
                <div className="text-left hidden md:block leading-tight">
                  <p className=" font-semibold text-stay-text">{user?.fullName || 'Nguyễn Văn Thành'}</p>
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
