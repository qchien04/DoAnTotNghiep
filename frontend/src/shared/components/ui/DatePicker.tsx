import React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import type { DatePickerProps as AntDatePickerProps } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';

export interface DatePickerProps extends AntDatePickerProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> & {
  RangePicker: typeof AntDatePicker.RangePicker;
} = ({
  label,
  error,
  helperText,
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-xs font-semibold text-stay-text">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <AntDatePicker
        className={`w-full py-2 px-3 rounded-xl border-stay-border shadow-2xs hover:border-stay-primary focus:border-stay-primary transition-all ${
          error ? 'border-red-400 focus:border-red-500 bg-red-50/20' : ''
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-red-500 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export const RangePicker: React.FC<RangePickerProps & { label?: string; error?: string }> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-stay-text">{label}</label>
      )}
      <AntDatePicker.RangePicker
        className={`w-full py-2 px-3 rounded-xl border-stay-border shadow-2xs hover:border-stay-primary focus:border-stay-primary transition-all ${
          error ? 'border-red-400 focus:border-red-500 bg-red-50/20' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
};

DatePicker.RangePicker = AntDatePicker.RangePicker;

// Aliases
export const AppDatePicker = DatePicker;
export const DateRangePicker = RangePicker;
export const AppRangePicker = RangePicker;

export default DatePicker;
