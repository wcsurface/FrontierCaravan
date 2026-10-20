'use client';

import React, { useState } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { TicketStubCard } from '../components/TicketStubCard';
import { LogShowScreen } from '../components/LogShowScreen';
import { SetlistDetailView } from '../components/SetlistDetailView';
import { StatsView } from '../components/StatsView';
import { Menu, Star } from 'lucide-react';

export default function HomeView() {
  const [currentView, setCurrentView] = useState<'diary' | 'log' | 'setlist' | 'stats'>('diary');
  const [selectedConcertId, setSelectedConcertId] = useState<string>('');

  const { concerts, artists, venues } = useEncoreStore();

  const handleOpenSetlist = (concertId: string) => {
    setSelectedConcertId(concertId);
    setCurrentView('setlist');
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-[#0A0D0E] text-slate-100 select-none font-sans overflow-hidden bg-grid-lines">
      {/* SCREEN 1: DIARY VIEW */}
      {currentView === 'diary' && (
        <div className="flex flex-col w-full max-w-md h-screen p-4 overflow-y-auto">
          {/* Larger & Centered Header */}
          <header className="relative flex items-center justify-between w-full pt-3 pb-5">
            <button
              onClick={() => setCurrentView('stats')}
              className="p-2 text-slate-200 hover:text-white transition rounded-full z-10"
            >
              <Menu size={24} />
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-black tracking-widest uppercase text-white font-sans pointer-events-none">
              LIVELORE
            </h1>
            <button
              onClick={() => setCurrentView('stats')}
              className="p-2 text-[#00E676] hover:text-white transition rounded-full z-10"
            >
              <Star size={24} className="fill-[#00E676]" />
            </button>
          </header>

          {/* Ticket Stubs Feed */}
          <div className="flex-1 overflow-y-auto pr-1">
            {concerts.length === 0 ? (
              <div className="text-center my-12 text-slate-500 font-medium">
                No shows logged yet. Tap + below to log your first show!
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
    </main>
  );
}
