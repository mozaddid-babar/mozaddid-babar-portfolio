import React, { useEffect, useState, useRef } from 'react';
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
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const mountTimeRef = useRef(Date.now());

  const displayName = fullName || candidateName || 'Mozaddid Ul Hoque Babar';

  // Wait for Google Fonts to be ready so the cursive typeface renders without FOUT
  useEffect(() => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setFontsLoaded(true)).catch(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, []);

  // Allow skip after 600ms
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard shortcuts (Esc, Space, Enter) to skip
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') && isReady) {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isReady]);

  // Complete signature drawing and smoothly transition out into portfolio
  useEffect(() => {
    if (error) return;

    if (isReady) {
      const elapsed = Date.now() - mountTimeRef.current;
      // Allow full realistic signing animation (2.4s) + brief pause (0.7s) before exit
      const minDisplayDuration = 3100;
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
    if (!canSkip && !isReady) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onFinished) onFinished();
    }, 300);
  };

  // Continuous fluid calligraphy stroke path that undulates through "Mozaddid Ul Hoque Babar"
  const handwritingPath = "M 84,115 C 88,88 94,60 102,60 C 110,60 116,92 120,126 C 124,102 132,74 140,74 C 148,74 152,98 156,126 C 160,104 168,80 176,80 C 184,80 188,104 192,126 C 196,110 204,98 212,98 C 220,98 224,112 226,124 C 230,112 238,98 244,98 C 248,98 250,110 248,126 C 244,146 238,165 246,165 C 252,165 256,140 260,118 C 266,104 274,98 282,98 C 290,98 294,112 296,124 C 302,112 308,80 312,64 C 316,64 316,98 318,124 C 324,112 330,80 334,64 C 338,64 338,98 340,124 C 344,110 350,102 356,102 C 362,102 364,114 366,124 C 372,112 378,80 382,64 C 386,64 386,98 388,124 C 394,110 402,74 410,68 C 418,68 424,96 428,126 C 434,102 444,76 450,76 C 456,76 458,98 460,126 C 466,110 474,80 480,60 C 486,60 488,96 492,126 C 498,110 508,72 516,62 C 524,62 528,96 532,126 C 538,100 550,66 558,66 C 564,66 566,98 568,126 C 574,110 582,98 590,98 C 598,98 602,112 604,124 C 610,110 616,104 624,104 C 630,104 632,120 632,135 C 632,154 628,170 636,170 C 642,170 646,144 650,120 C 656,104 664,104 670,104 C 676,104 678,116 680,124 C 686,110 694,98 702,98 C 708,98 710,112 712,124 C 718,108 726,72 734,62 C 742,62 746,96 748,126 C 754,104 766,84 774,84 C 782,84 786,104 788,126 C 794,110 802,104 810,104 C 816,104 818,116 820,124 C 826,110 834,80 840,60 C 846,60 848,96 852,126 C 858,110 866,104 872,104 C 878,104 880,114 884,124 C 888,112 894,102 900,102 C 908,102 912,116 916,122";

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden select-none transition-opacity duration-700 ease-out cursor-default ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Loading Screen"
    >
      {/* Pure White-on-Black Animated Calligraphic Signature */}
      <div className="relative px-6 w-full max-w-4xl flex items-center justify-center">
        {fontsLoaded && (
          <div className="relative w-full aspect-[920/220] max-h-[30vh] sm:max-h-[35vh] flex items-center justify-center">
            <svg
              viewBox="0 0 920 220"
              className="w-full h-full overflow-visible select-none pointer-events-none drop-shadow-[0_0_24px_rgba(255,255,255,0.2)]"
            >
              <defs>
                {/* Luminous Pen-Tip Glow Filter */}
                <filter id="nibGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Soft White Ink Bloom */}
                <filter id="inkBloom" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* The Dynamic Ink-Path Mask that traces out the signature */}
                <mask id="calligraphy-reveal-mask">
                  <path
                    d={handwritingPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="56"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="calligraphy-mask-stroke"
                  />
                </mask>
              </defs>

              {/* The Actual Signature Text in 'Great Vibes' Font, dynamically unveiled by the pen stroke */}
              <text
                x="460"
                y="126"
                textAnchor="middle"
                fill="#ffffff"
                mask="url(#calligraphy-reveal-mask)"
                filter="url(#inkBloom)"
                className="select-none pointer-events-none"
                style={{
                  fontFamily: "'Great Vibes', 'Alex Brush', cursive, sans-serif",
                  fontSize: '76px',
                  letterSpacing: '0.5px',
                  fontWeight: 400
                }}
              >
                {displayName}
              </text>

              {/* Active Luminous White Pen Nib that moves along the exact handwriting stroke */}
              <g className="pen-nib-carrier pointer-events-none">
                <circle r="6" fill="#ffffff" opacity="0.3" filter="url(#nibGlow)" />
                <circle r="3.2" fill="#ffffff" filter="url(#nibGlow)" />
                <circle r="1.5" fill="#ffffff" />
              </g>
            </svg>
          </div>
        )}

        {/* Error State View (only if backend fails to respond) */}
        {error && (
          <div className="absolute bottom-6 p-4 max-w-sm w-full bg-red-950/40 border border-red-500/30 rounded-xl text-center space-y-3 z-20">
            <div className="w-9 h-9 rounded-full bg-red-900/40 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-xs text-red-200/90 font-mono">{error}</p>
            {onRetry && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono rounded-lg transition-all cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Embedded CSS for True Handwriting Path Stroke and Gliding Pen Nib */}
      <style>{`
        /* The fluid white ink trail expanding along the calligraphy path */
        .calligraphy-mask-stroke {
          stroke-dasharray: 3200;
          stroke-dashoffset: 3200;
          animation: drawSignatureInk 2.4s cubic-bezier(0.4, 0, 0.22, 1) forwards;
        }

        /* The glowing pen-tip nib following the exact handwriting coordinates */
        .pen-nib-carrier {
          offset-path: path("${handwritingPath}");
          animation: travelPenNib 2.4s cubic-bezier(0.4, 0, 0.22, 1) forwards,
                     dissolvePenNib 0.5s 2.4s ease-out forwards;
        }

        @keyframes drawSignatureInk {
          0% {
            stroke-dashoffset: 3200;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes travelPenNib {
          0% {
            offset-distance: 0%;
            opacity: 0;
          }
          1% {
            opacity: 1;
          }
          96% {
            opacity: 1;
          }
          100% {
            offset-distance: 100%;
            opacity: 0.85;
          }
        }

        @keyframes dissolvePenNib {
          0% {
            opacity: 0.85;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.6);
          }
        }
      `}</style>
    </div>
  );
};
