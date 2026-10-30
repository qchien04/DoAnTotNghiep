import React from 'react';

interface RoomiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const RoomiLogo: React.FC<RoomiLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center justify-center gap-2.5 select-none ${className}`}>
      {showText ? (
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-icon.png"
            alt="Roomi Icon"
            className={`${iconSizes[size]} object-contain shrink-0 drop-shadow-xs`}
            onError={(e) => {
              // fallback if public url differs
              (e.target as HTMLImageElement).src = '/image.png';
            }}
          />
          <span className={`font-black tracking-tight text-stay-primary leading-none ${textSizes[size]}`}>
            Roomi
          </span>
        </div>
      ) : (
        <img
          src="/logo-icon.png"
          alt="Roomi"
          className={`${iconSizes[size]} object-contain shrink-0 drop-shadow-xs`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/image.png';
          }}
        />
      )}
    </div>
  );
};