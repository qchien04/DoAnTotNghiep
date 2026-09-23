import React from 'react';
import { Radio as AntRadio } from 'antd';
import type { RadioProps as AntRadioProps, RadioGroupProps as AntRadioGroupProps } from 'antd';

export interface RadioProps extends AntRadioProps {
  label?: React.ReactNode;
}

export const Radio: React.FC<RadioProps> & {
  Group: typeof AntRadio.Group;
  Button: typeof AntRadio.Button;
} = ({
  label,
  children,
  ...props
}) => {
  return (
    <AntRadio {...props}>
      {children || label}
    </AntRadio>
  );
};

Radio.Group = AntRadio.Group;
Radio.Button = AntRadio.Button;

// Aliases
export const AppRadio = Radio;
export const RadioGroup = AntRadio.Group;
export const RadioButton = AntRadio.Button;
export type { AntRadioGroupProps as RadioGroupProps };

export default Radio;
