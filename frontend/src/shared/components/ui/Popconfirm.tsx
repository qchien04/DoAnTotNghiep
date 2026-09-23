import React from 'react';
import { Popconfirm as AntPopconfirm } from 'antd';
import type { PopconfirmProps as AntPopconfirmProps } from 'antd';

export interface PopconfirmProps extends AntPopconfirmProps {
  className?: string;
}

export const Popconfirm: React.FC<PopconfirmProps> = ({
  okText = 'Xác nhận',
  cancelText = 'Hủy',
  okType = 'primary',
  ...props
}) => {
  return (
    <AntPopconfirm
      okText={okText}
      cancelText={cancelText}
      okType={okType}
      okButtonProps={{ className: 'bg-stay-primary hover:bg-stay-primary-hover shadow-xs font-medium' }}
      {...props}
    />
  );
};

export default Popconfirm;
