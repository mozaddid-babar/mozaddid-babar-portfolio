import React from 'react';
import { HeartHandshake } from 'lucide-react';
import { VolunteerEngagement, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface VolunteerSectionProps {
  volunteerWork?: VolunteerEngagement[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const VolunteerSection: React.FC<VolunteerSectionProps> = ({ volunteerWork = [], isAlt = false, sectionConfig }) => {
  if (!volunteerWork || volunteerWork.length === 0) return null;

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="volunteer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Voluntary Service"
          defaultTopText="COMMUNITY ENGAGEMENT"
          defaultDescription="Community initiatives, tech mentorship, and social responsibility contributions."
          icon={HeartHandshake}
          theme="emerald"
          titleGradientNode={
            <>
              Voluntary <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">Service</span>
            </>
          }
        />

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute top-2 bottom-0 left-[7px] w-[2px] bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex flex-col space-y-6 relative z-10">
            {volunteerWork.map((item, idx) => {
              const isOngoing = item.period?.toLowerCase().includes('present') || item.period?.toLowerCase().includes('ongoing') || item.period?.toLowerCase().includes('current');

              return (
                <div key={item.id} className="relative flex flex-col items-start text-left w-full pl-8 sm:pl-12">

                  {/* Marker */}
                  <div className="absolute left-[0px] top-[6px] flex items-center justify-center w-4 h-4">
                    {isOngoing ? (
                      <div className="absolute left-0 top-0 w-4 h-4">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-brand-600 opacity-30 animate-ping"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-600"></span>
                      </div>
                    ) : (
                      <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-brand-600 dark:border-brand-400"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="w-full max-w-2xl flex flex-col items-start">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {isOngoing && item.period ? item.period.replace(/-(?=[^-]*$)|–(?=[^–]*$)|—(?=[^—]*$)| to (?=[^to]*$)/i, ' - ').replace(/(present|ongoing|current|now)/i, '').trim() : item.period}
                      </span>
                      {isOngoing && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-[11px] font-semibold tracking-wide uppercase font-mono ml-1">
                          Ongoing
                        </span>
                      )}
                    </div>
                    <h4 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-tight mb-1">
                      {item.role || item.title}
                    </h4>
                    <span className="font-sans text-sm font-semibold text-brand-600 dark:text-brand-400 mb-2">
                      {item.organization}
                    </span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.description}
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
