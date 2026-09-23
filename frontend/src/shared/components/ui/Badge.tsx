import React from 'react';
import { ShieldCheck } from 'lucide-react';

export type BadgeVariant = 'match' | 'verified' | 'primary' | 'secondary' | 'outline' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  icon,
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const variantClasses: Record<BadgeVariant, string> = {
    // Green high-contrast match badge used for profile compatibility (94% Match)
    match: 'bg-stay-match-subtle text-stay-match-dark border border-stay-border font-bold',
    // Verified room badge used for verified landlords/listings
    verified: 'bg-stay-secondary text-white font-medium shadow-xs',
    primary: 'bg-stay-primary-subtle text-stay-primary border border-stay-border font-semibold',
    secondary: 'bg-stay-secondary-subtle text-stay-secondary border border-stay-border font-semibold',
    outline: 'bg-stay-card-bg text-stay-text border border-stay-border font-medium',
    neutral: 'bg-stay-bg-app text-stay-text-secondary border border-stay-border font-medium',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full transition-all ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {variant === 'verified' && !icon && <ShieldCheck className="w-3.5 h-3.5" />}
      {icon}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
