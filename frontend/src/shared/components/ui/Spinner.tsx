import React from 'react';
import { Spin as AntSpin } from 'antd';
import type { SpinProps as AntSpinProps } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export type SpinnerSize = 'small' | 'default' | 'large' | 'xs' | 'sm' | 'md' | 'lg';

export interface SpinnerProps extends Omit<AntSpinProps, 'size'> {
  size?: SpinnerSize;
  label?: string;
  color?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'default',
  label,
  tip,
  color = '#2563EB',
  indicator,
  className = '',
  fullScreen = false,
  ...props
}) => {
  const getPixelSize = () => {
    switch (size) {
      case 'xs':
      case 'small':
        return 16;
      case 'lg':
      case 'large':
        return 32;
      case 'md':
      case 'sm':
      case 'default':
      default:
        return 22;
    }
  };

  const resolvedColor =
    color === 'secondary'
      ? 'var(--stay-secondary, #16A34A)'
      : color === 'primary' || color === '#2563EB'
        ? 'var(--stay-primary, #2F53E8)'
        : color;

  const spinIndicator = indicator || (
    <LoadingOutlined style={{ fontSize: getPixelSize(), color: resolvedColor }} spin />
  );

  const content = (
    <div className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <AntSpin indicator={spinIndicator} tip={label} {...props} />
      {/* {label && !tip && <span className="text-xs text-stay-text-secondary font-medium">{label}</span>} */}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stay-bg-app/70 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
};

// Aliases
export const Spin = Spinner;
export const AppSpin = Spinner;
export type AppSpinProps = SpinnerProps;

export default Spinner;
