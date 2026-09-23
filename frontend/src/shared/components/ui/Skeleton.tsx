import React from 'react';
import { Skeleton as AntSkeleton } from 'antd';
import type { SkeletonProps as AntSkeletonProps } from 'antd';

export interface SkeletonProps extends AntSkeletonProps {
  type?: 'default' | 'card' | 'avatar' | 'table' | 'text';
  count?: number;
  lines?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> & {
  Card: typeof SkeletonCard;
  Text: typeof SkeletonText;
  Avatar: typeof SkeletonAvatar;
  Table: typeof SkeletonTable;
  Input: typeof AntSkeleton.Input;
  Button: typeof AntSkeleton.Button;
  Image: typeof AntSkeleton.Image;
  Node: typeof AntSkeleton.Node;
} = ({
  type = 'default',
  active = true,
  count = 1,
  lines = 3,
  className = '',
  ...props
}) => {
  if (type === 'avatar') {
    return (
      <div className={`p-4 bg-stay-card-bg rounded-2xl border border-stay-border flex items-center gap-3 shadow-2xs w-full ${className}`}>
        <AntSkeleton.Avatar active={active} size="large" shape="circle" />
        <div className="flex-1 space-y-2">
          <AntSkeleton.Input active={active} size="small" block style={{ width: '45%', height: 16 }} />
          <AntSkeleton.Input active={active} size="small" block style={{ width: '80%', height: 14 }} />
        </div>
      </div>
    );
  }

  if (type === 'card') {
    const renderCard = (key: number) => (
      <div key={key} className="rounded-2xl border border-stay-border bg-stay-card-bg p-4 shadow-2xs overflow-hidden space-y-4 w-full">
        {/* Skeleton Image Area (Full width banner) */}
        <div className="w-full h-40 overflow-hidden rounded-xl bg-stay-bg-app [&_.ant-skeleton-element]:!w-full [&_.ant-skeleton-element]:!h-full [&_.ant-skeleton-image]:!w-full [&_.ant-skeleton-image]:!h-full [&_.ant-skeleton-image]:!flex [&_.ant-skeleton-image]:!items-center [&_.ant-skeleton-image]:!justify-center">
          <AntSkeleton.Image active={active} />
        </div>

        {/* Skeleton Details (User, Title, Paragraph) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <AntSkeleton.Avatar active={active} size="small" shape="circle" />
            <AntSkeleton.Input active={active} size="small" block style={{ width: '55%', height: 16 }} />
          </div>
          <AntSkeleton
            active={active}
            title={{ width: '85%' }}
            paragraph={{ rows: 2, width: ['100%', '70%'] }}
          />
        </div>
      </div>
    );

    if (count > 1) {
      return (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 w-full ${className}`}>
          {Array.from({ length: count }).map((_, i) => renderCard(i))}
        </div>
      );
    }

    return <div className={`w-full ${className}`}>{renderCard(0)}</div>;
  }

  if (type === 'table') {
    return (
      <div className={`p-4 bg-stay-card-bg rounded-2xl border border-stay-border space-y-3 shadow-2xs w-full ${className}`}>
        <AntSkeleton.Input active={active} size="large" block style={{ height: 38 }} />
        {Array.from({ length: lines }).map((_, i) => (
          <AntSkeleton.Input key={i} active={active} size="default" block style={{ height: 42 }} />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`p-4 bg-stay-card-bg rounded-2xl border border-stay-border shadow-2xs w-full ${className}`}>
        <AntSkeleton active={active} title={{ width: '45%' }} paragraph={{ rows: lines, width: ['100%', '90%', '75%', '60%'].slice(0, lines) }} />
      </div>
    );
  }

  return <AntSkeleton active={active} className={className} {...props} />;
};

// Helper Sub-components for quick layout skeleton rendering
export const SkeletonCard: React.FC<{ count?: number; className?: string }> = ({ count = 1, className }) => (
  <Skeleton type="card" count={count} className={className} />
);

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className }) => (
  <Skeleton type="text" lines={lines} className={className} />
);

export const SkeletonAvatar: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton type="avatar" className={className} />
);

export const SkeletonTable: React.FC<{ lines?: number; className?: string }> = ({ lines = 4, className }) => (
  <Skeleton type="table" lines={lines} className={className} />
);

// Re-export Antd Skeleton subcomponents
export const SkeletonInput = AntSkeleton.Input;
export const SkeletonButton = AntSkeleton.Button;
export const SkeletonImage = AntSkeleton.Image;
export const SkeletonNode = AntSkeleton.Node;

// Attach subcomponents to Skeleton
Skeleton.Card = SkeletonCard;
Skeleton.Text = SkeletonText;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Table = SkeletonTable;
Skeleton.Input = SkeletonInput;
Skeleton.Button = SkeletonButton;
Skeleton.Image = SkeletonImage;
Skeleton.Node = SkeletonNode;

// Aliases
export const AppSkeleton = Skeleton;
export type AppSkeletonProps = SkeletonProps;

export default Skeleton;
