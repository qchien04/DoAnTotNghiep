import React, { useState } from 'react';
import { Layout } from 'antd';
import { Menu, type MenuItemType } from './Menu';

const { Sider } = Layout;

export interface SidebarProps {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  collapsible?: boolean;
  width?: number;
  collapsedWidth?: number;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  menuItems?: MenuItemType[];
  selectedKey?: string;
  onMenuClick?: (info: { key: string }) => void;
  children?: React.ReactNode;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapse,
  collapsible = true,
  width = 260,
  collapsedWidth = 80,
  header,
  menuItems,
  selectedKey,
  onMenuClick,
  children,
  className = '',
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleCollapse = (c: boolean) => {
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(c);
    }
    onCollapse?.(c);
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={isCollapsed}
      onCollapse={handleCollapse}
      trigger={null}
      width={width}
      collapsedWidth={collapsedWidth}
      theme="light"
      style={{ background: 'var(--stay-card-bg)', height: '100vh' }}
      className={`border-r border-stay-border !bg-stay-card-bg min-h-[400px] flex flex-col justify-between transition-all duration-300 shadow-2xs ${className}`}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Header Slot */}
        <div className="flex-1 flex flex-col min-h-0">
          {header && (
            <div className={`p-4 border-b border-stay-border flex items-center justify-between shrink-0 ${isCollapsed ? 'justify-center p-3' : ''}`}>
              {header}
            </div>
          )}

          {/* Navigation Menu / Content Slot */}
          <div className="p-2 space-y-2 flex-1 overflow-y-auto">
            {menuItems && (
              <Menu
                mode="inline"
                items={menuItems}
                selectedKeys={selectedKey ? [selectedKey] : undefined}
                onClick={onMenuClick}
                inlineCollapsed={isCollapsed}
              />
            )}
            {children}
          </div>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
