import React from 'react';
import { Slider as AntSlider } from 'antd';
import type { SliderSingleProps, SliderRangeProps } from 'antd/es/slider';

export type SliderProps = (SliderSingleProps | SliderRangeProps) & {
  label?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  valueDisplay?: string | React.ReactNode;
  className?: string;
};

export const Slider: React.FC<SliderProps> = ({
  label,
  helperText,
  prefix,
  suffix,
  valueDisplay,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {(label || valueDisplay) && (
        <div className="flex items-center justify-between text-xs">
          {label && <label className="font-semibold text-stay-text">{label}</label>}
          {valueDisplay && (
            <span className="font-bold text-stay-primary bg-stay-primary-subtle px-2 py-0.5 rounded-md border border-stay-border text-[11px]">
              {valueDisplay}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        {prefix && <span className="text-xs text-stay-text-secondary shrink-0">{prefix}</span>}
        <div className="flex-1">
          <AntSlider
            className="custom-antd-slider my-1.5 [&_.ant-slider-track]:!bg-stay-primary [&_.ant-slider-handle::after]:!shadow-[0_0_0_2px_var(--stay-primary)] [&_.ant-slider-handle:hover::after]:!shadow-[0_0_0_4px_var(--stay-primary)] [&_.ant-slider-rail]:!bg-stay-border"
            {...(props as any)}
          />
        </div>
        {suffix && <span className="text-xs text-stay-text-secondary shrink-0">{suffix}</span>}
      </div>

      {helperText && <p className="text-[11px] text-stay-text-muted">{helperText}</p>}
    </div>
  );
};

export default Slider;
