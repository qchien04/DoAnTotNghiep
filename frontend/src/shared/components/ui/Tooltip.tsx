import React from 'react';
import { Tooltip as AntTooltip } from 'antd';
import type { TooltipProps as AntTooltipProps } from 'antd';

export interface TooltipProps extends AntTooltipProps {
  children: React.ReactElement;
  text?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  placement = 'top',
  title,
  text,
  ...props
}) => {
  return (
    <AntTooltip
      placement={placement}
      overlayClassName="custom-antd-tooltip "
      title={title ?? text}
      {...props}
    >
      {children}
    </AntTooltip>
  );
};

// Aliases
export const AppTooltip = Tooltip;

export default Tooltip;
