import React from 'react';
import { Button, Avatar, Badge, Dropdown, Space, Tag } from 'antd';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  LogoutOutlined,
  UserOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { env } from '@/configs/env';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div>
          <p className="font-semibold text-xs text-slate-800">{user?.fullName || user?.username}</p>
          <p className="text-[11px] text-slate-400">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'role',
      icon: <SafetyCertificateOutlined className="text-emerald-500" />,
      label: <span className="text-xs">Vai trò: {user?.role}</span>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined className="text-red-500" />,
      label: <span className="text-xs text-red-500 font-medium">Đăng xuất</span>,
      onClick: logout,
    },
  ];

  return (
    <header className="h-16 bg-stay-card-bg border-b border-stay-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-stay-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
          SC
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-bold text-stay-text leading-none">
            {env.APP_TITLE}
          </h1>
          <p className="text-[11px] text-stay-text-secondary mt-1">Mono-service Core Architecture</p>
        </div>
      </div>

      <Space size={12} className="items-center">
        {/* Link Swagger API */}
        <Button
          type="text"
          size="small"
          icon={<BookOutlined className="text-stay-primary" />}
          href="http://localhost:8080/swagger-ui.html"
          target="_blank"
          className="text-xs font-medium text-stay-text-secondary bg-stay-bg-app hover:bg-stay-primary-subtle hover:text-stay-primary border border-stay-border-subtle"
        >
          Swagger API
        </Button>

        {/* Thông báo Notification */}
        <Badge dot color="#EF4444" offset={[-2, 2]}>
          <Button
            type="text"
            shape="circle"
            icon={<BellOutlined className="text-stay-text-secondary text-base" />}
          />
        </Badge>

        {/* Auth profile dropdown */}
        {isAuthenticated && user ? (
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <Avatar
                size={32}
                style={{ backgroundColor: 'var(--stay-primary)', color: '#fff' }}
                icon={!user.fullName && <UserOutlined />}
              >
                {user.fullName?.charAt(0).toUpperCase()}
              </Avatar>

              <div className="text-left hidden sm:block leading-tight">
                <span className="text-xs font-semibold text-stay-text block">
                  {user.fullName || user.username}
                </span>
                <Tag color="blue" className="text-[10px] px-1 py-0 mr-0 mt-0.5 border-none">
                  {user.role}
                </Tag>
              </div>
            </div>
          </Dropdown>
        ) : (
          <Button type="primary" size="small" href="/login" className="bg-stay-primary hover:bg-stay-primary-hover font-medium">
            Đăng nhập
          </Button>
        )}
      </Space>
    </header>
  );
};

export default Header;
