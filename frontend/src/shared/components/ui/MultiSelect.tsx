import React from 'react';
import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';
import { ChevronDown, X } from 'lucide-react';

export interface MultiSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  emoji?: string;
  badge?: string;
}

export interface MultiSelectProps extends Omit<AntSelectProps, 'mode' | 'options' | 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: MultiSelectOption[];
  value?: (string | number)[];
  defaultValue?: (string | number)[];
  onChange?: (values: (string | number)[]) => void;
  placeholder?: string;
  maxTagCount?: number | 'responsive';
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  helperText,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Chọn các mục...',
  maxTagCount = 'responsive',
  fullWidth = true,
  className = '',
  disabled,
  allowClear = true,
  ...props
}) => {
  const antdOptions = options.map((opt) => ({
    value: opt.value,
    label: (
      <div className="flex items-center justify-between w-full py-0.5">
        <div className="flex items-center gap-2">
          {opt.emoji && <span className="text-sm">{opt.emoji}</span>}
          {opt.icon && <span className="text-stay-text-secondary">{opt.icon}</span>}
          <span className="font-medium">{opt.label}</span>
        </div>
        {opt.badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stay-primary-subtle text-stay-primary border border-stay-border-subtle">
            {opt.badge}
          </span>
        )}
      </div>
    ),
    rawLabel: opt.label,
    disabled: opt.disabled,
  }));

  return (
    <div className={`space-y-1.5 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-xs font-semibold text-stay-text">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <AntSelect
        mode="multiple"
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={placeholder}
        options={antdOptions}
        disabled={disabled}
        allowClear={
          allowClear
            ? {
              clearIcon: <X className="w-3.5 h-3.5 text-stay-text-muted hover:text-stay-text" />,
            }
            : false
        }
        maxTagCount={maxTagCount}
        suffixIcon={<ChevronDown className="w-4 h-4 text-stay-text-muted" />}
        tagRender={({ label: tagLabel, closable, onClose, value: tagVal }) => {
          const opt = options.find((o) => o.value === tagVal);
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-stay-primary-subtle border border-stay-border text-stay-primary text-xs font-semibold m-0.5 shadow-2xs">
              {opt?.emoji && <span>{opt.emoji}</span>}
              <span>{opt?.label || tagLabel}</span>
              {closable && (
                <button
                  type="button"
                  onClick={onClose}
                  className="hover:bg-stay-primary/10 rounded p-0.5 transition-colors cursor-pointer text-stay-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          );
        }}
        className={`w-full custom-antd-multiselect [&_.ant-select-selector]:!bg-stay-card-bg [&_.ant-select-selector]:!border-stay-border [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!min-h-[42px] [&_.ant-select-selector]:!py-1 ${error ? '[&_.ant-select-selector]:!border-red-400' : ''
          } ${className}`}
        {...props}
      />

      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-stay-text-muted">{helperText}</p>}
    </div>
  );
};

export default MultiSelect;
