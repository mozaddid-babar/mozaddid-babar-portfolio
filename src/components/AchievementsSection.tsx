import React from 'react';
import { Trophy, FileText, GitBranch, Star } from 'lucide-react';
import { Achievement, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';

interface AchievementsSectionProps {
  achievements?: Achievement[];
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements = [], isAlt = false, sectionConfig }) => {
  if (!achievements || achievements.length === 0) return null;

  // Group achievements by category
  const groupedAchievements = achievements.reduce((acc, ach) => {
    const key = ach.category || ach.title; // Group by category, fallback to title if no category
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const groups: Achievement[][] = Object.values(groupedAchievements);

  // Four colors: Teal, Indigo, Amber, Rose
  const colorThemes = [
    { text: 'text-[#2B6E68]', bg: 'bg-white', border: 'border-[#2B6E68]' },
    { text: 'text-[#454C8C]', bg: 'bg-white', border: 'border-[#454C8C]' },
    { text: 'text-[#A16A26]', bg: 'bg-white', border: 'border-[#A16A26]' },
    { text: 'text-[#954B5E]', bg: 'bg-white', border: 'border-[#954B5E]' },
  ];

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'file-text': return <FileText className="w-8 h-8" strokeWidth={1.5} />;
      case 'star': return <Star className="w-8 h-8" strokeWidth={1.5} />;
      case 'git-branch': return <GitBranch className="w-8 h-8" strokeWidth={1.5} />;
      default: return <Trophy className="w-8 h-8" strokeWidth={1.5} />;
    }
  };

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="achievements">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Notable Achievements"
          defaultTopText="KEY MILESTONES & HONORS"
          defaultDescription="Major milestone accomplishments, hackathon & competition wins, and academic recognitions."
          icon={Star}
          theme="violet"
          titleGradientNode={
            <>
              Notable <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">Achievements</span>
            </>
          }
        />

        {/* Staggered Zigzag Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 w-full justify-items-center items-start">
          {groups.map((group, groupIdx) => {
            const firstAch = group[0];
            const theme = colorThemes[groupIdx % colorThemes.length];
            const isEven = groupIdx % 2 === 1; // 0-indexed: 0 is odd in display (1st), 1 is even (2nd)

            return (
              <div
                key={groupIdx}
                className={`w-full max-w-[200px] min-h-[270px] rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 flex flex-col items-center py-8 px-4 sm:px-5 transition-all duration-300 ease-out hover:-translate-y-2.5 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)] ${isEven ? 'mt-9 sm:mt-[58px]' : 'mt-0'}`}
              >
                {/* Icon Badge */}
                <div className={`w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0 mb-6 bg-slate-50 dark:bg-slate-800 ${theme.text}`}>
                  {renderIcon(firstAch.icon)}
                </div>

                {/* Stacked Content */}
                <div className="flex flex-col w-full space-y-4">
                  {group.map((ach, achIdx) => (
                    <React.Fragment key={ach.id}>
                      {achIdx > 0 && <hr className="border-t border-slate-100 dark:border-slate-800 w-12 mx-auto" />}
                      <div className="text-center w-full flex flex-col items-center">
                        <h4 className="font-sans font-bold text-sm text-slate-900 dark:text-white leading-snug break-words">
                          {ach.title}
                        </h4>
                        {(ach.year || ach.date) && (
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-2 block">
                            {ach.year || ach.date}
                          </span>
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
