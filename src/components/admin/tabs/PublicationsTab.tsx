import React, { useState } from 'react';
import { VisibilityToggle } from './VisibilityToggle';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  ExternalLink, 
  Award,
  AlertCircle,
  FileText,
  Quote,
  Sparkles,
  Download
} from 'lucide-react';
import { Publication, Profile } from '../../../types';
import { createPublicationAPI, updatePublicationAPI, deletePublicationAPI } from '../../../api';
import { AutoImportPublicationsModal } from './AutoImportPublicationsModal';

interface PublicationsTabProps {
  publications: Publication[];
  profile?: Profile;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const EMPTY_PUB: Omit<Publication, 'id'> = {
  title: '',
  authors: '',
  venue: '',
  year: new Date().getFullYear(),
  category: 'Journal',
  doi: '',
  link: '',
  pdfUrl: '',
  abstract: '',
  citations: 0,
  featured: false,
  tags: [],
  bibtex: '',
  showInFrontend: true,
  showInCv: true
};

export const PublicationsTab: React.FC<PublicationsTabProps> = ({ publications, profile, onRefresh, showToast }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoImportOpen, setIsAutoImportOpen] = useState(false);
  const [editingPubId, setEditingPubId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Publication, 'id'>>(EMPTY_PUB);
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = publications
    .filter(pub => {
      const matchCat = categoryFilter === 'All' || pub.category === categoryFilter;
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        pub.title.toLowerCase().includes(q) ||
        pub.authors.toLowerCase().includes(q) ||
        pub.venue.toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if ((b.year || 0) !== (a.year || 0)) {
        return (b.year || 0) - (a.year || 0);
      }
      return (b.citations || 0) - (a.citations || 0);
    });

  const openCreateModal = () => {
    setEditingPubId(null);
    setFormData(EMPTY_PUB);
    setTagsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (pub: Publication) => {
    setEditingPubId(pub.id);
    setFormData({
      title: pub.title,
      authors: pub.authors,
      venue: pub.venue,
      year: pub.year,
      category: pub.category,
      doi: pub.doi || '',
      link: pub.link || '',
      pdfUrl: pub.pdfUrl || '',
      abstract: pub.abstract || '',
      citations: pub.citations || 0,
      featured: !!pub.featured,
      tags: pub.tags || [],
      bibtex: pub.bibtex || ''
    });
    setTagsInput((pub.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.authors || !formData.venue || !formData.year) {
      showToast('Please fill in title, authors, venue, and year.', 'error');
      return;
    }

    setLoading(true);
    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      ...formData,
      tags: parsedTags,
      year: Number(formData.year),
      citations: Number(formData.citations) || 0
    };

    try {
      if (editingPubId) {
        await updatePublicationAPI(editingPubId, payload);
        showToast('Publication updated successfully!');
      } else {
        await createPublicationAPI(payload);
        showToast('New publication added successfully!');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePublicationAPI(id);
      showToast('Publication deleted.');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-publications-tab">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            <span>Manage Publications & Articles</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {publications.length} records in database. Create, auto-import from Google Scholar / BibTeX, or edit.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAutoImportOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-brand-100 bg-brand-950/80 hover:bg-brand-900 border border-brand-500/40 shadow-lg shadow-brand-950/50 transition-all cursor-pointer group"
            id="auto-import-pub-btn"
          >
            <Sparkles className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Auto-Import & Scholar Sync</span>
          </button>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all cursor-pointer"
            id="add-pub-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Add</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search publications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Journal">Journal</option>
          <option value="Conference">Conference</option>
          <option value="Preprint">Preprint</option>
          <option value="Book Chapter">Book Chapter</option>
          <option value="Workshop">Workshop</option>
        </select>
      </div>

      {/* Publications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-400 text-xs">
            No publications found matching your criteria.
          </div>
        ) : (
          filtered.map((pub) => (
            <div
              key={pub.id}
              className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              id={`admin-pub-row-${pub.id}`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-300 font-semibold text-[11px]">
                    {pub.category}
                  </span>
                  <span className="text-slate-400 font-semibold">{pub.year}</span>
                  {pub.featured && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-semibold text-[11px] flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" /> Featured
                    </span>
                  )}
                  {pub.citations !== undefined && pub.citations > 0 && (
                    <span className="text-emerald-400 text-[11px] font-semibold">
                      • {pub.citations} Citations
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                  {pub.title}
                </h3>

                <p className="text-xs text-slate-400">
                  <span className="text-slate-300">Authors:</span> {pub.authors}
                </p>
                <p className="text-xs text-brand-400 italic">
                  {pub.venue}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700">
                <button
                  onClick={() => openEditModal(pub)}
                  className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                  title="Edit Publication"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(pub.id)}
                  className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-800/60 transition-colors"
                  title="Delete Publication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">
                {editingPubId ? 'Edit Publication Details' : 'Add New Academic Publication'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Publication Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Deep Transfer Learning for..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Authors <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.authors || ''}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    placeholder="e.g. Md. Rashedul Islam, A. Rahman"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                  >
                    <option value="Journal">Journal</option>
                    <option value="Conference">Conference</option>
                    <option value="Preprint">Preprint</option>
                    <option value="Book Chapter">Book Chapter</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Venue (Journal / Conference Name) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue || ''}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. IEEE Transactions on Medical Robotics"
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Year <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    DOI (Digital Object Identifier)
                  </label>
                  <input
                    type="text"
                    value={formData.doi || ''}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    placeholder="10.1109/..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Publisher / Paper URL
                  </label>
                  <input
                    type="text"
                    value={formData.link || ''}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Citations Count
                  </label>
                  <input
                    type="number"
                    value={formData.citations || 0}
                    onChange={(e) => setFormData({ ...formData, citations: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Abstract Summary
                </label>
                <textarea
                  rows={3}
                  value={formData.abstract || ''}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                  placeholder="Summary of research methodology and findings..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30 resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Keywords / Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Deep Learning, Medical Imaging, Transformers"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Custom BibTeX Entry (optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.bibtex || ''}
                  onChange={(e) => setFormData({ ...formData, bibtex: e.target.value })}
                  placeholder="@article{...}"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-brand-300 focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-pub-checkbox"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 bg-slate-900 border-slate-700"
                />
                <label htmlFor="featured-pub-checkbox" className="text-xs font-semibold text-slate-300">
                  Feature this publication on homepage
                </label>
              </div>

              <VisibilityToggle showInFrontend={formData.showInFrontend ?? true} showInCv={formData.showInCv ?? true} onChange={(field, val) => setFormData({ ...formData, [field]: val })} />
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 shadow-md transition-all cursor-pointer"
                >
                  {loading ? 'Saving...' : editingPubId ? 'Update Publication' : 'Add Publication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Delete Publication?</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this publication record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Import & Scholar Sync Modal */}
      <AutoImportPublicationsModal
        isOpen={isAutoImportOpen}
        onClose={() => setIsAutoImportOpen(false)}
        profile={profile}
        onSuccess={() => {
          onRefresh();
        }}
        showToast={showToast}
      />

    </div>
  );
};
