import React from 'react';
import { User } from 'lucide-react';

export interface UserAvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const getInitials = (name?: string | null): string => {
  if (!name || !name.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const SIZE_MAP = {
  xs: {
    container: 'w-6 h-6 text-[11px]',
    icon: 'w-3 h-3',
  },
  sm: {
    container: 'w-7 h-7 text-xs',
    icon: 'w-3.5 h-3.5',
  },
  md: {
    container: 'w-9 h-9 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    container: 'w-12 h-12 text-base',
    icon: 'w-6 h-6',
  },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'sm',
  className = '',
}) => {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.sm;
  const initials = getInitials(name);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        className={`${sizeConfig.container} rounded-full object-cover shrink-0 border border-stay-border ${className}`}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`${sizeConfig.container} rounded-full bg-stay-primary-subtle text-stay-primary font-semibold flex items-center justify-center shrink-0 border border-stay-primary/20 select-none ${className}`}
        title={name || undefined}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${sizeConfig.container} rounded-full bg-stay-bg-app text-stay-text-secondary flex items-center justify-center shrink-0 border border-stay-border ${className}`}
    >
      <User className={sizeConfig.icon} />
    </div>
  );
};

export default UserAvatar;
