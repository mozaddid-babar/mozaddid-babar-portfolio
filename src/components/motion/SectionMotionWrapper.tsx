import React, { useRef, useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SectionMotionCategory, SectionHoverEffect } from '../../types';

export interface SectionMotionWrapperProps {
  children: React.ReactNode;
  motionCategory?: SectionMotionCategory | string;
  hoverEffect?: SectionHoverEffect | string;
  className?: string;
  delay?: number;
  id?: string;
  bidirectional?: boolean;
}

// Tailored motion variants for each 3D rendering category
const getMotionVariants = (category: SectionMotionCategory | string = 'opposite-angles', delay: number = 0) => {
  switch (category) {
    case 'opposite-angles':
      return {
        initial: {
          opacity: 0,
          rotateY: 6,
          rotateX: 3,
          y: 35,
          scale: 0.96,
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          rotateY: 0,
          rotateX: 0,
          y: 0,
          scale: 1,
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          y: 25,
          scale: 0.97,
          transformPerspective: 1400
        },
        transition: {
          duration: 1.2,
          delay,
          ease: [0.16, 1, 0.3, 1]
        }
      };

    case 'stacked-deck':
      return {
        initial: {
          opacity: 0,
          scale: 0.91,
          y: 75,
          rotateX: 18,
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          scale: 1,
          y: 0,
          rotateX: 0,
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          scale: 0.94,
          y: -30,
          transformPerspective: 1400
        },
        transition: {
          duration: 0.95,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }
      };

    case 'epic-bidirectional':
      return {
        initial: {
          opacity: 0,
          y: 80,
          scale: 0.94,
          filter: 'blur(5px)',
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          y: -50,
          scale: 0.96,
          filter: 'blur(3px)',
          transformPerspective: 1400
        },
        transition: {
          duration: 1.05,
          delay,
          ease: [0.16, 1, 0.3, 1]
        }
      };

    case 'perspective-flip':
      return {
        initial: {
          opacity: 0,
          rotateX: 26,
          y: 75,
          scale: 0.96,
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          rotateX: -15,
          y: -30,
          scale: 0.97
        },
        transition: {
          duration: 0.95,
          delay,
          ease: [0.16, 1, 0.3, 1]
        }
      };

    case 'isometric-drift':
      return {
        initial: {
          opacity: 0,
          rotateX: 16,
          rotateY: -14,
          x: -55,
          y: 45,
          scale: 0.96,
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          rotateX: 0,
          rotateY: 0,
          x: 0,
          y: 0,
          scale: 1,
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          x: 40,
          scale: 0.96
        },
        transition: {
          duration: 1.0,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }
      };

    case 'depth-zoom':
      return {
        initial: {
          opacity: 0,
          scale: 0.86,
          y: 50,
          filter: 'blur(6px)',
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          scale: 0.92,
          filter: 'blur(3px)'
        },
        transition: {
          duration: 1.05,
          delay,
          ease: [0.25, 1, 0.5, 1]
        }
      };

    case 'origami-fold':
      return {
        initial: {
          opacity: 0,
          rotateX: -32,
          y: -30,
          scale: 0.97,
          transformOrigin: '50% 0%',
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          transformOrigin: '50% 0%',
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          rotateX: 15,
          y: 20
        },
        transition: {
          duration: 0.9,
          delay,
          ease: [0.33, 1, 0.68, 1]
        }
      };

    case 'cascade-stagger':
      return {
        initial: {
          opacity: 0,
          y: 65,
          rotateZ: -1.2,
          scale: 0.96,
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          y: 0,
          rotateZ: 0,
          scale: 1,
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          y: -30,
          scale: 0.97
        },
        transition: {
          duration: 0.88,
          delay,
          ease: [0.22, 1, 0.36, 1]
        }
      };

    case 'matrix-glissade':
      return {
        initial: {
          opacity: 0,
          rotateY: 15,
          rotateX: 7,
          x: 55,
          y: 25,
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          rotateY: 0,
          rotateX: 0,
          x: 0,
          y: 0,
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          x: -30,
          scale: 0.97
        },
        transition: {
          duration: 0.95,
          delay,
          ease: [0.16, 1, 0.3, 1]
        }
      };

    case 'subtle-elevation':
    default:
      return {
        initial: {
          opacity: 0,
          y: 40,
          scale: 0.985,
          transformPerspective: 1400
        },
        whileInView: {
          opacity: 1,
          y: 0,
          scale: 1,
          transformPerspective: 1400
        },
        exit: {
          opacity: 0,
          y: -20,
          scale: 0.985
        },
        transition: {
          duration: 0.85,
          delay,
          ease: [0.25, 1, 0.5, 1]
        }
      };
  }
};

