import React, { useState } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { Terminal, Plus, Trash2, Save, Check, Sparkles, X, GripVertical, Eye, EyeOff, FileText } from 'lucide-react';
import { SkillGroup, SkillItem } from '../../../types';
import { updateSkillsAPI } from '../../../api';

interface SkillsTabProps {
  skillGroups: SkillGroup[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SkillsTab: React.FC<SkillsTabProps> = ({ skillGroups, onRefresh, showToast }) => {
  const [groups, setGroups] = useState<SkillGroup[]>(JSON.parse(JSON.stringify(skillGroups)));
  const [loading, setLoading] = useState(false);

  const [draggedGroupIndex, setDraggedGroupIndex] = useState<number | null>(null);
  const [draggedSkillIndex, setDraggedSkillIndex] = useState<{group: number, skill: number} | null>(null);

  // Group Drag Handlers
  const handleGroupDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedGroupIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGroupDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedGroupIndex === null || draggedGroupIndex === index) return;
    
    const newGroups = [...groups];
    const draggedItem = newGroups[draggedGroupIndex];
    newGroups.splice(draggedGroupIndex, 1);
    newGroups.splice(index, 0, draggedItem);
    
    setGroups(newGroups);
    setDraggedGroupIndex(index);
  };

  const handleGroupDragEnd = () => {
    setDraggedGroupIndex(null);
  };

  // Skill Drag Handlers
  const handleSkillDragStart = (e: React.DragEvent<HTMLDivElement>, groupIdx: number, skillIdx: number) => {
    e.stopPropagation();
    setDraggedSkillIndex({group: groupIdx, skill: skillIdx});
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSkillDragEnter = (e: React.DragEvent<HTMLDivElement>, groupIdx: number, skillIdx: number) => {
    e.preventDefault();
    if (!draggedSkillIndex || draggedSkillIndex.group !== groupIdx || draggedSkillIndex.skill === skillIdx) return;
    
    const newGroups = [...groups];
    const groupSkills = [...newGroups[groupIdx].skills];
    const draggedItem = groupSkills[draggedSkillIndex.skill];
    
    groupSkills.splice(draggedSkillIndex.skill, 1);
    groupSkills.splice(skillIdx, 0, draggedItem);
    
    newGroups[groupIdx].skills = groupSkills;
    setGroups(newGroups);
    setDraggedSkillIndex({group: groupIdx, skill: skillIdx});
  };

  const handleSkillDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDraggedSkillIndex(null);
  };

  const handleAddGroup = () => {
    const newGroup: SkillGroup = {
      id: `sg-${Date.now()}`,
      category: 'New Competency Group',
      description: 'Description of domain tools and methods.',
      skills: [
        { name: 'Skill 1', level: 90, highlight: true }
      ]
    };
    setGroups([...groups, newGroup]);
  };

  const handleRemoveGroup = (idx: number) => {
    if (!confirm('Remove this entire skill category?')) return;
    const updated = groups.filter((_, i) => i !== idx);
    setGroups(updated);
  };

  const handleUpdateGroup = (idx: number, partial: Partial<SkillGroup>) => {
    const updated = [...groups];
    updated[idx] = { ...updated[idx], ...partial };
    setGroups(updated);
  };

  const handleAddSkillToGroup = (groupIdx: number) => {
    const updated = [...groups];
    updated[groupIdx].skills.push({
      name: 'New Skill',
      level: 85,
      highlight: false
    });
    setGroups(updated);
  };

  const handleRemoveSkill = (groupIdx: number, skillIdx: number) => {
    const updated = [...groups];
    updated[groupIdx].skills = updated[groupIdx].skills.filter((_, i) => i !== skillIdx);
    setGroups(updated);
  };

