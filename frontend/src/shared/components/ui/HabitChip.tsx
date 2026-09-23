import React from 'react';

export interface HabitOption {
  id: string;
  label: string;
  emoji?: string;
  icon?: React.ReactNode;
}

interface HabitChipProps {
  label: string;
  emoji?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const HabitChip: React.FC<HabitChipProps> = ({
  label,
  emoji,
  icon,
  selected = false,
  onClick,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs sm:text-sm px-3 py-1.5 gap-2',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-lg border transition-all cursor-pointer select-none font-medium ${
        sizeClasses[size]
      } ${
        selected
          ? 'bg-stay-primary-subtle border-stay-primary text-stay-primary shadow-2xs font-semibold'
          : 'bg-stay-card-bg hover:bg-stay-bg-app border-stay-border text-stay-text'
      } ${className}`}
    >
      {emoji && <span className="text-sm shrink-0">{emoji}</span>}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
