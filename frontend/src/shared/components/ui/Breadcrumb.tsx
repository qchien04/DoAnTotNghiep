import React from 'react';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import type { BreadcrumbProps as AntBreadcrumbProps } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

export interface BreadcrumbProps extends AntBreadcrumbProps {
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> & {
  Item: typeof AntBreadcrumb.Item;
} = ({
  className = '',
  items,
  ...props
}) => {
  return (
    <AntBreadcrumb
      className={`text-xs sm:text-sm font-medium py-2 text-slate-600 ${className}`}
      items={items}
      {...props}
    />
  );
};

Breadcrumb.Item = AntBreadcrumb.Item;

export const BreadcrumbHomeIcon = HomeOutlined;
export default Breadcrumb;
