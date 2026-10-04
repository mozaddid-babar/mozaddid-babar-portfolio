import React from 'react';
import { ScrollReveal } from './ScrollReveal';
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { Training, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface TrainingSectionProps {
  trainings?: Training[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const TrainingSection: React.FC<TrainingSectionProps> = ({
  trainings = [],
  isAlt = false,
  sectionConfig
}) => {
  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="training">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Trainings & Field Visits"
          defaultTopText="PROFESSIONAL WORKSHOPS"
          defaultDescription="Specialized industry workshops, institutional visits, and continuous technical education."
          icon={BookOpen}
          theme="cyan"
          titleGradientNode={
            <>
              Trainings &{' '}
              <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-teal-300 dark:to-emerald-400">
                Field Visits
              </span>
            </>
          }
        />

        {/* Subsection 1: Professional Training & Field Visits */}
        {trainings.length > 0 && (
          <div className="space-y-6 mb-6">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-200 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-sm font-mono tracking-wider text-slate-700 dark:text-slate-300 uppercase font-semibold">
                PROFESSIONAL TRAINING & FIELD VISITS
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trainings.map((tr, idx) => (
                <ScrollReveal key={tr.id} delay={idx * 0.15}>
                  <div
                    key={tr.id}
                    className="p-6 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-300 ease-out hover:-translate-y-2 flex flex-col justify-between group shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)]"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:border-brand-300 transition-colors">
                          <Award className="w-4 h-4" />
                        </div>
                        <span className="px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 text-[11px] font-mono text-brand-700 dark:text-brand-300">
                          {tr.year}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                        {tr.title}
                      </h4>

                      <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {tr.issuer}
                      </div>

                      {tr.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                          {tr.description}
                        </p>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
