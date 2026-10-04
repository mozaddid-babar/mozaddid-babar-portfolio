import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollHeight = document.documentElement.scrollHeight;
          const clientHeight = window.innerHeight || document.documentElement.clientHeight;
          const docHeight = scrollHeight - clientHeight;
          const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

          setScrollProgress(progress);
          setIsVisible(scrollTop > 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const circumference = 2 * Math.PI * 20; // Radius = 20, ~125.66px
  const strokeOffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <>
      {/* Top Scroll Progress Line Bar with Vibrant Gradient */}
      <div
        className={`fixed top-0 left-0 right-0 z-[100] h-[3.5px] bg-slate-200/20 dark:bg-slate-800/20 pointer-events-none no-print transition-opacity duration-300 ${
          scrollProgress > 0.5 ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        id="top-scroll-progress-bar"
      >
        <div
          className="h-full w-full bg-gradient-to-r from-brand-600 via-sky-400 via-cyan-400 to-indigo-600 shadow-[0_0_12px_rgba(2,111,195,0.7)] will-change-transform origin-left transition-transform duration-75 ease-out"
          style={{
            transform: `scaleX(${scrollProgress / 100})`,
          }}
        />
      </div>

      {/* Floating Scroll-to-Top Button with Circular Gradient Border Progress */}
      <div
        className={`fixed bottom-8 right-8 z-50 no-print transition-all duration-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <button
          onClick={scrollToTop}
          className="group relative w-12 h-12 rounded-full flex items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-200 shadow-xl shadow-slate-300/50 dark:shadow-slate-950/70 hover:text-brand-600 dark:hover:text-brand-400 hover:scale-110 active:scale-95 hover:shadow-2xl hover:shadow-brand-500/25 transition-all duration-300 focus:outline-none"
          aria-label={`Scroll back to top (${Math.round(scrollProgress)}%)`}
          title={`Back to top (${Math.round(scrollProgress)}%)`}
          id="scroll-to-top-button"
        >
          {/* Circular Progress SVG Border with Dynamic Gradient Fill */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 48 48">
            <defs>
              <linearGradient id="scrollProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#026fc3" />
                <stop offset="45%" stopColor="#38bdf8" />
                <stop offset="75%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>
            </defs>

            {/* Base Background Track Circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-slate-200/90 dark:text-slate-800"
            />

            {/* Animated Dynamic Gradient Fill Circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="url(#scrollProgressGradient)"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 24 24)"
              className="transition-[stroke-dashoffset] duration-150 ease-out"
            />
          </svg>

          {/* Up Arrow Icon with micro hover lift */}
          <ArrowUp className="w-5 h-5 relative z-10 transition-transform duration-200 group-hover:-translate-y-0.5" />

          {/* Micro Tooltip on Hover showing exact scroll % */}
          <div className="absolute -top-8 px-2 py-0.5 rounded-md bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-900 text-[10px] font-mono font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {Math.round(scrollProgress)}%
          </div>
        </button>
      </div>
    </>
  );
};