  const handleUpdateSkill = (groupIdx: number, skillIdx: number, partial: Partial<SkillItem>) => {
    const updated = [...groups];
    updated[groupIdx].skills[skillIdx] = {
      ...updated[groupIdx].skills[skillIdx],
      ...partial
    };
    setGroups(updated);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateSkillsAPI(groups);
      showToast('Technical skills updated successfully!');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update skills', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-skills-tab">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-400" />
            <span>Technical Skills & Competencies</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize domain categories, proficiency percentages, and featured tags.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddGroup}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Skills'}</span>
          </button>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-6">
        {groups.map((group, gIdx) => (
          <div
            key={group.id || gIdx}
            draggable
            onDragStart={(e) => handleGroupDragStart(e, gIdx)}
            onDragEnter={(e) => handleGroupDragEnter(e, gIdx)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={handleGroupDragEnd}
            className={`p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4 transition-transform ${draggedGroupIndex === gIdx ? 'opacity-50 scale-[0.99] border-brand-500' : ''}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
              <div className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={group.category || ''}
                  onChange={(e) => handleUpdateGroup(gIdx, { category: e.target.value })}
                  className="px-3 py-1.5 text-xs sm:text-sm font-bold bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
                  placeholder="Category Name"
                />
                <input
                  type="text"
                  value={group.description || ''}
                  onChange={(e) => handleUpdateGroup(gIdx, { description: e.target.value })}
                  className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-300 focus:outline-none"
                  placeholder="Category Description..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleAddSkillToGroup(gIdx)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-400 hover:bg-brand-950/60 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveGroup(gIdx)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/60 transition-colors"
                  title="Remove Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            
            </div>
            
            
            
            {/* Skills Table / List inside Category */}

            <div className="space-y-2">
              {group.skills.map((skill, sIdx) => (
                <div
                  key={sIdx}
                  draggable
                  onDragStart={(e) => handleSkillDragStart(e, gIdx, sIdx)}
                  onDragEnter={(e) => handleSkillDragEnter(e, gIdx, sIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={handleSkillDragEnd}
                  className={`flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border transition-all ${draggedSkillIndex?.group === gIdx && draggedSkillIndex?.skill === sIdx ? 'opacity-50 border-brand-500' : 'border-slate-800'}`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 p-0.5">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={skill.name || ''}
                    onChange={(e) => handleUpdateSkill(gIdx, sIdx, { name: e.target.value })}
                    className="flex-1 min-w-[160px] px-3 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="Skill Name"
                  />

                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <span>Level %:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={skill.level || 90}
                      onChange={(e) => handleUpdateSkill(gIdx, sIdx, { level: Number(e.target.value) })}
                      className="w-16 px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white text-center"
                    />
                  </div>

                  <label className="flex items-center space-x-1.5 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skill.highlight || false}
                      onChange={(e) => handleUpdateSkill(gIdx, sIdx, { highlight: e.target.checked })}
                      className="w-3.5 h-3.5 text-brand-600 rounded"
                    />
                    <span className="text-[11px] font-semibold">Highlight</span>
                  </label>

                  <div className="flex items-center space-x-2 border-l border-slate-700 pl-2 ml-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateSkill(gIdx, sIdx, { showInFrontend: !(skill.showInFrontend ?? true) })}
                      className={`p-1 rounded text-xs flex items-center transition-colors ${skill.showInFrontend ?? true ? 'text-brand-400 hover:bg-brand-950/30' : 'text-slate-500 hover:bg-slate-800'}`}
                      title="Toggle Frontend Visibility"
                    >
                      {skill.showInFrontend ?? true ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateSkill(gIdx, sIdx, { showInCv: !(skill.showInCv ?? true) })}
                      className={`p-1 rounded text-xs flex items-center transition-colors ${skill.showInCv ?? true ? 'text-indigo-400 hover:bg-indigo-950/30' : 'text-slate-500 hover:bg-slate-800'}`}
                      title="Toggle CV Visibility"
                    >
                      {skill.showInCv ?? true ? <FileText className="w-4 h-4" /> : <FileText className="w-4 h-4 opacity-40" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(gIdx, sIdx)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
