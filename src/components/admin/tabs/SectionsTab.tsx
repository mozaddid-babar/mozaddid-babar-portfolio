import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  FileText, 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Code,
  User,
  Briefcase,
  Terminal,
  Award,
  ShieldCheck,
  Trophy,
  Users,
  UserCheck,
  Mail,
  HeartHandshake,
  GraduationCap,
  Sparkles,
  Printer,
  Play,
  MousePointer,
  Wand2,
  RefreshCw,
  X,
  Zap,
  Compass,
  Type,
  Tag,
  AlignLeft,
  Edit3,
  Sliders,
  Check
} from 'lucide-react';
import { 
  SectionConfig, 
  PortfolioData, 
  DEFAULT_SECTIONS, 
  DEFAULT_CV_TITLES,
  SectionMotionCategory, 
  SectionHoverEffect 
} from '../../../types';
import { 
  MOTION_CATEGORIES, 
  HOVER_EFFECTS, 
  MOTION_PRESETS 
} from '../../../utils/motionCategories';
import { SectionMotionWrapper } from '../../motion/SectionMotionWrapper';
import { updateSectionsAPI, resetSectionsAPI, toggleSectionVisibilityAPI } from '../../../api';

interface SectionsTabProps {
  data: PortfolioData;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onViewLive: () => void;
  onOpenCvPreview?: () => void;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  hero: User,
  about: Sparkles,
  publications: BookOpen,
  experience: Briefcase,
  projects: Code,
  capabilities: Terminal,
  training: GraduationCap,
  certifications: ShieldCheck,
  achievements: Trophy,
  awards: Award,
  volunteer: HeartHandshake,
  affiliations: Users,
  references: UserCheck,
  contact: Mail
};

