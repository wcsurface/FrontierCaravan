'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBack, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');

  const { login, register, isLoading, error, clearError, user, logout } = useAuthStore();

  useEffect(() => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    clearError();
  }, [clearError]);

  const handleSwitchTab = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setDisplayName('');
    clearError();
  };

  const handleGoogleSignIn = async () => {
    const googleEmailPrompt = prompt("🌐 Google Sign-In Authorization:\n\nPlease select or enter your Google Account email address:", "you@gmail.com");
    if (!googleEmailPrompt || !googleEmailPrompt.includes('@')) {
      useAuthStore.setState({ error: '⚠️ Google Sign-In authorization was canceled or invalid.' });
      return;
    }

    const cleanedEmail = googleEmailPrompt.toLowerCase().trim();
    const ok = await login(cleanedEmail, 'google_session_token_2026');
    if (ok) onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !email.includes('@')) {
      useAuthStore.setState({ error: '⚠️ Incorrect Email Address or Password. Please try again.' });
      return;
    }

    if (!password || password.length < 4) {
      useAuthStore.setState({ error: '⚠️ Incorrect Email Address or Password. Please try again.' });
      return;
    }

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) onSuccess();
    } else {
      const ok = await register(email, displayName, password);
      if (ok) onSuccess();
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none bg-grid-lines overflow-y-auto min-h-screen justify-between">
      {/* Header with LiveLore Logo & Generous Top Padding */}
      <header className="relative flex items-center justify-between w-full pt-10 sm:pt-14 pb-6 my-1">
        {user ? (
          <button
            onClick={onBack}
            className="p-2 text-slate-200 hover:text-white transition rounded-full z-10"
          >
            <ArrowLeft size={26} />
          </button>
        ) : (
          <div className="w-10 z-10" />
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-10">
          <img
            src="/assets/livelore_logo.png"
            alt="LiveLore"
            className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.4)] filter contrast-105"
          />
        </div>
        <div className="w-10 z-10" />
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pb-8 pt-4">
        {/* If Active User is Logged In */}
        {user ? (
          <div className="bg-[#121619] p-6 rounded-2xl border border-[#222B30] text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 bg-[#00E676]/10 text-[#00E676] rounded-full flex items-center justify-center mx-auto border border-[#00E676]/30">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase text-white tracking-wide">
                {user.displayName}
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-1">{user.email}</p>
            </div>
            <div className="pt-2 flex flex-col gap-3">
              <div className="flex items-center justify-center gap-1.5 text-xs text-[#00E676] font-bold">
                <CheckCircle2 size={16} /> Persistent Session & Cloud Sync Active
              </div>
              <button
                onClick={logout}
                className="w-full py-3 bg-[#111618] hover:bg-rose-950/40 text-rose-400 font-extrabold text-sm uppercase tracking-wider rounded-full border border-rose-900/50 transition"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : (
          /* Clean Authentication Form with Google Sign-In & Persistent Session */
          <div className="space-y-4 mt-2">
            {/* 1-Tap Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm rounded-full shadow-lg flex items-center justify-center gap-2.5 transition active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.1 0-5.73-2.09-6.67-4.91H1.29v3.09C3.27 21.3 7.37 24 12 24z"/>
                <path fill="#FBBC05" d="M5.33 14.34c-.25-.72-.38-1.49-.38-2.34s.13-1.62.38-2.34V6.57H1.29E-4C.47 8.25 0 10.06 0 12s.47 3.75 1.29 5.43l4.04-3.09z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.27 2.7 1.29 6.57l4.04 3.09c.94-2.82 3.57-4.91 6.67-4.91z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-[#222B30]" />
              <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">or email</span>
              <div className="flex-1 h-px bg-[#222B30]" />
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-[#121619] p-1 rounded-full border border-[#222B30]">
              <button
                type="button"
                onClick={() => handleSwitchTab('login')}
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
                onClick={() => handleSwitchTab('register')}
                className={`flex-1 py-3 rounded-full text-xs font-black uppercase tracking-wider transition ${
                  mode === 'register'
                    ? 'bg-[#FFB300] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message Notification */}
            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
              {/* Display Name (Register Mode) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
                    Display Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      autoComplete="off"
                      className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg pl-10 pr-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#00FFA3] hover:to-[#00E676] text-slate-950 font-black text-lg uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(0,230,118,0.4)] active:scale-[0.98] transition my-2 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Create Account'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
