import React, { useEffect, useState, useMemo, useRef } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface LoadingScreenProps {
  isReady?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onFinished?: () => void;
  candidateName?: string;
  fullName?: string;
  welcomeText?: string;
  discipline?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isReady = false,
  error = null,
  onRetry,
  onFinished,
  candidateName = 'Mozaddid Babar',
  fullName = 'Mozaddid Ul Hoque Babar',
  welcomeText = 'WELCOME'
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const mountTimeRef = useRef(Date.now());

  // Allow skip after 800ms
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard shortcuts (Esc, Space, Enter) or click to skip
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') && isReady) {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isReady]);

  // Complete signature animation and smoothly transition out
  useEffect(() => {
    if (error) return;

    if (isReady) {
      const elapsed = Date.now() - mountTimeRef.current;
      const minDisplayDuration = 2200; // Allow signature to draw out and be appreciated
      const remainingTime = Math.max(0, minDisplayDuration - elapsed);

      const timer = setTimeout(() => {
        setIsFadingOut(true);
        const exitTimer = setTimeout(() => {
          if (onFinished) onFinished();
        }, 650);
        return () => clearTimeout(exitTimer);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isReady, error, onFinished]);

  const handleSkip = () => {
    if (!isReady) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinished) onFinished();
    }, 300);
  };

  // Subtle floating background particles
  const particles = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: `${(i * 19 + 7) % 100}%`,
      top: `${(i * 29 + 11) % 100}%`,
      size: `${(i % 3) * 1.5 + 1.2}px`,
      duration: `${3.5 + (i % 5)}s`,
      delay: `${(i % 4) * 0.7}s`,
      opacity: i % 2 === 0 ? 0.3 : 0.65
    }));
  }, []);

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#07090e] overflow-hidden select-none transition-all duration-700 ease-out cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-[1.03] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Welcome Screen"
      title="Click anywhere to enter"
    >
      {/* Background Ambient Glows & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Core Golden Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[380px] bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-yellow-600/10 rounded-full blur-[110px] pointer-events-none animate-pulse duration-[3500ms]" />

        {/* Subtle Celestial Indigo & Cyan Haze */}
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/4 w-[380px] h-[280px] bg-sky-500/10 rounded-full blur-[90px] pointer-events-none" />

        {/* Ambient Subtle Geometric Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d4af37 1px, transparent 0)`,
            backgroundSize: '36px 36px'
          }}
        />

        {/* Floating Stardust Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-amber-200 pointer-events-none animate-pulse"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animationDuration: p.duration,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>

      {/* Main Center Stage */}
      <div className="relative z-10 w-full max-w-xl px-6 flex flex-col items-center text-center">

        {/* Top Welcome Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/25 shadow-lg shadow-amber-500/5 mb-5 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.28em] uppercase text-amber-300 font-semibold">
            {welcomeText || 'WELCOME'}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        </div>

        {/* ========================================================================= */}
        {/* THE SIGNATURE CANVAS: "Mozaddid Babar" In Signature Mode                  */}
        {/* ========================================================================= */}
        <div className="relative w-full max-w-md sm:max-w-lg h-36 sm:h-44 flex items-center justify-center my-1">
          <svg
            viewBox="0 0 620 180"
            className="w-full h-full overflow-visible drop-shadow-[0_4px_28px_rgba(245,158,11,0.25)]"
          >
            <defs>
              {/* Liquid Golden Calligraphy Gradient */}
              <linearGradient id="sigGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              {/* Shimmer Light Gradient for flourish underline */}
              <linearGradient id="flourishGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#fef08a" stopOpacity="1" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
              </linearGradient>

              {/* Golden Bloom Filter */}
              <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Glowing Backdrop Silhouette for depth */}
            <text
              x="50%"
              y="94"
              textAnchor="middle"
              className="signature-text-glow select-none pointer-events-none"
              style={{
                fontFamily: "'Great Vibes', 'Alex Brush', cursive, sans-serif",
                fontSize: '82px',
                fill: 'none',
                stroke: 'rgba(245, 158, 11, 0.4)',
                strokeWidth: '4px',
                filter: 'url(#goldGlow)'
              }}
            >
              {candidateName}
            </text>

            {/* Foreground Animated Drawing Signature */}
            <text
              x="50%"
              y="94"
              textAnchor="middle"
              className="signature-text-animated select-none pointer-events-none"
              style={{
                fontFamily: "'Great Vibes', 'Alex Brush', cursive, sans-serif",
                fontSize: '82px',
                letterSpacing: '1px'
              }}
            >
              {candidateName}
            </text>

            {/* Elegant Calligraphic Flourish Swoop under the signature */}
            <path
              d="M 110,134 C 180,148 290,140 410,130 C 470,124 525,126 545,136 C 560,144 542,156 505,154 C 455,150 420,140 450,130 C 475,122 535,124 570,128"
              fill="none"
              stroke="url(#flourishGold)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="signature-flourish pointer-events-none"
            />

            {/* Animated Golden Starlight Particle at tip of flourish */}
            <g className="pen-tip-particle pointer-events-none">
              <circle r="4" fill="#ffffff" />
              <circle r="8" fill="#fbbf24" opacity="0.6" filter="url(#goldGlow)" />
              <circle r="14" fill="#f59e0b" opacity="0.25" filter="url(#goldGlow)" />
            </g>
          </svg>

          {/* Golden Ambient Radial Halo */}
          <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />
        </div>

        {/* Full Name */}
        <div className="mt-3">
          <h2 className="text-sm sm:text-base font-serif tracking-[0.24em] text-slate-100 font-medium uppercase drop-shadow-sm">
            {fullName || 'Mozaddid Ul Hoque Babar'}
          </h2>
        </div>

        {/* Error State View (if backend fails to respond) */}
        {error && (
          <div className="mt-6 p-4 max-w-sm w-full bg-red-950/60 border border-red-500/40 rounded-2xl backdrop-blur-md text-center space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-red-900/60 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-xs text-red-200 font-medium">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold font-mono rounded-xl hover:brightness-110 shadow-lg transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Connection
              </button>
            )}
          </div>
        )}

      </div>

      {/* Embedded CSS for Signature Stroke Drawing and Pen Sparkle Animation */}
      <style>{`
        /* Animated SVG Handwriting Signature */
        .signature-text-animated {
          stroke: url(#sigGold);
          stroke-width: 1.8px;
          stroke-dasharray: 850;
          stroke-dashoffset: 850;
          fill: transparent;
          animation: drawSignatureText 2.3s cubic-bezier(0.45, 0, 0.25, 1) forwards,
                     fillSignatureText 1.1s 1.7s ease-in-out forwards;
        }

        .signature-text-glow {
          stroke-dasharray: 850;
          stroke-dashoffset: 850;
          animation: drawSignatureGlow 2.3s cubic-bezier(0.45, 0, 0.25, 1) forwards;
        }

        /* Calligraphic flourish path under the name */
        .signature-flourish {
          stroke-dasharray: 750;
          stroke-dashoffset: 750;
          animation: drawFlourish 2.1s 0.5s cubic-bezier(0.35, 0, 0.25, 1) forwards;
        }

        /* Particle tracing pen movement */
        .pen-tip-particle {
          offset-path: path("M 110,134 C 180,148 290,140 410,130 C 470,124 525,126 545,136 C 560,144 542,156 505,154 C 455,150 420,140 450,130 C 475,122 535,124 570,128");
          animation: movePenNib 2.1s 0.5s cubic-bezier(0.35, 0, 0.25, 1) forwards,
                     fadePenNib 0.6s 2.6s forwards;
        }

        @keyframes drawSignatureText {
          0% {
            stroke-dashoffset: 850;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawSignatureGlow {
          0% {
            stroke-dashoffset: 850;
            opacity: 0.15;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.75;
          }
        }

        @keyframes fillSignatureText {
          0% {
            fill: transparent;
          }
          100% {
            fill: url(#sigGold);
          }
        }

        @keyframes drawFlourish {
          0% {
            stroke-dashoffset: 750;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes movePenNib {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0.8;
          }
        }

        @keyframes fadePenNib {
          0% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: scale(1.6);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 1.8s infinite linear;
        }
      `}</style>
    </div>
  );
};
