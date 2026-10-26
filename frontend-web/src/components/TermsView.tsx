'use client';

import React from 'react';
import { GlassNavBar } from './GlassNavBar';
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const TermsView: React.FC<TermsViewProps> = ({ onBack, onNavigate }) => {
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
      </header>

      {/* Main Legal Content Container */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full space-y-5 pb-6 pt-2">
        <div className="bg-[#121619] p-6 rounded-2xl border border-[#222B30] shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#222B30] pb-3">
            <FileText size={24} className="text-[#FFB300]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#FFB300] uppercase tracking-wide">
              TERMS OF SERVICE
            </h1>
          </div>

          <div className="text-sm text-slate-200 leading-relaxed font-sans space-y-4">
            <p className="font-semibold text-slate-300">
              Welcome to <strong>LiveLore: Concert Diary & Setlist Vault</strong>, provided by <strong>Surface Apps</strong>. By accessing or using our mobile application or web app, you agree to be bound by these Terms of Service.
            </p>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">1. User Accounts & Responsibilities</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information when registering and using cloud backup features.
              </p>
            </div>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">2. Content & Data Ownership</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You retain full ownership of all concert logs, setlists, notes, and photos uploaded to your personal vault. Surface Apps does not claim ownership of your uploaded media or memories.
              </p>
            </div>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">3. LiveLore VIP Pass ($4.99 One-Time)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                The LiveLore VIP Pass is a one-time, non-subscription purchase that permanently unlocks concert photo attachments and removes in-app advertisement placements across your account.
              </p>
            </div>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">4. Prohibited Uses & Conduct</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You agree not to upload harmful, offensive, illegal, or infringing content to the platform or attempt to breach system security.
              </p>
            </div>

            <div>
              <h3 className="font-black text-[#FFB300] uppercase tracking-wider mb-1">5. Limitation of Liability</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Surface Apps provides LiveLore on an "as-is" basis and shall not be liable for indirect damages or data loss resulting from device malfunction or unauthorized account access.
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
