'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useEncoreStore } from '../store/useEncoreStore';
import { GlassNavBar } from './GlassNavBar';
import { Crown, LogOut, Sparkles, KeyRound } from 'lucide-react';

interface ProfileViewProps {
  onBack: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
  onSwitchAccount?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onBack, onNavigate, onSwitchAccount }) => {
  const { user, logout } = useAuthStore();
  const { isPremium, setIsPremium } = useEncoreStore();

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
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between min-h-screen pb-28">
      {/* Header with LiveLore Logo & Generous Top Padding */}
      <header className="relative flex items-center justify-center w-full pt-10 sm:pt-14 pb-6 my-1 shrink-0">
        <img
          src="/assets/livelore_logo.png"
          alt="LiveLore"
          className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.4)] filter contrast-105"
        />
      </header>

      {/* Main Profile & Premium Offer */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full space-y-5 pb-6">
        {/* User Account Details Card (Renders only if user is logged in) */}
        {user && (
          <div className="bg-[#121619] p-4 rounded-2xl border border-[#222B30] text-center space-y-1 shadow-xl">
            <h2 className="text-lg font-black uppercase text-white tracking-wide font-sans">
              {user.displayName}
            </h2>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
          </div>
        )}

        {/* CATCHY "BUY THE APP / GO PREMIUM ($3.99)" BANNER */}
        <div className={`p-5 rounded-2xl border transition shadow-xl space-y-3 relative overflow-hidden ${
          isPremium
            ? 'bg-gradient-to-br from-[#00E676]/20 via-[#121619] to-[#00C853]/10 border-[#00E676]'
            : 'bg-gradient-to-br from-[#FFB300]/20 via-[#121619] to-[#FF7A00]/10 border-[#FFB300]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5">
              <Crown size={16} className="text-[#FFB300]" /> {isPremium ? 'VIP PASS ACTIVE' : 'LIVELORE VIP PASS'}
            </span>
            <span className="bg-[#FFB300] text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              {isPremium ? 'UNLOCKED' : '$3.99 ONE-TIME'}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-sans">
              Unlock Photo Feature & 100% AD-Free Experience!
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mt-1">
              Attach and save photos from concerts. Remove all ads.
            </p>
          </div>

          {!isPremium && (
            <button
              onClick={handlePurchasePremium}
              className="w-full py-3.5 bg-gradient-to-r from-[#FFB300] to-[#FFA000] hover:from-[#FFC107] hover:to-[#FFB300] text-slate-950 font-black text-sm uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(255,179,0,0.4)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles size={18} /> GO PREMIUM FOR $3.99
            </button>
          )}
        </div>

        {/* Change Password Card */}
        <div className="bg-[#121619] p-5 rounded-2xl border border-[#222B30] space-y-3 shadow-xl">
          <h3 className="text-xs font-black text-[#FFB300] uppercase tracking-widest flex items-center gap-1.5">
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
                className="w-full bg-[#111618] border-[1.5px] border-[#222B30] focus:border-[#FFB300] rounded-lg px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition"
              />
            </div>
            {passUpdated && (
              <p className="text-xs text-[#00E676] font-bold">✓ Password updated successfully!</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1C2128] hover:bg-[#222B30] text-slate-200 font-bold text-xs uppercase tracking-wider rounded-lg border border-[#222B30] transition"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Log Out Button */}
        <button
          onClick={() => {
            logout();
            if (onSwitchAccount) onSwitchAccount();
          }}
          className="w-full py-3.5 bg-[#121619] hover:bg-rose-950/40 text-rose-400 font-extrabold text-sm uppercase tracking-wider rounded-full border border-rose-900/50 transition flex items-center justify-center gap-2"
        >
          <LogOut size={18} /> LOG OUT
        </button>
      </div>

      {/* Fixed Floating Glassmorphic 4-Button Navigation Bar */}
      <GlassNavBar currentView="auth" onNavigate={onNavigate} />
    </div>
  );
};
