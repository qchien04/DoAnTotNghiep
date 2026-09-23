import React from 'react';
import { Menu as AntMenu } from 'antd';
import type { MenuProps as AntMenuProps } from 'antd';
export type { MenuItemProps } from 'antd';

export type MenuItemType = Required<AntMenuProps>['items'][number];

export interface MenuProps extends AntMenuProps {
  className?: string;
  variant?: 'default' | 'card' | 'pills';
}

export const Menu: React.FC<MenuProps> & {
  Item: typeof AntMenu.Item;
  SubMenu: typeof AntMenu.SubMenu;
  ItemGroup: typeof AntMenu.ItemGroup;
  Divider: typeof AntMenu.Divider;
} = ({
  mode = 'inline',
  className = '',
  variant = 'default',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'card':
        return 'bg-stay-card-bg border border-stay-border rounded-2xl p-2 shadow-xs';
      case 'pills':
        return 'bg-stay-bg-app border border-stay-border rounded-2xl p-1.5 [&_.ant-menu-item-selected]:!bg-stay-card-bg [&_.ant-menu-item-selected]:!shadow-xs';
      default:
        return 'bg-transparent border-r-0';
    }
  };

  return (
    <AntMenu
      mode={mode}
      style={{ background: 'transparent' }}
      className={`custom-stay-menu text-xs font-medium !text-stay-text [&_.ant-menu-item]:!text-stay-text [&_.ant-menu-item]:!rounded-xl [&_.ant-menu-item]:!my-1 [&_.ant-menu-item:hover]:!text-stay-primary [&_.ant-menu-item-selected]:!bg-stay-primary-subtle [&_.ant-menu-item-selected]:!text-stay-primary [&_.ant-menu-item-selected]:!font-semibold [&_.ant-menu-submenu-title]:!text-stay-text [&_.ant-menu-submenu-title]:!rounded-xl [&_.ant-menu-submenu-selected>.ant-menu-submenu-title]:!text-stay-primary ${getVariantClass()} ${className}`}
      {...props}
    />
  );
};

// Subcomponents attachment
Menu.Item = AntMenu.Item;
Menu.SubMenu = AntMenu.SubMenu;
Menu.ItemGroup = AntMenu.ItemGroup;
Menu.Divider = AntMenu.Divider;

export default Menu;
