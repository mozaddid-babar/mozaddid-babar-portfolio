import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ScrollReveal } from './ScrollReveal';
import {
  Search,
  BookOpen,
  ExternalLink,
  FileText,
  Quote,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Award
} from 'lucide-react';
import { Publication, SectionConfig } from '../types';
import { SectionHeader } from './SectionHeader';
import { BibtexModal } from './BibtexModal';
import { PublicationDetailsModal } from './PublicationDetailsModal';

interface PublicationsSectionProps {
  publications: Publication[];
  scholarUrl?: string;
  isAlt?: boolean;
  sectionConfig?: SectionConfig;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({ publications, scholarUrl, isAlt = false, sectionConfig }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'citations' | 'journal_first' | 'oldest'>('citations');
  const [activeBibtexPub, setActiveBibtexPub] = useState<Publication | null>(null);
  const [activeDetailsPub, setActiveDetailsPub] = useState<Publication | null>(null);

  // Citations Sync State
  const [citationCounts, setCitationCounts] = useState<Record<string, number>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncCitations = async (currentCounts: Record<string, number>) => {
    setIsSyncing(true);
    let updatedCount = 0;

    try {
      const newCounts = { ...currentCounts };
      let scholarSuccess = false;

      // 1. Try Google Scholar Scraper Backend first
      if (scholarUrl) {
        try {
          const scholarRes = await fetch(`/api/scholar/sync?url=${encodeURIComponent(scholarUrl)}`);
          if (scholarRes.ok) {
            const data = await scholarRes.json();
            if (data.success && data.data) {
              const scholarCitations = data.data as Record<string, number>;

              // Map fetched titles to our publications
              for (const pub of publications) {
                const pubTitleLower = pub.title.toLowerCase();
                const matchedKey = Object.keys(scholarCitations).find(k => pubTitleLower.includes(k) || k.includes(pubTitleLower.substring(0, 30)));

                if (matchedKey) {
                  newCounts[pub.id] = scholarCitations[matchedKey];
                  updatedCount++;
                }
              }
              scholarSuccess = true;
            }
          }
        } catch (e) {
          console.error("Google Scholar backend sync failed, falling back...", e);
        }
      }

      // 2. Fallback to Semantic Scholar if Google Scholar failed or wasn't available
      if (!scholarSuccess) {
        for (const pub of publications) {
          if (pub.doi) {
            try {
              const cleanDoi = pub.doi.replace('https://doi.org/', '');
              const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/DOI:${cleanDoi}?fields=citationCount`);
              if (res.ok) {
                const data = await res.json();
                if (data && typeof data.citationCount === 'number') {
                  newCounts[pub.id] = data.citationCount;
                  updatedCount++;
                }
              }
            } catch (e) {
              console.error("Failed to fetch DOI for", pub.id, e);
            }
          }
        }
      }

      setCitationCounts(newCounts);

    } catch (err: any) {
      console.error('Failed to sync citations.', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Initialize citation counts from props and start auto-sync
  useEffect(() => {
    const initial: Record<string, number> = {};
    publications.forEach(pub => {
      if (pub.citations !== undefined) {
        initial[pub.id] = pub.citations;
      }
    });
    setCitationCounts(initial);

    // Automatically sync on load
    handleSyncCitations(initial);
  }, [publications, scholarUrl]);

  // Dynamically extract categories from all loaded publications
  const categories = useMemo(() => {
    const set = new Set<string>();
    publications.forEach(pub => {
      if (pub.category) set.add(pub.category);
      if (pub.statusNote) set.add(pub.statusNote);
    });

    // Sort categories: Journal first, Conference second, others alphabetically
    const sorted = Array.from(set).sort((a, b) => {
      if (a.toLowerCase() === 'journal') return -1;
      if (b.toLowerCase() === 'journal') return 1;
      if (a.toLowerCase() === 'conference') return -1;
      if (b.toLowerCase() === 'conference') return 1;
      return a.localeCompare(b);
    });

    return ['all', ...sorted];
  }, [publications]);

  // Find the highest publication year across all papers to badge newest items
  const maxYear = useMemo(() => {
    if (publications.length === 0) return new Date().getFullYear();
    return Math.max(...publications.map(p => p.year || 0));
  }, [publications]);

  const filteredAndSortedPubs = useMemo(() => {
    // 1. Filter
    const matched = (publications || []).filter(pub => {
      const matchesCategory =
        selectedCategory === 'all' ||
        pub.category === selectedCategory ||
        pub.statusNote === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        pub.title.toLowerCase().includes(q) ||
        pub.authors.toLowerCase().includes(q) ||
        pub.venue.toLowerCase().includes(q) ||
        (pub.tags && pub.tags.some(t => t.toLowerCase().includes(q))) ||
        (pub.abstract && pub.abstract.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });

    // 2. Sort
    return matched.sort((a, b) => {
      const citationsA = citationCounts[a.id] ?? a.citations ?? 0;
      const citationsB = citationCounts[b.id] ?? b.citations ?? 0;
      const yearA = a.year || 0;
      const yearB = b.year || 0;

      if (sortBy === 'citations') {
        if (citationsB !== citationsA) return citationsB - citationsA;
        return yearB - yearA;
      }

      if (sortBy === 'journal_first') {
        const isJournalA = a.category?.toLowerCase() === 'journal' ? 1 : 0;
        const isJournalB = b.category?.toLowerCase() === 'journal' ? 1 : 0;
        if (isJournalB !== isJournalA) return isJournalB - isJournalA;
        if (yearB !== yearA) return yearB - yearA;
        return citationsB - citationsA;
      }

      if (sortBy === 'oldest') {
        if (yearA !== yearB) return yearA - yearB;
        return (a.title || '').localeCompare(b.title || '');
      }

      // Default: 'latest' (Newest Year First -> Most Cited / Journal priority within same year)
      if (yearB !== yearA) {
        return yearB - yearA;
      }

      // If same year: Journal papers or higher citations go first
      const isJournalA = a.category?.toLowerCase() === 'journal' ? 1 : 0;
      const isJournalB = b.category?.toLowerCase() === 'journal' ? 1 : 0;
      if (isJournalB !== isJournalA) return isJournalB - isJournalA;

      if (citationsB !== citationsA) return citationsB - citationsA;
      return (a.title || '').localeCompare(b.title || '');
    });
  }, [publications, selectedCategory, searchQuery, sortBy, citationCounts]);

  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const initialCount = 2;
  const hasMore = filteredAndSortedPubs.length > initialCount;
  const firstBatch = filteredAndSortedPubs.slice(0, initialCount);
  const secondBatch = filteredAndSortedPubs.slice(initialCount);

  useEffect(() => {
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [filteredAndSortedPubs, expanded]);

  const handleToggle = () => {
    if (expanded) {
      const section = document.getElementById('publications');
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top < 0) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
    setExpanded(!expanded);
  };

  const renderPublicationCard = (pub: Publication, idx: number) => {
    const displayCitations = citationCounts[pub.id] !== undefined ? citationCounts[pub.id] : pub.citations;
    const isLatestYear = pub.year === maxYear;
    const isTopFeatured = idx === 0 && (pub.featured || isLatestYear);

    const MAX_ABSTRACT_LENGTH = 150;
    const isAbstractLong = pub.abstract && pub.abstract.length > MAX_ABSTRACT_LENGTH;
    const shortAbstract = isAbstractLong
      ? pub.abstract.substring(0, MAX_ABSTRACT_LENGTH).trim()
      : pub.abstract;

    return (
      <ScrollReveal
        key={pub.id}
        direction="stack"
        bidirectional
        delay={Math.min(idx * 0.08, 0.4)}
      >
        <div
          className={`p-5 sm:p-6 rounded-2xl backdrop-blur-md border space-y-3.5 group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 shadow-md shadow-slate-200/70 dark:shadow-slate-950/50 hover:shadow-2xl hover:shadow-slate-300/60 dark:hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.2)] ${isTopFeatured
              ? 'bg-gradient-to-r from-white via-brand-50/20 to-white dark:from-slate-900 dark:via-slate-800/60 dark:to-slate-900 border-brand-300 dark:border-brand-500 ring-1 ring-brand-500/20 hover:border-brand-500'
              : 'bg-white/85 dark:bg-slate-900/85 border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500'
            }`}
        >
          {/* Top Bar: Venue & Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">

              {/* Latest Work / Featured Highlight Badge */}
              {isTopFeatured && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 dark:bg-brand-600 text-white shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  <span>Latest Highlight</span>
                </span>
              )}

              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${pub.category === 'Journal'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-800'
                  : pub.category === 'Under Review' || pub.statusNote === 'Under Review'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : pub.category === 'Conference'
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}>
                {pub.statusNote || pub.category}
              </span>

              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                {pub.year}
              </span>
            </div>

            {displayCitations !== undefined && displayCitations > 0 && (
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold shadow-xs">
                {displayCitations} Citations
              </span>
            )}
          </div>

          {/* Paper Title */}
          <h3 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
            {pub.link ? (
              <a href={pub.link} target="_blank" rel="noreferrer" className="hover:underline">
                {pub.title}
              </a>
            ) : (
              pub.title
            )}
          </h3>

          {/* Authors & Venue */}
          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            <p className="font-light">
              <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">Authors: </span>
              {pub.authors}
            </p>
            <p className="font-sans italic text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
              <span>{pub.venue}</span>
            </p>
          </div>

          {/* Tags */}
          {pub.tags && pub.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pub.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Short Abstract */}
          {pub.abstract && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
              <span className="text-[10px] font-mono tracking-widest text-indigo-700 dark:text-indigo-400 uppercase font-bold block mb-1">
                Abstract
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-light leading-relaxed">
                {shortAbstract}
                {isAbstractLong && (
                  <span>
                    ...{' '}
                    <button
                      onClick={() => setActiveDetailsPub(pub)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center cursor-pointer ml-1"
                    >
                      More Details
                    </button>
                  </span>
                )}
                {!isAbstractLong && (
                  <span>
                    {' '}
                    <button
                      onClick={() => setActiveDetailsPub(pub)}
                      className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center cursor-pointer ml-1"
                    >
                      More Details
                    </button>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Actions Row */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div />

            <div className="flex items-center space-x-3">
              {pub.bibtex && (
                <button
                  onClick={() => setActiveBibtexPub(pub)}
                  className="inline-flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                >
                  <Quote className="w-3.5 h-3.5" />
                  <span>BibTeX</span>
                </button>
              )}

              {pub.doi && (
                <a
                  href={`https://doi.org/${pub.doi.replace('https://doi.org/', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>DOI</span>
                </a>
              )}

              {pub.pdfUrl && (
                <a
                  href={pub.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:underline"
                >
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>PDF</span>
                </a>
              )}
            </div>
          </div>

        </div>
      </ScrollReveal>
    );
  };

  return (
    <section className={`py-8 sm:py-10 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300 ${isAlt ? 'bg-slate-50/70 dark:bg-[#111827]' : 'bg-white dark:bg-[#0B0F17]'}`} id="publications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          sectionConfig={sectionConfig}
          defaultTitle="Publications & Preprints"
          defaultTopText="RESEARCH & SCHOLARLY WORKS"
          defaultDescription="Peer-reviewed journal papers, conference proceedings, and biomedical machine learning contributions."
          icon={BookOpen}
          theme="indigo"
          titleGradientNode={
            <>
              Publications &{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-blue-300 dark:to-sky-400">
                Preprints
              </span>
            </>
          }
        />

        {/* Filter, Sort & Search Control Bar */}
        <div className="space-y-3 mb-5">
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-stretch lg:items-center">

            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold shadow-md shadow-slate-900/10'
                      : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {cat === 'all' ? 'ALL PAPERS' : cat}
                </button>
              ))}

              {scholarUrl && (
                <>
                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                  <a
                    href={scholarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all cursor-pointer bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 border border-brand-200 dark:border-brand-800"
                    title="View Google Scholar Profile"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Scholar Profile</span>
                  </a>
                </>
              )}
            </div>

            {/* Right controls: Sorting + Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">

              {/* Sort selector */}
              <div className="flex items-center space-x-1.5 bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 shadow-sm text-xs text-slate-700 dark:text-slate-200">
                <ArrowUpDown className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-400">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
                >
                  <option value="citations" className="dark:bg-slate-800">Most Cited First</option>
                  <option value="latest" className="dark:bg-slate-800">Latest Work First</option>
                  <option value="journal_first" className="dark:bg-slate-800">Journals First</option>
                  <option value="oldest" className="dark:bg-slate-800">Oldest First</option>
                </select>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, author, venue..."
                  className="w-full pl-9 pr-4 py-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors shadow-sm"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Publications List */}
        {filteredAndSortedPubs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">No publications matched your filter criteria.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-xs font-mono text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* First Batch */}
            {firstBatch.map((pub, idx) => renderPublicationCard(pub, idx))}

            {/* Expandable Remaining Publications + Divider Button */}
            {hasMore && (
              <div className="relative mt-6 sm:mt-8">
                <div
                  ref={contentRef}
                  className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
                  style={{ maxHeight: expanded ? `${contentHeight}px` : '0px' }}
                >
                  <div className="space-y-4 pb-6">
                    {secondBatch.map((pub, idx) => renderPublicationCard(pub, initialCount + idx))}
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
                      <span>{expanded ? 'Show less' : `Show ${secondBatch.length} more publication${secondBatch.length === 1 ? '' : 's'}`}</span>
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
        )}

      </div>

      {/* BibTeX Modal */}
      {activeBibtexPub && (
        <BibtexModal
          publication={activeBibtexPub}
          onClose={() => setActiveBibtexPub(null)}
        />
      )}

      {/* Publication Details Modal */}
      {activeDetailsPub && (
        <PublicationDetailsModal
          publication={activeDetailsPub}
          onClose={() => setActiveDetailsPub(null)}
          citationCount={citationCounts[activeDetailsPub.id]}
        />
      )}
    </section>
  );
};

