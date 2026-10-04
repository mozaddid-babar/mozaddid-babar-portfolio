import React from 'react';
import { SectionConfig } from '../types';

export type SectionHeaderTheme = 
  | 'brand' 
  | 'indigo' 
  | 'emerald' 
  | 'amber' 
  | 'violet' 
  | 'cyan' 
  | 'rose' 
  | 'teal';

interface SectionHeaderProps {
  sectionConfig?: SectionConfig;
  defaultTitle: string;
  defaultTopText?: string;
  defaultDescription?: string;
  icon?: React.ElementType;
  theme?: SectionHeaderTheme;
  titleGradientNode?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const THEME_CLASSES: Record<SectionHeaderTheme, {
  badgeBg: string;
  badgeBorder: string;
  badgeDot: string;
  badgeIcon: string;
  badgeText: string;
  gradient: string;
}> = {
  brand: {
    badgeBg: 'bg-brand-50/80 dark:bg-brand-950/50',
    badgeBorder: 'border-brand-200/80 dark:border-brand-800/60',
    badgeDot: 'bg-brand-500',
    badgeIcon: 'text-brand-600 dark:text-brand-400',
    badgeText: 'text-brand-700 dark:text-brand-300',
    gradient: 'from-brand-600 via-sky-600 to-indigo-600 dark:from-brand-400 dark:via-sky-300 dark:to-indigo-400'
  },
  indigo: {
    badgeBg: 'bg-indigo-50/80 dark:bg-indigo-950/50',
    badgeBorder: 'border-indigo-200/80 dark:border-indigo-800/60',
    badgeDot: 'bg-indigo-500',
    badgeIcon: 'text-indigo-600 dark:text-indigo-400',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    gradient: 'from-indigo-600 via-blue-600 to-sky-500 dark:from-indigo-400 dark:via-blue-300 dark:to-sky-400'
  },
  emerald: {
    badgeBg: 'bg-emerald-50/80 dark:bg-emerald-950/50',
    badgeBorder: 'border-emerald-200/80 dark:border-emerald-800/60',
    badgeDot: 'bg-emerald-500',
    badgeIcon: 'text-emerald-600 dark:text-emerald-400',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400'
  },
  amber: {
    badgeBg: 'bg-amber-50/80 dark:bg-amber-950/50',
    badgeBorder: 'border-amber-200/80 dark:border-amber-800/60',
    badgeDot: 'bg-amber-500',
    badgeIcon: 'text-amber-600 dark:text-amber-400',
    badgeText: 'text-amber-700 dark:text-amber-300',
    gradient: 'from-amber-600 via-yellow-600 to-orange-500 dark:from-amber-400 dark:via-yellow-300 dark:to-orange-400'
  },
  violet: {
    badgeBg: 'bg-violet-50/80 dark:bg-violet-950/50',
    badgeBorder: 'border-violet-200/80 dark:border-violet-800/60',
    badgeDot: 'bg-violet-500',
    badgeIcon: 'text-violet-600 dark:text-violet-400',
    badgeText: 'text-violet-700 dark:text-violet-300',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-500 dark:from-violet-400 dark:via-purple-300 dark:to-fuchsia-400'
  },
  cyan: {
    badgeBg: 'bg-cyan-50/80 dark:bg-cyan-950/50',
    badgeBorder: 'border-cyan-200/80 dark:border-cyan-800/60',
    badgeDot: 'bg-cyan-500',
    badgeIcon: 'text-cyan-600 dark:text-cyan-400',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    gradient: 'from-cyan-600 via-teal-600 to-emerald-500 dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-400'
  },
  rose: {
    badgeBg: 'bg-rose-50/80 dark:bg-rose-950/50',
    badgeBorder: 'border-rose-200/80 dark:border-rose-800/60',
    badgeDot: 'bg-rose-500',
    badgeIcon: 'text-rose-600 dark:text-rose-400',
    badgeText: 'text-rose-700 dark:text-rose-300',
    gradient: 'from-rose-600 via-pink-600 to-amber-500 dark:from-rose-400 dark:via-pink-300 dark:to-amber-400'
  },
  teal: {
    badgeBg: 'bg-teal-50/80 dark:bg-teal-950/50',
    badgeBorder: 'border-teal-200/80 dark:border-teal-800/60',
    badgeDot: 'bg-teal-500',
    badgeIcon: 'text-teal-600 dark:text-teal-400',
    badgeText: 'text-teal-700 dark:text-teal-300',
    gradient: 'from-teal-600 via-emerald-600 to-cyan-500 dark:from-teal-400 dark:via-emerald-300 dark:to-cyan-400'
  }
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  sectionConfig,
  defaultTitle,
  defaultTopText,
  defaultDescription,
  icon: Icon,
  theme = 'brand',
  titleGradientNode,
  className = 'mb-7 space-y-2.5',
  children
}) => {
  // Visibility rules: By default only section title should be visible
  const showTitle = sectionConfig?.showTitle !== undefined ? sectionConfig.showTitle : true;
  const showTopText = sectionConfig?.showTopText !== undefined ? Boolean(sectionConfig.showTopText) : false;
  const showDescription = sectionConfig?.showDescription !== undefined ? Boolean(sectionConfig.showDescription) : false;

  const topText = sectionConfig?.topText || defaultTopText;
  const rawTitle = sectionConfig?.title || defaultTitle;
  const description = sectionConfig?.description || defaultDescription;

  // If nothing is visible and no children, don't leave empty space
  if (!showTitle && !showTopText && !showDescription && !children) {
    return null;
  }

  const t = THEME_CLASSES[theme] || THEME_CLASSES.brand;

  // Title rendering logic:
  // If title was customized and differs from default, format it cleanly (two-tone if multi-word)
  // Otherwise use the curated titleGradientNode or defaultTitle
  let renderedTitle: React.ReactNode = titleGradientNode || rawTitle;

  if (sectionConfig?.title && sectionConfig.title.trim() && (!titleGradientNode || sectionConfig.title.trim() !== defaultTitle.trim())) {
    const customTitle = sectionConfig.title.trim();
    const words = customTitle.split(' ');
    if (words.length > 1) {
      const splitIdx = Math.max(1, Math.ceil(words.length / 2));
      const firstPart = words.slice(0, splitIdx).join(' ');
      const secondPart = words.slice(splitIdx).join(' ');
      renderedTitle = (
        <>
          {firstPart}{' '}
          <span className={`bg-gradient-to-r ${t.gradient} bg-clip-text text-transparent`}>
            {secondPart}
          </span>
        </>
      );
    } else {
      renderedTitle = customTitle;
    }
  }

  return (
    <div className={className}>
      {/* 1. Text on top of section title (Badge / Eyebrow) - Hidden by default */}
      {showTopText && topText && (
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${t.badgeBg} border ${t.badgeBorder} shadow-xs backdrop-blur-md`}>
          <span className={`w-2 h-2 rounded-full ${t.badgeDot} animate-pulse`} />
          {Icon && <Icon className={`w-3.5 h-3.5 ${t.badgeIcon}`} />}
          <span className={`text-[11px] font-mono font-bold tracking-widest ${t.badgeText} uppercase`}>
            {topText}
          </span>
        </div>
      )}

      {/* 2. Section Title & Description */}
      {(showTitle || (showDescription && description) || children) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            {showTitle && (
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {renderedTitle}
              </h2>
            )}
            {showDescription && description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light mt-0.5">
                {description}
              </p>
            )}
          </div>
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
