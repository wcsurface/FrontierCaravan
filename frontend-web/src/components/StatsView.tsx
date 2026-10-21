'use client';

import React, { useState } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { GlassNavBar } from './GlassNavBar';
import { ArrowLeft, ChevronRight, MapPin, Music, Calendar, Clock } from 'lucide-react';

interface StatsViewProps {
  onBack: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ onBack, onNavigate }) => {
  const { getConcertStats } = useEncoreStore();
  const stats = getConcertStats();

  const [activeSubView, setActiveSubView] = useState<'main' | 'venues' | 'artists' | 'years' | 'days'>('main');

  const venuesList = stats.topVenues.length > 0 ? stats.topVenues : [
    { name: 'Red Rocks Amphitheatre', city: 'Morrison', visitCount: 12 },
    { name: 'The Fillmore', city: 'San Francisco', visitCount: 8 },
    { name: 'The Paramount Theatre', city: 'Seattle', visitCount: 5 },
    { name: 'Madison Square Garden', city: 'New York', visitCount: 4 },
    { name: 'Ryman Auditorium', city: 'Nashville', visitCount: 3 },
    { name: 'First Avenue', city: 'Minneapolis', visitCount: 3 },
    { name: 'The Wiltern', city: 'Los Angeles', visitCount: 2 },
    { name: '9:30 Club', city: 'Washington DC', visitCount: 2 },
    { name: 'Stubbs BBQ', city: 'Austin', visitCount: 2 },
    { name: 'Metro', city: 'Chicago', visitCount: 1 },
  ];

  const artistsList = stats.topArtists.length > 0 ? stats.topArtists : [
    { name: 'The Cure', timesSeen: 6 },
    { name: 'Radiohead', timesSeen: 4 },
    { name: 'Pixies', timesSeen: 4 },
    { name: 'Depeche Mode', timesSeen: 3 },
    { name: 'Nirvana', timesSeen: 3 },
    { name: 'The Smashing Pumpkins', timesSeen: 2 },
    { name: 'LCD Soundsystem', timesSeen: 2 },
    { name: 'Nine Inch Nails', timesSeen: 2 },
    { name: 'Interpol', timesSeen: 2 },
    { name: 'Arcade Fire', timesSeen: 1 },
  ];

  const yearsList = stats.topYears.length > 0 ? stats.topYears : [
    { year: 2026, count: 18 },
    { year: 2025, count: 22 },
    { year: 2024, count: 15 },
    { year: 2023, count: 11 },
    { year: 2022, count: 8 },
    { year: 2021, count: 4 },
    { year: 2019, count: 3 },
    { year: 2018, count: 2 },
  ];

  const daysList = stats.topDaysOfWeek.length > 0 ? stats.topDaysOfWeek : [
    { day: 'Thursday', count: 32, percentage: 42 },
    { day: 'Friday', count: 20, percentage: 26 },
    { day: 'Saturday', count: 14, percentage: 18 },
    { day: 'Wednesday', count: 8, percentage: 10 },
    { day: 'Tuesday', count: 4, percentage: 4 },
  ];

  const maxVenueVisits = Math.max(...venuesList.map(v => v.visitCount), 1);
  const maxArtistSeen = Math.max(...artistsList.map(a => a.timesSeen), 1);
  const maxYearShows = Math.max(...yearsList.map(y => y.count), 1);
  const maxDayShows = Math.max(...daysList.map(d => d.count), 1);

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between pb-28">
      {/* Header with LiveLore Logo & Generous Top Padding */}
      <header className="relative flex items-center justify-between w-full pt-10 sm:pt-14 pb-6 my-1 shrink-0">
        {activeSubView !== 'main' ? (
          <button
            onClick={() => setActiveSubView('main')}
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

      {/* 1. FULL DATA DETAIL SUB-VIEWS */}
      {activeSubView === 'venues' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-4 overflow-y-auto">
          <div className="text-center">
            <h2 className="text-xl font-black uppercase text-[#00E676] font-sans flex items-center justify-center gap-2">
              <MapPin size={22} /> ALL VENUES
            </h2>
          </div>
          <div className="space-y-3">
            {venuesList.map((v, i) => (
              <div key={i} className="bg-[#121619] p-3.5 rounded-xl border border-[#222B30] space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-100">{i + 1}. {v.name} {v.city ? `(${v.city})` : ''}</span>
                  <span className="text-[#00E676] font-mono">{v.visitCount} Shows</span>
                </div>
                <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#00E676] rounded-full" style={{ width: `${(v.visitCount / maxVenueVisits) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubView === 'artists' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-4 overflow-y-auto">
          <div className="text-center">
            <h2 className="text-xl font-black uppercase text-[#FFB300] font-sans flex items-center justify-center gap-2">
              <Music size={22} /> ALL ARTISTS
            </h2>
          </div>
          <div className="space-y-3">
            {artistsList.map((a, i) => (
              <div key={i} className="bg-[#121619] p-3.5 rounded-xl border border-[#222B30] space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-100">{i + 1}. {a.name}</span>
                  <span className="text-[#FFB300] font-mono">{a.timesSeen} Times</span>
                </div>
                <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#FFB300] rounded-full" style={{ width: `${(a.timesSeen / maxArtistSeen) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubView === 'years' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-4 overflow-y-auto">
          <div className="text-center">
            <h2 className="text-xl font-black uppercase text-[#00B0FF] font-sans flex items-center justify-center gap-2">
              <Calendar size={22} /> ALL YEARS
            </h2>
          </div>
          <div className="space-y-3">
            {yearsList.map((y, i) => (
              <div key={i} className="bg-[#121619] p-3.5 rounded-xl border border-[#222B30] space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-100">Year {y.year}</span>
                  <span className="text-[#00B0FF] font-mono">{y.count} Concerts</span>
                </div>
                <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#00B0FF] rounded-full" style={{ width: `${(y.count / maxYearShows) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubView === 'days' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-4 overflow-y-auto">
          <div className="text-center">
            <h2 className="text-xl font-black uppercase text-[#E040FB] font-sans flex items-center justify-center gap-2">
              <Clock size={22} /> DAYS OF THE WEEK
            </h2>
          </div>
          <div className="space-y-3">
            {daysList.map((d, i) => (
              <div key={i} className="bg-[#121619] p-3.5 rounded-xl border border-[#222B30] space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-100">{d.day}</span>
                  <span className="text-[#E040FB] font-mono">{d.count} Shows ({d.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#E040FB] rounded-full" style={{ width: `${(d.count / maxDayShows) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. MAIN STATS OVERVIEW SCREEN */}
      {activeSubView === 'main' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-6 pb-4 overflow-y-auto">
          {/* Hero Readout */}
          <div className="text-center my-2">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-white uppercase font-sans">
              {stats.totalShows || 78} SHOWS
            </h2>
          </div>

          {/* Top 10 Ranked Sections */}
          <div className="space-y-6">
            {/* Top Venues Card */}
            <div
              onClick={() => setActiveSubView('venues')}
              className="bg-[#121619] p-4.5 rounded-2xl border border-[#222B30] hover:border-[#00E676]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-[#222B30]">
                <h3 className="text-xs sm:text-sm font-black text-[#00E676] uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={16} /> TOP VENUES (TOP 10)
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 group-hover:text-[#00E676] transition">
                  SEE ALL <ChevronRight size={16} />
                </div>
              </div>
              <div className="space-y-2.5">
                {venuesList.slice(0, 10).map((v, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-200">
                      <span>{i + 1}. {v.name}</span>
                      <span className="text-[#00E676] font-mono font-extrabold">{v.visitCount}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#00E676] rounded-full" style={{ width: `${(v.visitCount / maxVenueVisits) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists Card */}
            <div
              onClick={() => setActiveSubView('artists')}
              className="bg-[#121619] p-4.5 rounded-2xl border border-[#222B30] hover:border-[#FFB300]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-[#222B30]">
                <h3 className="text-xs sm:text-sm font-black text-[#FFB300] uppercase tracking-widest flex items-center gap-1.5">
                  <Music size={16} /> TOP ARTISTS (TOP 10)
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 group-hover:text-[#FFB300] transition">
                  SEE ALL <ChevronRight size={16} />
                </div>
              </div>
              <div className="space-y-2.5">
                {artistsList.slice(0, 10).map((a, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-200">
                      <span>{i + 1}. {a.name}</span>
                      <span className="text-[#FFB300] font-mono font-extrabold">{a.timesSeen}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#FFB300] rounded-full" style={{ width: `${(a.timesSeen / maxArtistSeen) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Years Card */}
            <div
              onClick={() => setActiveSubView('years')}
              className="bg-[#121619] p-4.5 rounded-2xl border border-[#222B30] hover:border-[#00B0FF]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-[#222B30]">
                <h3 className="text-xs sm:text-sm font-black text-[#00B0FF] uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={16} /> TOP YEARS (TOP 10)
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 group-hover:text-[#00B0FF] transition">
                  SEE ALL <ChevronRight size={16} />
                </div>
              </div>
              <div className="space-y-2.5">
                {yearsList.slice(0, 10).map((y, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-200">
                      <span>{i + 1}. Year {y.year}</span>
                      <span className="text-[#00B0FF] font-mono font-extrabold">{y.count} shows</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#00B0FF] rounded-full" style={{ width: `${(y.count / maxYearShows) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Days of Week Card */}
            <div
              onClick={() => setActiveSubView('days')}
              className="bg-[#121619] p-4.5 rounded-2xl border border-[#222B30] hover:border-[#E040FB]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-3.5 pb-2 border-b border-[#222B30]">
                <h3 className="text-xs sm:text-sm font-black text-[#E040FB] uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={16} /> DAYS OF THE WEEK
                </h3>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-slate-400 group-hover:text-[#E040FB] transition">
                  SEE ALL <ChevronRight size={16} />
                </div>
              </div>
              <div className="space-y-2.5">
                {daysList.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-200">
                      <span>{i + 1}. {d.day}</span>
                      <span className="text-[#E040FB] font-mono font-extrabold">{d.count} ({d.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#E040FB] rounded-full" style={{ width: `${(d.count / maxDayShows) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glassmorphic 4-Button Navigation Bar */}
      <GlassNavBar currentView="stats" onNavigate={onNavigate} />
    </div>
  );
};
