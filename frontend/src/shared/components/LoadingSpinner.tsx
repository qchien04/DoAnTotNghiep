import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'default' | 'large';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Đang tải dữ liệu...',
  size = 'default',
  className = '',
}) => {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: size === 'small' ? 18 : size === 'large' ? 36 : 24,
        color: 'var(--stay-primary, #2563EB)',
      }}
      spin
    />
  );

  return (
    <div className={`flex flex-col items-center justify-center p-8 gap-3 select-none ${className}`}>
      <Spin indicator={antIcon} size={size} tip={text} />
      {text && <p className="text-xs text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
