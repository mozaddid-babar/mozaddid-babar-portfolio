import React from 'react';
import { Award as AwardIcon } from 'lucide-react';
import { Award, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface HonorsAndAwardsSectionProps {
  awards?: Award[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const HonorsAndAwardsSection: React.FC<HonorsAndAwardsSectionProps> = ({ awards = [], isAlt = false, sectionConfig }) => {
  if (!awards || awards.length === 0) return null;

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="honors-awards">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Honors & Awards"
          defaultTopText="DISTINCTIONS & MERITS"
          defaultDescription="Competitive academic honors, research fellowships, and professional distinctions."
          icon={AwardIcon}
          theme="amber"
          titleGradientNode={
            <>
              Honors &{' '}
              <span className="bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-500 bg-clip-text text-transparent dark:from-amber-400 dark:via-yellow-300 dark:to-orange-400">
                Awards
              </span>
            </>
          }
        />

        {/* Timeline Container */}
        <div className="relative">
          {/* Center Line (Desktop) & Left Line (Mobile) */}
          <div className="absolute top-0 bottom-0 left-[18px] sm:left-1/2 w-[1px] bg-slate-200 dark:bg-slate-800 sm:-translate-x-[0.5px]"></div>

          <div className="flex flex-col space-y-6 sm:space-y-8 relative z-10 py-2">
            {awards.map((award, idx) => {
              const isEven = idx % 2 === 0; // 0th is even -> Left side on desktop

              return (
                <div key={award.id} className="relative flex flex-col sm:flex-row items-start sm:items-center w-full">

                  {/* Marker */}
                  <div className="absolute left-[18px] sm:left-1/2 w-[11px] h-[11px] rounded-full bg-white dark:bg-slate-900 border-2 border-brand-600 dark:border-brand-400 -translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2 top-[5px] z-20"></div>

                  {/* Desktop Layout - Left Side (isEven) */}
                  <div className={`hidden sm:flex w-1/2 ${isEven ? 'justify-end pr-12 md:pr-16' : 'justify-start pl-12 md:pl-16 order-2'}`}>
                    <div className={`w-full max-w-[90%] lg:max-w-[500px] flex flex-col ${isEven ? 'text-right items-end' : 'text-left items-start'}`}>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {award.date}
                      </span>
                      <h4 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mb-2">
                        {award.title}
                      </h4>
                      <span className="font-sans text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3">
                        {award.issuer}
                      </span>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {award.description}
                      </p>
                    </div>
                  </div>

                  {/* Desktop Layout - Empty Space for alternating sides */}
                  <div className={`hidden sm:block w-1/2 ${isEven ? 'order-2' : ''}`}></div>

                  {/* Mobile Layout (Below sm) */}
                  <div className="sm:hidden pl-12 flex flex-col items-start text-left w-full">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {award.date}
                    </span>
                    <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white leading-tight mb-1">
                      {award.title}
                    </h4>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-2">
                      {award.issuer}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {award.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