export const SectionMotionWrapper: React.FC<SectionMotionWrapperProps> = ({
  children,
  motionCategory = 'opposite-angles',
  hoverEffect = 'tilt-3d',
  className = '',
  delay = 0,
  id,
  bidirectional = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Interactive 3D tilt tracking state
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, active: false });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverEffect === 'none' || shouldReduceMotion || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setGlarePos({ x: x * 100, y: y * 100 });

    if (hoverEffect === 'tilt-3d') {
      const maxTilt = 2.8; // Subtle & ultra-professional 3D tilt
      const rotX = (0.5 - y) * maxTilt * 2;
      const rotY = (x - 0.5) * maxTilt * 2;
      setTilt({ rotateX: rotX, rotateY: rotY, active: true });
    } else if (hoverEffect === 'magnetic') {
      const offsetX = (x - 0.5) * 8;
      const offsetY = (y - 0.5) * 8;
      setTilt({ rotateX: offsetY, rotateY: offsetX, active: true });
    }
  }, [hoverEffect, shouldReduceMotion]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ rotateX: 0, rotateY: 0, active: false });
  }, []);

  // Graceful fallback for reduced motion preference
  if (shouldReduceMotion) {
    return (
      <div id={id} className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  const variants = getMotionVariants(motionCategory, delay);

  // Compute hover style classes and inline transforms
  let hoverTransform = '';
  let hoverClass = '';

  if (hoverEffect === 'tilt-3d' && tilt.active) {
    hoverTransform = `perspective(1400px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) translateZ(10px)`;
  } else if (hoverEffect === 'lift-float' && isHovered) {
    hoverTransform = 'translateY(-6px) scale(1.004)';
    hoverClass = 'shadow-2xl shadow-brand-500/10 dark:shadow-brand-900/20';
  } else if (hoverEffect === 'magnetic' && tilt.active) {
    hoverTransform = `translate3d(${tilt.rotateY.toFixed(1)}px, ${tilt.rotateX.toFixed(1)}px, 0)`;
  } else if (hoverEffect === 'glow-pulse' && isHovered) {
    hoverClass = 'ring-1 ring-brand-500/25 shadow-[0_0_50px_-15px_rgba(14,140,228,0.25)]';
  }

  return (
    <div
      ref={containerRef}
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative group/section-motion ${className}`}
      style={{
        perspective: '1400px',
        transformStyle: 'preserve-3d'
      }}
    >
      <motion.div
        initial={variants.initial}
        whileInView={variants.whileInView}
        exit={bidirectional ? variants.exit : undefined}
        viewport={{
          once: !bidirectional,
          amount: 0.16,
          margin: '-50px 0px -50px 0px'
        }}
        transition={variants.transition}
        style={{
          transformStyle: 'preserve-3d',
          transform: hoverTransform || undefined,
          transition: tilt.active ? 'transform 0.12s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className={`w-full ${hoverClass}`}
      >
        {children}

        {/* Dynamic Specular Glare Effect for 3D Tilt */}
        {hoverEffect === 'tilt-3d' && isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-20 rounded-3xl opacity-0 group-hover/section-motion:opacity-100 transition-opacity duration-300 overflow-hidden"
            aria-hidden="true"
            style={{
              background: `radial-gradient(circle 600px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.04), transparent 70%)`
            }}
          />
        )}
      </motion.div>
    </div>
  );
};
