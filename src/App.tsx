import React, { useState, useEffect, useRef } from 'react';
import {
  fetchPortfolioData,
  isAdminLoggedIn,
  fetchAdminData,
  removeAuthToken
} from './api';
import { PortfolioData, SectionConfig, DEFAULT_SECTIONS } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { PublicationsSection } from './components/PublicationsSection';
import { TrainingSection } from './components/TrainingSection';
import { CertificationsSection } from './components/CertificationsSection';
import { HonorsAndAwardsSection } from './components/HonorsAndAwardsSection';
import { VolunteerSection } from './components/VolunteerSection';
import { ReferencesSection } from './components/ReferencesSection';
import { HonorsAndActivitiesSection } from './components/HonorsAndActivitiesSection';
import { AchievementsSection } from './components/AchievementsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ScrollReveal } from './components/ScrollReveal';
import { SectionMotionWrapper } from './components/motion/SectionMotionWrapper';
import { CvPreviewModal, CvDocumentContent, generateCvPdfFromElement } from './components/CvPreviewModal';
import { LoadingScreen } from './components/LoadingScreen';


export function App() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<'home' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') ? 'admin' : 'home';
  });
  const [isAuth, setIsAuth] = useState<boolean>(isAdminLoggedIn());
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('portfolio-theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
      return false; // Default to light mode first for new visitors
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('portfolio-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('portfolio-theme', 'light');
      }
    } catch (err) {
      console.warn('Failed to update theme classes or localStorage:', err);
    }
  }, [darkMode]);

  const [cvModalOpen, setCvModalOpen] = useState<boolean>(false);
  const [isDownloadingCv, setIsDownloadingCv] = useState<boolean>(false);
  const hiddenCvRef = useRef<HTMLDivElement>(null);

  const handleDownloadCv = async () => {
    if (!data) return;

    // 1. If admin configured custom uploaded manual CV and file exists, trigger manual download
    if (data.profile.cvSettings?.downloadMode === 'manual' && data.profile.cvSettings?.manualCvUrl) {
      const a = document.createElement('a');
      a.href = data.profile.cvSettings.manualCvUrl;
      a.download = data.profile.cvSettings.manualCvFileName || `${data.profile.name.replace(/\s+/g, '_')}_Curriculum_Vitae.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // 2. Otherwise, generate auto-generated dynamic CV directly (matching popup formatting)
    if (!hiddenCvRef.current || isDownloadingCv) return;
    const cleanDocTitle = `${(data.profile.name || 'Candidate').replace(/\s+/g, '_')}_Curriculum_Vitae`;
    await generateCvPdfFromElement(hiddenCvRef.current, cleanDocTitle, setIsDownloadingCv);
  };

  // Load portfolio data
  const loadData = async () => {
    try {
      setError(null);
      if (isAdminLoggedIn()) {
        try {
          const adminData = await fetchAdminData();
          setData(adminData);
          setIsAuth(true);
          return;
        } catch (adminErr) {
          console.warn('Admin session expired or invalid, falling back to public data:', adminErr);
          removeAuthToken();
          setIsAuth(false);
        }
      }

      const publicData = await fetchPortfolioData();
      setData(publicData);
      setIsAuth(false);
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
      setError(err.message || 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data?.profile) {
      document.title = data.profile.siteTitle || `${data.profile.name} - ${data.profile.title}`;

      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }

      let urlToRevoke: string | null = null;

      if (data.profile.logoUrl) {
        link.href = data.profile.logoUrl;
      } else {
        const initials = data.profile.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#4f46e5" stroke-width="4" />
            <text x="50" y="50" dominant-baseline="central" text-anchor="middle" font-family="serif" font-size="42" font-weight="600" fill="#4f46e5" letter-spacing="1">
              ${initials}
            </text>
          </svg>
        `.trim();
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        urlToRevoke = URL.createObjectURL(blob);
        link.href = urlToRevoke;
      }

      return () => {
        if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
      };
    }
  }, [data?.profile]);

  useEffect(() => {
    loadData();

    // Listen to browser URL navigation (popstate)
    const handlePopState = () => {
      setRoute(window.location.pathname.startsWith('/admin') ? 'admin' : 'home');
      setIsAuth(isAdminLoggedIn());
    };

    // Secret shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to access admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateTo('admin');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);



  const navigateTo = (newRoute: 'home' | 'admin') => {
    setRoute(newRoute);
    const path = newRoute === 'admin' ? '/admin' : '/';
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsAuth(isAdminLoggedIn());
  };

  if (!splashFinished) {
    return (
      <LoadingScreen
        isReady={!loading && !!data && !error}
        error={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          loadData();
        }}
        onFinished={() => setSplashFinished(true)}
        candidateName={data?.profile?.shortName || data?.profile?.name || "Mozaddid Babar"}
        fullName={data?.profile?.name || "Mozaddid Ul Hoque Babar"}
        welcomeText={data?.sections?.find(s => s.id === 'hero')?.topText || 'WELCOME'}
      />
    );
  }

  if (loading && !data) {
    return (
      <LoadingScreen
        isReady={false}
        error={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          loadData();
        }}
        candidateName="Mozaddid Babar"
        fullName="Mozaddid Ul Hoque Babar"
        welcomeText="WELCOME"
      />
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0d111a] rounded-2xl border border-red-800/80 p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 bg-red-950/80 text-red-400 rounded-full flex items-center justify-center mx-auto text-lg font-mono">
            !
          </div>
          <h2 className="text-base font-bold text-white">Failed to connect to backend</h2>
          <p className="text-xs text-slate-300 font-light">{error || 'Unknown error occurred.'}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              loadData();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold rounded-xl transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Admin Route View (only visible when directly accessing /admin or via secret shortcut)
  if (route === 'admin') {
    if (!isAuth) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            setLoading(true);
            loadData();
          }}
          onBackToSite={() => navigateTo('home')}
        />
      );
    }

    return (
      <AdminDashboard
        data={data}
        onRefresh={loadData}
        onLogout={() => {
          setIsAuth(false);
          navigateTo('home');
        }}
        onViewLive={() => navigateTo('home')}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    );
  }

  // Public Frontend Portfolio View (Original pristine design with dynamic section ordering & visibility)
  const sections = data.sections && data.sections.length > 0 ? data.sections : DEFAULT_SECTIONS;

  const isSectionRenderable = (secId: string) => {
    switch (secId) {
      case 'certifications':
        return !!(data.certifications && data.certifications.length > 0);
      case 'achievements':
        return !!(data.achievements && data.achievements.length > 0);
      case 'awards':
        return !!(data.awards && data.awards.length > 0);
      case 'volunteer':
        return !!(data.volunteerWork && data.volunteerWork.length > 0);
      case 'affiliations':
        return !!(data.affiliations && data.affiliations.length > 0);
      case 'references':
        return !!(data.references && data.references.length > 0);
      case 'training':
        return !!(data.trainings && data.trainings.length > 0);
      case 'projects':
        return !!(data.projects && data.projects.length > 0);
      case 'publications':
        return !!(data.publications && data.publications.length > 0);
      case 'capabilities':
        return !!(data.skillGroups && data.skillGroups.length > 0);
      default:
        return true;
    }
  };

  const visibleSections = sections.filter(
    sec => sec.showInFrontend !== false && isSectionRenderable(sec.id)
  );

  const renderSection = (sec: SectionConfig, isAlt: boolean) => {
    let content: React.ReactNode = null;

    switch (sec.id) {
      case 'hero':
        content = (
          <Hero
            profile={data.profile}
            isAlt={isAlt}
            onDownloadCv={handleDownloadCv}
            isDownloadingCv={isDownloadingCv}
          />
        );
        break;

      case 'about':
        content = <AboutSection profile={data.profile} researchPillars={data.researchPillars} isAlt={isAlt} sectionConfig={sec} />;
        break;

      case 'publications':
        content = (
          <PublicationsSection
            publications={data.publications.filter(p => p.showInFrontend !== false)}
            scholarUrl={data.profile.social.scholar}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'experience':
        content = (
          <ExperienceSection
            experience={data.experience.filter(e => e.showInFrontend !== false)}
            education={data.education.filter(e => e.showInFrontend !== false)}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'projects':
        content = (
          <ProjectsSection
            projects={data.projects.filter(p => p.showInFrontend !== false)}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'capabilities':
        content = (
          <CapabilitiesSection
            skillGroups={data.skillGroups.filter(s => s.showInFrontend !== false)}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'training':
        content = (
          <TrainingSection
            trainings={data.trainings ? data.trainings.filter(t => t.showInFrontend !== false) : undefined}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'certifications':
        content = data.certifications && data.certifications.length > 0 ? (
          <CertificationsSection
            certifications={data.certifications.filter((c: any) => c.showInFrontend !== false)}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        ) : null;
        break;

      case 'achievements':
        content = data.achievements && data.achievements.length > 0 ? (
          <AchievementsSection
            achievements={data.achievements.filter((a: any) => a.showInFrontend !== false)}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        ) : null;
        break;

      case 'awards':
        content = (
          <HonorsAndAwardsSection
            awards={data.awards ? data.awards.filter((a: any) => a.showInFrontend !== false) : undefined}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'volunteer':
        content = (
          <VolunteerSection
            volunteerWork={data.volunteerWork ? data.volunteerWork.filter((v: any) => v.showInFrontend !== false) : undefined}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'affiliations':
        content = (
          <HonorsAndActivitiesSection
            affiliations={data.affiliations ? data.affiliations.filter((a: any) => a.showInFrontend !== false) : undefined}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'references':
        content = (
          <ReferencesSection
            references={data.references ? data.references.filter((r: any) => r.showInFrontend !== false) : undefined}
            isAlt={isAlt}
            sectionConfig={sec}
          />
        );
        break;

      case 'contact':
        content = <ContactSection profile={data.profile} isAlt={isAlt} sectionConfig={sec} />;
        break;

      default:
        content = null;
    }

    if (!content) return null;

    return (
      <SectionMotionWrapper
        key={sec.id}
        id={`section-motion-${sec.id}`}
        motionCategory={sec.motionCategory || 'perspective-flip'}
        hoverEffect={sec.hoverEffect || 'tilt-3d'}
      >
        {content}
      </SectionMotionWrapper>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 antialiased relative transition-colors duration-300" id="public-portfolio-root">
      {/* Main Navbar */}
      <Header
        profile={data.profile}
        sections={visibleSections}
        onOpenAdmin={() => navigateTo('admin')}
        isAdminLoggedIn={isAuth}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onViewCv={() => setCvModalOpen(true)}
      />

      {/* Main Content Sections - dynamically ordered and filtered by showInFrontend */}
      <main className="space-y-0 overflow-hidden" id="main-sections-container" data-html2canvas-ignore="true">
        {visibleSections.map((sec, visibleIdx) => {
          const isAlt = visibleIdx % 2 === 1;
          return renderSection(sec, isAlt);
        })}
      </main>

      {/* Footer */}
      <div data-html2canvas-ignore="true">
        <Footer
          profile={data.profile}
          onOpenAdmin={() => navigateTo('admin')}
          isAdminLoggedIn={isAuth}
        />
        <ScrollToTop />
      </div>

      {/* Curriculum Vitae (CV) Preview & Download Modal */}
      <CvPreviewModal
        isOpen={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        data={data}
      />

      {/* Off-screen CV document element for instant high-fidelity PDF generation */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '794px',
          pointerEvents: 'none',
          zIndex: -9999
        }}
        aria-hidden="true"
      >
        <div
          ref={hiddenCvRef}
          className="cv-printable-document bg-white text-black p-[18mm]"
          style={{
            width: '794px',
            fontFamily: '"Times New Roman", Times, Georgia, serif',
            color: '#000000',
            fontSize: '14px',
            lineHeight: '1.5',
            letterSpacing: 'normal',
            wordSpacing: 'normal',
            background: '#ffffff'
          }}
        >
          <CvDocumentContent data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
