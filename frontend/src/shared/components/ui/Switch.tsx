import React from 'react';
import { Switch as AntSwitch } from 'antd';
import type { SwitchProps as AntSwitchProps } from 'antd';

export interface SwitchProps extends AntSwitchProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <AntSwitch className="mt-0.5" {...props} />
      {(label || helperText) && (
        <div className="space-y-0.5 select-none">
          {label && <div className="text-xs sm:text-sm font-medium text-stay-text">{label}</div>}
          {helperText && <div className="text-[11px] text-slate-500">{helperText}</div>}
        </div>
      )}
    </div>
  );
};

// Aliases
export const AppSwitch = Switch;

export default Switch;
