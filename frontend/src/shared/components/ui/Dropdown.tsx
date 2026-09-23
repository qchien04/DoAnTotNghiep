import React, { useState } from 'react';
import { Dropdown as AntDropdown, Popover as AntPopover } from 'antd';
import type { DropDownProps as AntDropDownProps, PopoverProps as AntPopoverProps } from 'antd';

export interface DropdownProps extends AntDropDownProps {
  children: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({ children, ...props }) => {
  return (
    <AntDropdown
      trigger={['click']}
      overlayClassName="custom-antd-dropdown"
      {...props}
    >
      {children}
    </AntDropdown>
  );
};

export const AppDropdown = Dropdown;

export interface PopoverProps extends AntPopoverProps {
  children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ children, ...props }) => {
  return (
    <AntPopover
      trigger={['click']}
      overlayClassName="custom-antd-popover"
      {...props}
    >
      {children}
    </AntPopover>
  );
};

export const AppPopover = Popover;

// Popover popup wrapper for arbitrary content with function-as-a-child support
export interface PopupProps extends Omit<AntPopoverProps, 'children' | 'content' | 'trigger'> {
  trigger: React.ReactNode;
  content?: React.ReactNode;
  children?: React.ReactNode | ((close: () => void) => React.ReactNode);
}

export const Popup: React.FC<PopupProps> = ({ trigger, content, children, ...props }) => {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const renderContent = () => {
    if (typeof children === 'function') {
      return children(close);
    }
    return content || children;
  };

  return (
    <AntPopover
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      content={renderContent()}
      overlayClassName="custom-antd-popup"
      {...props}
    >
      <span className="inline-block cursor-pointer">{trigger}</span>
    </AntPopover>
  );
};

export const PopupItem: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  className?: string;
}> = ({ children, icon, onClick, destructive = false, className = '' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
        destructive
          ? 'text-red-600 hover:bg-red-50'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </button>
  );
};

export const PopupDivider: React.FC = () => {
  return <div className="my-1 border-t border-stay-border" />;
};

export default Dropdown;
