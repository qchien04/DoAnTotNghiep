import React from 'react';
import { Upload as AntUpload } from 'antd';
import type { UploadProps as AntUploadProps } from 'antd';
import { InboxOutlined, CloudUploadOutlined } from '@ant-design/icons';

const { Dragger: AntDragger } = AntUpload;

export interface UploadProps extends AntUploadProps {
  children?: React.ReactNode;
}

export const Upload: React.FC<UploadProps> & {
  Dragger: typeof Dragger;
} = ({ children, ...props }) => {
  return (
    <AntUpload {...props}>
      {children}
    </AntUpload>
  );
};

export interface DraggerProps extends AntUploadProps {
  title?: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
}

export const Dragger: React.FC<DraggerProps> = ({
  title = 'Nhấp hoặc kéo thả tệp vào khu vực này để tải lên',
  hint = 'Hỗ trợ định dạng JPG, PNG, PDF (tối đa 10MB)',
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <AntDragger
      className={`rounded-2xl border-2 border-dashed border-stay-border hover:border-stay-primary bg-stay-bg-app p-6 transition-all ${className}`}
      {...props}
    >
      {children ? (
        children
      ) : (
        <div className="space-y-2 py-4">
          <p className="text-4xl text-stay-primary">
            {icon || <InboxOutlined />}
          </p>
          <p className="text-sm font-semibold text-stay-text">{title}</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{hint}</p>
        </div>
      )}
    </AntDragger>
  );
};

Upload.Dragger = Dragger;

// Aliases
export const AppUpload = Upload;
export const UploadDragger = Dragger;
export const UploadIcon = CloudUploadOutlined;

export default Upload;
