import React from 'react';
import { Drawer as AntDrawer } from 'antd';
import type { DrawerProps as AntDrawerProps } from 'antd';

export interface DrawerProps extends Omit<AntDrawerProps, 'open'> {
  open?: boolean;
  isOpen?: boolean; // alias for open
  children?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  isOpen,
  children,
  className = '',
  ...props
}) => {
  const visible = open !== undefined ? open : isOpen;

  return (
    <AntDrawer
      open={visible}
      className={`custom-antd-drawer ${className}`}
      {...props}
    >
      {children}
    </AntDrawer>
  );
};

// Aliases
export const AppDrawer = Drawer;
export type AppDrawerProps = DrawerProps;

export default Drawer;
