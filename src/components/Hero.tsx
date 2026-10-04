import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Mail, Github, Linkedin, GraduationCap, BookOpen, Code, Code2, Twitter, Globe, Facebook, Instagram, FileText, FlaskConical } from 'lucide-react';
import { Profile } from '../types';

interface HeroProps {
  profile: Profile;
  isAlt?: boolean;
  onViewCv?: () => void;
  onDownloadCv?: () => void;
  isDownloadingCv?: boolean;
}

import { TypewriterText } from './TypewriterText';


const getBrandStyle = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('github')) return { bg: '#181717', color: '#fff' };
  if (p.includes('linkedin')) return { bg: '#0A66C2', color: '#fff' };
  if (p.includes('scholar')) return { bg: '#4285F4', color: '#fff' };
  if (p.includes('orcid')) return { bg: '#A6CE39', color: '#111' };
  if (p.includes('leetcode')) return { bg: '#1A1A1A', color: '#FFA116' };
  if (p.includes('research')) return { bg: '#00CCBB', color: '#113333' };
  if (p.includes('facebook')) return { bg: '#1877F2', color: '#fff' };
  if (p.includes('twitter') || p === 'x') return { bg: '#000000', color: '#fff' };
  if (p.includes('instagram')) return { bg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' };
  return { bg: '#0B59B6', color: '#fff' };
};

