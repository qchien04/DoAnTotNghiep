import React from 'react';
import { Form as AntForm } from 'antd';
import type { FormProps as AntFormProps, FormItemProps as AntFormItemProps } from 'antd';
export type { FormInstance } from 'antd';

export interface FormProps<T = any> extends AntFormProps<T> {
  children?: React.ReactNode;
  className?: string;
}

export interface FormItemProps extends AntFormItemProps {
  children?: React.ReactNode;
  className?: string;
  helperText?: string;
}

export interface FormGroupProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export interface FormRowProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

// 1. Form Container
export const Form = (<T,>({
  layout = 'vertical',
  requiredMark = false,
  className = '',
  children,
  ...props
}: FormProps<T>) => {
  return (
    <AntForm
      layout={layout}
      requiredMark={requiredMark}
      className={`custom-stay-form [&_.ant-form-item-label_label]:!text-xs [&_.ant-form-item-label_label]:!font-semibold [&_.ant-form-item-label_label]:!text-stay-text [&_.ant-form-item-optional]:!hidden [&_.ant-form-item-explain-error]:!text-xs [&_.ant-form-item-explain-error]:!font-medium ${className}`}
      {...props}
    >
      {children}
    </AntForm>
  );
}) as (<T = any>(props: FormProps<T>) => React.ReactElement) & {
  Item: typeof FormItem;
  Group: typeof FormGroup;
  Row: typeof FormRow;
  Actions: typeof FormActions;
  useForm: typeof AntForm.useForm;
  useWatch: typeof AntForm.useWatch;
};

// 2. Form.Item
export const FormItem: React.FC<FormItemProps> = ({
  className = '',
  helperText,
  children,
  ...props
}) => {
  return (
    <AntForm.Item
      className={`mb-4 ${className}`}
      extra={helperText ? <span className="text-[11px] text-stay-text-muted">{helperText}</span> : undefined}
      {...props}
    >
      {children}
    </AntForm.Item>
  );
};

// 3. Form.Group
export const FormGroup: React.FC<FormGroupProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-stay-card-bg border border-stay-border shadow-2xs space-y-4 ${className}`}>
      {(title || description) && (
        <div className="pb-3 border-b border-stay-border-subtle flex items-start gap-2.5">
          {icon && <span className="text-stay-primary mt-0.5">{icon}</span>}
          <div>
            {title && <h4 className="text-sm font-bold text-stay-text">{title}</h4>}
            {description && <p className="text-xs text-stay-text-secondary mt-0.5">{description}</p>}
          </div>
        </div>
      )}
      <div className="space-y-3">{children}</div>
    </div>
  );
};

// 4. Form.Row
export const FormRow: React.FC<FormRowProps> = ({
  children,
  cols = 2,
  className = '',
}) => {
  const colClasses = {
    1: 'grid grid-cols-1',
    2: 'grid grid-cols-1 sm:grid-cols-2',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return <div className={`gap-4 ${colClasses[cols]} ${className}`}>{children}</div>;
};

// 5. Form.Actions
export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className = '',
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div className={`pt-4 border-t border-stay-border-subtle flex items-center gap-3 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

// Attachments
Form.Item = FormItem;
Form.Group = FormGroup;
Form.Row = FormRow;
Form.Actions = FormActions;
Form.useForm = AntForm.useForm;
Form.useWatch = AntForm.useWatch;

export default Form;
