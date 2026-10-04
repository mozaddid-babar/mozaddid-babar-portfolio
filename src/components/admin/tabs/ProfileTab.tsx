import React, { useState, useRef } from 'react';
import { User, Save, Plus, Trash2, Image, Link2, Sparkles, Building, Mail, Phone, MapPin, Award, ExternalLink, X, GripVertical, Eye, EyeOff, FileText } from 'lucide-react';
import { Profile } from '../../../types';
import { updateProfileAPI } from '../../../api';

interface ProfileTabProps {
  profile: Profile;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, onRefresh, showToast }) => {
  const initializeSocialLinks = (profile: Profile) => {
    const fixedPlatforms = ['Google Scholar', 'ResearchGate', 'GitHub', 'LinkedIn', 'ORCID', 'Codeforces', 'LeetCode', 'Twitter', 'Personal Website'];
    let links = [...(profile.socialLinks || [])];
    
    // Auto-migrate from old social object if needed
    if (profile.social) {
      const mappings: Record<string, string> = {
        scholar: 'Google Scholar', researchgate: 'ResearchGate', github: 'GitHub', linkedin: 'LinkedIn', orcid: 'ORCID', codeforces: 'Codeforces', leetcode: 'LeetCode', twitter: 'Twitter', website: 'Personal Website'
      };
      Object.entries(profile.social).forEach(([key, val]) => {
        if (val) {
          const plat = mappings[key];
          if (plat && !links.find(l => l.platform.toLowerCase() === plat.toLowerCase())) {
            links.push({ id: `social-${key}-${Date.now()}`, platform: plat, url: val, showInFrontend: true, showInCv: true });
          }
        }
      });
    }

    // Ensure fixed platforms exist (empty if not filled)
    fixedPlatforms.forEach(plat => {
      if (!links.find(l => l.platform.toLowerCase() === plat.toLowerCase())) {
        links.push({ id: `social-${plat.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`, platform: plat, url: '', showInFrontend: true, showInCv: true });
      }
    });

    return links;
  };

  const [formData, setFormData] = useState<Profile>({
    ...profile,
    aboutText: profile.aboutText || [],
    stats: { ...profile.stats },
    social: { ...profile.social },
    contactFields: [...(profile.contactFields || [])],
    socialLinks: initializeSocialLinks(profile)
  });
  const [aboutParagraphsText, setAboutParagraphsText] = useState(
    (profile.aboutText || []).join('\n\n')
  );
  const [loading, setLoading] = useState(false);
  const [draggedSocialIndex, setDraggedSocialIndex] = useState<number | null>(null);

  const [draggedContactIndex, setDraggedContactIndex] = useState<number | null>(null);
  const formDataRef = useRef<Profile>(formData);
  formDataRef.current = formData;
  const latestSocialLinksRef = useRef<any[]>(formData.socialLinks || []);
  const latestContactFieldsRef = useRef<any[]>(formData.contactFields || []);



  const handleContactDragStart = (e: React.DragEvent, index: number) => {
    setDraggedContactIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleContactDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedContactIndex === null || draggedContactIndex === index) return;
    const newFields = [...(formData.contactFields || [])];
    const draggedItem = newFields[draggedContactIndex];
    newFields.splice(draggedContactIndex, 1);
    newFields.splice(index, 0, draggedItem);
    setDraggedContactIndex(index);
    latestContactFieldsRef.current = newFields;
    setFormData({ ...formData, contactFields: newFields });
  };

  const autoSave = async (currentData: Profile) => {
    const parsedAbout = aboutParagraphsText.split("\n\n").map(p => p.trim()).filter(Boolean);
      
    const payload: Profile = {
      ...currentData,
      aboutText: parsedAbout,
      stats: {
        ...currentData.stats,
        citations: Number(currentData.stats.citations) || 0,
        hIndex: Number(currentData.stats.hIndex) || 0,
        publicationsCount: Number(currentData.stats.publicationsCount) || 0,
        researchProjects: Number(currentData.stats.researchProjects) || 0
      }
    };

    try {
      await updateProfileAPI(payload);
      onRefresh();
      showToast('Profile updated!', 'success');
    } catch (err: any) {
      console.error('Auto-save failed:', err);
    }
  };

  const handleContactDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    setDraggedContactIndex(null);
    autoSave({ ...formDataRef.current, contactFields: latestContactFieldsRef.current });
  };



  const handleSocialDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSocialIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleSocialDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSocialIndex === null || draggedSocialIndex === index) return;
    const newLinks = [...(formData.socialLinks || [])];
    const draggedItem = newLinks[draggedSocialIndex];
    newLinks.splice(draggedSocialIndex, 1);
    newLinks.splice(index, 0, draggedItem);
    setDraggedSocialIndex(index);
    latestSocialLinksRef.current = newLinks;
    setFormData({ ...formData, socialLinks: newLinks });
  };

  const handleSocialDragEnd = (e: React.DragEvent) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
    setDraggedSocialIndex(null);
    autoSave({ ...formDataRef.current, socialLinks: latestSocialLinksRef.current });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsedAbout = aboutParagraphsText.split("\n\n").map(p => p.trim()).filter(Boolean);

    const payload: Profile = {
      ...formData,
      aboutText: parsedAbout,
      stats: {
        ...formData.stats,
        citations: Number(formData.stats.citations) || 0,
        hIndex: Number(formData.stats.hIndex) || 0,
        publicationsCount: Number(formData.stats.publicationsCount) || 0,
        researchProjects: Number(formData.stats.researchProjects) || 0
      }
    };

    try {
      await updateProfileAPI(payload);
      showToast('Profile information saved successfully!');
      onRefresh();
      showToast('Profile updated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-profile-tab">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" />
            <span>Edit Profile & Researcher Information</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify personal details, biographical narrative, affiliations, social handles, and impact metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 shadow-md shadow-brand-600/30 transition-all cursor-pointer"
          id="save-profile-btn"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Identity Card */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-brand-400">
            Core Identity & Headlines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Website / Browser Tab Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., Jane Doe - Portfolio"
                value={formData.siteTitle || ''}
                onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white mb-4"
              />
            </div>
<div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Academic Title / Position <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Headline (Main Hero Tagline)
            </label>
            <input
              type="text"
              value={formData.headline || ''}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="e.g. Advancing Healthcare Informatics & Computer Vision..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status Tag (Pill on Hero)
            </label>
            <input
              type="text"
              value={formData.statusTag || ''}
              onChange={(e) => setFormData({ ...formData, statusTag: e.target.value })}
              placeholder="e.g. Available for Collaborative Research & Academic Inquiries"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div>
    <label className="block text-xs font-semibold text-slate-300 mb-1">
      Brand Logo Image (Optional, also used as Favicon)
    </label>
    <div className="flex items-start gap-3 mb-4">
      {formData.logoUrl ? (
        <img src={formData.logoUrl} alt="Logo Preview" className="w-12 h-12 rounded-lg object-contain border border-slate-600 bg-slate-800 shrink-0 mt-1 p-1" />
      ) : (
        <div className="w-12 h-12 rounded-lg border border-slate-600 bg-slate-800 shrink-0 mt-1 flex items-center justify-center">
          <span className="text-[10px] text-slate-500 text-center leading-tight">No<br/>Logo</span>
        </div>
      )}
      <div className="flex-1">
        <input
          type="text"
          value={formData.logoUrl || ''}
          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
          placeholder="Paste Logo Image URL..."
          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => setFormData({ ...formData, logoUrl: reader.result as string });
              reader.readAsDataURL(file);
            }
          }}
          className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-900/50 file:text-brand-300 hover:file:bg-brand-900/80 transition-colors"
        />
      </div>
    </div>
  </div>
  <label className="block text-xs font-semibold text-slate-300 mb-1">
    Profile Photo / Avatar
  </label>
              <div className="flex items-start gap-3">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Avatar Preview" className="w-12 h-12 rounded-full object-cover border border-slate-600 bg-slate-800 shrink-0 mt-1" />
                ) : (
                  <div className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 shrink-0 mt-1 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-500" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="text"
                    value={formData.avatarUrl || ''}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    placeholder="Paste Image URL..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({ ...formData, avatarUrl: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-500/20 file:text-brand-300 hover:file:bg-brand-500/30 file:cursor-pointer cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Curriculum Vitae (CV) PDF URL or Link
              </label>
              <input
                type="text"
                value={formData.cvUrl || ''}
                onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        {/* Narrative & About Card */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-brand-400">
            Biographical Statement & About Narrative
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Short Bio Summary
            </label>
            <textarea
              rows={2}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              About Section Paragraphs (Separate each paragraph with an empty line)
            </label>
            <textarea
              rows={6}
              value={aboutParagraphsText}
              onChange={(e) => setAboutParagraphsText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white resize-y leading-relaxed font-sans"
            />
          </div>
        </div>

                {/* --- DYNAMIC CONTACT CHANNELS --- */}
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Contact Channels (Dynamic)</h3>
            <button
              type="button"
              onClick={() => {
                const newField = { id: `contact-${Date.now()}`, title: 'NEW', value: '', icon: 'Mail', showInFrontend: true, showInCv: true };
                setFormData({ ...formData, contactFields: [...(formData.contactFields || []), newField] });
              }}
              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>
          <div className="space-y-2">
            {(formData.contactFields || []).map((field: any, idx: number) => (
              <div 
                key={field.id} 
                draggable
                onDragStart={(e) => handleContactDragStart(e, idx)}
                onDragEnter={(e) => handleContactDragEnter(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleContactDragEnd}
                className={`flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border transition-all ${draggedContactIndex === idx ? 'opacity-50 border-brand-500' : 'border-slate-800'}`}
              >
                <div className="cursor-move p-1 text-slate-600 hover:text-slate-400">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="w-24 sm:w-32">
                  <input type="text" value={field.title} onChange={(e) => {
                    const list = [...(formData.contactFields || [])]; list[idx].title = e.target.value; setFormData({ ...formData, contactFields: list });
                  }} className="w-full px-2 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="Title" />
                </div>
                
                <div className="flex-1 min-w-[150px]">
                  <input type="text" value={field.value} onChange={(e) => {
                    const list = [...(formData.contactFields || [])]; list[idx].value = e.target.value; setFormData({ ...formData, contactFields: list });
                  }} className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500" placeholder="Value (e.g. email@...)" />
                </div>
                
                <div className="w-24 sm:w-28">
                  <select value={field.icon || 'Mail'} onChange={(e) => {
                    const list = [...(formData.contactFields || [])]; list[idx].icon = e.target.value; setFormData({ ...formData, contactFields: list });
                  }} className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white">
                    <option value="Mail">Mail</option>
                    <option value="MapPin">Location</option>
                    <option value="Building">Building</option>
                    <option value="Smartphone">Phone/Mobile</option>
                    <option value="Phone">Phone</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-1 ml-auto">
                   <button 
                     type="button" 
                     onClick={() => {
                        const list = [...(formData.contactFields || [])];
                        list[idx].showInFrontend = !list[idx].showInFrontend;
                        setFormData({ ...formData, contactFields: list });
                     }} 
                     className={`p-1 rounded text-xs flex items-center transition-colors ${field.showInFrontend ? 'text-brand-400 hover:bg-brand-950/30' : 'text-slate-500 hover:bg-slate-800'}`}
                     title="Toggle Frontend Visibility"
                   >
                     {field.showInFrontend ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                   </button>
                   <button 
                     type="button" 
                     onClick={() => {
                        const list = [...(formData.contactFields || [])];
                        list[idx].showInCv = !list[idx].showInCv;
                        setFormData({ ...formData, contactFields: list });
                     }} 
                     className={`p-1 rounded text-xs flex items-center transition-colors ${field.showInCv ? 'text-indigo-400 hover:bg-indigo-950/30' : 'text-slate-500 hover:bg-slate-800'}`}
                     title="Toggle CV Visibility"
                   >
                     {field.showInCv ? <FileText className="w-4 h-4" /> : <FileText className="w-4 h-4 opacity-40" />}
                   </button>
                   <div className="w-px h-4 bg-slate-700 mx-1"></div>
                   <button 
                     type="button" 
                     onClick={() => {
                        const list = (formData.contactFields || []).filter((_, i) => i !== idx);
                        setFormData({ ...formData, contactFields: list });
                     }} 
                     className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                     title="Delete Contact"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- ACADEMIC PROFILES & SOCIAL HANDLES --- */}
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700 mt-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Academic Profiles & Social Handles</h3>
            <button
              type="button"
              onClick={() => {
                const newField = { id: `social-${Date.now()}`, platform: 'New Platform', url: '', showInFrontend: true, showInCv: true };
                setFormData({ ...formData, socialLinks: [...(formData.socialLinks || []), newField] });
              }}
              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Profile
            </button>
          </div>
          <div className="space-y-2">
            {(formData.socialLinks || []).map((social: any, idx: number) => (
              <div 
                key={social.id} 
                draggable
                onDragStart={(e) => handleSocialDragStart(e, idx)}
                onDragEnter={(e) => handleSocialDragEnter(e, idx)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={handleSocialDragEnd}
                className={`flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border transition-all ${draggedSocialIndex === idx ? 'opacity-50 border-brand-500' : 'border-slate-800'}`}
              >
                <div className="cursor-move p-1 text-slate-600 hover:text-slate-400">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="w-32 sm:w-40">
                  <input type="text" value={social.platform} onChange={(e) => {
                    const list = [...(formData.socialLinks || [])]; list[idx].platform = e.target.value; setFormData({ ...formData, socialLinks: list });
                  }} className="w-full px-2 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="Platform" />
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <input type="url" value={social.url} onChange={(e) => {
                    const list = [...(formData.socialLinks || [])]; list[idx].url = e.target.value; setFormData({ ...formData, socialLinks: list });
                  }} className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500" placeholder="https://..." />
                </div>
                
                <div className="flex items-center gap-1 ml-auto">
                   <button 
                     type="button" 
                     onClick={() => {
                        const list = [...(formData.socialLinks || [])];
                        list[idx].showInFrontend = !list[idx].showInFrontend;
                        setFormData({ ...formData, socialLinks: list });
                     }} 
                     className={`p-1 rounded text-xs flex items-center transition-colors ${social.showInFrontend ? 'text-brand-400 hover:bg-brand-950/30' : 'text-slate-500 hover:bg-slate-800'}`}
                     title="Toggle Frontend Visibility"
                   >
                     {social.showInFrontend ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                   </button>
                   <button 
                     type="button" 
                     onClick={() => {
                        const list = [...(formData.socialLinks || [])];
                        list[idx].showInCv = !list[idx].showInCv;
                        setFormData({ ...formData, socialLinks: list });
                     }} 
                     className={`p-1 rounded text-xs flex items-center transition-colors ${social.showInCv ? 'text-indigo-400 hover:bg-indigo-950/30' : 'text-slate-500 hover:bg-slate-800'}`}
                     title="Toggle CV Visibility"
                   >
                     {social.showInCv ? <FileText className="w-4 h-4" /> : <FileText className="w-4 h-4 opacity-40" />}
                   </button>
                   <div className="w-px h-4 bg-slate-700 mx-1"></div>
                   <button 
                     type="button" 
                     onClick={() => {
                        const list = (formData.socialLinks || []).filter((_, i) => i !== idx);
                        setFormData({ ...formData, socialLinks: list });
                     }} 
                     className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                     title="Delete Profile"
                   >
                     <X className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Stats */}
        <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-brand-400">
            Impact Metrics Display
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Citations</label>
              <input
                type="number"
                value={formData.stats.citations || 0}
                onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, citations: Number(e.target.value) } })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">h-Index</label>
              <input
                type="number"
                value={formData.stats.hIndex || 0}
                onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, hIndex: Number(e.target.value) } })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

    </div>
  );
};
