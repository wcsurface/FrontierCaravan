'use client';

import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (mode === 'login') {
      const ok = await login(email, password);
      if (ok) onSuccess();
    } else {
      const ok = await register(email, displayName, password);
      if (ok) onSuccess();
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none bg-grid-lines overflow-y-auto">
      {/* Centered & Larger Header */}
      <header className="relative flex items-center justify-between w-full pt-3 pb-5 mb-2">
        <button
          onClick={onBack}
          className="p-2 text-slate-200 hover:text-white transition rounded-full z-10"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-black tracking-widest uppercase text-white font-sans pointer-events-none">
          {user ? 'ACCOUNT' : mode === 'login' ? 'LOG IN' : 'REGISTER'}
        </h1>
        <div className="w-10 z-10" />
      </header>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pb-8">
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
                <CheckCircle2 size={16} /> Railway Cloud Sync Active
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
          /* Authentication Form */
          <div className="space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-[#121619] p-1 rounded-full border border-[#222B30]">
              <button
                onClick={() => { setMode('login'); clearError(); }}
                className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                  mode === 'login'
                    ? 'bg-[#FFB300] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setMode('register'); clearError(); }}
                className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition ${
                  mode === 'register'
                    ? 'bg-[#FFB300] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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

            {/* Guest / Offline Mode Link */}
            <div className="text-center pt-2">
              <button
                onClick={onBack}
                className="text-xs text-slate-400 hover:text-white underline tracking-wide font-medium transition"
              >
                Continue as Guest (Local Offline Storage)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
