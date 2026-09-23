import React, { forwardRef } from 'react';
import { Input as AntInput } from 'antd';
import type { InputProps as AntInputProps, InputRef } from 'antd';
import type { TextAreaProps, SearchProps, PasswordProps } from 'antd/es/input';
import type { OTPProps } from 'antd/es/input/OTP';

export interface InputProps extends AntInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const InputBase = forwardRef<InputRef, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      id,
      prefix,
      suffix,
      status,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-stay-text">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <AntInput
          id={inputId}
          ref={ref}
          prefix={prefix || leftIcon}
          suffix={suffix || rightIcon}
          status={error ? 'error' : status}
          className={`w-full py-2 px-3.5 rounded-xl border-stay-border text-xs sm:text-sm text-stay-text hover:border-stay-primary focus:border-stay-primary transition-all ${className}`}
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
);

InputBase.displayName = 'Input';

export const Input = InputBase as typeof InputBase & {
  Password: typeof AntInput.Password;
  Search: typeof AntInput.Search;
  TextArea: typeof AntInput.TextArea;
  OTP: typeof AntInput.OTP;
};

Input.Password = AntInput.Password;
Input.Search = AntInput.Search;
Input.TextArea = AntInput.TextArea;
Input.OTP = AntInput.OTP;

export type { TextAreaProps, SearchProps, PasswordProps, OTPProps };
export default Input;
