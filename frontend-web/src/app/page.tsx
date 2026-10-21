'use client';

import React, { useState, useEffect } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { useAuthStore } from '../store/useAuthStore';
import { TicketStubCard } from '../components/TicketStubCard';
import { LogShowScreen } from '../components/LogShowScreen';
import { SetlistDetailView } from '../components/SetlistDetailView';
import { StatsView } from '../components/StatsView';
import { AuthScreen } from '../components/AuthScreen';
import { ProfileView } from '../components/ProfileView';
import { GlassNavBar } from '../components/GlassNavBar';
import { Sparkles, ArrowDown, SlidersHorizontal } from 'lucide-react';

export default function HomeView() {
  const { user, token, checkMe } = useAuthStore();
  const { concerts, artists, venues } = useEncoreStore();

  const [currentView, setCurrentView] = useState<'diary' | 'log' | 'setlist' | 'stats' | 'auth' | 'profile'>('diary');
  const [selectedConcertId, setSelectedConcertId] = useState<string>('');
  const [editingConcertId, setEditingConcertId] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'band'>('newest');

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
    setEditingConcertId(undefined);
    setCurrentView('setlist');
  };

  const handleEditConcert = (concertId: string) => {
    setSelectedConcertId(concertId);
    setEditingConcertId(concertId);
    setCurrentView('log');
  };

  const sortedConcerts = [...concerts].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.date - a.date;
    } else if (sortBy === 'oldest') {
      return a.date - b.date;
    } else if (sortBy === 'band') {
      const artistA = artists.find((art) => art.id === a.headlineArtistId)?.name || '';
      const artistB = artists.find((art) => art.id === b.headlineArtistId)?.name || '';
      return artistA.localeCompare(artistB);
    }
    return 0;
  });

  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-[#0A0D0E] text-slate-100 select-none font-sans overflow-hidden bg-grid-lines">
      {/* SCREEN 1: DIARY VIEW */}
      {currentView === 'diary' && (
        <div className="flex flex-col w-full max-w-md h-screen p-4 overflow-y-auto justify-between pb-28">
          {/* Centered LiveLore Header with Generous Top Padding Clearing Camera Notch */}
          <header className="relative flex items-center justify-center w-full pt-10 sm:pt-14 pb-6 my-1">
            <img
              src="/assets/livelore_logo.png"
              alt="LiveLore"
              className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.4)] filter contrast-105"
            />
          </header>

          {/* Sort Dropdown & Show Count Bar */}
          {concerts.length > 0 && (
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {concerts.length} {concerts.length === 1 ? 'Show' : 'Shows'} Logged
              </span>
              <div className="flex items-center gap-1.5 bg-[#121619] border border-[#222B30] rounded-lg px-2.5 py-1.5 shadow-sm">
                <SlidersHorizontal size={14} className="text-[#FFB300]" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer uppercase tracking-wider"
                >
                  <option value="newest" className="bg-[#121619] text-slate-200">Newest First</option>
                  <option value="oldest" className="bg-[#121619] text-slate-200">Oldest First</option>
                  <option value="band" className="bg-[#121619] text-slate-200">Band (A-Z)</option>
                </select>
              </div>
            </div>
          )}

          {/* Ticket Stubs Feed OR Clean Empty State */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col pb-6">
            {sortedConcerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center my-auto py-8 px-4 space-y-6">
                <div className="w-16 h-16 bg-[#FFB300]/10 text-[#FFB300] rounded-full flex items-center justify-center border border-[#FFB300]/30 shadow-[0_0_20px_rgba(255,179,0,0.2)] mb-1">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide font-sans">
                  Your Concert Vault Is Empty! 🎸
                </h2>

                <div className="pt-4 flex flex-col items-center gap-3 text-[#00E676] animate-bounce">
                  <span className="text-base sm:text-lg font-black uppercase tracking-widest text-[#FFB300]">
                    Start adding your concerts below!
                  </span>
                  <ArrowDown size={44} className="stroke-[3.5] text-[#00E676] drop-shadow-[0_0_15px_rgba(0,230,118,0.8)]" />
                </div>
              </div>
            ) : (
              sortedConcerts.map((concert) => {
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

          {/* Fixed Floating Glassmorphic 4-Button Navigation Bar */}
          <GlassNavBar
            currentView={currentView}
            onNavigate={(view) => {
              if (view === 'log') setEditingConcertId(undefined);
              setCurrentView(view === 'auth' ? 'profile' : view);
            }}
          />
        </div>
      )}

      {/* SCREEN 2: LOG SHOW VIEW */}
      {currentView === 'log' && (
        <LogShowScreen
          concertIdToEdit={editingConcertId}
          onBack={() => setCurrentView('diary')}
          onSaved={() => {
            setEditingConcertId(undefined);
            setCurrentView('diary');
          }}
          onNavigate={(view) => {
            setEditingConcertId(undefined);
            setCurrentView(view === 'auth' ? 'profile' : view);
          }}
        />
      )}

      {/* SCREEN 3: SETLIST VIEW */}
      {currentView === 'setlist' && (
        <SetlistDetailView
          concertId={selectedConcertId}
          onBack={() => setCurrentView('diary')}
          onEdit={(concertId) => handleEditConcert(concertId)}
          onNavigate={(view) => setCurrentView(view === 'auth' ? 'profile' : view)}
        />
      )}

      {/* SCREEN 4: STATS VIEW */}
      {currentView === 'stats' && (
        <StatsView
          onBack={() => setCurrentView('diary')}
          onNavigate={(view) => setCurrentView(view === 'auth' ? 'profile' : view)}
        />
      )}

      {/* SCREEN 5: PROFILE VIEW */}
      {currentView === 'profile' && (
        <ProfileView
          onBack={() => setCurrentView('diary')}
          onNavigate={(view) => setCurrentView(view === 'auth' ? 'profile' : view)}
          onSwitchAccount={() => setCurrentView('auth')}
        />
      )}

      {/* SCREEN 6: AUTH / LOG IN SCREEN */}
      {currentView === 'auth' && (
        <AuthScreen
          onBack={() => setCurrentView('diary')}
          onSuccess={() => setCurrentView('diary')}
        />
      )}
    </main>
  );
}
