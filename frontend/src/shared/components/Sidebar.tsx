import React from 'react';
import { Layout, Menu, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  CodeOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <NavLink to="/">Trang Chủ Đồ Án</NavLink>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <NavLink to="/users">Quản Lý Người Dùng</NavLink>,
    },
    {
      key: '/components',
      icon: <AppstoreOutlined />,
      label: (
        <NavLink to="/components" className="flex items-center justify-between">
          <span>UI Components</span>
          <Tag color="blue" className="text-[10px] scale-90 m-0">Antd 6</Tag>
        </NavLink>
      ),
    },
  ];

  return (
    <Sider
      width={240}
      theme="light"
      style={{ background: 'var(--stay-card-bg)' }}
      className="border-r border-stay-border !bg-stay-card-bg min-h-[calc(100vh-4rem)] flex flex-col justify-between p-2 shadow-2xs"
    >
      <div className="space-y-4">
        <div className="px-3 pt-3">
          <Text type="secondary" className="text-[11px] font-bold uppercase tracking-wider block">
            Điều Hướng Hệ Thống
          </Text>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-r-0 font-medium text-xs bg-transparent"
        />

        <div className="p-3 bg-stay-bg-app rounded-xl border border-stay-border space-y-2 mx-2">
          <Text type="secondary" className="text-[11px] font-bold uppercase tracking-wider block">
            Hạ Tầng Mono-service
          </Text>
          <div className="space-y-1.5 text-xs text-stay-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircleOutlined className="text-emerald-500" />
              <span>JWT Payload Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <DatabaseOutlined className="text-amber-500" />
              <span>Spring Data JPA</span>
            </div>
            <div className="flex items-center gap-2">
              <CodeOutlined className="text-blue-500" />
              <span>Spring Boot 3.4 & Antd</span>
            </div>
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
