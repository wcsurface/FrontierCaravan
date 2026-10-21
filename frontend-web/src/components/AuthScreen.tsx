'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBack, onSuccess }) => {
  const { login, register, error, clearError, isLoading } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    clearError();
  };

  const handleGoogleSignIn = () => {
    if (typeof window !== 'undefined' && (window as any).AndroidGoogleAuth && (window as any).AndroidGoogleAuth.launchGoogleSignIn) {
      (window as any).AndroidGoogleAuth.launchGoogleSignIn();
    } else {
      const googleClientId = '1084293847291-livelore.apps.googleusercontent.com';
      const redirectUri = encodeURIComponent(window.location.origin || 'https://frontier-caravan-9r14f56ys-surface7.vercel.app');
      const scope = encodeURIComponent('email profile');
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
      window.open(authUrl, 'GoogleOAuthWindow', 'width=500,height=600,top=100,left=100');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const cleanedEmail = email.toLowerCase().trim();

    if (!cleanedEmail || cleanedEmail.length < 3 || !cleanedEmail.includes('@')) {
      alert('⚠️ Incorrect Email Address or Password. Please try again.');
      return;
    }

    if (!password || password.length < 4) {
      alert('⚠️ Incorrect Email Address or Password. Please try again.');
      return;
    }

    if (mode === 'login') {
      const ok = await login(cleanedEmail, password);
      if (ok) {
        onSuccess();
      } else {
        alert('⚠️ Incorrect Email Address or Password. Please try again.');
      }
    } else {
      const ok = await register(cleanedEmail, password, displayName || cleanedEmail.split('@')[0]);
      if (ok) {
        onSuccess();
      } else {
        alert('⚠️ Could not create account. Please check your info and try again.');
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none bg-grid-lines justify-between overflow-y-auto min-h-screen">
      {/* Header with Enlarged LiveLore Logo */}
      <header className="relative flex items-center justify-center w-full pt-8 sm:pt-12 pb-6 shrink-0">
        <img
          src="/assets/livelore_logo.png"
          alt="LiveLore"
          className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.45)] filter contrast-105"
        />
      </header>

      {/* Main Auth Form Container */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full my-auto space-y-4">
        {/* 1-Tap Official Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-white text-slate-900 font-extrabold text-base py-3.5 px-4 rounded-full border border-slate-200 flex items-center justify-center gap-3 shadow-lg hover:bg-slate-50 active:scale-[0.98] transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.73-2.09-6.67-4.91H1.29v3.09C3.27 21.3 7.37 24 12 24z"/>
            <path fill="#FBBC05" d="M5.33 14.34c-.25-.72-.38-1.49-.38-2.34s.13-1.62.38-2.34V6.57H1.29E-4C.47 8.25 0 10.06 0 12s.47 3.75 1.29 5.43l4.04-3.09z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.27 2.7 1.29 6.57l4.04 3.09c.94-2.82 3.57-4.91 6.67-4.91z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-[#222B30]"></div>
          <span className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">or email</span>
          <div className="flex-1 border-t border-[#222B30]"></div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#121619] p-1.5 rounded-full border border-[#222B30] mb-2">
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-wider transition ${
              mode === 'login'
                ? 'bg-[#FFB300] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-wider transition ${
              mode === 'register'
                ? 'bg-[#FFB300] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-500/80 rounded-xl text-rose-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#FFB300] mb-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3.5 text-base font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#FFB300] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3.5 text-base font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-[#FFB300] mb-1">
              Password *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={4}
              className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3.5 text-base font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#00FFA3] hover:to-[#00E676] text-slate-950 font-black text-lg uppercase tracking-widest rounded-full shadow-[0_0_22px_rgba(0,230,118,0.5)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span>Connecting...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn size={20} /> LOG IN
              </>
            ) : (
              <>
                <UserPlus size={20} /> CREATE ACCOUNT
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
