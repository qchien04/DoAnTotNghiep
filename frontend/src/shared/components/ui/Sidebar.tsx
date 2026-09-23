import React, { useState } from 'react';
import { Layout } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  footer,
  menuItems,
  selectedKey,
  onMenuClick,
  children,
  className = '',
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setInternalCollapsed(nextState);
    onCollapse?.(nextState);
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={isCollapsed}
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

        {/* Footer & Collapse Toggle Slot */}
        <div className="p-3 border-t border-stay-border space-y-2 shrink-0">
          {footer}

          {collapsible && (
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold text-stay-text-secondary hover:text-stay-primary hover:bg-stay-bg-app border border-stay-border transition-all cursor-pointer"
              title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-stay-primary" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 text-stay-primary" />
                  <span>Thu gọn thanh bên</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
