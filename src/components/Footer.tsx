import React from 'react';
import { ArrowUp, Heart } from 'lucide-react';
import { Profile } from '../types';

interface FooterProps {
  profile: Profile;
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ profile }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-transparent py-6 sm:py-8 text-slate-500 dark:text-slate-400" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Bottom copyright line */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {profile.department || 'Machine Learning & NLP Research'} · {profile.location}
          </p>
        </div>

      </div>
    </footer>
  );
};
