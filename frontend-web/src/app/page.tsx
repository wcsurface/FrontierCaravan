'use client';

import React, { useState } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { TicketStubCard } from '../components/TicketStubCard';
import { LogShowScreen } from '../components/LogShowScreen';
import { SetlistDetailView } from '../components/SetlistDetailView';
import { StatsView } from '../components/StatsView';
import { Menu, Star, Plus, BarChart2 } from 'lucide-react';

export default function HomeView() {
  const [currentView, setCurrentView] = useState<'diary' | 'log' | 'setlist' | 'stats'>('diary');
  const [selectedConcertId, setSelectedConcertId] = useState<string>('');

  const { concerts, artists, venues } = useEncoreStore();

  const handleOpenSetlist = (concertId: string) => {
    setSelectedConcertId(concertId);
    setCurrentView('setlist');
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-[#121212] text-slate-100 select-none font-sans overflow-hidden">
      {/* SCREEN 1: DIARY VIEW */}
      {currentView === 'diary' && (
        <div className="flex flex-col w-full max-w-md h-screen p-4 overflow-y-auto">
          {/* Header */}
          <header className="flex items-center justify-between w-full pt-2 pb-4">
            <button
              onClick={() => setCurrentView('stats')}
              className="p-2 text-slate-200 hover:text-white transition rounded-full"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-2xl font-black tracking-wider uppercase text-white font-sans">
              DIARY
            </h1>
            <button
              onClick={() => setCurrentView('stats')}
              className="p-2 text-[#00E676] hover:text-white transition rounded-full"
            >
              <Star size={22} className="fill-[#00E676]" />
            </button>
          </header>

          {/* Ticket Stubs Feed */}
          <div className="flex-1 overflow-y-auto pr-1">
            {concerts.length === 0 ? (
              <div className="text-center my-12 text-slate-500 font-medium">
                No shows logged yet. Tap + below to add your first concert ticket!
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

          {/* Bottom Floating Navigation Dock */}
          <div className="pt-2 pb-4 flex justify-around items-center w-full bg-[#121212]">
            <button
              onClick={() => setCurrentView('log')}
              className="flex items-center gap-2 px-6 py-3 bg-[#00E676] hover:bg-[#00FFA3] text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_15px_rgba(0,230,118,0.4)] active:scale-95 transition-transform"
            >
              <Plus size={18} /> LOG NEW SHOW
            </button>
            <button
              onClick={() => setCurrentView('stats')}
              className="p-3 bg-[#1e1e1e] hover:bg-slate-800 text-slate-200 rounded-2xl border border-slate-700 transition"
            >
              <BarChart2 size={20} />
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
    </main>
  );
}
