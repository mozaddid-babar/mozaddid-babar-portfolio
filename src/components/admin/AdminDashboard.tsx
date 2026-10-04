import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Code, 
  User, 
  Briefcase, 
  Terminal, 
  Mail, 
  Settings, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  ShieldCheck,
  Moon,
  Sun,
  Award,
  Trophy,
  UserCheck,
  Layers,
  Printer,
  Sparkles,
  FileText
} from 'lucide-react';
import { PortfolioData } from '../../types';
import { logoutAdmin } from '../../api';
import { OverviewTab } from './tabs/OverviewTab';
import { SectionsTab } from './tabs/SectionsTab';
import { CvPreviewModal } from './tabs/CvPreviewModal';
import { CvManagerTab } from './tabs/CvManagerTab';
import { PublicationsTab } from './tabs/PublicationsTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { ProfileTab } from './tabs/ProfileTab';
import { ResearchFocusTab } from './tabs/ResearchFocusTab';
import { TimelineTab } from './tabs/TimelineTab';
import { SkillsTab } from './tabs/SkillsTab';
import { TrainingsTab } from './tabs/TrainingsTab';
import { CertificationsTab } from './tabs/CertificationsTab';
import { HonorsTab } from './tabs/HonorsTab';
import { AchievementsTab } from './tabs/AchievementsTab';
import { AwardsTab } from './tabs/AwardsTab';
import { VolunteerTab } from './tabs/VolunteerTab';
import { ReferencesTab } from './tabs/ReferencesTab';
import { MessagesTab } from './tabs/MessagesTab';
import { SettingsTab } from './tabs/SettingsTab';

