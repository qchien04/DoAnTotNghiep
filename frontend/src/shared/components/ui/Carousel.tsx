import React, { useRef } from 'react';
import { Carousel as AntCarousel } from 'antd';
import type { CarouselProps as AntCarouselProps } from 'antd';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselProps extends AntCarouselProps {
  slides?: Array<{
    id?: string | number;
    image?: string;
    title?: string;
    description?: string;
    tag?: string;
    content?: React.ReactNode;
  }>;
  showArrows?: boolean;
  aspectRatio?: 'video' | 'square' | 'banner' | 'auto';
  className?: string;
  children?: React.ReactNode;
}

export const Carousel: React.FC<CarouselProps> = ({
  slides,
  showArrows = true,
  aspectRatio = 'video',
  autoplay = true,
  effect = 'scrollx',
  className = '',
  children,
  ...props
}) => {
  const carouselRef = useRef<any>(null);

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    banner: 'aspect-[21/9]',
    auto: 'h-auto',
  };

  return (
    <div className={`relative group overflow-hidden rounded-2xl border border-stay-border bg-stay-card-bg shadow-card ${className}`}>
      <AntCarousel
        ref={carouselRef}
        autoplay={autoplay}
        effect={effect}
        className="[&_.slick-dots]:!bottom-3 [&_.slick-dots_li_button]:!bg-white/80 [&_.slick-dots_li.slick-active_button]:!bg-stay-primary [&_.slick-dots_li.slick-active_button]:!w-6 [&_.slick-dots_li_button]:!h-2 [&_.slick-dots_li_button]:!rounded-full [&_.slick-dots_li_button]:!transition-all"
        {...props}
      >
        {slides
          ? slides.map((slide, index) => (
              <div key={slide.id || index} className="relative outline-none">
                <div className={`w-full relative overflow-hidden bg-slate-900 ${aspectClasses[aspectRatio]}`}>
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={slide.title || `Slide ${index + 1}`}
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    />
                  )}

                  {/* Gradient Overlay & Text Captions */}
                  {(slide.title || slide.description || slide.tag) && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white space-y-1.5">
                      {slide.tag && (
                        <span className="self-start text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-stay-primary text-white shadow-xs">
                          {slide.tag}
                        </span>
                      )}
                      {slide.title && <h3 className="text-base sm:text-lg font-bold text-white drop-shadow-sm">{slide.title}</h3>}
                      {slide.description && (
                        <p className="text-xs text-slate-200 line-clamp-2 max-w-xl font-normal drop-shadow-xs">
                          {slide.description}
                        </p>
                      )}
                    </div>
                  )}

                  {slide.content}
                </div>
              </div>
            ))
          : children}
      </AntCarousel>

      {/* Prev / Next Nav Navigation Arrows */}
      {showArrows && (
        <>
          <button
            type="button"
            onClick={() => carouselRef.current?.prev()}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-stay-card-bg/90 backdrop-blur-sm border border-stay-border text-stay-text shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-stay-card-bg hover:text-stay-primary cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => carouselRef.current?.next()}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-stay-card-bg/90 backdrop-blur-sm border border-stay-border text-stay-text shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 hover:bg-stay-card-bg hover:text-stay-primary cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default Carousel;