export const SectionsTab: React.FC<SectionsTabProps> = ({
  data,
  onRefresh,
  showToast,
  onViewLive,
  onOpenCvPreview
}) => {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Live 3D preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    section: SectionConfig | null;
    motionCategory: SectionMotionCategory;
    hoverEffect: SectionHoverEffect;
    replayKey: number;
  } | null>(null);

  // Expanded header editors per section
  const [expandedHeaders, setExpandedHeaders] = useState<Record<string, boolean>>({});

  const toggleHeaderExpanded = (id: string) => {
    setExpandedHeaders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    if (data.sections && data.sections.length > 0) {
      setSections(data.sections);
    } else {
      setSections(DEFAULT_SECTIONS);
    }
    setHasUnsavedChanges(false);
  }, [data.sections]);

  // Content count helper for each section
  const getContentCount = (id: string): string | null => {
    switch (id) {
      case 'about':
        return `${data.researchPillars?.length || 4} research pillars`;
      case 'publications':
        return `${data.publications?.length || 0} publications`;
      case 'projects':
        return `${data.projects?.length || 0} projects`;
      case 'experience':
        return `${(data.experience?.length || 0) + (data.education?.length || 0)} appointments & degrees`;
      case 'capabilities':
        return `${data.skillGroups?.length || 0} skill domains`;
      case 'training':
        return `${data.trainings?.length || 0} courses`;
      case 'certifications':
        return `${data.certifications?.length || 0} certifications`;
      case 'achievements':
        return `${data.achievements?.length || 0} achievements`;
      case 'awards':
        return `${data.awards?.length || 0} awards`;
      case 'volunteer':
        return `${data.volunteerWork?.length || 0} activities`;
      case 'affiliations':
        return `${data.affiliations?.length || 0} memberships`;
      case 'references':
        return `${data.references?.length || 0} referees`;
      case 'contact':
        return `${data.profile?.contactFields?.length || 0} channels`;
      default:
        return null;
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...sections];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setSections(newItems);
    setDraggedIndex(index);
    setHasUnsavedChanges(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    await autoSaveSections(sections);
  };

  // Move up/down single step
  const moveSection = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setSections(updated);
    await autoSaveSections(updated);
  };

  // Auto-save helper
  const autoSaveSections = async (updatedSections: SectionConfig[]) => {
    try {
      setSaving(true);
      await updateSectionsAPI(updatedSections);
      setHasUnsavedChanges(false);
      showToast('Section order & visibility saved!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update section ordering', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Motion category selector handler
  const handleMotionChange = async (id: string, motionCategory: SectionMotionCategory) => {
    const updated = sections.map(s => s.id === id ? { ...s, motionCategory } : s);
    setSections(updated);
    await autoSaveSections(updated);
    showToast(`Updated 3D motion for ${sections.find(s => s.id === id)?.label}`, 'success');
  };

  // Hover effect selector handler
  const handleHoverChange = async (id: string, hoverEffect: SectionHoverEffect) => {
    const updated = sections.map(s => s.id === id ? { ...s, hoverEffect } : s);
    setSections(updated);
    await autoSaveSections(updated);
    showToast(`Updated hover effect for ${sections.find(s => s.id === id)?.label}`, 'success');
  };

  // Preset batch helper
  const applyMotionPreset = async (presetId: string) => {
    let updated = [...sections];
    if (presetId === 'curated-dynamic') {
      const defaultMap = new Map(DEFAULT_SECTIONS.map(d => [d.id, d]));
      updated = updated.map(s => {
        const def = defaultMap.get(s.id);
        return {
          ...s,
          motionCategory: def?.motionCategory || 'perspective-flip',
          hoverEffect: def?.hoverEffect || 'tilt-3d'
        };
      });
    } else if (presetId === 'all-perspective') {
      updated = updated.map(s => ({ ...s, motionCategory: 'perspective-flip' as SectionMotionCategory }));
    } else if (presetId === 'all-isometric') {
      updated = updated.map(s => ({ ...s, motionCategory: 'isometric-drift' as SectionMotionCategory }));
    } else if (presetId === 'all-depth-zoom') {
      updated = updated.map(s => ({ ...s, motionCategory: 'depth-zoom' as SectionMotionCategory }));
    } else if (presetId === 'all-origami') {
      updated = updated.map(s => ({ ...s, motionCategory: 'origami-fold' as SectionMotionCategory }));
    } else if (presetId === 'all-subtle') {
      updated = updated.map(s => ({ ...s, motionCategory: 'subtle-elevation' as SectionMotionCategory }));
    } else if (presetId === 'hover-tilt') {
      updated = updated.map(s => ({ ...s, hoverEffect: 'tilt-3d' as SectionHoverEffect }));
    } else if (presetId === 'hover-lift') {
      updated = updated.map(s => ({ ...s, hoverEffect: 'lift-float' as SectionHoverEffect }));
    }
    setSections(updated);
    await autoSaveSections(updated);
    showToast('Applied 3D motion preset across all sections!', 'success');
  };

  // Toggle single section visibility (supports frontend, CV, and header fields)
  const toggleVisibility = async (
    id: string, 
    field: 'showInFrontend' | 'showInCv' | 'showTitle' | 'showTopText' | 'showDescription'
  ) => {
    const updated = sections.map(s => {
      if (s.id === id) {
        const currentVal = s[field];
        // For showTitle, default is true if undefined; for others default is false if undefined
        const effectiveVal = field === 'showTitle' 
          ? (currentVal !== false) 
          : Boolean(currentVal);
        return { ...s, [field]: !effectiveVal };
      }
      return s;
    });

    setSections(updated);
    await autoSaveSections(updated);
  };

  // Update section text field (title, top badge, description, cvTitle, cvEducationTitle)
  const updateSectionTextField = (
    id: string,
    field: 'title' | 'topText' | 'description' | 'label' | 'cvTitle' | 'cvEducationTitle' | 'experienceColumnTitle' | 'educationColumnTitle' | 'educationHiddenText',
    value: string
  ) => {
    const updated = sections.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setSections(updated);
    setHasUnsavedChanges(true);
  };

  // Batch header visibility (show/hide all titles, badges, or descriptions)
  const batchHeaderVisibility = async (
    field: 'showTitle' | 'showTopText' | 'showDescription',
    value: boolean
  ) => {
    const updated = sections.map(s => ({
      ...s,
      [field]: value
    }));
    setSections(updated);
    await autoSaveSections(updated);
    showToast(`Updated visibility for all sections!`, 'success');
  };

  // Apply default visibility rule: Only Section Titles are visible
  const applyDefaultHeaderRules = async () => {
    const updated = sections.map(s => ({
      ...s,
      showTitle: true,
      showTopText: false,
      showDescription: false
    }));
    setSections(updated);
    await autoSaveSections(updated);
    showToast('Applied default visibility: Only Section Titles are visible!', 'success');
  };

  // Batch show/hide for frontend or CV
  const batchToggle = async (field: 'showInFrontend' | 'showInCv', value: boolean) => {
    const updated = sections.map(s => ({ ...s, [field]: value }));
    setSections(updated);
    await autoSaveSections(updated);
  };

  // Reset to default ordering
  const handleReset = async () => {
    if (!window.confirm('Reset all sections to their original default layout and visibility?')) return;
    try {
      setSaving(true);
      const res = await resetSectionsAPI();
      setSections(res);
      showToast('Sections reset to default ordering & visibility', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to reset sections', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Counters
  const frontendVisibleCount = sections.filter(s => s.showInFrontend !== false).length;
  const cvVisibleCount = sections.filter(s => s.showInCv !== false).length;

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-sections-tab">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-800 via-slate-800/90 to-brand-950/40 border border-slate-700/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <Layers className="w-3.5 h-3.5" />
            <span>Site Architecture & Sections Layout</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Frontend Sections Ordering, Titles & Visibility
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Drag rows or click arrows to reorder sections. Manage each section&apos;s <strong className="text-brand-300">Title</strong>, <strong className="text-cyan-300">Top Badge Text</strong>, and <strong className="text-indigo-300">Description</strong> with individual hide/unhide toggles. By default, only section titles are visible on the website.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenCvPreview && (
            <button
              onClick={onOpenCvPreview}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-200 bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/60 shadow-md transition-all cursor-pointer"
              title="Preview CV with your visibility settings"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Preview / Print CV</span>
            </button>
          )}

          <button
            onClick={onViewLive}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all cursor-pointer"
          >
            <span>Preview Live Site</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Control Bar & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-700/80 text-slate-200 font-medium">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Total Sections: <strong className="text-white font-bold">{sections.length}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-950/50 text-brand-300 border border-brand-800/60 font-medium">
            <Eye className="w-3.5 h-3.5 text-brand-400" />
            <span>Frontend Visible: <strong className="text-brand-200 font-bold">{frontendVisibleCount}</strong> of {sections.length}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-950/50 text-indigo-300 border border-indigo-800/60 font-medium">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>CV Included: <strong className="text-indigo-200 font-bold">{cvVisibleCount}</strong> of {sections.length}</span>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedChanges && (
            <button
              onClick={() => autoSaveSections(sections)}
              disabled={saving}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Layout'}</span>
            </button>
          )}

          <div className="flex items-center rounded-lg bg-slate-700/60 p-0.5 border border-slate-600/60">
            <button
              onClick={() => batchToggle('showInFrontend', true)}
              className="px-2.5 py-1 text-[11px] font-semibold text-brand-300 hover:text-white rounded hover:bg-slate-600 transition-colors"
              title="Show all sections in frontend"
            >
              Show All (Web)
            </button>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => batchToggle('showInFrontend', false)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-red-300 rounded hover:bg-slate-600 transition-colors"
              title="Hide all sections in frontend"
            >
              Hide All (Web)
            </button>
          </div>

          <div className="flex items-center rounded-lg bg-slate-700/60 p-0.5 border border-slate-600/60">
            <button
              onClick={() => batchToggle('showInCv', true)}
              className="px-2.5 py-1 text-[11px] font-semibold text-indigo-300 hover:text-white rounded hover:bg-slate-600 transition-colors"
              title="Include all sections in CV"
            >
              Show All (CV)
            </button>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => batchToggle('showInCv', false)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:text-red-300 rounded hover:bg-slate-600 transition-colors"
              title="Exclude all sections from CV"
            >
              Hide All (CV)
            </button>
          </div>

          {/* Default Titles Only Visibility Preset Button */}
          <button
            type="button"
            onClick={applyDefaultHeaderRules}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 shadow-sm transition-all cursor-pointer"
            title="Set default visibility: Titles visible, Top Badges and Descriptions hidden"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Default: Titles Only</span>
          </button>

          <button
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Reset to original default section order"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Order</span>
          </button>
        </div>
      </div>

      {/* 3D Motion & Interactive Physics Suite */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950/40 border border-slate-700/80 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>3D Section Rendering Motions & Physics</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                  Selectable Per Section
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose distinct 3D entrance motions & interactive mouse hover physics for each section below, or apply quick curated themes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyMotionPreset('curated-dynamic')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md transition-all cursor-pointer"
              title="Apply curated diverse 3D motions matched to each section type"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Apply Curated 3D Theme</span>
            </button>
          </div>
        </div>

        {/* Preset quick actions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-700/60 text-xs">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Presets:</span>
          {MOTION_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyMotionPreset(p.id)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-700 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title={p.description}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => applyMotionPreset('hover-tilt')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/60 transition-colors cursor-pointer"
            title="Set all sections to 3D Interactive Tilt on hover"
          >
            🎯 All 3D Tilt Hover
          </button>
          <button
            type="button"
            onClick={() => applyMotionPreset('hover-lift')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 transition-colors cursor-pointer"
            title="Set all sections to Dynamic Lift on hover"
          >
            🎈 All Lift & Float
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-3" id="sections-reorder-list">
        {sections.map((sec, index) => {
          const Icon = SECTION_ICONS[sec.id] || Layers;
          const isFrontendVisible = sec.showInFrontend !== false;
          const isCvVisible = sec.showInCv !== false;
          const isDragging = draggedIndex === index;
          const contentCount = getContentCount(sec.id);
          const currentMotion = MOTION_CATEGORIES.find(m => m.id === (sec.motionCategory || 'perspective-flip')) || MOTION_CATEGORIES[0];
          const currentHover = HOVER_EFFECTS.find(h => h.id === (sec.hoverEffect || 'tilt-3d')) || HOVER_EFFECTS[0];

          return (
            <div
              key={sec.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              className={`group flex flex-col p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 select-none ${
                isDragging
                  ? 'opacity-40 bg-slate-800/50 border-brand-500 border-dashed scale-[0.99]'
                  : isFrontendVisible
                  ? 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600 shadow-sm'
                  : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800/80 opacity-75'
              }`}
              id={`section-row-${sec.id}`}
            >
              {/* Top Row: Section Info & Visibility Buttons */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left Column: Drag Handle, Number, Icon & Details */}
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  
                  {/* Drag Handle */}
                  <div 
                    className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-white p-1 rounded hover:bg-slate-700/60 transition-colors flex-shrink-0"
                    title="Drag and drop to reorder section"
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Move Up/Down Quick Buttons */}
                  <div className="flex flex-col space-y-0.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ${
                        index === 0 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      title="Move section up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      className={`p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ${
                        index === sections.length - 1 ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      title="Move section down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Order Index Badge */}
                  <div className="w-8 h-8 rounded-xl bg-slate-700/70 border border-slate-600/40 flex items-center justify-center text-xs font-mono font-bold text-slate-200 flex-shrink-0 shadow-inner">
                    #{index + 1}
                  </div>

                  {/* Section Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isFrontendVisible 
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Title & Description */}
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold truncate ${
                        isFrontendVisible ? 'text-white' : 'text-slate-400 line-through decoration-slate-600'
                      }`}>
                        {sec.title || sec.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                        id: {sec.id}
                      </span>
                      {contentCount && (
                        <span className="hidden sm:inline-block text-[10px] font-medium text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
                          {contentCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-light truncate mt-0.5">
                      {sec.description || 'Portfolio section component'}
                    </p>

                    {/* Live Header Status Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        sec.showTitle !== false 
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <Type className="w-2.5 h-2.5" />
                        <span>Title: {sec.showTitle !== false ? 'Visible' : 'Hidden'}</span>
                      </span>

                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        sec.showTopText === true 
                          ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <Tag className="w-2.5 h-2.5" />
                        <span>Top Badge: {sec.showTopText === true ? 'Visible' : 'Hidden'}</span>
                      </span>

                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        sec.showDescription === true 
                          ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <AlignLeft className="w-2.5 h-2.5" />
                        <span>Description: {sec.showDescription === true ? 'Visible' : 'Hidden'}</span>
                      </span>

                      {sec.id === 'hero' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60" title="Subtitle under candidate name in generated CV & PDF">
                          <FileText className="w-2.5 h-2.5" />
                          <span>CV Subtitle: &ldquo;{sec.cvTitle || data.profile.headline || data.profile.title || 'Professional Title'}&rdquo;</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60" title="Section title in generated CV & PDF">
                          <FileText className="w-2.5 h-2.5" />
                          <span>CV: &ldquo;{sec.cvTitle || DEFAULT_CV_TITLES[sec.id] || sec.title || sec.label}&rdquo;</span>
                        </span>
                      )}
                      {sec.id === 'experience' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-950/60 text-purple-300 border border-purple-800/60" title="Education heading in generated CV & PDF">
                          <GraduationCap className="w-2.5 h-2.5" />
                          <span>CV Edu: &ldquo;{sec.cvEducationTitle || 'Education'}&rdquo;</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Visibility & Header Edit Buttons */}
                <div className="flex items-center justify-end gap-2.5 mt-3 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/60 flex-shrink-0">
                  
                  {/* Status indicator on desktop */}
                  <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-slate-400 mr-2">
                    {!isFrontendVisible && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 font-medium">
                        Hidden on Site
                      </span>
                    )}
                    {!isCvVisible && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                        Excluded in CV
                      </span>
                    )}
                  </div>

                  {/* Header Management Button */}
                  <button
                    type="button"
                    onClick={() => toggleHeaderExpanded(sec.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      expandedHeaders[sec.id]
                        ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700/60'
                    }`}
                    title="Customize Section Title, Top Badge Text, and Subtitle Description"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-brand-300" />
                    <span>Manage Header</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedHeaders[sec.id] ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Frontend Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(sec.id, 'showInFrontend')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isFrontendVisible
                        ? 'bg-brand-600/20 text-brand-300 border-brand-500/40 hover:bg-brand-600/30 shadow-sm'
                        : 'bg-slate-800/90 text-slate-500 border-slate-700 hover:text-slate-300 hover:bg-slate-700/60'
                    }`}
                    title={isFrontendVisible ? 'Visible on public frontend — Click to hide' : 'Hidden from public frontend — Click to show'}
                    id={`toggle-frontend-${sec.id}`}
                  >
                    {isFrontendVisible ? (
                      <>
                        <Eye className="w-4 h-4 text-brand-400" />
                        <span>Frontend: On</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4 text-slate-500" />
                        <span>Frontend: Off</span>
                      </>
                    )}
                  </button>

                  {/* CV Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(sec.id, 'showInCv')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isCvVisible
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30 shadow-sm'
                        : 'bg-slate-800/90 text-slate-500 border-slate-700 hover:text-slate-300 hover:bg-slate-700/60'
                    }`}
                    title={isCvVisible ? 'Included in CV resume — Click to exclude' : 'Excluded from CV resume — Click to include'}
                    id={`toggle-cv-${sec.id}`}
                  >
                    <FileText className={`w-4 h-4 ${isCvVisible ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{isCvVisible ? 'CV: On' : 'CV: Off'}</span>
                  </button>

                </div>
              </div>

              {/* Expandable Section Header Content & Visibility Management Panel */}
              {expandedHeaders[sec.id] && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-700/70 p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-brand-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Manage Section Header & Visibility
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      By default, only Section Title is visible on public pages.
                    </span>
                  </div>

                  {/* 1. Section Title */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Type className="w-3.5 h-3.5 text-brand-400" />
                        <span>Section Title</span>
                        <span className="text-[10px] text-slate-400 font-normal">(Visible by default)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(sec.id, 'showTitle')}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          sec.showTitle !== false
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/70'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {sec.showTitle !== false ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Title: Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Title: Hidden</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sec.title !== undefined ? sec.title : (sec.label || '')}
                      onChange={(e) => updateSectionTextField(sec.id, 'title', e.target.value)}
                      placeholder="e.g. Featured Projects & Systems"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* 2. Text on Top of Section Title (Badge / Eyebrow) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-cyan-400" />
                        <span>
                          {sec.id === 'hero' 
                            ? 'Splash Screen Welcome Text / Hero Top Badge' 
                            : 'Text on Top of Section Title (Badge / Eyebrow)'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {sec.id === 'hero' ? '(Shown on initial loading splash)' : '(Hidden by default)'}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(sec.id, 'showTopText')}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          sec.showTopText === true
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/70'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {sec.showTopText === true ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Top Text: Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Top Text: Hidden</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={sec.topText || ''}
                      onChange={(e) => updateSectionTextField(sec.id, 'topText', e.target.value)}
                      placeholder={sec.id === 'hero' ? 'e.g. WELCOME' : 'e.g. ENGINEERING & APPLIED AI'}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  {/* 3. Section Description (Subtitle below title) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Section Description (Subtitle below title)</span>
                        <span className="text-[10px] text-slate-400 font-normal">(Hidden by default)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleVisibility(sec.id, 'showDescription')}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                          sec.showDescription === true
                            ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/70'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                        }`}
                      >
                        {sec.showDescription === true ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Description: Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                            <span>Description: Hidden</span>
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={sec.description || ''}
                      onChange={(e) => updateSectionTextField(sec.id, 'description', e.target.value)}
                      placeholder="Brief description or subtitle displayed beneath the section title..."
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-y"
                    />
                  </div>

                  {/* 4. CV Section Title / Subtitle (Heading in Generated CV & PDF) */}
                  {sec.id === 'hero' ? (
                    <div className="space-y-2 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/25">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <label className="font-semibold text-purple-200 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>CV Header Subtitle / Target Role</span>
                          <span className="text-[10px] text-purple-300/80 font-normal">(Subtitle appearing under your name in the CV)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Defaults to &ldquo;{data.profile.headline || data.profile.title || 'Professional Title'}&rdquo;
                        </span>
                      </div>
                      <input
                        type="text"
                        value={sec.cvTitle !== undefined ? sec.cvTitle : ''}
                        onChange={(e) => updateSectionTextField(sec.id, 'cvTitle', e.target.value)}
                        placeholder={`e.g. ${data.profile.headline || data.profile.title || 'Machine Learning Researcher & Software Engineer'}`}
                        className="w-full px-3 py-2 bg-slate-800 border border-purple-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/25">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                        <label className="font-semibold text-purple-200 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-purple-400" />
                          <span>CV Section Title</span>
                          <span className="text-[10px] text-purple-300/80 font-normal">(Heading in Generated CV &amp; Downloaded PDF)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">
                          Defaults to &ldquo;{DEFAULT_CV_TITLES[sec.id] || sec.title || sec.label}&rdquo;
                        </span>
                      </div>
                      <input
                        type="text"
                        value={sec.cvTitle !== undefined ? sec.cvTitle : (DEFAULT_CV_TITLES[sec.id] || '')}
                        onChange={(e) => updateSectionTextField(sec.id, 'cvTitle', e.target.value)}
                        placeholder={`e.g. ${DEFAULT_CV_TITLES[sec.id] || sec.title || sec.label}`}
                        className="w-full px-3 py-2 bg-slate-800 border border-purple-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />

                      {/* For Experience & Education section, also allow configuring Education heading */}
                      {sec.id === 'experience' && (
                        <div className="pt-2.5 mt-2.5 border-t border-purple-500/20 space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                            <label className="font-semibold text-purple-200 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                              <span>CV Education Heading</span>
                              <span className="text-[10px] text-purple-300/80 font-normal">(Degrees / Academic Qualifications Title)</span>
                            </label>
                            <span className="text-[10px] text-slate-400">
                              Defaults to &ldquo;Education&rdquo;
                            </span>
                          </div>
                          <input
                            type="text"
                            value={sec.cvEducationTitle !== undefined ? sec.cvEducationTitle : 'Education'}
                            onChange={(e) => updateSectionTextField(sec.id, 'cvEducationTitle', e.target.value)}
                            placeholder="e.g. Education"
                            className="w-full px-3 py-2 bg-slate-800 border border-purple-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                          />

                          {/* Portfolio Webpage Column Headings */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                <span>Experience Column Heading</span>
                              </label>
                              <input
                                type="text"
                                value={sec.experienceColumnTitle !== undefined ? sec.experienceColumnTitle : 'Relevant Experiences'}
                                onChange={(e) => updateSectionTextField(sec.id, 'experienceColumnTitle', e.target.value)}
                                placeholder="e.g. Relevant Experiences"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                <span>Education Column Heading</span>
                              </label>
                              <input
                                type="text"
                                value={sec.educationColumnTitle !== undefined ? sec.educationColumnTitle : 'Academic Education'}
                                onChange={(e) => updateSectionTextField(sec.id, 'educationColumnTitle', e.target.value)}
                                placeholder="e.g. Academic Education"
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                              />
                            </div>
                          </div>

                          {/* Hidden Education Indicator Badge Text */}
                          <div className="space-y-1 pt-1">
                            <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                              <span>Education Hidden Strip Text</span>
                              <span className="text-[10px] text-slate-400 font-normal">(Vertical strip text when hidden)</span>
                            </label>
                            <input
                              type="text"
                              value={sec.educationHiddenText !== undefined ? sec.educationHiddenText : 'Education Hidden'}
                              onChange={(e) => updateSectionTextField(sec.id, 'educationHiddenText', e.target.value)}
                              placeholder="e.g. Education Hidden"
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                    <span>Changes to text save with &ldquo;Save Layout&rdquo; or the button to the right.</span>
                    <button
                      type="button"
                      onClick={() => autoSaveSections(sections)}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs cursor-pointer shadow-sm transition-colors"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save Content</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Row: 3D Motion Category & Hover Physics Selector Bar */}
              <div className="pt-3 mt-3 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-900/40 -mx-3.5 -mb-3.5 p-3 rounded-b-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Motion Category Dropdown */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      Motion:
                    </span>
                    <select
                      value={sec.motionCategory || 'perspective-flip'}
                      onChange={(e) => handleMotionChange(sec.id, e.target.value as SectionMotionCategory)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-brand-500 cursor-pointer shadow-inner"
                      id={`select-motion-${sec.id}`}
                    >
                      {MOTION_CATEGORIES.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.tag})
                        </option>
                      ))}
                    </select>
                    <span className={`hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${currentMotion.badgeBg} ${currentMotion.badgeText} border ${currentMotion.borderColor}`}>
                      {currentMotion.tag}
                    </span>
                  </div>

                  {/* Hover Effect Dropdown */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                      Hover:
                    </span>
                    <select
                      value={sec.hoverEffect || 'tilt-3d'}
                      onChange={(e) => handleHoverChange(sec.id, e.target.value as SectionHoverEffect)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-brand-500 cursor-pointer shadow-inner"
                      id={`select-hover-${sec.id}`}
                    >
                      {HOVER_EFFECTS.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live 3D Preview Button */}
                <button
                  type="button"
                  onClick={() => setPreviewModal({
                    isOpen: true,
                    section: sec,
                    motionCategory: sec.motionCategory || 'perspective-flip',
                    hoverEffect: sec.hoverEffect || 'tilt-3d',
                    replayKey: Date.now()
                  })}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-300 bg-brand-950/70 hover:bg-brand-900/80 border border-brand-700/60 shadow-sm transition-all cursor-pointer"
                  title="Live 3D Preview this section's entrance and hover physics"
                >
                  <Play className="w-3 h-3 text-brand-400" />
                  <span>Preview 3D Motion</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Helpful Instructions Footer */}
      <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400 flex items-start space-x-3">
        <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-300">How Section Ordering, Motions & Visibility Work:</p>
          <ul className="list-disc list-inside space-y-0.5 text-slate-400 pl-1">
            <li>Any change made here immediately rearranges the live website layout and applies 3D animations in real-time.</li>
            <li>Each section can have its own <strong className="text-brand-300">3D Motion Category</strong> (Perspective Flip, Isometric Drift, Depth Zoom, Origami Fold, Cascade Stagger, Matrix Glissade, Subtle Elevation).</li>
            <li>Interactive <strong className="text-cyan-300">Hover Physics</strong> (3D Interactive Tilt with specular reflection, Dynamic Lift, Ambient Glow, Magnetic Pull) dynamically engage user interaction.</li>
            <li>When <strong className="text-brand-300">Frontend: Off</strong> is selected, the section and its navigation links are completely removed from the public website.</li>
            <li>When <strong className="text-indigo-300">CV: Off</strong> is selected, the section is omitted from curriculum vitae outputs and PDF resumes.</li>
          </ul>
        </div>
      </div>

      {/* Live 3D Motion Preview Modal */}
      {previewModal && previewModal.isOpen && previewModal.section && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    3D Motion Preview: {previewModal.section.label}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live simulation of section entrance animation and interactive hover physics
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls: Switch Motion / Hover on the fly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Rendering Motion Category:
                </label>
                <select
                  value={previewModal.motionCategory}
                  onChange={(e) => setPreviewModal({
                    ...previewModal,
                    motionCategory: e.target.value as SectionMotionCategory,
                    replayKey: Date.now()
                  })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  {MOTION_CATEGORIES.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.tag})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                  Hover Physics Effect:
                </label>
                <select
                  value={previewModal.hoverEffect}
                  onChange={(e) => setPreviewModal({
                    ...previewModal,
                    hoverEffect: e.target.value as SectionHoverEffect
                  })}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                >
                  {HOVER_EFFECTS.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Interactive Canvas */}
            <div className="p-4 sm:p-8 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center justify-center min-h-[220px]">
              <SectionMotionWrapper
                key={previewModal.replayKey}
                motionCategory={previewModal.motionCategory}
                hoverEffect={previewModal.hoverEffect}
                className="w-full max-w-md cursor-pointer"
              >
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-brand-400 uppercase tracking-wider">
                      {previewModal.section.id} section
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      {MOTION_CATEGORIES.find(m => m.id === previewModal.motionCategory)?.tag}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {previewModal.section.label}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {previewModal.section.description || 'Live demonstration card showing 3D rendering animation.'}
                  </p>
                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Hover: <strong className="text-cyan-300">{HOVER_EFFECTS.find(h => h.id === previewModal.hoverEffect)?.name}</strong></span>
                    <span className="text-emerald-400 font-mono">Move mouse across to test tilt ➔</span>
                  </div>
                </div>
              </SectionMotionWrapper>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setPreviewModal({
                  ...previewModal,
                  replayKey: Date.now()
                })}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replay Animation</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const secId = previewModal.section!.id;
                    const updated = sections.map(s => s.id === secId ? {
                      ...s,
                      motionCategory: previewModal.motionCategory,
                      hoverEffect: previewModal.hoverEffect
                    } : s);
                    setSections(updated);
                    await autoSaveSections(updated);
                    showToast(`Saved 3D motion for ${previewModal.section!.label}!`, 'success');
                    setPreviewModal(null);
                  }}
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply & Save to Section</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
