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
  Receipt,
  Wrench,
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

  const role = user?.role;

  // 1. Dynamic Navigation Links based on User Role
  const getNavLinks = () => {
    const commonLinks = [
      { label: 'Tìm phòng trọ', path: '/', icon: Compass },
      { label: 'Ở ghép', path: '/roommates', icon: Users },
    ];

    if (role === 'ROLE_TENANT') {
      return [
        ...commonLinks,
        { label: 'Phòng của tôi', path: '/tenant/my-room', icon: Home },
        { label: 'Hóa đơn', path: '/tenant/bills', icon: Receipt },
        { label: 'Khiếu nại', path: '/tenant/complaints', icon: Wrench },
      ];
    }

    if (role === 'ROLE_LANDLORD') {
      return [
        ...commonLinks,
        { label: 'Kênh chủ trọ', path: '/landlord', icon: Building2 },
        { label: 'Quản lý phòng', path: '/landlord/rooms', icon: Home },
        { label: 'Hóa đơn', path: '/landlord/bills', icon: Receipt },
      ];
    }

    if (role === 'ROLE_ADMIN') {
      return [
        ...commonLinks,
        { label: 'Quản trị hệ thống', path: '/admin', icon: ShieldAlert },
        { label: 'Người dùng', path: '/admin/users', icon: Users },
      ];
    }

    // Guest / Unauthenticated
    return [
      ...commonLinks,
      { label: 'Kênh chủ trọ', path: '/landlord', icon: Building2 },
    ];
  };

  const navLinks = getNavLinks();

  // 2. Dynamic Primary Action Button
  const handlePrimaryAction = () => {
    if (onPostListingClick) {
      onPostListingClick();
      return;
    }

    if (role === 'ROLE_TENANT') {
      navigate('/tenant/create-post');
    } else if (role === 'ROLE_LANDLORD') {
      navigate('/landlord/rooms');
    } else if (role === 'ROLE_ADMIN') {
      navigate('/admin');
    } else {
      navigate('/roommates/create');
    }
  };

  const getPrimaryActionConfig = () => {
    if (role === 'ROLE_TENANT') {
      return {
        label: 'Đăng tin tìm bạn',
        icon: <PlusCircle className="w-4 h-4" />,
      };
    }
    if (role === 'ROLE_LANDLORD') {
      return {
        label: 'Quản lý phòng trọ',
        icon: <Building2 className="w-4 h-4" />,
      };
    }
    if (role === 'ROLE_ADMIN') {
      return {
        label: 'Bảng quản trị',
        icon: <ShieldAlert className="w-4 h-4" />,
      };
    }
    return {
      label: 'Đăng tin',
      icon: <PlusCircle className="w-4 h-4" />,
    };
  };

  const actionConfig = getPrimaryActionConfig();

  // Role Badge Styling
  const getRoleBadge = () => {
    switch (role) {
      case 'ROLE_ADMIN':
        return (
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/20">
            Quản trị viên
          </span>
        );
      case 'ROLE_LANDLORD':
        return (
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">
            Chủ trọ
          </span>
        );
      default:
        return (
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-stay-primary-subtle text-stay-primary border border-stay-primary/20">
            Người thuê
          </span>
        );
    }
  };

  // 3. Dynamic User Menu Items based on Role
  const getUserMenuItems = (): MenuProps['items'] => [
    {
      key: 'user-info',
      label: (
        <div className="px-1 py-1.5 min-w-[200px]">
          <p className="font-bold text-sm text-stay-text line-clamp-1">
            {user?.fullName || user?.username || 'Người dùng'}
          </p>
          <p className="text-xs text-stay-text-secondary truncate">
            {user?.email || 'user@stayconnect.vn'}
          </p>
          {getRoleBadge()}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <User className="w-4 h-4 text-stay-text-secondary" />,
      label: <Link to="/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: 'verified',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />,
      label: <Link to="/verify">Xác thực danh tính</Link>,
    },
    { type: 'divider' },

    // Role-specific sections
    ...(role === 'ROLE_TENANT'
      ? [
          {
            key: 'my-room',
            icon: <Home className="w-4 h-4 text-stay-primary" />,
            label: <Link to="/tenant/my-room">Phòng & hợp đồng của tôi</Link>,
          },
          {
            key: 'my-bills',
            icon: <Receipt className="w-4 h-4 text-blue-500" />,
            label: <Link to="/tenant/bills">Quản lý hóa đơn & VietQR</Link>,
          },
          {
            key: 'my-complaints',
            icon: <Wrench className="w-4 h-4 text-amber-500" />,
            label: <Link to="/tenant/complaints">Khiếu nại & Báo hỏng sự cố</Link>,
          },
          {
            key: 'my-posts',
            icon: <Users className="w-4 h-4 text-indigo-500" />,
            label: <Link to="/tenant/posts">Bài đăng ở ghép của tôi</Link>,
          },
        ]
      : []),

    ...(role === 'ROLE_LANDLORD'
      ? [
          {
            key: 'landlord-portal',
            icon: <Building2 className="w-4 h-4 text-amber-500" />,
            label: <Link to="/landlord">Kênh quản trị chủ trọ</Link>,
          },
          {
            key: 'landlord-rooms',
            icon: <Home className="w-4 h-4 text-blue-500" />,
            label: <Link to="/landlord/rooms">Quản lý tòa nhà & phòng</Link>,
          },
          {
            key: 'landlord-bills',
            icon: <Receipt className="w-4 h-4 text-emerald-500" />,
            label: <Link to="/landlord/bills">Hóa đơn & Thu tiền trọ</Link>,
          },
        ]
      : []),

    ...(role === 'ROLE_ADMIN'
      ? [
          {
            key: 'admin-portal',
            icon: <ShieldAlert className="w-4 h-4 text-purple-500" />,
            label: <Link to="/admin">Trang quản trị hệ thống</Link>,
          },
          {
            key: 'admin-users',
            icon: <Users className="w-4 h-4 text-blue-500" />,
            label: <Link to="/admin/users">Quản lý người dùng</Link>,
          },
        ]
      : []),

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
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                    isActive
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

          {/* Role-specific CTA Button */}
          <Button
            variant="primary"
            size="sm"
            icon={actionConfig.icon}
            onClick={handlePrimaryAction}
            className="font-semibold shadow-xs"
          >
            {actionConfig.label}
          </Button>

          {/* Notification Dropdown */}
          <NotificationDropdown
            viewAllLink={role === 'ROLE_LANDLORD' ? '/landlord/complaints' : '/tenant/my-room'}
            viewAllText="Xem tất cả thông báo"
          />

          {/* Auth State Button / Profile Dropdown */}
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: getUserMenuItems() }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer p-1 pl-2 rounded-xl border border-stay-border hover:bg-stay-bg-app transition-colors">
                <div className="w-8 h-8 rounded-lg bg-stay-primary text-white flex items-center justify-center font-bold text-xs">
                  {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block leading-tight pr-1">
                  <p className="text-xs font-semibold text-stay-text line-clamp-1 max-w-[130px]">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-[10px] text-stay-primary font-bold">
                    {role === 'ROLE_ADMIN'
                      ? 'Quản trị viên'
                      : role === 'ROLE_LANDLORD'
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
            viewAllLink={role === 'ROLE_LANDLORD' ? '/landlord/complaints' : '/tenant/my-room'}
            viewAllText="Xem thông báo"
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
        styles={{
          body: { backgroundColor: 'var(--stay-card-bg)', color: 'var(--stay-text)' },
          header: { backgroundColor: 'var(--stay-card-bg)', color: 'var(--stay-text)', borderBottom: '1px solid var(--stay-border)' },
        }}
      >
        <div className="space-y-4">
          {isAuthenticated && user && (
            <div className="p-3 rounded-xl bg-stay-bg-app border border-stay-border">
              <p className="font-bold text-sm text-stay-text">{user.fullName || user.username}</p>
              <p className="text-xs text-stay-text-secondary truncate">{user.email}</p>
              {getRoleBadge()}
            </div>
          )}

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
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
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

          {/* Quick Primary Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                handlePrimaryAction();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-stay-primary text-white hover:bg-stay-primary-hover shadow-xs transition-colors cursor-pointer"
            >
              {actionConfig.icon}
              <span>{actionConfig.label}</span>
            </button>
          </div>

          <div className="pt-4 border-t border-stay-border">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="md"
                className="w-full text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setDrawerOpen(false);
                  logout();
                }}
              >
                Đăng xuất
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setDrawerOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setDrawerOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
};