export const Hero: React.FC<HeroProps> = ({ 
  profile, 
  isAlt = false, 
  onViewCv, 
  onDownloadCv, 
  isDownloadingCv = false 
}) => {
  const [hoveredSocialId, setHoveredSocialId] = useState<string | null>(null);
  return (
    <section className={`relative w-full pt-8 pb-6 sm:pt-12 sm:pb-8 overflow-hidden transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827] border-b border-slate-200/60 dark:border-slate-800' : 'bg-transparent dark:bg-[#0B0F17]'}`} id="hero">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">

        {/* Left Column: Fascinating Gradient Avatar & Action Buttons */}
        <div className="lg:col-span-4 relative w-full flex flex-col items-center justify-center lg:items-start lg:justify-start order-1 lg:order-1 gap-5">
          <div className="relative group w-60 h-60 sm:w-68 sm:h-68 md:w-76 md:h-76 lg:w-[290px] lg:h-[290px] shrink-0 flex items-center justify-center z-20">
            {/* Ambient Multi-Hue Glow Behind Avatar */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-brand-600 via-sky-400 to-indigo-600 opacity-40 dark:opacity-50 blur-2xl group-hover:opacity-75 transition-opacity duration-700 animate-pulse pointer-events-none" />

            {/* Glowing Gradient Ring Border */}
            <div className="relative w-full h-full rounded-full p-[5px] bg-gradient-to-tr from-brand-600 via-cyan-400 via-sky-500 to-indigo-600 shadow-[0_0_50px_rgba(2,111,195,0.35)] transition-all duration-500 group-hover:shadow-[0_0_65px_rgba(2,111,195,0.55)]">
              {/* Inner Separation Ring */}
              <div className="w-full h-full rounded-full p-1 bg-white dark:bg-slate-900 overflow-hidden">
                <motion.img
                  src={profile.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop"}
                  alt={profile.name}
                  className="relative z-10 w-full h-full object-cover rounded-full transition-transform duration-700 ease-out group-hover:scale-105"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                />
              </div>
            </div>
          </div>

          <motion.div
            className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {onDownloadCv ? (
              <button
                onClick={onDownloadCv}
                disabled={isDownloadingCv}
                className="inline-flex items-center justify-center space-x-2 bg-slate-900 dark:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-brand-500 transition-colors shadow-md shadow-slate-900/20 dark:shadow-brand-900/30 cursor-pointer disabled:opacity-60"
                id="hero-download-cv-btn"
                title="Download Academic Curriculum Vitae (CV)"
              >
                {isDownloadingCv ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Preparing CV...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download CV</span>
                  </>
                )}
              </button>
            ) : onViewCv ? (
              <button
                onClick={onViewCv}
                className="inline-flex items-center justify-center space-x-2 bg-slate-900 dark:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-brand-500 transition-colors shadow-md shadow-slate-900/20 dark:shadow-brand-900/30 cursor-pointer"
                id="hero-view-cv-btn"
                title="View Academic Curriculum Vitae (CV)"
              >
                <FileText className="w-4 h-4" />
                <span>View CV</span>
              </button>
            ) : (profile.cvSettings?.manualCvUrl || profile.cvUrl) && (
              <a
                href={profile.cvSettings?.manualCvUrl || profile.cvUrl}
                download={profile.cvSettings?.manualCvFileName || `${profile.name.replace(/\s+/g, '_')}_CV.pdf`}
                className="inline-flex items-center justify-center space-x-2 bg-slate-900 dark:bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:hover:bg-brand-500 transition-colors shadow-md shadow-slate-900/20 dark:shadow-brand-900/30 cursor-pointer"
                id="hero-download-cv-link"
              >
                <Download className="w-4 h-4" />
                <span>Download CV</span>
              </a>
            )}

            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center justify-center space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-200 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
            >
              <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Contact Me</span>
            </a>
          </motion.div>
        </div>

        {/* Right Column: Text & Details */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-4 order-2 lg:order-2 relative z-10">

          <div className="space-y-2">
            {/* Top: Designation/Title */}
            <motion.div
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium tracking-wide text-brand-700 dark:text-brand-300 bg-brand-50/90 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 shadow-xs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
              <span className="uppercase">{profile.title}</span>
            </motion.div>

            {/* Middle: Name (Capitalized on 1 Single Line) */}
            <motion.h1
              className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[38px] font-sans font-bold uppercase tracking-normal text-slate-900 dark:text-white leading-tight sm:whitespace-nowrap"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TypewriterText text={profile.name} delay={500} />
            </motion.h1>
          </div>

          {/* Roles & Bio Description */}
          <motion.div
            className="mt-3 space-y-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-normal leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {profile.aboutText && profile.aboutText.length > 0 ? (
              profile.aboutText.slice(0, 3).map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))
            ) : (
              <p>{profile.bio}</p>
            )}
          </motion.div>

          {/* Bottom: Social Links */}
          <motion.div
            className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div 
              className="flex flex-wrap items-center gap-2"
              onMouseLeave={() => setHoveredSocialId(null)}
            >
              {(profile.socialLinks || []).filter(s => s.showInFrontend !== false && s.url && s.url.trim() !== '').map(social => {
                let Icon = Globe;
                const p = social.platform.toLowerCase();
                if (p.includes('github')) Icon = Github;
                else if (p.includes('linkedin')) Icon = Linkedin;
                else if (p.includes('facebook')) Icon = Facebook;
                else if (p.includes('twitter') || p === 'x') Icon = Twitter;
                else if (p.includes('instagram')) Icon = Instagram;
                else if (p.includes('scholar')) Icon = GraduationCap;
                else if (p.includes('orcid')) Icon = FileText;
                else if (p.includes('leetcode')) Icon = Code;
                else if (p.includes('research')) Icon = FlaskConical;

                const brand = getBrandStyle(social.platform);
                const isHovered = hoveredSocialId === social.id;

                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group/btn relative shrink-0 flex items-center h-[42px] rounded-[10px] border transition-all duration-300 ease-out overflow-hidden ${
                      isHovered
                        ? 'border-transparent shadow-[0_4px_16px_rgba(0,0,0,0.15)]'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-transparent hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'
                    }`}
                    style={{
                      background: isHovered ? brand.bg : undefined,
                      borderColor: isHovered ? 'transparent' : undefined,
                      '--hover-bg': brand.bg,
                      '--hover-color': brand.color
                    } as React.CSSProperties}
                    onMouseEnter={() => setHoveredSocialId(social.id)}
                  >
                    <div 
                      className="w-[42px] h-[42px] flex items-center justify-center shrink-0 z-10 transition-colors duration-300"
                      style={{ color: isHovered ? brand.color : undefined }}
                    >
                      <Icon className="w-5 h-5 text-slate-500 group-hover/btn:!text-[var(--hover-color)] transition-colors duration-300" />
                    </div>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-out flex items-center ${
                        isHovered ? 'max-w-[220px] opacity-100' : 'max-w-0 opacity-0 group-hover/btn:max-w-[220px] group-hover/btn:opacity-100'
                      }`}
                    >
                      <span 
                        className="whitespace-nowrap text-[14px] font-semibold pr-4"
                        style={{ color: brand.color }}
                      >
                        {social.platform}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
