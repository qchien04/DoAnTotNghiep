import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Tooltip } from 'antd';

interface VerifiedLandlordBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const VerifiedLandlordBadge: React.FC<VerifiedLandlordBadgeProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 18,
  };

  const badgeContent = (
    <span
      className={`inline-flex items-center rounded-full font-medium shadow-xs transition-colors
        bg-emerald-50 text-emerald-700 border border-emerald-300/80
        dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700/60
        ${sizeClasses[size]} ${className}`}
    >
      <ShieldCheck size={iconSizes[size]} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
      {showText && <span>Chủ trọ xác minh</span>}
    </span>
  );

  return (
    <Tooltip title="Chủ trọ đã được Ban quản trị xác minh giấy tờ nhà/đất hoặc hợp đồng ủy quyền">
      {badgeContent}
    </Tooltip>
  );
};

