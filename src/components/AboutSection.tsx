import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import {
  MessageSquareText,
  Brain,
  Activity,
  Database,
  Sparkles,
  CheckCircle2,
  Cpu,
  Layers,
  Network,
  Code,
  Tag
} from 'lucide-react';
import { Profile, ResearchPillar, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface AboutSectionProps {
  profile: Profile;
  researchPillars?: ResearchPillar[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Activity,
  Brain,
  MessageSquareText,
  Cpu,
  Database,
  Layers,
  Network,
  Code,
  Sparkles
};

const THEME_STYLES: Record<string, { iconColor: string; bg: string; border: string }> = {
  brand: {
    iconColor: 'text-brand-600 dark:text-brand-400',
    bg: 'bg-brand-50 dark:bg-brand-950/60',
    border: 'border-brand-200/80 dark:border-brand-900/50'
  },
  purple: {
    iconColor: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    border: 'border-purple-200/80 dark:border-purple-900/50'
  },
  emerald: {
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    border: 'border-emerald-200/80 dark:border-emerald-900/50'
  },
  blue: {
    iconColor: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    border: 'border-blue-200/80 dark:border-blue-900/50'
  },
  amber: {
    iconColor: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    border: 'border-amber-200/80 dark:border-amber-900/50'
  },
  rose: {
    iconColor: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    border: 'border-rose-200/80 dark:border-rose-900/50'
  }
};

const DEFAULT_PILLARS: ResearchPillar[] = [
  {
    id: 'pillar-1',
    title: 'Biomedical Signal Processing',
    category: 'Core Foundation',
    icon: 'Activity',
    description: 'Feature extraction and predictive modeling on physiological signals (EEG/ECG) — including correlation-based feature selection for major depressive disorder detection.',
    color: 'brand',
    tags: ['EEG/ECG', 'Feature Selection', 'Biomedical Signals'],
    showInFrontend: true,
    order: 1
  },
  {
    id: 'pillar-2',
    title: 'Applied Machine Learning for Diagnostics',
    category: 'Healthcare ML',
    icon: 'Brain',
    description: 'Predictive modeling for multi-class disease classification, including diabetes mellitus prediction using filtered clinical datasets and optimized ML pipelines.',
    color: 'purple',
    tags: ['Supervised Learning', 'Clinical Data', 'Predictive Modeling'],
    showInFrontend: true,
    order: 2
  },
  {
    id: 'pillar-3',
    title: 'NLP & Data Mining (Target Focus)',
    category: 'Doctoral Target Focus',
    icon: 'MessageSquareText',
    description: 'Extending a background in structured feature engineering and pattern discovery toward language understanding, text mining, and large-scale unstructured data — the focus of my doctoral research.',
    color: 'emerald',
    tags: ['NLP', 'Data Mining', 'PhD 2027 Objective'],
    showInFrontend: true,
    order: 3
  },
  {
    id: 'pillar-4',
    title: 'Applied Systems & Software Engineering',
    category: 'Production Systems',
    icon: 'Cpu',
    description: 'Full-stack engineering experience (React, Node, Express) that translates research prototypes into deployable, data-driven systems and tools.',
    color: 'blue',
    tags: ['Next.js', 'Node.js', 'Express', 'Full-Stack'],
    showInFrontend: true,
    order: 4
  }
];

export const AboutSection: React.FC<AboutSectionProps> = ({
  profile,
  researchPillars,
  isAlt = true,
  sectionConfig
}) => {
  // Use database pillars if provided and non-empty, otherwise fallback to defaults
  const activePillars = (researchPillars && researchPillars.length > 0 ? researchPillars : DEFAULT_PILLARS)
    .filter(p => p.showInFrontend !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const badgeText = profile.aboutBadge || 'Research Focus & Trajectory';
  const titleText = profile.aboutTitle || 'Academic Background & Mission';

  return (
    <section
      className={`py-8 sm:py-10 md:py-12 border-t border-slate-200/60 dark:border-slate-800 transition-colors duration-300 ${
        isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'
      }`}
      id="about"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="About the Researcher"
          defaultTopText={badgeText || 'RESEARCH IDENTITY'}
          defaultDescription="Investigating computational intelligence, biomedical signal dynamics, and machine learning architectures."
          icon={Sparkles}
          theme="rose"
          titleGradientNode={
            <>
              About the{' '}
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 bg-clip-text text-transparent dark:from-rose-400 dark:via-pink-300 dark:to-amber-400">
                Researcher
              </span>
            </>
          }
        />

        {/* Narrative & Pillars Grid with Opposite Angle Entrance & 3D Stacking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* Narrative Column (6 cols) coming from opposite left angle */}
          <ScrollReveal direction="opposite-left" className="lg:col-span-6 space-y-4">
            <div
              className={`p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out space-y-4 ${
                isAlt ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/80 dark:bg-slate-800/80'
              }`}
            >
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>{titleText}</span>
              </h3>

              {profile.aboutText && profile.aboutText.length > 0 ? (
                profile.aboutText.map((paragraph, idx) => (
                  <p key={idx} className="text-sm sm:text-base text-slate-800 dark:text-slate-300 leading-relaxed font-sans">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-300 leading-relaxed font-sans">
                  {profile.bio}
                </p>
              )}

              {/* Research laboratory / Affiliation highlights */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                {profile.department && (
                  <div className="flex items-start space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Primary Research: {profile.department}</span>
                  </div>
                )}
                {profile.affiliation && (
                  <div className="flex items-start space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Affiliation: {profile.affiliation}</span>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Research Pillars Cards (6 cols) coming from opposite right angle */}
          <ScrollReveal direction="opposite-right" className="lg:col-span-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activePillars.map((pillar, pIdx) => {
                const IconComp = (pillar.icon && ICON_MAP[pillar.icon]) || Activity;
                const theme = (pillar.color && THEME_STYLES[pillar.color]) || THEME_STYLES.brand;

                return (
                  <ScrollReveal key={pillar.id} direction="stack" delay={pIdx * 0.08} className="h-full">
                    <div
                      className={`p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col justify-between space-y-3 h-full ${
                        isAlt ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/80 dark:bg-slate-800/80'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className={`w-10 h-10 rounded-xl ${theme.bg} flex items-center justify-center shrink-0`}>
                            <IconComp className={`w-5 h-5 ${theme.iconColor}`} />
                          </div>
                          {pillar.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                              {pillar.category}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {pillar.title}
                        </h4>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                          {pillar.description}
                        </p>
                      </div>

                      {pillar.tags && pillar.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                          {pillar.tags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 rounded-md"
                            >
                              <Tag className="w-2.5 h-2.5 mr-1 opacity-70" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </ScrollReveal>

        </div>

      </div>
    </section>
  );
};
