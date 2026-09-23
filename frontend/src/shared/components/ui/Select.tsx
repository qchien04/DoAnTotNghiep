import React from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';
import { MultiSelect, type MultiSelectOption, type MultiSelectProps } from './MultiSelect';

export type SelectOption = {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
};

export interface SelectProps<ValueType = any, OptionType extends Record<string, any> = Record<string, any>>
  extends AntSelectProps<ValueType, OptionType> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
}

export function Select<ValueType = any, OptionType extends Record<string, any> = Record<string, any>>({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  id,
  ...props
}: SelectProps<ValueType, OptionType>) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-stay-text">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <AntSelect
        id={selectId}
        status={error ? 'error' : props.status}
        className={`w-full custom-stay-select ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-stay-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}

Select.Option = AntSelect.Option;
Select.OptGroup = AntSelect.OptGroup;
Select.Multi = MultiSelect;

export { MultiSelect, type MultiSelectOption, type MultiSelectProps };
export default Select;
