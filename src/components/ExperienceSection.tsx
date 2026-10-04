import React, { useState, useRef, useEffect } from 'react';
import { ScrollReveal } from './ScrollReveal';
import {
  Briefcase,
  GraduationCap,
  Calendar,
  MapPin,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Columns2,
  ChevronLeft,
  PanelRightClose
} from 'lucide-react';
import { Experience, Education, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

const parseDateForSort = (dateStr: string): number => {
  if (!dateStr) return 0;
  if (dateStr.toLowerCase().includes('present')) return Infinity;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const getRoleEndDate = (period: string): number => {
  if (!period) return 0;
  const parts = period.split('-');
  const endStr = parts.length > 1 ? parts[1].trim() : parts[0].trim();
  return parseDateForSort(endStr);
};

interface ExperienceSectionProps {
  experience: Experience[];
  education: Education[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experience,
  education,
  isAlt = false,
  sectionConfig
}) => {
  // Page Layout State: false = Split View (side-by-side), true = Full Width Experience (Education hidden)
  const [hideEducation, setHideEducation] = useState(false);

  // Show More / Collapse State for experiences (not more than 2 initially)
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const visibleExperiences = (experience || []).filter(e => e.showInFrontend !== false);
  const visibleEducation = (education || []).filter(e => e.showInFrontend !== false);

  const initialCount = 2;
  const hasMore = visibleExperiences.length > initialCount;
  const firstBatch = visibleExperiences.slice(0, initialCount);
  const secondBatch = visibleExperiences.slice(initialCount);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    const timer = setTimeout(updateHeight, 550);
    return () => {
      window.removeEventListener('resize', updateHeight);
      clearTimeout(timer);
    };
  }, [visibleExperiences, expanded, hideEducation]);

  const handleToggle = () => {
    if (expanded) {
      const section = document.getElementById('experience');
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < 0) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setExpanded(!expanded);
  };

  if (visibleExperiences.length === 0 && visibleEducation.length === 0) {
    return null;
  }

  const renderExperienceCard = (exp: Experience, idx: number) => (
    <ScrollReveal key={exp.id} direction="stack" bidirectional delay={idx * 0.08}>
      <div
        className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-300 ease-out hover:-translate-y-1.5 space-y-3.5 relative group shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-3.5">
            {exp.logoUrl && (
              <div className="w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white flex items-center justify-center">
                <img
                  src={exp.logoUrl}
                  alt={`${exp.organization} logo`}
                  className="w-full h-full object-contain p-1"
                />
              </div>
            )}
            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                {exp.role}
              </h4>
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                {exp.organization}
              </div>
            </div>
          </div>

          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] font-mono text-amber-700 dark:text-amber-300 shrink-0">
            <Calendar className="w-3 h-3" />
            <span>{exp.period}</span>
          </span>
        </div>

        {exp.location && (
          <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{exp.location}</span>
          </div>
        )}

        {exp.description && (
          <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-200 font-light leading-relaxed">
            {exp.description}
          </p>
        )}

        {exp.highlights && exp.highlights.length > 0 && (
          <ul className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
            {exp.highlights.map((item, hIdx) => (
              <li key={hIdx} className="flex items-start space-x-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-light">
                <ChevronRight className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {exp.skills && exp.skills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {exp.skills.map((skill, sIdx) => (
              <span key={sIdx} className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-widest">
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Progressive Multi-Role Career Timeline */}
        {exp.roles && exp.roles.length > 0 && (
          <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 relative">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-7 bottom-3 w-[2px] bg-slate-200 dark:bg-slate-700" />

            <div className="relative space-y-5">
              {[...exp.roles].sort((a, b) => getRoleEndDate(b.period) - getRoleEndDate(a.period)).map((role, rIdx) => (
                <div key={rIdx} className="relative flex items-start gap-4">
                  <div className="absolute left-0 w-4 h-4 rounded-full border-[3px] border-white dark:border-slate-900 bg-slate-300 dark:bg-slate-600 mt-1 z-10" />
                  <div className="ml-8 w-full space-y-1.5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">{role.title}</h5>
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-[10px] font-mono text-slate-600 dark:text-slate-300">
                        <span>{role.period}</span>
                      </span>
                    </div>
                    {role.location && (
                      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        {role.location}
                      </div>
                    )}
                    {role.description && (
                      <p className="text-xs text-slate-900 dark:text-slate-200 font-light leading-relaxed">
                        {role.description}
                      </p>
                    )}
                    {role.highlights && role.highlights.length > 0 && (
                      <ul className="pt-1 space-y-1 border-t border-slate-100 dark:border-slate-800 mt-2">
                        {role.highlights.map((item, hIdx) => (
                          <li key={hIdx} className="flex items-start space-x-2 text-xs text-slate-600 dark:text-slate-300 font-light">
                            <ChevronRight className="w-3 h-3 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {role.skills && role.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1.5">
                        {role.skills.map((skill, sIdx) => (
                          <span key={sIdx} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollReveal>
  );

  return (
    <section className={`py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="experience">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header with single Split View toggle icon in header row */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Experience & Education"
          defaultTopText="CAREER & ACADEMIA"
          defaultDescription="Research appointments, industry software engineering roles, and academic qualifications."
          icon={Briefcase}
          theme="amber"
          titleGradientNode={
            <>
              Experience &{' '}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-300 dark:to-indigo-400">
                Education
              </span>
            </>
          }
        >
          {/* Just this icon for splitting as requested */}
          <button
            onClick={() => setHideEducation(!hideEducation)}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs ${
              !hideEducation
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/80 hover:bg-amber-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            title={hideEducation ? "Split View (Show Education)" : "Full Experience (Hide Education)"}
            aria-label="Toggle split view"
            id="exp-layout-split-btn"
          >
            <Columns2 className="w-4 h-4" />
          </button>
        </SectionHeader>

        {/* Dynamic Animated Content Container */}
        <div className="relative flex flex-col lg:flex-row items-start gap-6 lg:gap-8 w-full mt-2">

          {/* ========================================================================= */}
          {/* Left Column: Relevant Experiences                                         */}
          {/* Slides width to right & extends simultaneously when Education is hidden   */}
          {/* ========================================================================= */}
          <div
            className="flex-1 min-w-0 space-y-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            {/* Top Left Experience Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-mono tracking-wider text-slate-700 dark:text-slate-300 uppercase font-semibold">
                  {sectionConfig?.experienceColumnTitle || 'Relevant Experiences'}
                </h3>
              </div>
            </div>

            {/* Experience Cards Stack: Initial Batch (Up to 2) */}
            <div className="space-y-5">
              {firstBatch.map((exp, idx) => renderExperienceCard(exp, idx))}
            </div>

            {/* Expandable Remaining Experiences + Show More Button */}
            {hasMore && (
              <div className="relative mt-6 sm:mt-8">
                <div
                  ref={contentRef}
                  className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
                  style={{ maxHeight: expanded ? `${contentHeight}px` : '0px' }}
                >
                  <div className="space-y-5 pb-6">
                    {secondBatch.map((exp, idx) => renderExperienceCard(exp, initialCount + idx))}
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
                      id="toggle-more-experiences-btn"
                    >
                      <span>
                        {expanded
                          ? 'Show less'
                          : `Show ${secondBatch.length} more experience${secondBatch.length === 1 ? '' : 's'}`}
                      </span>
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

          {/* ========================================================================= */}
          {/* Right Column: Academic Education & Vertical Hidden Strip                  */}
          {/* Continuously animates width so Experience expands to the right in real-time */}
          {/* ========================================================================= */}
          <div
            className={`shrink-0 overflow-hidden lg:sticky lg:top-24 self-start transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              hideEducation
                ? 'hidden lg:block lg:w-[60px]'
                : 'w-full lg:w-[410px] xl:w-[440px]'
            }`}
          >
            {/* Expanded Academic Education View */}
            <div
              className={`w-full lg:w-[410px] xl:w-[440px] space-y-6 transition-all duration-400 ease-out ${
                hideEducation
                  ? 'opacity-0 translate-x-12 pointer-events-none absolute top-0 right-0'
                  : 'opacity-100 translate-x-0 relative'
              }`}
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-mono tracking-wider text-slate-700 dark:text-slate-300 uppercase font-semibold">
                    {sectionConfig?.educationColumnTitle || 'Academic Education'}
                  </h3>
                </div>
                {/* Clean header without "1 Degree" as requested */}
                <button
                  onClick={() => setHideEducation(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Hide Education column"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-5">
                {visibleEducation.map((edu, idx) => (
                  <ScrollReveal key={edu.id} direction="stack" bidirectional delay={idx * 0.1}>
                    <div
                      className="p-5 sm:p-6 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 ease-out hover:-translate-y-1.5 space-y-4 shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] group relative overflow-hidden"
                    >
                      {/* Subtle Corner Ambient Mesh */}
                      <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />

                      <div className="flex flex-wrap items-start justify-between gap-2 relative z-10">
                        <div className="space-y-1">
                          <h4 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                            {edu.degree}
                          </h4>
                          <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                            {edu.institution}
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[11px] font-mono text-indigo-700 dark:text-indigo-300 shrink-0">
                          {edu.year}
                        </span>
                      </div>

                      {/* Location & Result Status */}
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 relative z-10">
                        {edu.location && (
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{edu.location}</span>
                          </div>
                        )}
                        {edu.result && (
                          <div className="inline-flex items-center space-x-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px]">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span>{edu.result}</span>
                          </div>
                        )}
                      </div>

                      {/* Dissertation / Thesis Highlight Card */}
                      {edu.thesis && (
                        <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 relative z-10">
                          <div className="flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 text-[11px] font-mono font-bold uppercase tracking-wider">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Dissertation / Thesis</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 italic font-light leading-relaxed">
                            {edu.thesis}
                          </p>
                        </div>
                      )}

                      {/* Relevant Coursework Tag Chips */}
                      {edu.coursework && (
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 relative z-10">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                            Relevant Coursework:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {edu.coursework.split(',').map((course, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono"
                              >
                                {course.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Hidden State: Bordered Vertical Strip 'Education Hidden' */}
            <div
              className={`transition-all duration-300 ease-out ${
                hideEducation
                  ? 'opacity-100 translate-x-0 relative delay-150'
                  : 'opacity-0 translate-x-6 pointer-events-none absolute top-0 right-0'
              }`}
            >
              <button
                onClick={() => setHideEducation(false)}
                className="group relative flex flex-col items-center gap-3 py-5 px-2 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800/80 hover:border-indigo-500 dark:hover:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-md w-[56px]"
                title="Click to unhide Education and restore side-by-side view"
                id="unhide-education-strip-btn"
              >
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>

                {/* Distinct Bordered Text: Education Hidden */}
                <div className="px-1.5 py-3 rounded-lg border border-indigo-200 dark:border-indigo-700/80 bg-white/95 dark:bg-slate-900/90 shadow-xs group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors">
                  <span className="text-[11px] font-mono font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 block select-none text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {sectionConfig?.educationHiddenText || 'Education Hidden'}
                  </span>
                </div>

                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform text-indigo-600 dark:text-indigo-400">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile / Small Screen Indicator when Education is hidden */}
          {hideEducation && (
            <div className="lg:hidden w-full flex justify-center pt-2">
              <button
                onClick={() => setHideEducation(false)}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-mono shadow-xs cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="font-semibold">{sectionConfig?.educationHiddenText || 'Education Hidden'} — Tap to Unhide</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
