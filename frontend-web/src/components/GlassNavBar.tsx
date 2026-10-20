'use client';

import React from 'react';

interface GlassNavBarProps {
  currentView: 'diary' | 'log' | 'setlist' | 'stats' | 'auth';
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const GlassNavBar: React.FC<GlassNavBarProps> = ({ currentView, onNavigate }) => {
  return (
    <div className="w-full max-w-md mx-auto pt-2 pb-4 px-1 flex items-center justify-between gap-1.5 z-30 select-none shrink-0">
      {/* 1. HOME BUTTON */}
      <div className="relative group flex-1">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-amber-500/40 via-purple-600/30 to-amber-600/30 blur-md opacity-90 group-hover:opacity-100 transition"></div>
        <button
          type="button"
          onClick={() => onNavigate('diary')}
          className={`relative w-full py-3 px-1.5 rounded-xl bg-[#1C2128]/80 backdrop-blur-md border border-[#E6A04B]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.5)] active:scale-95 transition-all text-center ${
            currentView === 'diary' ? 'ring-1 ring-[#F6B756]' : ''
          }`}
        >
          <span className="text-[#F6B756] font-extrabold text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] uppercase tracking-wider block truncate">
            Home
          </span>
        </button>
      </div>

      {/* 2. ADD SHOW BUTTON */}
      <div className="relative group flex-1">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-b from-[#2DE38E]/45 to-teal-700/35 blur-md opacity-90 group-hover:opacity-100 transition"></div>
        <button
          type="button"
          onClick={() => onNavigate('log')}
          className={`relative w-full py-3 px-1.5 rounded-xl bg-[#1C2128]/80 backdrop-blur-md border border-[#2DE38E]/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.5)] active:scale-95 transition-all text-center ${
            currentView === 'log' ? 'ring-1 ring-[#2DE38E]' : ''
          }`}
        >
          <span className="text-[#2DE38E] font-extrabold text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] uppercase tracking-wider block truncate">
            Add Show
          </span>
        </button>
      </div>

      {/* 3. LOG IN BUTTON */}
      <div className="relative group flex-1">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-b from-[#FF7A00]/50 via-[#FFA73B]/30 to-[#8E2B5F]/40 blur-md opacity-90 group-hover:opacity-100 transition"></div>
        <button
          type="button"
          onClick={() => onNavigate('auth')}
          className={`relative w-full py-3 px-1.5 rounded-xl bg-[#1C2128]/80 backdrop-blur-md border border-[#FFA73B]/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.5)] active:scale-95 transition-all text-center ${
            currentView === 'auth' ? 'ring-1 ring-[#F6B756]' : ''
          }`}
        >
          <span className="text-[#F6B756] font-extrabold text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] uppercase tracking-wider block truncate">
            Log In
          </span>
        </button>
      </div>

      {/* 4. STATS BUTTON */}
      <div className="relative group flex-1">
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-b from-[#00B464]/40 to-cyan-700/30 blur-md opacity-90 group-hover:opacity-100 transition"></div>
        <button
          type="button"
          onClick={() => onNavigate('stats')}
          className={`relative w-full py-3 px-1.5 rounded-xl bg-[#1C2128]/80 backdrop-blur-md border border-[#2DE38E]/85 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_2px_rgba(0,0,0,0.5)] active:scale-95 transition-all text-center ${
            currentView === 'stats' ? 'ring-1 ring-[#2DE38E]' : ''
          }`}
        >
          <span className="text-[#2DE38E] font-extrabold text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)] uppercase tracking-wider block truncate">
            Stats
          </span>
        </button>
      </div>
    </div>
  );
};
