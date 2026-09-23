import React from 'react';
import { Checkbox as AntCheckbox } from 'antd';
import type { CheckboxProps as AntCheckboxProps, CheckboxGroupProps } from 'antd/es/checkbox';

export type { CheckboxGroupProps };

export interface CheckboxProps extends AntCheckboxProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> & {
  Group: typeof AntCheckbox.Group;
} = ({
  label,
  description,
  children,
  className = '',
  ...props
}) => {
  const content = children || label;

  return (
    <div className={`inline-flex items-start gap-2.5 ${className}`}>
      <AntCheckbox className="mt-0.5" {...props}>
        {content}
      </AntCheckbox>
      {description && <p className="text-[11px] text-slate-500 pl-6 -mt-1">{description}</p>}
    </div>
  );
};

Checkbox.Group = AntCheckbox.Group;

// Aliases
export const AppCheckbox = Checkbox;
export const CheckboxGroup = AntCheckbox.Group;

export default Checkbox;
