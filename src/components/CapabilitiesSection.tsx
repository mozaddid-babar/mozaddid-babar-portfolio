import React, { useState, useRef, useEffect } from 'react';
import { ScrollReveal } from './ScrollReveal';
import {
  Check,
  Cpu,
  Settings,
  Activity,
  Flame,
  Database,
  BarChart3
} from 'lucide-react';
import { SkillGroup, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface CapabilitiesSectionProps {
  skillGroups: SkillGroup[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const CapabilitiesSection: React.FC<CapabilitiesSectionProps> = ({ skillGroups, isAlt = false, sectionConfig }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const categories = ['all', ...skillGroups.map(sg => sg.id)];

  const filteredGroups = activeCategory === 'all'
    ? skillGroups
    : (skillGroups || []).filter(sg => sg.id === activeCategory);

  const initialCount = 2;
  const hasMore = filteredGroups.length > initialCount;
  const firstBatch = filteredGroups.slice(0, initialCount);
  const secondBatch = filteredGroups.slice(initialCount);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [filteredGroups, expanded]);

  const handleToggle = () => {
    if (expanded) {
      const section = document.getElementById('capabilities');
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < 0) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setExpanded(!expanded);
  };

  const getCategoryIcon = (index: number) => {
    switch (index % 4) {
      case 0: return Cpu;
      case 1: return Activity;
      case 2: return Settings;
      default: return Database;
    }
  };

  const renderSkillGroupCard = (group: SkillGroup, idx: number) => {
    const Icon = getCategoryIcon(idx);
    const isEven = idx % 2 === 0;
    return (
      <ScrollReveal
        key={group.id}
        direction={isEven ? 'opposite-left' : 'opposite-right'}
        bidirectional
        delay={(idx % 2) * 0.12}
        className="h-full"
      >
        <div
          className="p-6 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-300 ease-out hover:-translate-y-2 flex flex-col justify-between shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)] h-full group"
        >
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:border-violet-300 dark:group-hover:border-violet-700 transition-colors duration-300">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
                  {group.category}
                </h3>
                {group.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                    {group.description}
                  </p>
                )}
              </div>
            </div>

            {/* Skills List */}
            <div className="flex flex-wrap gap-2 mt-5">
              {group.skills.filter(s => s.showInFrontend !== false).map((skill, sIdx) => (
                <div
                  key={sIdx}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    skill.highlight
                      ? 'bg-violet-50 dark:bg-violet-950/60 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300'
                      : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${skill.highlight ? 'bg-violet-600 dark:bg-violet-400' : 'bg-slate-400 dark:bg-slate-500'}`} />
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    );
  };

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="capabilities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Technical Capabilities & Toolsets"
          defaultTopText="EXPERTISE & PROFICIENCIES"
          defaultDescription="Core competencies across machine learning, biomedical signal analytics, algorithms, and full-stack software architectures."
          icon={Cpu}
          theme="violet"
          titleGradientNode={
            <>
              Technical{' '}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-purple-300 dark:to-fuchsia-400">
                Capabilities & Toolsets
              </span>
            </>
          }
        />

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-md shadow-slate-900/10'
                : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            ALL CAPABILITIES
          </button>
          {skillGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setActiveCategory(group.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all cursor-pointer ${
                activeCategory === group.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-md shadow-slate-900/10'
                  : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {group.category.split('&')[0].toUpperCase()}
            </button>
          ))}
        </div>

        {/* First Batch (Initial 2 Skill Groups) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [perspective:1400px]">
          {firstBatch.map((group, idx) => renderSkillGroupCard(group, idx))}
        </div>

        {/* Expandable Remaining Skill Groups + Divider Button */}
        {hasMore && (
          <div className="relative mt-6 sm:mt-8">
            <div
              ref={contentRef}
              className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
              style={{ maxHeight: expanded ? `${contentHeight}px` : '0px' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 [perspective:1400px]">
                {secondBatch.map((group, idx) => renderSkillGroupCard(group, initialCount + idx))}
              </div>
            </div>

            {/* Centered Button on Divider Line */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative z-10 flex justify-center">
                <button
                  type="button"
                  onClick={handleToggle}
                  className="flex items-center space-x-2 px-5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all text-slate-800 dark:text-slate-200 font-sans font-medium text-sm focus:outline-none cursor-pointer"
                >
                  <span>{expanded ? 'Show less' : `Show ${secondBatch.length} more skill categories`}</span>
                  <svg
                    className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
