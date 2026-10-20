'use client';

import React, { useState, useEffect } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { useAuthStore } from '../store/useAuthStore';
import { TicketStubCard } from '../components/TicketStubCard';
import { LogShowScreen } from '../components/LogShowScreen';
import { SetlistDetailView } from '../components/SetlistDetailView';
import { StatsView } from '../components/StatsView';
import { AuthScreen } from '../components/AuthScreen';
import { Menu, User, CheckCircle2, Sparkles, ArrowDown } from 'lucide-react';

export default function HomeView() {
  const { user, token, checkMe } = useAuthStore();
  const { concerts, artists, venues } = useEncoreStore();

  const [currentView, setCurrentView] = useState<'diary' | 'log' | 'setlist' | 'stats' | 'auth'>(
    user ? 'diary' : 'auth'
  );
  const [selectedConcertId, setSelectedConcertId] = useState<string>('');

  useEffect(() => {
    checkMe();
  }, [checkMe]);

  useEffect(() => {
    if (!user && !token) {
      setCurrentView('auth');
    }
  }, [user, token]);

  const handleOpenSetlist = (concertId: string) => {
    setSelectedConcertId(concertId);
    setCurrentView('setlist');
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-[#0A0D0E] text-slate-100 select-none font-sans overflow-hidden bg-grid-lines">
      {/* SCREEN 1: DIARY VIEW */}
      {currentView === 'diary' && (
        <div className="flex flex-col w-full max-w-md h-screen p-4 overflow-y-auto justify-between">
          {/* Header with 2X Larger LiveLore Logo */}
          <header className="relative flex items-center justify-between w-full pt-3 pb-6 my-1">
            <button
              onClick={() => setCurrentView('stats')}
              className="p-2 text-slate-200 hover:text-white transition rounded-full z-10"
            >
              <Menu size={26} />
            </button>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-10">
              <img
                src="/assets/livelore_logo.png"
                alt="LiveLore"
                className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.4)] filter contrast-105"
              />
            </div>
            <button
              onClick={() => setCurrentView('auth')}
              className="p-2 text-[#00E676] hover:text-white transition rounded-full z-10 flex items-center gap-1"
            >
              {user ? (
                <CheckCircle2 size={24} className="text-[#00E676]" />
              ) : (
                <User size={26} className="text-[#FFB300]" />
              )}
            </button>
          </header>

          {/* Ticket Stubs Feed OR Clean Empty State for New Users */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col">
            {concerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center my-auto py-8 px-4 space-y-6">
                <div className="w-16 h-16 bg-[#FFB300]/10 text-[#FFB300] rounded-full flex items-center justify-center border border-[#FFB300]/30 shadow-[0_0_20px_rgba(255,179,0,0.2)] mb-1">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide font-sans">
                  Your Concert Vault Is Empty! 🎸
                </h2>

                {/* Larger Bouncing Text & Green Arrow */}
                <div className="pt-4 flex flex-col items-center gap-3 text-[#00E676] animate-bounce">
                  <span className="text-base sm:text-lg font-black uppercase tracking-widest text-[#FFB300]">
                    Start adding your concerts below!
                  </span>
                  <ArrowDown size={44} className="stroke-[3.5] text-[#00E676] drop-shadow-[0_0_15px_rgba(0,230,118,0.8)]" />
                </div>
              </div>
            ) : (
              concerts.map((concert) => {
                const artistObj = artists.find((a) => a.id === concert.headlineArtistId);
                const venueObj = venues.find((v) => v.id === concert.venueId);
                return (
                  <TicketStubCard
                    key={concert.id}
                    concert={concert}
                    artist={artistObj}
                    venue={venueObj}
                    onClick={() => handleOpenSetlist(concert.id)}
                  />
                );
              })
            )}
          </div>

          {/* Bottom Floating CTA Button */}
          <div className="pt-2 pb-4 flex justify-center items-center w-full z-20">
            <button
              onClick={() => setCurrentView('log')}
              className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#00FFA3] hover:to-[#00E676] text-slate-950 font-black text-sm uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(0,230,118,0.4)] active:scale-[0.98] transition-transform"
            >
              + LOG NEW SHOW
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: LOG SHOW VIEW */}
      {currentView === 'log' && (
        <LogShowScreen
          onBack={() => setCurrentView('diary')}
          onSaved={() => setCurrentView('diary')}
        />
      )}

      {/* SCREEN 3: SETLIST VIEW */}
      {currentView === 'setlist' && (
        <SetlistDetailView
          concertId={selectedConcertId}
          onBack={() => setCurrentView('diary')}
        />
      )}

      {/* SCREEN 4: STATS VIEW */}
      {currentView === 'stats' && (
        <StatsView onBack={() => setCurrentView('diary')} />
      )}

      {/* SCREEN 5: AUTH VIEW */}
      {currentView === 'auth' && (
        <AuthScreen
          onBack={() => {
            if (user) setCurrentView('diary');
          }}
          onSuccess={() => setCurrentView('diary')}
        />
      )}
    </main>
  );
}
