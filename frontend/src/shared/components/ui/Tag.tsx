import React from 'react';
import { Tag as AntTag } from 'antd';
import type { TagProps as AntTagProps } from 'antd';

export type TagStatus = 'available' | 'rented' | 'pending' | 'verified' | 'match';

export interface TagProps extends AntTagProps {
  status?: TagStatus;
  children?: React.ReactNode;
}

export const Tag: React.FC<TagProps> & {
  CheckableTag: typeof AntTag.CheckableTag;
} = ({
  status,
  children,
  className = '',
  ...props
}) => {
  const getStatusProps = () => {
    switch (status) {
      case 'available':
        return {
          color: 'success',
          className: 'border-stay-border bg-stay-secondary-subtle text-stay-secondary font-semibold',
        };
      case 'rented':
        return {
          color: 'error',
          className: 'border-red-200 bg-red-50 text-red-600 font-semibold',
        };
      case 'pending':
        return {
          color: 'warning',
          className: 'border-amber-200 bg-amber-50 text-amber-700 font-semibold',
        };
      case 'verified':
        return {
          color: 'processing',
          className: 'border-stay-border bg-stay-primary-subtle text-stay-primary font-semibold',
        };
      case 'match':
        return {
          color: 'success',
          className: 'border-stay-border bg-stay-match-subtle text-stay-match font-bold',
        };
      default:
        return {};
    }
  };

  const statusConfig = getStatusProps();

  return (
    <AntTag
      className={`rounded-lg px-2.5 py-0.5 text-xs inline-flex items-center gap-1 ${statusConfig.className || ''} ${className}`}
      {...statusConfig}
      {...props}
    >
      {children}
    </AntTag>
  );
};

Tag.CheckableTag = AntTag.CheckableTag;

// Aliases
export const AppTag = Tag;
export const CheckableTag = AntTag.CheckableTag;

export default Tag;
