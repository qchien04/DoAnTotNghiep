import React from 'react';
import { Button as AntButton } from 'antd';
import type { ButtonProps as AntButtonProps } from 'antd';

export type ButtonVariant = 'primary' | 'bright-blue' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<AntButtonProps, 'type' | 'size' | 'loading' | 'variant'> {
  variant?: ButtonVariant;
  size?: ButtonSize | 'small' | 'middle' | 'large';
  fullWidth?: boolean;
  isLoading?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  type?: ButtonVariant | AntButtonProps['type'];
  htmlType?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> & {
  Group: typeof AntButton.Group;
} = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading,
  loading,
  icon,
  leftIcon,
  rightIcon,
  className = '',
  type,
  ...props
}) => {
  const isButtonLoading = isLoading ?? loading ?? false;
  const leadingIcon = icon || leftIcon;

  // Ánh xạ size Antd / Tailwind
  const sizeMap: Record<string, string> = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-auto',
    small: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 h-auto',
    md: 'text-sm px-4 py-2 rounded-xl gap-2 font-medium h-auto',
    middle: 'text-sm px-4 py-2 rounded-xl gap-2 font-medium h-auto',
    lg: 'text-base px-6 py-2.5 rounded-xl gap-2.5 font-semibold h-auto',
    large: 'text-base px-6 py-2.5 rounded-xl gap-2.5 font-semibold h-auto',
  };

  const resolvedVariant = (
    type && ['primary', 'bright-blue', 'secondary', 'outline', 'ghost', 'danger'].includes(type as string)
      ? type
      : variant
  ) as ButtonVariant;

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-stay-primary hover:!bg-stay-primary-hover text-white border-none shadow-sm active:scale-[0.99] transition-all',
    'bright-blue':
      'bg-blue-500 hover:!bg-stay-primary text-white border-none shadow-sm active:scale-[0.99] transition-all',
    secondary:
      'bg-stay-secondary hover:!bg-stay-secondary-hover text-white border-none shadow-sm active:scale-[0.99] transition-all',
    danger:
      'bg-red-600 hover:!bg-red-700 text-white border-none shadow-sm active:scale-[0.99] transition-all',
    outline:
      'bg-stay-card-bg hover:!bg-stay-bg-app text-stay-text border border-stay-border shadow-2xs active:scale-[0.99] transition-all',
    ghost:
      'bg-transparent hover:!bg-stay-bg-app text-stay-text border-none shadow-none active:scale-[0.99] transition-all',
  };

  return (
    <AntButton
      loading={isButtonLoading}
      block={fullWidth}
      icon={leadingIcon}
      className={`inline-flex items-center justify-center cursor-pointer transition-all ${
        sizeMap[size] || sizeMap.md
      } ${variantClasses[resolvedVariant]} ${className}`}
      {...props}
    >
      {children}
      {rightIcon && <span className="shrink-0 ml-1">{rightIcon}</span>}
    </AntButton>
  );
};

Button.Group = AntButton.Group;

export default Button;
