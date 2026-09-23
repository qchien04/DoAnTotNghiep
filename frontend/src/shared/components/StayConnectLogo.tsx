import React from 'react';

interface StayConnectLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const StayConnectLogo: React.FC<StayConnectLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brand Icon SVG */}
      <div className={`relative flex items-center justify-center rounded-xl bg-stay-primary-subtle p-1.5 shadow-xs border border-stay-border ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-0.5"
        >
          {/* House Roof & Outline */}
          <path
            d="M18 4L4 15V30C4 31.1 4.9 32 6 32H30C31.1 32 32 31.1 32 30V15L18 4Z"
            fill="var(--stay-card-bg, #FFFFFF)"
            stroke="var(--stay-primary, #2563EB)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M18 4L3 16"
            stroke="var(--stay-secondary, #16A34A)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M18 4L33 16"
            stroke="var(--stay-primary, #2563EB)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Left Person (Secondary) */}
          <circle cx="13" cy="19" r="2.8" fill="var(--stay-secondary, #16A34A)" />
          <path
            d="M8.5 28C8.5 24.5 10.5 23 13 23C15.5 23 17.5 24.5 17.5 28"
            stroke="var(--stay-secondary, #16A34A)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Right Person (Primary) */}
          <circle cx="23" cy="19" r="2.8" fill="var(--stay-primary, #2563EB)" />
          <path
            d="M18.5 28C18.5 24.5 20.5 23 23 23C25.5 23 27.5 24.5 27.5 28"
            stroke="var(--stay-primary, #2563EB)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Connection Arc (Match) */}
          <path
            d="M14.5 21C16.5 19.8 19.5 19.8 21.5 21"
            stroke="var(--stay-match, #10B981)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-stay-text ${textSizes[size]}`}>
            <span className="text-stay-secondary">Stay</span>
            <span className="text-stay-primary">Connect</span>
          </span>
        </div>
      )}
    </div>
  );
};
