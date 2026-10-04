import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Search, 
  FileText, 
  Globe, 
  Sparkles, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  UploadCloud, 
  ExternalLink,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Publication, Profile } from '../../../types';
import { 
  fetchAcademicPapersAPI, 
  parseBibTeXAPI, 
  bulkImportPublicationsAPI 
} from '../../../api';

interface AutoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Profile;
  onSuccess: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface DiscoveredPaper extends Omit<Publication, 'id'> {
  tempId: string;
  selected: boolean;
  existsInDb?: boolean;
  existingId?: string;
  source?: string;
  expanded?: boolean;
}

export const AutoImportPublicationsModal: React.FC<AutoImportModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSuccess,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'scholar' | 'bibtex' | 'doi'>('scholar');
  
  // Tab 1: Scholar / Semantic Scholar
  const [scholarQuery, setScholarQuery] = useState('');
  const [sourceType, setSourceType] = useState<'scholar' | 'semanticscholar'>('scholar');
  
  // Tab 2: BibTeX
  const [bibtexText, setBibtexText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 3: DOI
  const [doiQuery, setDoiQuery] = useState('');

  // Execution & Results state
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [papers, setPapers] = useState<DiscoveredPaper[]>([]);
  const [sourceName, setSourceName] = useState<string>('');
  const [updateExisting, setUpdateExisting] = useState(true);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile) {
      if (profile.social?.scholar) {
        setScholarQuery(profile.social.scholar);
      } else if (profile.name) {
        setScholarQuery(profile.name);
      }
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  // Handle Tab 1: Fetch Scholar / Semantic
  const handleFetchScholar = async () => {
    if (!scholarQuery.trim()) {
      showToast('Please enter a Google Scholar URL, User ID, or Author Name', 'error');
      return;
    }

    setIsLoading(true);
    setWarningMessage(null);
    try {
      const res = await fetchAcademicPapersAPI(sourceType, scholarQuery.trim());
      if (res.data.length === 0) {
        showToast('No publications found. Try entering your full author name or using the BibTeX upload option.', 'error');
      } else {
        setSourceName(res.source || 'Academic Source');
        if (res.notes) {
          setWarningMessage(res.notes);
        }
        const mapped = res.data.map((item: any) => ({
          ...item,
          tempId: item.tempId || `tmp-${Math.random().toString(36).substring(2, 9)}`,
          selected: true,
          expanded: false
        }));
        setPapers(mapped);
        showToast(`Discovered ${mapped.length} publications!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch publications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Tab 2: Parse BibTeX
  const handleParseBibtex = async () => {
    if (!bibtexText.trim()) {
      showToast('Please paste BibTeX entries or upload a .bib file', 'error');
      return;
    }

    setIsLoading(true);
    setWarningMessage(null);
    try {
      const res = await parseBibTeXAPI(bibtexText.trim());
      if (res.data.length === 0) {
        showToast('No valid BibTeX entries could be parsed. Check formatting.', 'error');
      } else {
        setSourceName('BibTeX Data');
        const mapped = res.data.map((item: any) => ({
          ...item,
          tempId: item.tempId || `tmp-${Math.random().toString(36).substring(2, 9)}`,
          selected: true,
          expanded: false
        }));
        setPapers(mapped);
        showToast(`Parsed ${mapped.length} publications from BibTeX!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to parse BibTeX', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle File Upload for BibTeX
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBibtexText(content);
        showToast(`Loaded ${file.name} (${Math.round(file.size / 1024)} KB)`);
      }
    };
    reader.onerror = () => {
      showToast('Failed to read file', 'error');
    };
    reader.readAsText(file);
  };

  // Handle Tab 3: DOI Lookup
  const handleFetchDOI = async () => {
    if (!doiQuery.trim()) {
      showToast('Please enter at least one DOI', 'error');
      return;
    }

    setIsLoading(true);
    setWarningMessage(null);
    try {
      const res = await fetchAcademicPapersAPI('doi', doiQuery.trim());
      if (res.data.length === 0) {
        showToast('Could not resolve metadata for the provided DOI(s).', 'error');
      } else {
        setSourceName('CrossRef DOI Lookup');
        const mapped = res.data.map((item: any) => ({
          ...item,
          tempId: item.tempId || `tmp-${Math.random().toString(36).substring(2, 9)}`,
          selected: true,
          expanded: false
        }));
        setPapers(mapped);
        showToast(`Resolved ${mapped.length} publications from DOIs!`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch DOIs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Selection
  const toggleSelect = (tempId: string) => {
    setPapers(prev => prev.map(p => p.tempId === tempId ? { ...p, selected: !p.selected } : p));
  };

  const toggleSelectAll = () => {
    const allSelected = papers.every(p => p.selected);
    setPapers(prev => prev.map(p => ({ ...p, selected: !allSelected })));
  };

  const updatePaperCategory = (tempId: string, category: Publication['category']) => {
    setPapers(prev => prev.map(p => p.tempId === tempId ? { ...p, category } : p));
  };

  const toggleExpand = (tempId: string) => {
    setPapers(prev => prev.map(p => p.tempId === tempId ? { ...p, expanded: !p.expanded } : p));
  };

  // Execute Bulk Import
  const handleBulkImport = async () => {
    const selectedPapers = papers.filter(p => p.selected);
    if (selectedPapers.length === 0) {
      showToast('Please select at least one publication to import', 'error');
      return;
    }

    setIsImporting(true);
    try {
      const payload = selectedPapers.map(p => ({
        title: p.title,
        authors: p.authors,
        venue: p.venue,
        year: p.year,
        category: p.category,
        doi: p.doi || '',
        link: p.link || '',
        pdfUrl: p.pdfUrl || '',
        abstract: p.abstract || '',
        citations: p.citations || 0,
        featured: !!p.featured,
        tags: p.tags || [],
        bibtex: p.bibtex || ''
      }));

      const res = await bulkImportPublicationsAPI(payload, updateExisting);
      showToast(`Success! Added ${res.addedCount} new papers, updated ${res.updatedCount} existing papers.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Bulk import failed', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = papers.filter(p => p.selected).length;
  const newCount = papers.filter(p => !p.existsInDb).length;
  const existingCount = papers.filter(p => p.existsInDb).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Automated Publications Importer</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  Auto-Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automatically import your research papers, citation metrics, and BibTeX entries.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Source Tabs */}
          <div className="flex items-center space-x-2 p-1.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <button
              onClick={() => setActiveTab('scholar')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'scholar'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Google Scholar & Academic Sync</span>
            </button>

            <button
              onClick={() => setActiveTab('bibtex')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bibtex'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>BibTeX File / Text Import</span>
            </button>

            <button
              onClick={() => setActiveTab('doi')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'doi'
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>DOI Lookup</span>
            </button>
          </div>

          {/* Tab 1: Scholar / Semantic */}
          {activeTab === 'scholar' && (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  Google Scholar Profile URL, User ID, or Author Name
                </label>
                
                {/* Method selector */}
                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="text-slate-400">Fetch Mode:</span>
                  <button
                    type="button"
                    onClick={() => setSourceType('scholar')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      sourceType === 'scholar'
                        ? 'bg-brand-900/60 text-brand-300 border border-brand-700/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Direct Scholar Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('semanticscholar')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      sourceType === 'semanticscholar'
                        ? 'bg-brand-900/60 text-brand-300 border border-brand-700/60'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Semantic Scholar Open API
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={scholarQuery}
                    onChange={(e) => setScholarQuery(e.target.value)}
                    placeholder="e.g. https://scholar.google.com/citations?user=... or Rashedul Islam"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleFetchScholar}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Fetch Publications</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-start space-x-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-300">Tip:</strong> Google Scholar automatically crawls public publications. If Google rate-limits automated requests, our system automatically utilizes the Semantic Scholar Graph API or you can use the 1-click <strong>BibTeX Tab</strong> below!
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: BibTeX Import */}
          {activeTab === 'bibtex' && (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  Paste Raw BibTeX or Upload .bib File
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".bib,.txt,.bibtex"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Choose .bib File</span>
                </button>
              </div>

              <textarea
                value={bibtexText}
                onChange={(e) => setBibtexText(e.target.value)}
                placeholder={`@article{islam2025hydrogen,
  title={Investigate the Performance of Hydrogen Fuel and Compare with Conventional Fuels in Port Fuel Injection SI Engine using CONVERGE CFD},
  author={Islam, Rashedul and Ahmed, Tanvir and Rahman, Md.},
  journal={Next Energy},
  year={2025},
  publisher={Elsevier}
}`}
                rows={6}
                className="w-full p-3 font-mono text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              />

              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  <span className="text-brand-400 font-semibold">How to export from Google Scholar:</span> 
                  {' '}1. Open Scholar $\rightarrow$ 2. Check "Select All" $\rightarrow$ 3. Click "Export" $\rightarrow$ "BibTeX".
                </div>

                <button
                  type="button"
                  disabled={isLoading || !bibtexText.trim()}
                  onClick={handleParseBibtex}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/30 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Parse & Preview Papers</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: DOI Lookup */}
          {activeTab === 'doi' && (
            <div className="space-y-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80">
              <label className="text-xs font-semibold text-slate-300">
                Enter Digital Object Identifier (DOI) or list of DOIs
              </label>

              <textarea
                value={doiQuery}
                onChange={(e) => setDoiQuery(e.target.value)}
                placeholder="10.1016/j.nexten.2024.100234&#10;10.1109/ICRE.2024.123456"
                rows={3}
                className="w-full p-3 font-mono text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-y"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isLoading || !doiQuery.trim()}
                  onClick={handleFetchDOI}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all shadow-md shadow-brand-600/30 flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Resolving...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Fetch Paper Metadata</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notice banner if any */}
          {warningMessage && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Discovered Papers Preview & Selection Section */}
          {papers.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              
              {/* Stats & Batch Controls Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-white">
                    Found {papers.length} publications
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-emerald-400 font-semibold">
                    {newCount} New
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400 font-semibold">
                    {existingCount} Existing in DB
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateExisting}
                      onChange={(e) => setUpdateExisting(e.target.checked)}
                      className="rounded border-slate-700 text-brand-600 focus:ring-brand-500"
                    />
                    <span>Update metadata for existing</span>
                  </label>

                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    {papers.every(p => p.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Papers List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {papers.map((paper) => (
                  <div
                    key={paper.tempId}
                    className={`p-4 rounded-2xl border transition-all ${
                      paper.selected
                        ? 'bg-slate-800/90 border-brand-500/50'
                        : 'bg-slate-900/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={paper.selected}
                        onChange={() => toggleSelect(paper.tempId)}
                        className="mt-1 rounded border-slate-700 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                      />

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              paper.existsInDb
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                                : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            }`}
                          >
                            {paper.existsInDb ? '🔄 Existing Paper' : '✨ New Paper'}
                          </span>

                          <select
                            value={paper.category}
                            onChange={(e) => updatePaperCategory(paper.tempId, e.target.value as any)}
                            className="py-0.5 px-2 text-[11px] font-semibold bg-slate-900 border border-slate-700 rounded-lg text-brand-300 focus:outline-none"
                          >
                            <option value="Journal">Journal</option>
                            <option value="Conference">Conference</option>
                            <option value="Preprint">Preprint</option>
                            <option value="Book Chapter">Book Chapter</option>
                            <option value="Workshop">Workshop</option>
                          </select>

                          <span className="text-xs font-semibold text-slate-400">{paper.year}</span>
                          
                          {paper.citations !== undefined && paper.citations > 0 && (
                            <span className="text-xs font-semibold text-emerald-400">
                              • {paper.citations} Citations
                            </span>
                          )}

                          {paper.source && (
                            <span className="text-[10px] text-slate-500 ml-auto">
                              via {paper.source}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white leading-snug">
                          {paper.title}
                        </h4>

                        <p className="text-xs text-slate-300">
                          <span className="text-slate-400">Authors:</span> {paper.authors}
                        </p>

                        <p className="text-xs text-brand-400 italic">
                          {paper.venue}
                        </p>

                        {paper.doi && (
                          <p className="text-[11px] font-mono text-slate-400">
                            DOI: <span className="text-slate-300">{paper.doi}</span>
                          </p>
                        )}

                        {/* Collapsible Abstract & Bibtex */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => toggleExpand(paper.tempId)}
                            className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium cursor-pointer"
                          >
                            {paper.expanded ? (
                              <>
                                <span>Hide BibTeX & Details</span>
                                <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                <span>Show BibTeX & Details</span>
                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>

                          {paper.expanded && (
                            <div className="mt-2 space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                              {paper.abstract && (
                                <div>
                                  <span className="font-semibold text-slate-400">Abstract:</span>
                                  <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                                    {paper.abstract}
                                  </p>
                                </div>
                              )}
                              {paper.bibtex && (
                                <div>
                                  <span className="font-semibold text-slate-400">BibTeX Snippet:</span>
                                  <pre className="mt-1 p-2 bg-slate-900 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto">
                                    {paper.bibtex}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isImporting || papers.length === 0 || selectedCount === 0}
            onClick={handleBulkImport}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-40 cursor-pointer"
            id="confirm-bulk-import-btn"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Importing to Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Import Selected ({selectedCount}) Publications</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
