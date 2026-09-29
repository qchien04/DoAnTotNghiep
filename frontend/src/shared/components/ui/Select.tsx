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
  wrapperClassName?: string;
}

function extractLayoutClasses(className: string = '') {
  const layoutClasses: string[] = [];
  const otherClasses: string[] = [];

  className.split(/\s+/).forEach((cls) => {
    if (!cls) return;
    if (/^(?:(?:sm|md|lg|xl|2xl):)?(?:w-|max-w-|min-w-|flex-|basis-)/.test(cls)) {
      layoutClasses.push(cls);
    } else {
      otherClasses.push(cls);
    }
  });

  return {
    layoutClasses: layoutClasses.join(' '),
    otherClasses: otherClasses.join(' '),
  };
}

export function Select<ValueType = any, OptionType extends Record<string, any> = Record<string, any>>({
  label,
  error,
  helperText,
  fullWidth = true,
  wrapperClassName,
  className = '',
  id,
  ...props
}: SelectProps<ValueType, OptionType>) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const { layoutClasses, otherClasses } = extractLayoutClasses(className);
  const effectiveWrapperWidth = wrapperClassName !== undefined
    ? wrapperClassName
    : layoutClasses || (fullWidth ? 'w-full' : '');

  return (
    <div
      className={`${label || error || helperText ? 'space-y-1.5' : ''} ${effectiveWrapperWidth}`.trim()}
    >
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-stay-text">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <AntSelect
        id={selectId}
        status={error ? 'error' : props.status}
        className={`w-full custom-stay-select ${otherClasses}`}
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
