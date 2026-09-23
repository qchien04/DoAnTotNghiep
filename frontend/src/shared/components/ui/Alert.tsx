import React from 'react';
import { Alert as AntAlert } from 'antd';
import type { AlertProps as AntAlertProps } from 'antd';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<AntAlertProps, 'type' | 'variant'> {
  variant?: AlertVariant;
  type?: AlertVariant;
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  type,
  title,
  message,
  description,
  children,
  showIcon = true,
  className = '',
  ...props
}) => {
  const alertType = type || variant;
  const alertMessage = title || message;
  const alertDescription = children || description;

  return (
    <AntAlert
      type={alertType}
      message={alertMessage}
      description={alertDescription}
      showIcon={showIcon}
      className={`rounded-xl border shadow-2xs text-xs sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Aliases
export const AppAlert = Alert;
export type AppAlertProps = AlertProps;

export default Alert;
