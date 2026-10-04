import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Wand2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Save, 
  ExternalLink, 
  Eye, 
  Layers, 
  ShieldCheck, 
  Clock, 
  FileCheck,
  Check,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { PortfolioData, CvSettings, DEFAULT_CV_TITLES } from '../../../types';
import { updateCvSettingsAPI, updateSectionsAPI } from '../../../api';

interface CvManagerTabProps {
  data: PortfolioData;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onOpenCvPreview: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const CvManagerTab: React.FC<CvManagerTabProps> = ({
  data,
  onRefresh,
  showToast,
  onOpenCvPreview,
  onNavigateTab
}) => {
  const currentSettings: CvSettings = data.profile.cvSettings || {
    downloadMode: 'auto',
    manualCvUrl: data.profile.cvUrl && data.profile.cvUrl !== '#' ? data.profile.cvUrl : '',
    manualCvFileName: '',
    manualCvFileSize: 0,
    manualCvUploadedAt: ''
  };

  const [downloadMode, setDownloadMode] = useState<'auto' | 'manual'>(currentSettings.downloadMode || 'auto');
  const [manualCvUrl, setManualCvUrl] = useState<string>(currentSettings.manualCvUrl || '');
  const [manualCvFileName, setManualCvFileName] = useState<string>(currentSettings.manualCvFileName || '');
  const [manualCvFileSize, setManualCvFileSize] = useState<number>(currentSettings.manualCvFileSize || 0);
  const [manualCvUploadedAt, setManualCvUploadedAt] = useState<string>(currentSettings.manualCvUploadedAt || '');
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sections = data.sections || [];
  const cvSections = sections.filter(s => s.showInCv !== false);

  // Local state for CV section titles
  const [sectionTitles, setSectionTitles] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    (data.sections || []).forEach(s => {
      map[s.id] = s.cvTitle !== undefined ? s.cvTitle : (DEFAULT_CV_TITLES[s.id] || s.title || '');
    });
    return map;
  });
  const [cvEduTitle, setCvEduTitle] = useState<string>(() => {
    const expSec = (data.sections || []).find(s => s.id === 'experience');
    return expSec?.cvEducationTitle || 'Education';
  });
  const [savingTitles, setSavingTitles] = useState(false);

  useEffect(() => {
    const map: Record<string, string> = {};
    (data.sections || []).forEach(s => {
      map[s.id] = s.cvTitle !== undefined ? s.cvTitle : (DEFAULT_CV_TITLES[s.id] || s.title || '');
    });
    setSectionTitles(map);
    const expSec = (data.sections || []).find(s => s.id === 'experience');
    setCvEduTitle(expSec?.cvEducationTitle || 'Education');
  }, [data.sections]);

  const handleSaveCvTitles = async () => {
    try {
      setSavingTitles(true);
      const updated = (data.sections || []).map(s => ({
        ...s,
        cvTitle: sectionTitles[s.id] !== undefined ? sectionTitles[s.id] : s.cvTitle,
        ...(s.id === 'experience' ? { cvEducationTitle: cvEduTitle } : {})
      }));
      await updateSectionsAPI(updated);
      showToast('CV section titles saved successfully!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save CV section titles', 'error');
    } finally {
      setSavingTitles(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please upload a valid PDF document (.pdf)', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('PDF file size exceeds 25MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setManualCvUrl(base64Data);
      setManualCvFileName(file.name);
      setManualCvFileSize(file.size);
      setManualCvUploadedAt(new Date().toISOString());
      setDownloadMode('manual');
      showToast(`Uploaded "${file.name}" successfully! Remember to click "Save Settings".`, 'success');
    };
    reader.onerror = () => {
      showToast('Failed to read PDF file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveManualCv = () => {
    if (confirm('Are you sure you want to remove the custom uploaded CV? The system will switch back to Auto-Generated CV.')) {
      setManualCvUrl('');
      setManualCvFileName('');
      setManualCvFileSize(0);
      setManualCvUploadedAt('');
      setDownloadMode('auto');
      showToast('Custom CV removed. Switched to Auto-Generated CV mode.', 'success');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const payload: CvSettings = {
        downloadMode,
        manualCvUrl,
        manualCvFileName,
        manualCvFileSize,
        manualCvUploadedAt
      };
      await updateCvSettingsAPI(payload);
      showToast('CV download settings saved successfully!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save CV settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestDownloadManual = () => {
    if (!manualCvUrl) return;
    const a = document.createElement('a');
    a.href = manualCvUrl;
    a.download = manualCvFileName || 'Curriculum_Vitae.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto" id="admin-cv-manager-tab">
      
      {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Curriculum Vitae (CV) & Download Manager
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Control the behavior of the public site &ldquo;Download CV&rdquo; button: serve an auto-generated real-time PDF or your uploaded custom PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenCvPreview}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-200 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 shadow-sm transition-all cursor-pointer"
            title="Preview Auto-Generated CV in popup modal"
            id="admin-cv-preview-modal-btn"
          >
            <Eye className="w-3.5 h-3.5 text-indigo-400" />
            <span>Preview Dynamic CV</span>
          </button>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
            id="admin-save-cv-settings-btn"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save CV Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Public Site Active Mode Status Alert */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
        downloadMode === 'manual' && manualCvUrl
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : downloadMode === 'manual' && !manualCvUrl
          ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
          : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
      }`}>
        <div className="mt-0.5">
          {downloadMode === 'manual' && manualCvUrl ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : downloadMode === 'manual' && !manualCvUrl ? (
            <AlertCircle className="w-5 h-5 text-amber-400" />
          ) : (
            <Wand2 className="w-5 h-5 text-blue-400" />
          )}
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-bold text-sm">
            Current Public Behavior:{' '}
            <span className="underline uppercase tracking-wide">
              {downloadMode === 'manual' ? 'Custom Uploaded PDF Mode' : 'Auto-Generated Dynamic CV Mode'}
            </span>
          </p>
          <p className="text-slate-300 font-normal leading-relaxed">
            {downloadMode === 'manual' && manualCvUrl ? (
              <>When visitors click <strong>&ldquo;Download CV&rdquo;</strong> under your profile avatar on the website, they will immediately download your uploaded file: <strong>&ldquo;{manualCvFileName || 'Custom CV.pdf'}&rdquo;</strong> ({formatFileSize(manualCvFileSize)}).</>
            ) : downloadMode === 'manual' && !manualCvUrl ? (
              <>You have selected Custom Uploaded PDF mode, but no PDF is uploaded yet. The system will fall back to downloading the auto-generated CV until a file is provided.</>
            ) : (
              <>When visitors click <strong>&ldquo;Download CV&rdquo;</strong>, they will download the standardized, publication-grade auto-generated A4 PDF containing all active sections and your custom section headings.</>
            )}
          </p>
        </div>
      </div>

      {/* Mode Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Option 1: Auto-Generated CV Card */}
        <div 
          onClick={() => setDownloadMode('auto')}
          className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            downloadMode === 'auto'
              ? 'bg-slate-800/90 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
              : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  downloadMode === 'auto'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Auto-Generated CV
                  </h3>
                  <span className="text-[11px] text-blue-300 font-mono">Dynamic Portfolio Sync</span>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                downloadMode === 'auto'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-600 bg-transparent'
              }`}>
                {downloadMode === 'auto' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Compiles real-time profile data, research publications, timeline appointments, degrees, skills, and honors into a clean A4 PDF.
            </p>

            <div className="pt-2 border-t border-slate-700/60 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Respects custom section headings configured in Admin</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Generous 18mm margins, active clickable links</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Never displays browser date or filename headers</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              {cvSections.length} sections included
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCvPreview();
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
            >
              <span>Preview</span>
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Option 2: Custom Uploaded PDF Card */}
        <div 
          onClick={() => setDownloadMode('manual')}
          className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
            downloadMode === 'manual'
              ? 'bg-slate-800/90 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
              : 'bg-slate-800/50 border-slate-700/70 hover:border-slate-600 hover:bg-slate-800/70'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  downloadMode === 'manual'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Custom Uploaded PDF CV
                  </h3>
                  <span className="text-[11px] text-emerald-300 font-mono">Curated LaTeX / PDF Document</span>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                downloadMode === 'manual'
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-600 bg-transparent'
              }`}>
                {downloadMode === 'manual' && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Upload your own prepared PDF file (such as a LaTeX resume, institutional template, or specialized curriculum vitae) for direct download.
            </p>

            <div className="pt-2 border-t border-slate-700/60 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Direct 1:1 file delivery to visitors</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Supports multi-page LaTeX / Word exported PDFs</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Replace or toggle back to auto-generated at any time</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">
              {manualCvUrl ? `File: ${manualCvFileName || 'Uploaded PDF'}` : 'No file uploaded'}
            </span>
            {manualCvUrl && (
              <span className="text-xs text-emerald-400 font-semibold inline-flex items-center space-x-1">
                <FileCheck className="w-3 h-3" />
                <span>Ready</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Manual PDF Upload & File Management Box */}
      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span>Custom PDF CV File Management</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your custom PDF document here. Used whenever &ldquo;Custom Uploaded PDF CV&rdquo; mode is active.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
            id="manual-cv-file-input"
          />
        </div>

        {manualCvUrl ? (
          /* File Uploaded Card */
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-700/60 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate" title={manualCvFileName}>
                  {manualCvFileName || 'Custom_Curriculum_Vitae.pdf'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span>Size: {formatFileSize(manualCvFileSize)}</span>
                  <span>•</span>
                  <span>Format: PDF</span>
                  {manualCvUploadedAt && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Uploaded {new Date(manualCvUploadedAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleTestDownloadManual}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 transition-colors cursor-pointer"
                title="Test downloading this uploaded file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Test Download</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-colors cursor-pointer"
                title="Replace with a new PDF"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace PDF</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveManualCv}
                className="p-1.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/50 border border-transparent hover:border-red-800/60 transition-colors cursor-pointer"
                title="Delete this file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Empty Dropzone Area */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-950/20'
                : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/80'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/50 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              Click to select a PDF file, or drag and drop it here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports standard .pdf documents up to 25MB (LaTeX resumes, Word exports, or institutional CVs)
            </p>
          </div>
        )}
      </div>

      {/* Dynamic Section Titles Quick Editor Box */}
      <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-5" id="cv-section-titles-editor">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Customize CV Section Titles & Headings</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit the headings that appear above each section in your auto-generated CV and downloaded PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveCvTitles}
              disabled={savingTitles}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingTitles ? 'Saving...' : 'Save CV Titles'}</span>
            </button>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('sections')}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 transition-colors cursor-pointer"
                title="Manage Section ordering, visibility, badges, and headers"
              >
                <span>Sections & Layout</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {cvSections.map((sec, idx) => {
            const isHero = sec.id === 'hero';
            const defaultLabel = isHero 
              ? (data.profile.headline || data.profile.title || 'Professional Title') 
              : (DEFAULT_CV_TITLES[sec.id] || sec.title || sec.label);

            return (
              <div 
                key={sec.id}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-500/40 transition-colors space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-purple-950/80 text-[10px] font-mono font-bold text-purple-300 flex items-center justify-center shrink-0 border border-purple-800/40">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-200 truncate">
                      {sec.label || sec.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      ({sec.id})
                    </span>
                  </div>

                  <span className="text-[10px] text-purple-300/80 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/30 shrink-0">
                    {isHero ? 'Header Subtitle' : 'Section Heading'}
                  </span>
                </div>

                <div className="space-y-1">
                  <input
                    type="text"
                    value={sectionTitles[sec.id] !== undefined ? sectionTitles[sec.id] : ''}
                    onChange={(e) => setSectionTitles({ ...sectionTitles, [sec.id]: e.target.value })}
                    placeholder={`Default: ${defaultLabel}`}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                  />
                  <p className="text-[10px] text-slate-400">
                    Default heading: <span className="text-slate-300 italic">&ldquo;{defaultLabel}&rdquo;</span>
                  </p>
                </div>

                {sec.id === 'experience' && (
                  <div className="pt-2 mt-2 border-t border-slate-800 space-y-1">
                    <label className="text-[11px] font-semibold text-purple-300 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-purple-400" />
                      <span>CV Education Heading:</span>
                    </label>
                    <input
                      type="text"
                      value={cvEduTitle}
                      onChange={(e) => setCvEduTitle(e.target.value)}
                      placeholder="Default: Education"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 focus:border-purple-500 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-700/60 text-xs text-slate-400">
          <span>Click &ldquo;Save CV Titles&rdquo; to apply changes to the live CV modal and PDF downloads.</span>
          <button
            type="button"
            onClick={handleSaveCvTitles}
            disabled={savingTitles}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingTitles ? 'Saving...' : 'Save CV Titles'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};
