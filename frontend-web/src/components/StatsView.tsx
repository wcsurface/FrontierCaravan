'use client';

import React, { useState } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { ArrowLeft, ChevronRight, MapPin, Music, Calendar, Clock } from 'lucide-react';

interface StatsViewProps {
  onBack: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ onBack }) => {
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
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines">
      {/* 1. DETAIL SUB-VIEWS */}
      {activeSubView === 'venues' && (
        <div className="flex flex-col w-full max-w-md mx-auto space-y-4">
          <header className="relative flex items-center justify-between w-full pt-3 pb-5 mb-2">
            <button onClick={() => setActiveSubView('main')} className="p-2 text-slate-200 hover:text-white transition rounded-full z-10">
              <ArrowLeft size={24} />
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-black tracking-widest uppercase text-white font-sans pointer-events-none gap-2">
              <MapPin size={22} className="text-[#00E676]" /> ALL TOP VENUES
            </h1>
            <div className="w-10 z-10" />
          </header>
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
        <div className="flex flex-col w-full max-w-md mx-auto space-y-4">
          <header className="relative flex items-center justify-between w-full pt-3 pb-5 mb-2">
            <button onClick={() => setActiveSubView('main')} className="p-2 text-slate-200 hover:text-white transition rounded-full z-10">
              <ArrowLeft size={24} />
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-black tracking-widest uppercase text-white font-sans pointer-events-none gap-2">
              <Music size={22} className="text-[#FFB300]" /> ALL TOP ARTISTS
            </h1>
            <div className="w-10 z-10" />
          </header>
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
        <div className="flex flex-col w-full max-w-md mx-auto space-y-4">
          <header className="relative flex items-center justify-between w-full pt-3 pb-5 mb-2">
            <button onClick={() => setActiveSubView('main')} className="p-2 text-slate-200 hover:text-white transition rounded-full z-10">
              <ArrowLeft size={24} />
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-black tracking-widest uppercase text-white font-sans pointer-events-none gap-2">
              <Calendar size={22} className="text-[#00B0FF]" /> ALL TOP YEARS
            </h1>
            <div className="w-10 z-10" />
          </header>
          <div className="space-y-3">
            {yearsList.map((y, i) => (
              <div key={i} className="bg-[#121619] p-3.5 rounded-xl border border-[#222B30] space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-100">{y.year}</span>
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
        <div className="flex flex-col w-full max-w-md mx-auto space-y-4">
          <header className="relative flex items-center justify-between w-full pt-3 pb-5 mb-2">
            <button onClick={() => setActiveSubView('main')} className="p-2 text-slate-200 hover:text-white transition rounded-full z-10">
              <ArrowLeft size={24} />
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl font-black tracking-widest uppercase text-white font-sans pointer-events-none gap-2">
              <Clock size={22} className="text-[#E040FB]" /> DAYS OF THE WEEK
            </h1>
            <div className="w-10 z-10" />
          </header>
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
        <div className="flex flex-col w-full max-w-md mx-auto space-y-6">
          {/* Larger & Centered Header */}
          <header className="relative flex items-center justify-between w-full pt-3 pb-5 mb-2">
            <button onClick={onBack} className="p-2 text-slate-200 hover:text-white transition rounded-full z-10">
              <ArrowLeft size={24} />
            </button>
            <h1 className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl font-black tracking-widest uppercase text-white font-sans pointer-events-none">
              STATS
            </h1>
            <div className="w-10 z-10" />
          </header>

          {/* Hero Readout */}
          <div className="text-center my-2">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-white uppercase font-sans">
              {stats.totalShows || 78} SHOWS
            </h2>
          </div>

          {/* Top 10 Ranked Sections (Clickable) */}
          <div className="space-y-5">
            {/* Top Venues Card (Top 10) */}
            <div
              onClick={() => setActiveSubView('venues')}
              className="bg-[#121619] p-4 rounded-2xl border border-[#222B30] hover:border-[#00E676]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-[#00E676] uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={14} /> TOP VENUES (TOP 10)
                </h3>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-[#00E676] transition" />
              </div>
              <div className="space-y-2.5">
                {venuesList.slice(0, 5).map((v, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{v.name}</span>
                      <span className="text-slate-400 font-mono">{v.visitCount}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#00E676] rounded-full" style={{ width: `${(v.visitCount / maxVenueVisits) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Artists Card (Top 10) */}
            <div
              onClick={() => setActiveSubView('artists')}
              className="bg-[#121619] p-4 rounded-2xl border border-[#222B30] hover:border-[#FFB300]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-[#FFB300] uppercase tracking-widest flex items-center gap-1.5">
                  <Music size={14} /> TOP ARTISTS (TOP 10)
                </h3>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-[#FFB300] transition" />
              </div>
              <div className="space-y-2.5">
                {artistsList.slice(0, 5).map((a, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{a.name}</span>
                      <span className="text-slate-400 font-mono">{a.timesSeen}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#FFB300] rounded-full" style={{ width: `${(a.timesSeen / maxArtistSeen) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Years Card (Top 10) */}
            <div
              onClick={() => setActiveSubView('years')}
              className="bg-[#121619] p-4 rounded-2xl border border-[#222B30] hover:border-[#00B0FF]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-[#00B0FF] uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar size={14} /> TOP YEARS (TOP 10)
                </h3>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-[#00B0FF] transition" />
              </div>
              <div className="space-y-2.5">
                {yearsList.slice(0, 4).map((y, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>Year {y.year}</span>
                      <span className="text-slate-400 font-mono">{y.count} shows</span>
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
              className="bg-[#121619] p-4 rounded-2xl border border-[#222B30] hover:border-[#E040FB]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-black text-[#E040FB] uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={14} /> DAYS OF THE WEEK
                </h3>
                <ChevronRight size={16} className="text-slate-500 group-hover:text-[#E040FB] transition" />
              </div>
              <div className="space-y-2.5">
                {daysList.slice(0, 3).map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{d.day}</span>
                      <span className="text-slate-400 font-mono">{d.percentage}%</span>
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
    </div>
  );
};