interface AdminDashboardProps {
  data: PortfolioData;
  onRefresh: () => void;
  onLogout: () => void;
  onViewLive: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  onRefresh,
  onLogout,
  onViewLive,
  darkMode,
  onToggleDarkMode
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogout = () => {
    logoutAdmin();
    onLogout();
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { 
      id: 'sections', 
      label: 'Sections & Layout', 
      icon: Layers, 
      count: (data.sections || []).length > 0 ? (data.sections || []).filter(s => s.showInFrontend !== false).length : 14 
    },
    { id: 'publications', label: 'Publications', icon: BookOpen, count: data.publications.length },
    { id: 'projects', label: 'Projects', icon: Code, count: data.projects.length },
    { id: 'profile', label: 'Researcher Profile', icon: User },
    { id: 'cv-manager', label: 'Curriculum Vitae (CV)', icon: FileText },
    { 
      id: 'research-focus', 
      label: 'Research Focus', 
      icon: Sparkles, 
      count: (data.researchPillars || []).length 
    },
    { id: 'timeline', label: 'Experience & Edu', icon: Briefcase },
    { id: 'skills', label: 'Skills & Tools', icon: Terminal },
    { id: 'trainings', label: 'Trainings & Courses', icon: Award, count: (data.trainings || []).length },
    { id: 'certifications', label: 'Certifications', icon: ShieldCheck, count: (data.certifications || []).length },
    { id: 'awards', label: 'Honors & Awards', icon: Trophy,
  UserCheck, count: (data.awards || []).length },
    { id: 'achievements', label: 'Achievements', icon: Trophy,
  UserCheck, count: (data.achievements || []).length },
    { id: 'honors', label: 'Affiliations & Activities', icon: Trophy,
  UserCheck, count: (data.affiliations || []).length },
    { id: 'references', label: 'References', icon: UserCheck, count: (data.references || []).length },
    { id: 'volunteer', label: 'Volunteer Work', icon: Trophy,
  UserCheck, count: (data.volunteerWork || []).length },
    { id: 'messages', label: 'Contact Messages', icon: Mail, count: (data.messages || []).filter(m => !m.read).length, isBadgeNew: true },
    { id: 'settings', label: 'Security & DB', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row" id="admin-dashboard-container">
      
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold animate-fadeIn ${
            toast.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
              : 'bg-red-950 border-red-700 text-red-200'
          }`}
          id="admin-toast-notification"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-800/90 border-b border-slate-700 sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <span className="font-bold text-sm text-white">Portfolio CMS</span>
            <span className="block text-[10px] text-slate-400">/admin</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onViewLive}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white"
            title="View Live Site"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-800/95 md:bg-slate-800/80 border-r border-slate-700/80 flex flex-col p-4 backdrop-blur-md transition-transform duration-300 ease-in-out overflow-y-auto admin-sidebar-scroll ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="admin-sidebar"
      >
        <div className="space-y-6 flex-1">
          {/* Logo & User Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white tracking-tight">Admin Console</h1>
                <p className="text-[11px] text-slate-400 font-mono">/admin portal</p>
              </div>
            </div>

            <button
              onClick={onViewLive}
              title="View Public Site"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
              id="admin-header-view-site"
            >
              <ExternalLink className="w-4 h-4 text-brand-400" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                  }`}
                  id={`admin-nav-${item.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isBadgeNew
                          ? 'bg-emerald-500 text-white'
                          : isActive
                          ? 'bg-brand-700 text-brand-100'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="pt-4 mt-6 border-t border-slate-700/80 space-y-2 shrink-0 pb-4">
          <button
            onClick={() => setActiveTab('cv-manager')}
            className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              activeTab === 'cv-manager'
                ? 'text-white bg-indigo-600 border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-700/40'
            }`}
            id="admin-sidebar-preview-cv"
            title="Manage CV download mode, upload custom PDF, and preview CV"
          >
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Curriculum Vitae (CV)</span>
          </button>

          <button
            onClick={onViewLive}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
            id="admin-sidebar-view-site"
            title="View Public Site"
          >
            <ExternalLink className="w-4 h-4 text-brand-400" />
            <span>View Public Site</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/60 transition-colors cursor-pointer"
            id="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-y-auto" id="admin-main-viewport">
        {activeTab === 'overview' && (
          <OverviewTab
            data={data}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onViewLive={onViewLive}
          />
        )}

        {activeTab === 'sections' && (
          <SectionsTab
            data={data}
            onRefresh={onRefresh}
            showToast={showToast}
            onViewLive={onViewLive}
            onOpenCvPreview={() => setCvModalOpen(true)}
          />
        )}

        {activeTab === 'publications' && (
          <PublicationsTab
            publications={data.publications}
            profile={data.profile}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            projects={data.projects}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={data.profile}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'cv-manager' && (
          <CvManagerTab
            data={data}
            onRefresh={onRefresh}
            showToast={showToast}
            onOpenCvPreview={() => setCvModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'research-focus' && (
          <ResearchFocusTab
            profile={data.profile}
            researchPillars={data.researchPillars}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineTab
            experience={data.experience}
            education={data.education}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab
            skillGroups={data.skillGroups}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'trainings' && (
          <TrainingsTab
            trainings={data.trainings}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'certifications' && (
          <CertificationsTab
            certifications={data.certifications}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'awards' && (
          <AwardsTab
            awards={data.awards}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}
        {activeTab === 'achievements' && (
          <AchievementsTab
            achievements={data.achievements}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}
        {activeTab === 'honors' && (
          <HonorsTab
            affiliations={data.affiliations}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}
        {activeTab === 'references' && (
          <ReferencesTab
            references={data.references}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}
        {activeTab === 'volunteer' && (
          <VolunteerTab
            volunteerWork={data.volunteerWork}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'messages' && (
          <MessagesTab
            messages={data.messages}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            data={data}
            onRefresh={onRefresh}
            showToast={showToast}
          />
        )}
      </main>

      {/* Curriculum Vitae (CV) Preview & Print Modal */}
      <CvPreviewModal
        isOpen={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        data={data}
      />

    </div>
  );
};
