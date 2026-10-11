import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { StayConnectLogo } from './StayConnectLogo';
import {
  Compass,
  Users,
  LayoutDashboard,
  Menu,
  User,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeSwitcher } from './ThemeSwitcher';

export const StayConnectHeader: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const role = user?.role;

  const getAdminPath = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'ROLE_ADMIN') return '/admin';
    if (role === 'ROLE_LANDLORD') return '/landlord';
    if (role === 'ROLE_TENANT') return '/tenant';
    return '/landlord';
  };

  const isRoomActive = location.pathname === '/rooms' || location.pathname === '/';
  const isRoommateActive = location.pathname.startsWith('/roommates');
  const isAdminActive =
    location.pathname.startsWith('/landlord') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/tenant');

  const handleAdminNavigate = () => {
    navigate(getAdminPath());
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="px-1 py-1 min-w-[160px]">
          <p className="font-semibold text-xs text-stay-text truncate">
            {user?.fullName || user?.username || 'Người dùng'}
          </p>
          <p className="text-[11px] text-stay-text-secondary truncate">
            {user?.email || ''}
          </p>
          <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-stay-primary-subtle text-stay-primary">
            {role === 'ROLE_ADMIN'
              ? 'Quản trị viên'
              : role === 'ROLE_LANDLORD'
              ? 'Chủ trọ'
              : 'Người thuê'}
          </span>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <User className="w-3.5 h-3.5 text-stay-text-secondary" />,
      label: <Link to="/profile">Hồ sơ cá nhân</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className="w-3.5 h-3.5 text-rose-500" />,
      danger: true,
      label: 'Đăng xuất',
      onClick: () => logout(),
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-stay-card-bg/95 backdrop-blur-md border-b border-stay-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link to="/rooms" className="flex items-center select-none shrink-0">
            <StayConnectLogo size="md" />
          </Link>

          {/* Center Navigation - Exactly 3 Items: Tìm phòng, Bài đăng ở ghép, Trang quản trị */}
          <nav className="hidden md:flex items-center gap-1">
            {/* 1. Nút Tìm phòng */}
            <Link
              to="/rooms"
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${
                isRoomActive
                  ? 'text-stay-primary bg-stay-primary-subtle font-semibold'
                  : 'text-stay-text hover:text-stay-primary hover:bg-stay-bg-app'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Tìm phòng</span>
            </Link>

            {/* 2. Nút Bài đăng ở ghép */}
            <Link
              to="/roommates"
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors ${
                isRoommateActive
                  ? 'text-stay-primary bg-stay-primary-subtle font-semibold'
                  : 'text-stay-text hover:text-stay-primary hover:bg-stay-bg-app'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Bài đăng ở ghép</span>
            </Link>

            {/* 3. Nút Trang quản trị */}
            <button
              type="button"
              onClick={handleAdminNavigate}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                isAdminActive
                  ? 'text-stay-primary bg-stay-primary-subtle font-semibold'
                  : 'text-stay-text hover:text-stay-primary hover:bg-stay-bg-app'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Trang quản trị</span>
            </button>
          </nav>
        </div>

        {/* Right: Theme Switcher & Simple Auth Info */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeSwitcher />

          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-xl border border-stay-border hover:bg-stay-bg-app transition-colors">
                <div className="w-7 h-7 rounded-lg bg-stay-primary text-white flex items-center justify-center font-bold text-xs select-none">
                  {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-stay-text max-w-[120px] truncate">
                  {user.fullName || user.username}
                </span>
              </div>
            </Dropdown>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-stay-primary hover:bg-stay-primary-hover text-white transition-colors shadow-xs"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeSwitcher compact />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl text-stay-text hover:bg-stay-bg-app transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Tối giản) */}
      <Drawer
        title={<StayConnectLogo size="sm" />}
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={260}
        styles={{
          body: { backgroundColor: 'var(--stay-card-bg)', color: 'var(--stay-text)' },
          header: {
            backgroundColor: 'var(--stay-card-bg)',
            color: 'var(--stay-text)',
            borderBottom: '1px solid var(--stay-border)',
          },
        }}
      >
        <div className="space-y-4">
          {isAuthenticated && user && (
            <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border">
              <p className="font-semibold text-xs text-stay-text truncate">
                {user.fullName || user.username}
              </p>
              <p className="text-[11px] text-stay-text-secondary truncate">{user.email}</p>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to="/rooms"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isRoomActive
                  ? 'bg-stay-primary-subtle text-stay-primary font-semibold'
                  : 'text-stay-text hover:bg-stay-bg-app'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>Tìm phòng</span>
            </Link>

            <Link
              to="/roommates"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isRoommateActive
                  ? 'bg-stay-primary-subtle text-stay-primary font-semibold'
                  : 'text-stay-text hover:bg-stay-bg-app'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Bài đăng ở ghép</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                handleAdminNavigate();
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left cursor-pointer ${
                isAdminActive
                  ? 'bg-stay-primary-subtle text-stay-primary font-semibold'
                  : 'text-stay-text hover:bg-stay-bg-app'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Trang quản trị</span>
            </button>
          </div>

          <div className="pt-4 border-t border-stay-border">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-500 border border-stay-border hover:bg-stay-bg-app transition-colors cursor-pointer"
              >
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setDrawerOpen(false)}
                className="block text-center w-full py-2 px-3 rounded-xl text-xs font-semibold bg-stay-primary text-white hover:bg-stay-primary-hover transition-colors"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};
