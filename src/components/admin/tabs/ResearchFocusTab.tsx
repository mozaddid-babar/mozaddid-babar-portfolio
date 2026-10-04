import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  Activity,
  Brain,
  MessageSquareText,
  Cpu,
  Database,
  Layers,
  Network,
  Code,
  CheckCircle2,
  FileText,
  HelpCircle,
  Tag,
  Palette
} from 'lucide-react';
import { Profile, ResearchPillar } from '../../../types';
import {
  updateProfileAPI,
  createResearchPillarAPI,
  updateResearchPillarAPI,
  deleteResearchPillarAPI,
  reorderResearchPillarsAPI
} from '../../../api';

interface ResearchFocusTabProps {
  profile: Profile;
  researchPillars?: ResearchPillar[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const AVAILABLE_ICONS = [
  { id: 'Activity', label: 'Activity (Signal/Bio)', icon: Activity },
  { id: 'Brain', label: 'Brain (ML/AI/Cognitive)', icon: Brain },
  { id: 'MessageSquareText', label: 'Message (NLP/Text)', icon: MessageSquareText },
  { id: 'Cpu', label: 'CPU (Systems/Hardware)', icon: Cpu },
  { id: 'Database', label: 'Database (Data Mining)', icon: Database },
  { id: 'Layers', label: 'Layers (Architecture)', icon: Layers },
  { id: 'Network', label: 'Network (Graphs/Deep Net)', icon: Network },
  { id: 'Code', label: 'Code (Engineering)', icon: Code },
  { id: 'Sparkles', label: 'Sparkles (Innovation)', icon: Sparkles }
];

const COLOR_THEMES = [
  { id: 'brand', label: 'Brand Cyan', border: 'border-cyan-500/50', bg: 'bg-cyan-500/10', text: 'text-cyan-400', preview: 'bg-cyan-500' },
  { id: 'purple', label: 'Royal Purple', border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400', preview: 'bg-purple-500' },
  { id: 'emerald', label: 'Emerald Green', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10', text: 'text-emerald-400', preview: 'bg-emerald-500' },
  { id: 'blue', label: 'Tech Blue', border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400', preview: 'bg-blue-500' },
  { id: 'amber', label: 'Amber Orange', border: 'border-amber-500/50', bg: 'bg-amber-500/10', text: 'text-amber-400', preview: 'bg-amber-500' },
  { id: 'rose', label: 'Rose Pink', border: 'border-rose-500/50', bg: 'bg-rose-500/10', text: 'text-rose-400', preview: 'bg-rose-500' }
];

export const ResearchFocusTab: React.FC<ResearchFocusTabProps> = ({
  profile,
  researchPillars = [],
  onRefresh,
  showToast
}) => {
  // Narrative State
  const [aboutBadge, setAboutBadge] = useState(profile.aboutBadge || 'Research Focus & Trajectory');
  const [aboutTitle, setAboutTitle] = useState(profile.aboutTitle || 'Academic Background & Mission');
  const [aboutParagraphsText, setAboutParagraphsText] = useState(
    (profile.aboutText || []).join('\n\n')
  );
  const [savingNarrative, setSavingNarrative] = useState(false);

  // Pillars State
  const [pillars, setPillars] = useState<ResearchPillar[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Pillar Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pillarFormData, setPillarFormData] = useState<Omit<ResearchPillar, 'id'>>({
    title: '',
    category: '',
    description: '',
    icon: 'Activity',
    color: 'brand',
    tags: [],
    showInFrontend: true
  });
  const [tagsInput, setTagsInput] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [submittingPillar, setSubmittingPillar] = useState(false);

  useEffect(() => {
    setAboutBadge(profile.aboutBadge || 'Research Focus & Trajectory');
    setAboutTitle(profile.aboutTitle || 'Academic Background & Mission');
    setAboutParagraphsText((profile.aboutText || []).join('\n\n'));
  }, [profile]);

  useEffect(() => {
    setPillars([...researchPillars].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }, [researchPillars]);

  // Save Narrative Section
  const handleSaveNarrative = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNarrative(true);
    const parsedParagraphs = aboutParagraphsText
      .split('\n\n')
      .map(p => p.trim())
      .filter(Boolean);

    try {
      await updateProfileAPI({
        ...profile,
        aboutBadge: aboutBadge.trim(),
        aboutTitle: aboutTitle.trim(),
        aboutText: parsedParagraphs
      });
      showToast('Academic narrative updated successfully!', 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save academic narrative', 'error');
    } finally {
      setSavingNarrative(false);
    }
  };

  // Open Create Pillar Modal
  const openCreateModal = () => {
    setEditingId(null);
    setPillarFormData({
      title: '',
      category: '',
      description: '',
      icon: 'Brain',
      color: 'brand',
      tags: [],
      showInFrontend: true
    });
    setTagsInput('');
    setIsModalOpen(true);
  };

  // Open Edit Pillar Modal
  const openEditModal = (pillar: ResearchPillar) => {
    setEditingId(pillar.id);
    setPillarFormData({
      title: pillar.title || '',
      category: pillar.category || '',
      description: pillar.description || '',
      icon: pillar.icon || 'Activity',
      color: pillar.color || 'brand',
      tags: pillar.tags || [],
      showInFrontend: pillar.showInFrontend !== false
    });
    setTagsInput((pillar.tags || []).join(', '));
    setIsModalOpen(true);
  };

  // Submit Add / Edit Pillar
  const handleSubmitPillar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pillarFormData.title.trim() || !pillarFormData.description.trim()) {
      showToast('Please provide both Title and Description', 'error');
      return;
    }

    setSubmittingPillar(true);
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      ...pillarFormData,
      tags: parsedTags
    };

    try {
      if (editingId) {
        await updateResearchPillarAPI(editingId, payload);
        showToast('Research pillar updated successfully!', 'success');
      } else {
        await createResearchPillarAPI(payload);
        showToast('New research pillar added successfully!', 'success');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Error saving research pillar', 'error');
    } finally {
      setSubmittingPillar(false);
    }
  };

  // Delete Pillar
  const handleDeletePillar = async (id: string) => {
    try {
      await deleteResearchPillarAPI(id);
      showToast('Research pillar deleted', 'success');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete research pillar', 'error');
    }
  };

  // Toggle Pillar Visibility
  const handleToggleVisibility = async (pillar: ResearchPillar) => {
    try {
      const updated = !pillar.showInFrontend;
      await updateResearchPillarAPI(pillar.id, { showInFrontend: updated });
      showToast(updated ? 'Pillar visible on frontend' : 'Pillar hidden from frontend', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Failed to update visibility', 'error');
    }
  };

  // Reorder Pillar (move up / down)
  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pillars.length) return;

    const newPillars = [...pillars];
    const [moved] = newPillars.splice(index, 1);
    newPillars.splice(targetIndex, 0, moved);
    setPillars(newPillars);

    try {
      const orderedIds = newPillars.map(p => p.id);
      await reorderResearchPillarsAPI(orderedIds);
      showToast('Research pillars reordered', 'success');
      onRefresh();
    } catch (err: any) {
      showToast('Failed to save order', 'error');
    }
  };

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newItems = [...pillars];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    setPillars(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      const orderedIds = pillars.map(p => p.id);
      await reorderResearchPillarsAPI(orderedIds);
      showToast('Research pillars reordered', 'success');
      onRefresh();
    } catch {
      showToast('Failed to persist order', 'error');
    }
  };

  const getIconComponent = (iconName?: string) => {
    const found = AVAILABLE_ICONS.find(i => i.id === iconName);
    return found ? found.icon : Activity;
  };

  const getColorTheme = (colorName?: string) => {
    const found = COLOR_THEMES.find(c => c.id === colorName);
    return found || COLOR_THEMES[0];
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-research-focus-tab">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Research Focus & Academic Narrative
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            A dedicated layer to manage your research trajectory, doctoral target focus, academic background narrative, and core foundational pillars.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-brand-600/30 cursor-pointer"
          id="add-research-pillar-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Add Research Pillar</span>
        </button>
      </div>

      {/* Layer 1: Academic Background Narrative Editor */}
      <form onSubmit={handleSaveNarrative} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Academic Background & Narrative Statement
            </h3>
          </div>
          <button
            type="submit"
            disabled={savingNarrative}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingNarrative ? 'Saving...' : 'Save Narrative'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Section Header Badge
            </label>
            <input
              type="text"
              value={aboutBadge}
              onChange={(e) => setAboutBadge(e.target.value)}
              placeholder="e.g. Research Focus & Trajectory"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Appears at the very top of the section as a glowing pill badge.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Narrative Box Headline Title
            </label>
            <input
              type="text"
              value={aboutTitle}
              onChange={(e) => setAboutTitle(e.target.value)}
              placeholder="e.g. Academic Background & Mission"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-400 mt-1">Heading above the narrative paragraphs.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Narrative Paragraphs (Separate each paragraph with an empty line)
          </label>
          <textarea
            rows={5}
            value={aboutParagraphsText}
            onChange={(e) => setAboutParagraphsText(e.target.value)}
            placeholder="Type or paste your academic background, research motivations, and target goals here. Use double Enter to break paragraphs."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white leading-relaxed focus:border-brand-500 focus:outline-none resize-y"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>
              {aboutParagraphsText.split('\n\n').filter(p => p.trim().length > 0).length} paragraph(s) formatted
            </span>
            <span>Automatically formatted into distinct readable blocks on the frontend</span>
          </div>
        </div>
      </form>

      {/* Layer 2: Research Pillars / Focus Areas Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Research Pillars ({pillars.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Drag cards or use arrows to rearrange order
          </span>
        </div>

        {pillars.length === 0 ? (
          <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
            <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No research pillars added yet</p>
            <p className="text-xs text-slate-500 mt-1">Click "Add Research Pillar" above to showcase your research domains.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((pillar, idx) => {
              const IconComp = getIconComponent(pillar.icon);
              const theme = getColorTheme(pillar.color);

              return (
                <div
                  key={pillar.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnter={(e) => handleDragEnter(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                    draggedIndex === idx
                      ? 'border-brand-500 bg-brand-950/30 opacity-60 scale-[0.98]'
                      : pillar.showInFrontend === false
                      ? 'bg-slate-900/60 border-slate-800 opacity-60'
                      : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 hover:shadow-lg'
                  }`}
                >
                  {/* Top Bar inside card */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-1">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.border} border flex items-center justify-center shrink-0`}>
                          <IconComp className={`w-5 h-5 ${theme.text}`} />
                        </div>
                        <div>
                          {pillar.category && (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-700 mb-0.5">
                              {pillar.category}
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {pillar.title}
                          </h4>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center space-x-1 shrink-0">
                        {/* Up/Down buttons */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-700/60 rounded"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === pillars.length - 1}
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-700/60 rounded"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        {/* Visibility */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(pillar)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            pillar.showInFrontend !== false
                              ? 'text-emerald-400 hover:bg-emerald-950/40'
                              : 'text-slate-500 hover:bg-slate-700'
                          }`}
                          title={pillar.showInFrontend !== false ? 'Visible on website' : 'Hidden from website'}
                        >
                          {pillar.showInFrontend !== false ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => openEditModal(pillar)}
                          className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-950/40 rounded-lg transition-colors"
                          title="Edit Pillar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(pillar.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete Pillar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 leading-relaxed pl-7">
                      {pillar.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {pillar.tags && pillar.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-700/60 pl-7">
                      {pillar.tags.map((t, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center text-[10px] font-medium text-slate-300 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700/80"
                        >
                          <Tag className="w-2.5 h-2.5 mr-1 text-slate-400" />
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pillar Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-white">
                  {editingId ? 'Edit Research Pillar' : 'Add New Research Pillar'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPillar} className="space-y-4">
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Pillar Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={pillarFormData.title}
                    onChange={(e) => setPillarFormData({ ...pillarFormData, title: e.target.value })}
                    placeholder="e.g. Biomedical Signal Processing"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category / Target Badge
                  </label>
                  <input
                    type="text"
                    value={pillarFormData.category || ''}
                    onChange={(e) => setPillarFormData({ ...pillarFormData, category: e.target.value })}
                    placeholder="e.g. Core Foundation, Target Focus"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Visual Icon
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {AVAILABLE_ICONS.map(item => {
                    const ItemIcon = item.icon;
                    const isSelected = pillarFormData.icon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPillarFormData({ ...pillarFormData, icon: item.id })}
                        className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-brand-950/60 border-brand-500 text-brand-300 shadow-xs'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 shrink-0" />
                        <span className="text-xs truncate">{item.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Accent Color Theme
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_THEMES.map(theme => {
                    const isSelected = (pillarFormData.color || 'brand') === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setPillarFormData({ ...pillarFormData, color: theme.id })}
                        className={`flex items-center space-x-2 p-2 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-white text-white shadow-xs'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${theme.preview}`} />
                        <span className="text-[11px] truncate">{theme.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Impact Statement *
                </label>
                <textarea
                  rows={3}
                  required
                  value={pillarFormData.description}
                  onChange={(e) => setPillarFormData({ ...pillarFormData, description: e.target.value })}
                  placeholder="Detail your methodology, specific challenges addressed, and how this relates to your research focus..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:outline-none resize-y"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. EEG/ECG, Feature Selection, Signal Processing"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Show in Public Website</span>
                  <span className="text-[11px] text-slate-400">Card will be rendered in the About Researcher section</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPillarFormData({ ...pillarFormData, showInFrontend: !pillarFormData.showInFrontend })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    pillarFormData.showInFrontend ? 'bg-brand-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      pillarFormData.showInFrontend ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPillar}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 transition-colors shadow-md shadow-brand-600/30"
                >
                  {submittingPillar ? 'Saving...' : editingId ? 'Save Changes' : 'Create Pillar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Delete Research Pillar?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Are you sure you want to delete this research pillar? This action will remove it from the frontend immediately.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePillar(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-md shadow-red-600/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
