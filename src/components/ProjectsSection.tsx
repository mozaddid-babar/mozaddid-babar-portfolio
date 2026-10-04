import React, { useState, useRef, useEffect } from 'react';
import { ScrollReveal } from './ScrollReveal';
import { Github, ExternalLink, Code2 } from 'lucide-react';
import { Project, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface ProjectsSectionProps {
  projects: Project[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, isAlt = false, sectionConfig }) => {
  const visibleProjects = projects.filter(p => p.showInFrontend !== false);
  if (!visibleProjects || visibleProjects.length === 0) return null;

  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const initialCount = 2;
  const hasMore = visibleProjects.length > initialCount;
  const firstBatch = visibleProjects.slice(0, initialCount);
  const secondBatch = visibleProjects.slice(initialCount);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [visibleProjects, expanded]);

  const handleToggle = () => {
    if (expanded) {
      const section = document.getElementById('projects');
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < 0) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setExpanded(!expanded);
  };

  const renderProjectCard = (project: Project, idx: number) => {
    const hasImages = project.images && project.images.length > 0;
    let displayImages: string[] = [];
    if (hasImages) {
      const sliced = project.images!.slice(0, 3);
      displayImages = [...sliced];
      if (displayImages.length === 1) {
        displayImages.push(sliced[0], sliced[0]);
      } else if (displayImages.length === 2) {
        displayImages.push(sliced[0]);
      }
    }

    const isEven = idx % 2 === 0;

    return (
      <ScrollReveal
        key={project.id}
        direction={isEven ? 'opposite-left' : 'opposite-right'}
        bidirectional
        delay={(idx % 2) * 0.16}
        duration={1.3}
        className="h-full"
      >
        <div
          className="relative bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 rounded-2xl py-7 px-8 min-h-[300px] flex flex-col group h-full overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)]"
          id={`project-card-${project.id}`}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold tracking-wider uppercase">
              {project.category}
            </span>
            {project.date && (
              <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                {project.date}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div className="flex items-start justify-between gap-4 mt-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 leading-snug">
              {project.title}
            </h3>
            {(project.githubUrl || project.liveUrl) && (
              <div className="flex items-center space-x-3 shrink-0 pt-1">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
                    title="View Source on GitHub"
                  >
                    <Github className="w-[18px] h-[18px]" />
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-300"
                    title="Visit Live Site"
                  >
                    <ExternalLink className="w-[18px] h-[18px]" />
                  </a>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
            {project.description}
          </p>

          {/* Sub-container */}
          <div className={`mt-4 flex-1 flex flex-col justify-end ${displayImages.length > 0 ? 'pr-[100px] sm:pr-[150px]' : ''}`}>
            {project.buildNote && (
              <p className="italic text-xs text-slate-500 dark:text-slate-400 mb-3">
                {project.buildNote}
              </p>
            )}

            {/* Tag Pills */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2.5">
                {project.technologies.map((tech, tIdx) => (
                  <div key={tIdx} className="flex items-center text-xs font-mono text-slate-600 dark:text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1.5"></span>
                    {tech}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Corner Photo Stack – calendar page-turn animation */}
          {displayImages.length > 0 && (() => {
            const stackContent = (
              <>
                {displayImages.map((img, iIdx) => (
                  <div
                    key={iIdx}
                    className="photo-page"
                    style={{ backgroundImage: `url(${img})` }}
                  >
                    <div className="washi-tape absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 z-10" />
                  </div>
                ))}
              </>
            );

            const wrapperClass = "photo-stack absolute right-4 bottom-4 w-28 h-20 sm:w-36 sm:h-24";

            return project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className={`${wrapperClass} block cursor-pointer group-hover:scale-105 transition-transform duration-300 ease-out`}
                title="Open Project"
              >
                {stackContent}
              </a>
            ) : (
              <div className={wrapperClass}>
                {stackContent}
              </div>
            );
          })()}
        </div>
      </ScrollReveal>
    );
  };

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Featured Projects & Systems"
          defaultTopText="ENGINEERING & APPLIED AI"
          defaultDescription="Research prototypes, machine learning systems, and full-stack software applications."
          icon={Code2}
          theme="emerald"
          titleGradientNode={
            <>
              Featured{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400">
                Projects & Systems
              </span>
            </>
          }
        />

        {/* First Batch (Initial 2 Projects) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 [perspective:1400px]">
          {firstBatch.map((project, idx) => renderProjectCard(project, idx))}
        </div>

        {/* Expandable Remaining Projects + Divider Button */}
        {hasMore && (
          <div className="relative mt-6 sm:mt-8">
            <div
              ref={contentRef}
              className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
              style={{ maxHeight: expanded ? `${contentHeight}px` : '0px' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 [perspective:1400px]">
                {secondBatch.map((project, idx) => renderProjectCard(project, initialCount + idx))}
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
                  <span>{expanded ? 'Show less' : `Show ${secondBatch.length} more projects`}</span>
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
