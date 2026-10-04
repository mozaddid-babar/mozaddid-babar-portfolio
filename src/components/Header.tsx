import React, { useState, useEffect, useMemo } from 'react';
import { Menu, X, FileText, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Profile, SectionConfig } from '../types';

interface HeaderProps {
  profile: Profile;
  sections?: SectionConfig[];
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onViewCv?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  sections,
  darkMode = false,
  onToggleDarkMode,
  onViewCv
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  const isSectionVisible = (secId: string): boolean => {
    if (!sections || sections.length === 0) return true;
    const sec = sections.find(s => s.id === secId);
    return sec ? sec.showInFrontend !== false : false;
  };

  const sectionOrderMap = useMemo(() => {
    const map = new Map<string, number>();
    (sections || []).forEach((sec, idx) => {
      map.set(sec.id, idx);
    });
    return map;
  }, [sections]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const candidateSectionIds = [
      'hero',
      'about',
      'publications',
      'honors-awards',
      'honors-activities',
      'training',
      'certifications',
      'projects',
      'experience',
      'capabilities',
      'volunteer',
      'references',
      'contact'
    ];
    const activeCandidateIds = candidateSectionIds.filter(id => {
      const el = document.getElementById(id);
      return !!el;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    activeCandidateIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  // Map low-level section IDs to our 4 top-level nav items
  const getActiveTab = () => {
    const sectionToGroupMap: Record<string, string> = {
      hero: 'Overview',
      about: 'Overview',
      publications: 'Research',
      'honors-awards': 'Research',
      'honors-activities': 'Research',
      training: 'Research',
      certifications: 'Research',
      projects: 'Work',
      experience: 'Work',
      capabilities: 'Work',
      volunteer: 'Work',
      references: 'Work',
      contact: 'Contact'
    };
    return sectionToGroupMap[activeSection] || 'Overview';
  };

  const activeTab = getActiveTab();

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) return;

    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      const headerOffset = 80; // approximate sticky header height
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    setMobileMenuOpen(false);
  };

  // Build dynamic nav structure strictly filtered by active, unhidden sections from admin console
  // and ordered by their respective positions on the page
  const navStructure = useMemo(() => {
    const groupDefs = [
      {
        name: 'Overview',
        candidates: [
          { sectionId: 'hero', name: 'Intro', href: '#hero' },
          { sectionId: 'about', name: 'About', href: '#about' }
        ]
      },
      {
        name: 'Research',
        candidates: [
          { sectionId: 'publications', name: 'Publications', href: '#publications' },
          { sectionId: 'awards', name: 'Honors & Awards', href: '#honors-awards' },
          { sectionId: 'affiliations', name: 'Activities & Affiliations', href: '#honors-activities' },
          { sectionId: 'achievements', name: 'Achievements', href: '#honors-awards' },
          { sectionId: 'training', name: 'Training', href: '#training' },
          { sectionId: 'certifications', name: 'Certifications', href: '#certifications' }
        ]
      },
      {
        name: 'Work',
        candidates: [
          { sectionId: 'projects', name: 'Projects', href: '#projects' },
          { sectionId: 'experience', name: 'Experience', href: '#experience' },
          { sectionId: 'capabilities', name: 'Capabilities', href: '#capabilities' },
          { sectionId: 'volunteer', name: 'Volunteering', href: '#volunteer' },
          { sectionId: 'references', name: 'References', href: '#references' }
        ]
      },
      {
        name: 'Contact',
        candidates: [
          { sectionId: 'contact', name: 'Contact', href: '#contact' }
        ]
      }
    ];

    const builtGroups: {
      name: string;
      href: string;
      order: number;
      dropdown?: { name: string; href: string }[];
    }[] = [];

    groupDefs.forEach((group) => {
      // Keep only candidates whose section is unhidden in the admin console
      const visibleCandidates = group.candidates.filter(item => isSectionVisible(item.sectionId));

      if (visibleCandidates.length === 0) {
        return; // Exclude group completely if none of its sections are unhidden
      }

      // Deduplicate targets sharing the same anchor
      const uniqueItems: typeof visibleCandidates = [];
      const seenHrefs = new Set<string>();
      for (const item of visibleCandidates) {
        if (!seenHrefs.has(item.href)) {
          seenHrefs.add(item.href);
          uniqueItems.push(item);
        }
      }

      // Sort sub-items according to section layout order
      uniqueItems.sort((a, b) => {
        const orderA = sectionOrderMap.get(a.sectionId) ?? 999;
        const orderB = sectionOrderMap.get(b.sectionId) ?? 999;
        return orderA - orderB;
      });

      // The group's placement in the navbar matches its first visible section
      const firstSectionOrder = Math.min(...uniqueItems.map(item => sectionOrderMap.get(item.sectionId) ?? 999));

      if (uniqueItems.length === 1) {
        // Simple direct link if only 1 section in group is unhidden
        builtGroups.push({
          name: group.name,
          href: uniqueItems[0].href,
          order: firstSectionOrder
        });
      } else {
        // Nested dropdown if multiple sections in group are unhidden
        builtGroups.push({
          name: group.name,
          href: uniqueItems[0].href,
          order: firstSectionOrder,
          dropdown: uniqueItems.map(item => ({
            name: item.name,
            href: item.href
          }))
        });
      }
    });

    // Position nav groups according to their respective section sequence on the page
    builtGroups.sort((a, b) => a.order - b.order);

    return builtGroups;
  }, [sections, sectionOrderMap]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-[#0B0F17]/85 backdrop-blur-md shadow-sm border-b-[0.5px] border-slate-200 dark:border-slate-800' : 'bg-transparent border-b-[0.5px] border-transparent'}`} id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Brand Name */}
          <a
            href="#"
            className="flex items-center space-x-2.5 group"
            id="brand-logo-link"
          >
            <div className="relative w-7 h-7 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {scrolled && profile.avatarUrl ? (
                  <motion.img
                    key="avatar"
                    initial={{ opacity: 0, scale: 0.3, rotate: -45, y: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.3, rotate: 45, y: 20 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="absolute inset-0 w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:border-brand-400 shadow-sm bg-slate-100"
                  />
                ) : profile.logoUrl ? (
                  <motion.img
                    key="custom-logo"
                    initial={{ opacity: 0, scale: 0.3, rotate: 45, y: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.3, rotate: -45, y: 20 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    src={profile.logoUrl}
                    alt="Logo"
                    className="absolute inset-0 w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:border-brand-400 shadow-sm bg-white"
                  />
                ) : (
                  <motion.div
                    key="initials"
                    initial={{ opacity: 0, scale: 0.3, rotate: 45, y: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.3, rotate: -45, y: 20 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-7 h-7 rounded-full border border-brand-600 flex items-center justify-center text-brand-600 dark:text-brand-400 font-serif text-[11px] font-semibold tracking-wider group-hover:bg-brand-50 dark:group-hover:bg-slate-800 bg-white/50 dark:bg-slate-900/50"
                  >
                    {getInitials(profile.name)}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {profile.name}
            </span>
          </a>

          {/* Desktop Right Side: Nav & Theme Toggle */}
          <div className="hidden md:flex items-center space-x-6 h-full">
            <nav className="flex items-center space-x-7 h-full" id="desktop-nav">
              {navStructure.map((item) => (
                <div key={item.name} className="relative group h-full flex items-center">
                  <a
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={`text-sm font-medium transition-colors flex items-center space-x-1 ${activeTab === item.name ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400'
                      }`}
                  >
                    <span>{item.name}</span>
                    {item.dropdown && (
                      <ChevronDown className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
                    )}
                  </a>

                  {/* Active Underline Indicator */}
                  {activeTab === item.name && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-600 dark:bg-brand-400"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-50">
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 p-2 min-w-[160px] flex flex-col space-y-1">
                        {item.dropdown.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={subItem.href}
                            onClick={(e) => scrollToSection(e, subItem.href)}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {onViewCv && (
              <button
                onClick={onViewCv}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-xs"
                id="header-view-cv-btn"
                title="View Academic Curriculum Vitae (CV)"
              >
                <FileText className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>View CV</span>
              </button>
            )}

            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                id="theme-toggle-btn-desktop"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center space-x-2">
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                id="theme-toggle-btn-mobile"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              id="mobile-menu-toggle-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-brand-600 dark:text-brand-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur overflow-hidden"
            id="mobile-nav-drawer"
          >
            <div className="px-4 py-4 flex flex-col space-y-4">
              {navStructure.map((item) => (
                <div key={item.name} className="flex flex-col space-y-2">
                  <a
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className={`text-sm font-semibold ${activeTab === item.name ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                  >
                    {item.name}
                  </a>
                  {item.dropdown && (
                    <div className="pl-4 flex flex-col space-y-2 border-l-2 border-slate-100 dark:border-slate-800">
                      {item.dropdown.map((subItem) => (
                        <a
                          key={subItem.name}
                          href={subItem.href}
                          onClick={(e) => scrollToSection(e, subItem.href)}
                          className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400"
                        >
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {onViewCv ? (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onViewCv();
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    id="mobile-drawer-view-cv-btn"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View CV</span>
                  </button>
                </div>
              ) : profile.cvUrl && profile.cvUrl !== '#' && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View CV</span>
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
