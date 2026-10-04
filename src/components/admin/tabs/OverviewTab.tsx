import React from 'react';
import { 
  BookOpen, 
  Code, 
  Mail, 
  Award, 
  TrendingUp, 
  ExternalLink, 
  Plus, 
  Sparkles,
  ArrowRight,
  Database,
  UserCheck,
  Layers,
  Eye,
  FileText
} from 'lucide-react';
import { PortfolioData } from '../../../types';

interface OverviewTabProps {
  data: PortfolioData;
  onNavigateTab: (tab: string) => void;
  onViewLive: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ data, onNavigateTab, onViewLive }) => {
  const unreadMessages = (data.messages || []).filter(m => !m.read).length;

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-overview-tab">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900/40 via-slate-800 to-slate-800/80 border border-brand-500/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {data.profile.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            You can create, update, and delete all publications, research projects, credentials, and curriculum vitae details from this unified dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onViewLive}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all"
            id="overview-live-preview-btn"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Publications */}
        <div 
          onClick={() => onNavigateTab('publications')}
          className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-brand-500/50 transition-all cursor-pointer group"
          id="metric-card-publications"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Publications</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data.publications.length}</span>
            <span className="text-xs text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Projects */}
        <div 
          onClick={() => onNavigateTab('projects')}
          className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-brand-500/50 transition-all cursor-pointer group"
          id="metric-card-projects"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Research & Dev Projects</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Code className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data.projects.length}</span>
            <span className="text-xs text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Messages */}
        <div 
          onClick={() => onNavigateTab('messages')}
          className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-brand-500/50 transition-all cursor-pointer group"
          id="metric-card-messages"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Visitor Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center relative">
              <Mail className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white">{data.messages.length}</span>
              {unreadMessages > 0 && (
                <span className="text-xs font-bold text-amber-400">({unreadMessages} new)</span>
              )}
            </div>
            <span className="text-xs text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              View Inbox <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Citations & Impact */}
        <div 
          onClick={() => onNavigateTab('profile')}
          className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-brand-500/50 transition-all cursor-pointer group"
          id="metric-card-impact"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Scholar Citations</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{data.profile.stats.citations}+</span>
            <span className="text-xs text-slate-400 font-semibold">
              h-index: {data.profile.stats.hIndex}
            </span>
          </div>
        </div>

      </div>

      {/* Sections Layout & Ordering Callout */}
      <div 
        onClick={() => onNavigateTab('sections')}
        className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-800/90 via-slate-800 to-indigo-950/30 border border-slate-700/80 hover:border-brand-500/50 shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        id="overview-sections-banner"
      >
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-2xl bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                Page Sections Ordering & Visibility
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full border border-brand-500/30">
                Layout Manager
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {(data.sections || []).length > 0 ? (data.sections || []).length : 14} sections configured • {(data.sections || []).filter(s => s.showInFrontend !== false).length || 14} active on website • {(data.sections || []).filter(s => s.showInCv !== false).length || 14} included in CV
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-brand-400 group-hover:text-brand-300 group-hover:translate-x-1 transition-all flex-shrink-0">
          <span>Manage Layout & Ordering</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Quick Jump Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Publications list */}
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Recent Publications</span>
            </h3>
            <button
              onClick={() => onNavigateTab('publications')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300"
            >
              View All ({data.publications.length})
            </button>
          </div>

          <div className="space-y-3">
            {data.publications.slice(0, 3).map(pub => (
              <div key={pub.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-brand-950 text-brand-300 font-semibold">{pub.category}</span>
                  <span className="text-slate-400">{pub.year}</span>
                </div>
                <p className="text-xs font-semibold text-white line-clamp-1">{pub.title}</p>
                <p className="text-[11px] text-slate-400 italic line-clamp-1">{pub.venue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages list */}
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>Recent Contact Inquiries</span>
            </h3>
            <button
              onClick={() => onNavigateTab('messages')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Inbox ({data.messages.length})
            </button>
          </div>

          <div className="space-y-3">
            {data.messages.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No messages in inbox yet.</p>
            ) : (
              data.messages.slice(0, 3).map(msg => (
                <div key={msg.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">{msg.name}</span>
                    <span className="text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 line-clamp-1">{msg.subject}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
