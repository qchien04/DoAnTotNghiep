import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dropdown, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { StayConnectLogo } from './StayConnectLogo';
import {
  User,
  ShieldCheck,
  Building2,
  ShieldAlert,
  LogOut,
  PlusCircle,
  Menu,
  Home,
  Users,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ThemeSwitcher } from './ThemeSwitcher';
import { NotificationDropdown } from './ui/NotificationDropdown';
import { Button } from './ui/Button';

interface StayConnectHeaderProps {
  onPostListingClick?: () => void;
  onLoginClick?: () => void;
}

export const StayConnectHeader: React.FC<StayConnectHeaderProps> = ({
  onPostListingClick,
  onLoginClick,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const navLinks = [
    { label: 'Tìm phòng trọ', path: '/', icon: Compass },
    { label: 'Ở ghép', path: '/roommates', icon: Users },
    { label: 'Phòng của tôi', path: '/tenant/my-room', icon: Home },
    { label: 'Kênh chủ trọ', path: '/landlord', icon: Building2 },
  ];

  const handlePostListing = () => {
    if (onPostListingClick) {
      onPostListingClick();
    } else {
      navigate('/roommates/create');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="px-1 py-1.5 min-w-[180px]">
          <p className="font-bold text-sm text-stay-text">{user?.fullName || user?.username || 'Người dùng'}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email || 'user@stayconnect.vn'}</p>
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-stay-primary-subtle text-stay-primary">
            {user?.role === 'ROLE_ADMIN'
              ? 'Quản trị viên'
              : user?.role === 'ROLE_LANDLORD'
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
      icon: <User className="w-4 h-4 text-slate-500" />,
      label: <Link to="/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: 'verified',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      label: <Link to="/verify">Xác thực danh tính</Link>,
    },
    {
      key: 'my-room',
      icon: <Home className="w-4 h-4 text-stay-primary" />,
      label: <Link to="/tenant/my-room">Phòng & hợp đồng của tôi</Link>,
    },
    { type: 'divider' },
    {
      key: 'landlord-portal',
      icon: <Building2 className="w-4 h-4 text-amber-500" />,
      label: <Link to="/landlord">Kênh quản trị chủ trọ</Link>,
    },
    {
      key: 'admin-portal',
      icon: <ShieldAlert className="w-4 h-4 text-purple-500" />,
      label: <Link to="/admin">Quản trị hệ thống</Link>,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut className="w-4 h-4 text-red-500" />,
      danger: true,
      label: 'Đăng xuất',
      onClick: () => logout(),
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-stay-card-bg/95 backdrop-blur-md border-b border-stay-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 select-none shrink-0">
            <StayConnectLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${isActive
                    ? 'text-stay-primary bg-stay-primary-subtle font-semibold shadow-2xs'
                    : 'text-stay-text hover:text-stay-primary hover:bg-stay-bg-app'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* 1-Click Theme Switcher */}
          <ThemeSwitcher />

          {/* Đăng tin cho thuê / tìm bạn Button */}
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={handlePostListing}
            className="font-semibold shadow-xs"
          >
            Đăng tin
          </Button>

          {/* Notification Dropdown */}
          <NotificationDropdown
            viewAllLink="/tenant/my-room"
            viewAllText="Xem phòng & hợp đồng của tôi"
          />

          {/* Auth State Button / Profile Dropdown */}
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer p-1 pl-2 rounded-xl border border-stay-border hover:bg-stay-bg-app transition-colors">
                <div className="w-8 h-8 rounded-lg bg-stay-primary text-white flex items-center justify-center font-bold text-xs">
                  {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block leading-tight pr-1">
                  <p className="text-xs font-semibold text-stay-text line-clamp-1">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-[10px] text-stay-secondary font-medium">
                    {user.role === 'ROLE_ADMIN'
                      ? 'Quản trị viên'
                      : user.role === 'ROLE_LANDLORD'
                        ? 'Chủ trọ'
                        : 'Người thuê'}
                  </p>
                </div>
              </div>
            </Dropdown>
          ) : (
            <Link to="/login" onClick={onLoginClick}>
              <Button variant="outline" size="sm" className="font-medium">
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu drawer toggle button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeSwitcher compact />
          <NotificationDropdown
            viewAllLink="/tenant/my-room"
            viewAllText="Xem phòng & hợp đồng của tôi"
          />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-xl text-stay-text hover:bg-stay-bg-app transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={<StayConnectLogo size="sm" />}
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={290}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? 'bg-stay-primary-subtle text-stay-primary font-semibold'
                    : 'text-stay-text hover:bg-stay-bg-app'
                    }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stay-border space-y-2">
            <Button
              variant="primary"
              block
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => {
                setDrawerOpen(false);
                handlePostListing();
              }}
            >
              Đăng tin
            </Button>

            {!isAuthenticated ? (
              <Link to="/login" onClick={() => setDrawerOpen(false)} className="block">
                <Button variant="outline" block>
                  Đăng nhập / Đăng ký
                </Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                block
                className="text-red-500 hover:bg-red-50"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
              >
                Đăng xuất
              </Button>
            )}
          </div>

          {/* Social Channels in Mobile Drawer */}
          <div className="pt-4 border-t border-stay-border space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stay-text-secondary">
              Kênh kết nối & Hỗ trợ
            </p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-stay-bg-app hover:bg-blue-50 border border-stay-border transition-colors text-center"
              >
                <span className="w-6 h-6 rounded-full bg-[#0068FF] text-white flex items-center justify-center font-bold text-[9px] leading-none mb-1">
                  Zalo
                </span>
                <span className="text-[10px] font-medium text-stay-text">Zalo OA</span>
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-stay-bg-app hover:bg-blue-50 border border-stay-border transition-colors text-center"
              >
                <svg className="w-6 h-6 fill-[#1877F2] mb-1" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-medium text-stay-text">Facebook</span>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-stay-bg-app hover:bg-red-50 border border-stay-border transition-colors text-center"
              >
                <svg className="w-6 h-6 fill-[#FF0000] mb-1" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span className="text-[10px] font-medium text-stay-text">YouTube</span>
              </a>
            </div>

            <div className="pt-1 text-center">
              <span className="text-[11px] text-slate-500">
                Hotline hỗ trợ: <strong className="text-stay-text font-bold">1900 8899</strong>
              </span>
            </div>
          </div>
        </div>
      </Drawer>
    </header>
  );
};

export default StayConnectHeader;
