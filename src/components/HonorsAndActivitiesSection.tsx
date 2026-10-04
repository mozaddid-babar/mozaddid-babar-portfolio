import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import {
  Trophy,
  Users,
  HeartHandshake,
  UserCheck,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { Affiliation, Reference, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface HonorsAndActivitiesSectionProps {
  affiliations?: Affiliation[];
  references?: Reference[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const HonorsAndActivitiesSection: React.FC<HonorsAndActivitiesSectionProps> = ({
  affiliations = [],
  references = [],
  isAlt = false,
  sectionConfig
}) => {
  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="honors-activities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Honors, Affiliations & Activities"
          defaultTopText="DISTINCTIONS & ACADEMIC SERVICE"
          defaultDescription="Recognitions, professional society memberships, and institutional leadership roles."
          icon={Trophy}
          theme="amber"
          titleGradientNode={
            <>
              Honors, Affiliations & <span className="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">Activities</span>
            </>
          }
        />

        {/* 2-Column Layout for Achievements and Affiliations/Volunteering */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Achievements */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Trophy className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-sm font-mono tracking-wider text-slate-700 dark:text-slate-300 uppercase font-semibold">
                ACHIEVEMENTS & AWARDS
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            </div>
          </div>

          {/* Right Column: Affiliations & Volunteer Work */}
          <div className="lg:col-span-6 space-y-8">

            {/* Professional Affiliations */}
            {affiliations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <h3 className="text-sm font-mono tracking-wider text-slate-700 dark:text-slate-300 uppercase font-semibold">
                    PROFESSIONAL AFFILIATIONS & ACTIVITIES
                  </h3>
                </div>

                <div className="space-y-3">
                  {affiliations.map((aff, idx) => (
                    <ScrollReveal key={aff.id} delay={idx * 0.15}>
                      <div
                        key={aff.id}
                        className="p-4 rounded-xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-600 transition-all flex items-center justify-between group shadow-sm shadow-slate-200/50 dark:shadow-none"
                      >
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {aff.organization}
                          </h4>
                          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                            Role: <span className="text-brand-600 dark:text-brand-400 font-medium">{aff.role}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded bg-white/60 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 shrink-0">
                          {aff.period}
                        </span>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            )}



          </div>
        </div>
      </div>
    </section>
  );
};
