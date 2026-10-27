'use client';

import React from 'react';
import { GlassNavBar } from './GlassNavBar';
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({ onBack, onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleBack = () => {
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('livelore_active_user') : null;
    let hasUser = false;
    if (rawUser) {
      try {
        const uObj = JSON.parse(rawUser);
        if (uObj && uObj.email) hasUser = true;
      } catch (e) {}
    }
    if (!hasUser) {
      onNavigate('auth');
    } else {
      onBack();
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between min-h-screen">
      {/* Header */}
      <header className="relative flex flex-col items-center justify-center w-full pt-4 sm:pt-6 pb-2 shrink-0">
        <button
          onClick={handleBack}
          className="absolute left-2 top-4 p-2 text-slate-200 hover:text-white transition rounded-full z-10 flex items-center gap-1 text-sm font-extrabold text-[#FFB300]"
        >
          <ArrowLeft size={24} /> BACK
        </button>
        <img
          src="/assets/livelore_logo.png"
          alt="LiveLore"
          className="h-28 sm:h-32 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.45)] filter contrast-105"
        />
        <GlassNavBar currentView="auth" onNavigate={onNavigate} />
      </header>

      {/* Main Privacy Policy Container */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full space-y-5 pb-6 pt-2">
        <div className="bg-[#121619] p-6 rounded-2xl border border-[#222B30] shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#222B30] pb-3">
            <ShieldCheck size={24} className="text-[#00E676]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#00E676] uppercase tracking-wide">
              PRIVACY POLICY
            </h1>
          </div>

          <div className="text-sm text-slate-200 leading-relaxed font-sans space-y-4">
            <p className="font-semibold text-slate-300">
              At <strong>Surface Apps</strong>, we respect your privacy. This Privacy Policy explains how your information is collected, protected, and used in <strong>LiveLore</strong>.
            </p>

            <div className="p-3 bg-[#0A0D0E] rounded-xl border border-[#00E676]/30 text-xs font-extrabold text-[#00E676] flex items-center gap-2">
              <Lock size={16} className="shrink-0" />
              <span>Zero Data Sale Guarantee: We NEVER sell or rent your personal information to third parties.</span>
            </div>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">1. Information We Collect</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                • <strong>Account Details:</strong> Email address and optional display name when creating an account or logging in via Google.
                <br />
                • <strong>Concert Vault Data:</strong> Concert logs, artists, venues, setlists, notes, and attached photos.
              </p>
            </div>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">2. How Data Is Stored & Synced</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your concert memories are saved locally in encrypted on-device storage and backed up securely to our cloud database to enable seamless multi-device synchronization.
              </p>
            </div>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">3. Third-Party Services</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Google Authentication and Google AdMob (for non-VIP users) process credentials and anonymous diagnostic metrics strictly in compliance with Google Play Developer Privacy Guidelines.
              </p>
            </div>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">4. Your Data Rights</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You can delete your concert entries or request a complete wipe of your vault at any time directly through your Profile settings.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Copyright Footer */}
        <footer className="text-center pt-2 pb-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
          <p>© {currentYear} Surface Apps. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};
