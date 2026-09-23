import React from 'react';
import { StayConnectSearchBar, SearchFilters } from './StayConnectSearchBar';
import { ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

interface StayConnectHeroProps {
  onSearch?: (filters: SearchFilters) => void;
  className?: string;
}

export const StayConnectHero: React.FC<StayConnectHeroProps> = ({
  onSearch,
  className = '',
}) => {
  return (
    <section className={`relative pt-8 pb-12 overflow-hidden ${className}`}>
      {/* Background Soft Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-50/70 via-indigo-50/30 to-transparent pointer-events-none rounded-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Headline & Subheadline */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stay-primary-subtle text-stay-primary text-xs font-semibold border border-stay-border shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nền tảng kết nối phòng trọ & bạn ở ghép thông minh #1</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stay-text tracking-tight leading-tight sm:leading-snug">
            Chốn An Cư – <span className="text-stay-primary">Bạn Cùng Gu</span>
          </h1>

          <p className="text-sm sm:text-base text-stay-text-secondary leading-relaxed font-normal max-w-2xl mx-auto">
            Nền tảng xác thực phòng trọ chính chủ và kết nối người ở ghép dựa trên độ tương thích thói quen sống.
          </p>
        </div>

        {/* Hero Vector Illustration (Cozy Living Room with Roommates) */}
        <div className="relative max-w-4xl mx-auto mb-[-2rem] sm:mb-[-3rem] z-10">
          <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-blue-100/50 to-emerald-50/40 p-4 sm:p-6 border border-stay-border flex items-center justify-center min-h-[220px] sm:min-h-[300px]">
            {/* SVG Flat Vector Artwork depicting roommates hanging out */}
            <svg
              viewBox="0 0 900 360"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto max-h-[340px] drop-shadow-sm select-none pointer-events-none"
            >
              {/* Living Room Background elements: Wall picture, window, lamp */}
              <rect x="120" y="40" width="100" height="70" rx="8" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
              <circle cx="170" cy="75" r="16" fill="#93C5FD" />
              <path d="M130 95L155 75L180 95H130Z" fill="#38A169" />

              {/* Floor Lamp */}
              <path d="M80 60L100 100H60L80 60Z" fill="#FCD34D" />
              <line x1="80" y1="100" x2="80" y2="300" stroke="#64748B" strokeWidth="4" />
              <ellipse cx="80" cy="300" rx="25" ry="6" fill="#94A3B8" />

              {/* Plant Pot */}
              <rect x="790" y="220" width="40" height="60" rx="4" fill="#EA580C" />
              <path d="M810 220C810 160 840 180 840 160" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" />
              <path d="M810 220C810 170 780 180 780 170" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" />
              <path d="M810 220C810 150 810 140 810 140" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" />

              {/* Big Cozy Sofa */}
              <rect x="230" y="190" width="340" height="90" rx="20" fill="#93C5FD" />
              <rect x="210" y="180" width="40" height="90" rx="12" fill="#60A5FA" />
              <rect x="550" y="180" width="40" height="90" rx="12" fill="#60A5FA" />
              <rect x="250" y="140" width="140" height="70" rx="12" fill="#60A5FA" />
              <rect x="410" y="140" width="140" height="70" rx="12" fill="#60A5FA" />

              {/* Person 1: Sitting on sofa with laptop */}
              <circle cx="310" cy="120" r="22" fill="#FDBA74" />
              <path d="M295 105C295 100 325 100 325 105C325 110 320 115 295 105Z" fill="#1E293B" />
              <path d="M285 142C285 130 335 130 335 142V200H285V142Z" fill="var(--stay-primary, #2563EB)" />
              {/* Laptop */}
              <rect x="310" y="175" width="45" height="28" rx="3" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />

              {/* Person 2: Roommate female sitting next smiling */}
              <circle cx="430" cy="122" r="22" fill="#FDBA74" />
              <path d="M410 115C410 95 450 95 450 115V135H410V115Z" fill="#7C2D12" />
              <path d="M405 144C405 132 455 132 455 144V200H405V144Z" fill="var(--stay-secondary, #16A34A)" />

              {/* Standing Roommate 3 (Male chatting with glass/mug) */}
              <circle cx="680" cy="115" r="24" fill="#FDBA74" />
              <path d="M662 100C662 90 698 90 698 100C698 110 680 115 662 100Z" fill="#0F172A" />
              <path d="M655 139C655 125 705 125 705 139V250H655V139Z" fill="#1E3A8A" />
              <line x1="670" y1="250" x2="670" y2="330" stroke="#334155" strokeWidth="12" strokeLinecap="round" />
              <line x1="690" y1="250" x2="690" y2="330" stroke="#334155" strokeWidth="12" strokeLinecap="round" />

              {/* Coffee table */}
              <rect x="330" y="270" width="160" height="18" rx="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="360" y1="288" x2="350" y2="320" stroke="#64748B" strokeWidth="4" />
              <line x1="460" y1="288" x2="470" y2="320" stroke="#64748B" strokeWidth="4" />
              {/* Cup on table */}
              <rect x="390" y="255" width="14" height="15" rx="2" fill="#EF4444" />
            </svg>

            {/* Floating Trust Pills around illustration */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-8 bg-stay-card-bg/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stay-border text-xs font-semibold text-stay-secondary shadow-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-stay-secondary" />
              <span>100% Phòng Trọ Xác Minh</span>
            </div>

            <div className="absolute bottom-6 right-4 sm:bottom-8 sm:right-8 bg-stay-card-bg/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-stay-border text-xs font-semibold text-stay-primary shadow-xs flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-stay-primary" />
              <span>Ghép Gu Lối Sống Tương Thích</span>
            </div>
          </div>
        </div>

        {/* Floating Search Bar (Card overlapping bottom of Hero) */}
        <div className="relative z-20 max-w-4xl mx-auto pt-2">
          <StayConnectSearchBar onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
};
