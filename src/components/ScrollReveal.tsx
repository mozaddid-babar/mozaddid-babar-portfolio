import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type ScrollRevealDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'opposite-left'
  | 'opposite-right'
  | 'stack'
  | 'zoom'
  | 'fade';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: ScrollRevealDirection;
  bidirectional?: boolean;
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = "",
  delay = 0,
  duration,
  direction = 'up',
  bidirectional = true,
  style
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className} style={style}>{children}</div>;
  }

  const getVariants = () => {
    switch (direction) {
      case 'opposite-left':
        return {
          initial: { opacity: 0, x: -50, rotateY: 10, rotateZ: -1.5, scale: 0.95 },
          whileInView: { opacity: 1, x: 0, rotateY: 0, rotateZ: 0, scale: 1 },
          exit: { opacity: 0, x: -30, scale: 0.97 }
        };
      case 'opposite-right':
        return {
          initial: { opacity: 0, x: 50, rotateY: -10, rotateZ: 1.5, scale: 0.95 },
          whileInView: { opacity: 1, x: 0, rotateY: 0, rotateZ: 0, scale: 1 },
          exit: { opacity: 0, x: 30, scale: 0.97 }
        };
      case 'stack':
        return {
          initial: { opacity: 0, y: 50, scale: 0.93, rotateX: 10 },
          whileInView: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
          exit: { opacity: 0, y: -25, scale: 0.97 }
        };
      case 'zoom':
        return {
          initial: { opacity: 0, scale: 0.88, filter: 'blur(4px)' },
          whileInView: { opacity: 1, scale: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, scale: 0.94 }
        };
      case 'left':
        return {
          initial: { opacity: 0, x: -50 },
          whileInView: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -25 }
        };
      case 'right':
        return {
          initial: { opacity: 0, x: 50 },
          whileInView: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 25 }
        };
      case 'down':
        return {
          initial: { opacity: 0, y: -40 },
          whileInView: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 20 }
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          whileInView: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'up':
      default:
        return {
          initial: { opacity: 0, y: 40, scale: 0.98 },
          whileInView: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -20, scale: 0.98 }
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        ...style
      }}
      initial={variants.initial}
      whileInView={variants.whileInView}
      exit={bidirectional ? variants.exit : undefined}
      viewport={{
        once: !bidirectional,
        amount: 0.16,
        margin: "-30px 0px -30px 0px"
      }}
      transition={{
        duration: duration ?? 0.98,
        delay,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      {children}
    </motion.div>
  );
};
