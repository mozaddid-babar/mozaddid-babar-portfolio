import React, { useState } from 'react';
import { Mail, Trash2, CheckCircle2, Search, CornerUpLeft, Clock, AlertCircle } from 'lucide-react';
import { Message } from '../../../types';
import { toggleMessageReadAPI, deleteMessageAPI } from '../../../api';

interface MessagesTabProps {
  messages: Message[];
  onRefresh: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ messages, onRefresh, showToast }) => {
  const [search, setSearch] = useState('');
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = (messages || []).filter(m => {
    const matchFilter = filterRead === 'all' ? true : filterRead === 'unread' ? !m.read : m.read;
    const q = search.toLowerCase().trim();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleToggleRead = async (id: string) => {
    try {
      await toggleMessageReadAPI(id);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update message', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this message?')) return;
    try {
      await deleteMessageAPI(id);
      showToast('Message deleted.');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const unreadCount = (messages || []).filter(m => !m.read).length;

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-messages-tab">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-400" />
            <span>Visitor Inquiries & Contact Messages</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {messages.length} inquiries received ({unreadCount} unread). Messages are stored securely in your database.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setFilterRead('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterRead === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilterRead('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterRead === 'unread' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilterRead('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterRead === 'read' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Read ({messages.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inquiries by sender, email, subject, or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-800/50 border border-slate-700 text-slate-400 text-xs">
            No inquiries match your current filter.
          </div>
        ) : (
          filtered.map(msg => (
            <div
              key={msg.id}
              className={`p-6 rounded-2xl border transition-all space-y-3 ${
                msg.read
                  ? 'bg-slate-800/60 border-slate-700/60'
                  : 'bg-slate-800/95 border-emerald-500/40 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  )}
                  <span className="text-sm font-bold text-white">{msg.name}</span>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs text-brand-400 hover:underline"
                  >
                    &lt;{msg.email}&gt;
                  </a>
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-300">
                  <span className="text-slate-500">Subject:</span> {msg.subject}
                </p>
                <div className="mt-2 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleToggleRead(msg.id)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${msg.read ? 'text-slate-500' : 'text-emerald-400'}`} />
                  <span>{msg.read ? 'Mark as Unread' : 'Mark as Read'}</span>
                </button>

                <div className="flex items-center space-x-2">
                  <a
                    href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: ' + msg.subject)}`}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
                  >
                    <CornerUpLeft className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/60"
                    title="Delete Message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
