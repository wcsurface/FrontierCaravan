'use client';

import React, { useState } from 'react';
import { GlassNavBar } from './GlassNavBar';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqViewProps {
  onBack: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

interface FaqItem {
  q: string;
  a: string;
}

export const FaqView: React.FC<FaqViewProps> = ({ onBack, onNavigate }) => {
  const currentYear = new Date().getFullYear();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      q: "What is LiveLore?",
      a: "LiveLore is your ultimate personal concert diary and setlist vault. Log bands, venues, dates, and setlists, track lifetime show stats, and preserve your concert memories forever."
    },
    {
      q: "How does Cloud Sync work?",
      a: "When logged in with your email or Google account, your concert vault automatically backs up to our secure cloud database so your memories are safely synced across all your mobile and web devices."
    },
    {
      q: "What comes with the LiveLore VIP Pass ($4.99)?",
      a: "The VIP Pass is a $4.99 one-time purchase that unlocks the ability to attach up to 5 concert photos per show and permanently removes all advertisements across the app."
    },
    {
      q: "How do I set my Primary Photo for a ticket stub?",
      a: "The first photo (index 0) in your concert photos list is automatically rendered on your ticket stub. On the Add/Edit Concert page, you can drag photos or tap the ⭐ button on any photo to set it as Primary!"
    },
    {
      q: "Is my data safe and private?",
      a: "Yes! Surface Apps adheres to a strict Zero Data Sale Policy. Your personal information, concert notes, and photos are encrypted and never shared with third parties."
    }
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between min-h-screen">
      {/* Header */}
      <header className="relative flex flex-col items-center justify-center w-full pt-4 sm:pt-6 pb-2 shrink-0">
        <button
          onClick={onBack}
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

      {/* Main FAQ Container */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full space-y-5 pb-6 pt-2">
        <div className="bg-[#121619] p-6 rounded-2xl border border-[#222B30] shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-[#222B30] pb-3">
            <HelpCircle size={24} className="text-[#00B0FF]" />
            <h1 className="text-xl sm:text-2xl font-black text-[#00B0FF] uppercase tracking-wide">
              FREQUENTLY ASKED QUESTIONS
            </h1>
          </div>

          <div className="space-y-3 pt-1">
            {faqs.map((item, idx) => (
              <div key={idx} className="bg-[#111618] border border-[#222B30] rounded-xl overflow-hidden transition shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full p-4 text-left font-black text-sm sm:text-base text-slate-100 flex items-center justify-between gap-2 hover:bg-[#1A2126]"
                >
                  <span className="uppercase tracking-wide">{item.q}</span>
                  {openIdx === idx ? (
                    <ChevronUp size={20} className="text-[#00B0FF] shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-500 shrink-0" />
                  )}
                </button>
                {openIdx === idx && (
                  <div className="p-4 pt-0 text-xs sm:text-sm font-medium text-slate-300 leading-relaxed border-t border-[#222B30]/60 bg-[#0A0D0E]/60">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
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
