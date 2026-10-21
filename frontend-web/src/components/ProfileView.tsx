'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useEncoreStore } from '../store/useEncoreStore';
import { GlassNavBar } from './GlassNavBar';
import { Crown, LogOut, Sparkles, KeyRound, Palette } from 'lucide-react';

interface ProfileViewProps {
  onBack: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
  onSwitchAccount?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onNavigate, onSwitchAccount }) => {
  const { user, logout } = useAuthStore();
  const { isPremium, setIsPremium, ticketTheme, setTicketTheme } = useEncoreStore();

  const [newPassword, setNewPassword] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);

  const handlePurchasePremium = () => {
    setIsPremium(true);
    alert('🎉 Welcome to LiveLore VIP! Ad-Free experience and photo features are now permanently unlocked!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length >= 6) {
      setPassUpdated(true);
      setNewPassword('');
      setTimeout(() => setPassUpdated(false), 3000);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between min-h-screen">
      {/* 1. Header with LiveLore Logo & Navbar Directly Under Logo */}
      <header className="relative flex flex-col items-center justify-center w-full pt-6 sm:pt-10 pb-4 shrink-0">
        <img
          src="/assets/livelore_logo.png"
          alt="LiveLore"
          className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.4)] filter contrast-105"
        />
        {/* Navigation Bar Positioned Under Logo */}
        <GlassNavBar currentView="auth" onNavigate={onNavigate} />
      </header>

      {/* Main Profile View Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full space-y-5 pb-6">
        {/* 1. TICKET STUB COLOR THEME TOGGLE (FIRST THING ON PROFILE PAGE ABOVE VIP BOX) */}
        <div className="bg-[#121619] p-5 rounded-2xl border border-[#222B30] shadow-xl space-y-3">
          <span className="text-xs sm:text-sm font-black text-[#FFB300] uppercase tracking-widest flex items-center gap-2">
            <Palette size={18} /> TICKET STUB COLOR THEME
          </span>
          <div className="flex bg-[#111618] p-1.5 rounded-xl border border-[#222B30]">
            <button
              type="button"
              onClick={() => setTicketTheme('multicolor')}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition ${
                ticketTheme === 'multicolor'
                  ? 'bg-[#FFB300] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🎨 Multi-Colored
            </button>
            <button
              type="button"
              onClick={() => setTicketTheme('classic')}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition ${
                ticketTheme === 'classic'
                  ? 'bg-[#FFB300] text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📜 Classic Beige
            </button>
          </div>
        </div>

        {/* 2. CATCHY VIP PASS AREA WITH $4.99 PRICE */}
        <div className={`p-6 rounded-2xl border transition shadow-xl space-y-4 relative overflow-hidden ${
          isPremium
            ? 'bg-gradient-to-br from-[#00E676]/20 via-[#121619] to-[#00C853]/10 border-[#00E676]'
            : 'bg-gradient-to-br from-[#FFB300]/20 via-[#121619] to-[#FF7A00]/10 border-[#FFB300]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5">
              <Crown size={18} className="text-[#FFB300]" /> {isPremium ? 'VIP PASS ACTIVE' : 'LIVELORE VIP PASS'}
            </span>
            <span className="bg-[#FFB300] text-slate-950 text-xs font-black px-3 py-1 rounded-full uppercase">
              {isPremium ? 'UNLOCKED' : '$4.99 ONE-TIME'}
            </span>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight font-sans leading-snug">
              Unlock Photo Feature & 100% AD-Free Experience!
            </h3>
            <p className="text-sm sm:text-base text-slate-200 font-semibold leading-relaxed mt-2">
              Attach and save photos from concerts. Remove all ads.
            </p>
          </div>

          {!isPremium && (
            <button
              onClick={handlePurchasePremium}
              className="w-full py-4 bg-gradient-to-r from-[#FFB300] to-[#FFA000] hover:from-[#FFC107] hover:to-[#FFB300] text-slate-950 font-black text-base uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(255,179,0,0.4)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles size={20} /> ⭐ GO PREMIUM FOR $4.99
            </button>
          )}
        </div>

        {/* Account Details Card */}
        <div className="bg-[#121619] p-6 rounded-2xl border border-[#222B30] space-y-4 shadow-xl">
          <div>
            <span className="text-xs sm:text-sm font-black text-[#FFB300] uppercase tracking-widest block mb-1">
              👤 ACCOUNT EMAIL
            </span>
            <span className="text-base sm:text-lg font-black text-white font-sans block">
              {user?.email || 'you@example.com'}
            </span>
          </div>

          {/* Styled Update Password Section */}
          <div className="pt-3 border-t border-[#222B30]">
            <h3 className="text-xs sm:text-sm font-black text-[#FFB300] uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <KeyRound size={16} /> CHANGE PASSWORD
            </h3>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="New Password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3.5 text-base font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
                />
              </div>
              {passUpdated && (
                <p className="text-xs sm:text-sm text-[#00E676] font-bold">✓ Password updated successfully!</p>
              )}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#1C2128] to-[#222B30] hover:from-[#222B30] hover:to-[#2A343B] text-[#FFB300] font-black text-sm uppercase tracking-wider rounded-full border-[1.5px] border-[#FFB300] shadow-md active:scale-[0.98] transition-transform"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Log Out Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              logout();
              if (onSwitchAccount) onSwitchAccount();
            }}
            className="w-full py-4 bg-[#121619] hover:bg-rose-950/40 text-rose-400 font-black text-base uppercase tracking-wider rounded-full border border-rose-900/50 shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <LogOut size={20} /> LOG OUT
          </button>
        </div>
      </div>
    </div>
  );
};
