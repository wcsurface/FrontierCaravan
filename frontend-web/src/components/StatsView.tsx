'use client';

import React, { useState } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { GlassNavBar } from './GlassNavBar';
import { ArrowLeft, ChevronRight, MapPin, Music, Calendar, Clock, Building2, Flag } from 'lucide-react';

interface StatsViewProps {
  onBack: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ onBack, onNavigate }) => {
  const { getConcertStats, concerts } = useEncoreStore();
  const stats = getConcertStats();

  const [activeSubView, setActiveSubView] = useState<'main' | 'artists' | 'venues' | 'cities' | 'states' | 'years' | 'days'>('main');

  const artistsList = stats.topArtists || [];
  const venuesList = stats.topVenues || [];
  const citiesList = stats.topCities || [];
  const statesList = stats.topStates || [];
  const yearsList = stats.topYears || [];
  const daysList = stats.topDaysOfWeek || [];

  const maxArtistSeen = Math.max(...artistsList.map(a => a.timesSeen), 1);
  const maxVenueVisits = Math.max(...venuesList.map(v => v.visitCount), 1);
  const maxCityVisits = Math.max(...citiesList.map(c => c.visitCount), 1);
  const maxStateVisits = Math.max(...statesList.map(s => s.visitCount), 1);
  const maxYearShows = Math.max(...yearsList.map(y => y.count), 1);
  const maxDayShows = Math.max(...daysList.map(d => d.count), 1);

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between min-h-screen">
      {/* Header with LiveLore Logo - Pushed down to match Home and Add Show Y-coordinate exactly */}
      <header className="relative flex flex-col items-center justify-center w-full pt-10 sm:pt-14 pb-2 shrink-0">
        {activeSubView !== 'main' && (
          <button
            onClick={() => setActiveSubView('main')}
            className="absolute left-2 top-4 p-2 text-slate-200 hover:text-white transition rounded-full z-10"
          >
            <ArrowLeft size={28} />
          </button>
        )}
        <img
          src="/assets/livelore_logo.png"
          alt="LiveLore"
          className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.45)] filter contrast-105"
        />
        <GlassNavBar currentView="stats" onNavigate={onNavigate} />
      </header>

      {/* FULL INDIVIDUAL CATEGORY SUB-PAGES - LARGER, EASY-TO-READ TYPOGRAPHY */}
      {activeSubView === 'artists' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-6 overflow-y-auto">
          <div className="text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#FFB300] font-sans flex items-center justify-center gap-2">
              <Music size={26} /> ALL ARTISTS ({artistsList.length})
            </h2>
            <p className="text-sm text-slate-300 font-semibold mt-1">Complete artist breakdown including headliners and openers</p>
          </div>
          <div className="space-y-3">
            {artistsList.length > 0 ? artistsList.map((a, i) => (
              <div key={i} className="bg-[#121619] p-4 rounded-xl border border-[#222B30] space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-base sm:text-lg font-extrabold">
                  <span className="text-slate-100">{i + 1}. {a.name}</span>
                  <span className="text-[#FFB300] font-mono font-black">{a.timesSeen} {a.timesSeen === 1 ? 'Time' : 'Times'}</span>
                </div>
                <div className="w-full h-2.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#FFB300] rounded-full" style={{ width: `${(a.timesSeen / maxArtistSeen) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-center text-slate-400 py-4 font-semibold">No artists logged yet.</p>}
          </div>
        </div>
      )}

      {activeSubView === 'venues' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-6 overflow-y-auto">
          <div className="text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#00E676] font-sans flex items-center justify-center gap-2">
              <MapPin size={26} /> ALL VENUES ({venuesList.length})
            </h2>
            <p className="text-sm text-slate-300 font-semibold mt-1">Complete venue breakdown from your concert vault</p>
          </div>
          <div className="space-y-3">
            {venuesList.length > 0 ? venuesList.map((v, i) => (
              <div key={i} className="bg-[#121619] p-4 rounded-xl border border-[#222B30] space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-base sm:text-lg font-extrabold">
                  <span className="text-slate-100">{i + 1}. {v.name} {v.city ? `(${v.city})` : ''}</span>
                  <span className="text-[#00E676] font-mono font-black">{v.visitCount} {v.visitCount === 1 ? 'Show' : 'Shows'}</span>
                </div>
                <div className="w-full h-2.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#00E676] rounded-full" style={{ width: `${(v.visitCount / maxVenueVisits) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-center text-slate-400 py-4 font-semibold">No venues logged yet.</p>}
          </div>
        </div>
      )}

      {activeSubView === 'cities' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-6 overflow-y-auto">
          <div className="text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#00B0FF] font-sans flex items-center justify-center gap-2">
              <Building2 size={26} /> ALL CITIES ({citiesList.length})
            </h2>
            <p className="text-sm text-slate-300 font-semibold mt-1">Complete city breakdown of concerts attended</p>
          </div>
          <div className="space-y-3">
            {citiesList.length > 0 ? citiesList.map((c, i) => (
              <div key={i} className="bg-[#121619] p-4 rounded-xl border border-[#222B30] space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-base sm:text-lg font-extrabold">
                  <span className="text-slate-100">{i + 1}. {c.city} {c.state ? `(${c.state})` : ''}</span>
                  <span className="text-[#00B0FF] font-mono font-black">{c.visitCount} {c.visitCount === 1 ? 'Show' : 'Shows'}</span>
                </div>
                <div className="w-full h-2.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#00B0FF] rounded-full" style={{ width: `${(c.visitCount / maxCityVisits) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-center text-slate-400 py-4 font-semibold">No cities logged yet.</p>}
          </div>
        </div>
      )}

      {activeSubView === 'states' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-6 overflow-y-auto">
          <div className="text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#E040FB] font-sans flex items-center justify-center gap-2">
              <Flag size={26} /> ALL STATES ({statesList.length})
            </h2>
            <p className="text-sm text-slate-300 font-semibold mt-1">Complete state breakdown using 2-letter state abbreviations</p>
          </div>
          <div className="space-y-3">
            {statesList.length > 0 ? statesList.map((s, i) => (
              <div key={i} className="bg-[#121619] p-4 rounded-xl border border-[#222B30] space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-base sm:text-lg font-extrabold">
                  <span className="text-slate-100">{i + 1}. {s.state}</span>
                  <span className="text-[#E040FB] font-mono font-black">{s.visitCount} {s.visitCount === 1 ? 'Show' : 'Shows'}</span>
                </div>
                <div className="w-full h-2.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#E040FB] rounded-full" style={{ width: `${(s.visitCount / maxStateVisits) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-center text-slate-400 py-4 font-semibold">No states logged yet.</p>}
          </div>
        </div>
      )}

      {activeSubView === 'years' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-6 overflow-y-auto">
          <div className="text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#FF7A00] font-sans flex items-center justify-center gap-2">
              <Calendar size={26} /> ALL YEARS ({yearsList.length})
            </h2>
            <p className="text-sm text-slate-300 font-semibold mt-1">Complete year-by-year concert activity</p>
          </div>
          <div className="space-y-3">
            {yearsList.length > 0 ? yearsList.map((y, i) => (
              <div key={i} className="bg-[#121619] p-4 rounded-xl border border-[#222B30] space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-base sm:text-lg font-extrabold">
                  <span className="text-slate-100">{i + 1}. Year {y.year}</span>
                  <span className="text-[#FF7A00] font-mono font-black">{y.count} {y.count === 1 ? 'Concert' : 'Concerts'}</span>
                </div>
                <div className="w-full h-2.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#FF7A00] rounded-full" style={{ width: `${(y.count / maxYearShows) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-center text-slate-400 py-4 font-semibold">No years logged yet.</p>}
          </div>
        </div>
      )}

      {activeSubView === 'days' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-4 pb-6 overflow-y-auto">
          <div className="text-center mb-2">
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#FF4081] font-sans flex items-center justify-center gap-2">
              <Clock size={26} /> DAYS OF THE WEEK
            </h2>
            <p className="text-sm text-slate-300 font-semibold mt-1">Complete breakdown by day of week</p>
          </div>
          <div className="space-y-3">
            {daysList.length > 0 ? daysList.map((d, i) => (
              <div key={i} className="bg-[#121619] p-4 rounded-xl border border-[#222B30] space-y-2 shadow-sm">
                <div className="flex justify-between items-center text-base sm:text-lg font-extrabold">
                  <span className="text-slate-100">{d.day}</span>
                  <span className="text-[#FF4081] font-mono font-black">{d.count} {d.count === 1 ? 'Show' : 'Shows'} ({d.percentage}%)</span>
                </div>
                <div className="w-full h-2.5 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                  <div className="h-full bg-[#FF4081] rounded-full" style={{ width: `${(d.count / maxDayShows) * 100}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-center text-slate-400 py-4 font-semibold">No days logged yet.</p>}
          </div>
        </div>
      )}

      {/* MAIN OVERVIEW SCREEN */}
      {activeSubView === 'main' && (
        <div className="flex-1 flex flex-col w-full max-w-md mx-auto space-y-6 pb-6 overflow-y-auto">
          {/* Total Shows Hero Readout */}
          <div className="text-center my-2">
            <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-white uppercase font-sans">
              {concerts.length} {concerts.length === 1 ? 'SHOW' : 'SHOWS'}
            </h2>
          </div>

          <div className="space-y-6">
            {/* 1. TOP ARTISTS (TOP 10) */}
            <div
              onClick={() => setActiveSubView('artists')}
              className="bg-[#121619] p-5 rounded-2xl border border-[#222B30] hover:border-[#FFB300]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#222B30]">
                <h3 className="text-sm sm:text-base font-black text-[#FFB300] uppercase tracking-wider flex items-center gap-2">
                  <Music size={18} /> TOP ARTISTS (TOP 10)
                </h3>
                <div className="flex items-center gap-1 text-xs font-black text-slate-300 group-hover:text-[#FFB300] transition">
                  SEE ALL <ChevronRight size={18} />
                </div>
              </div>
              <div className="space-y-3">
                {artistsList.length > 0 ? artistsList.slice(0, 10).map((a, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-100">
                      <span>{i + 1}. {a.name}</span>
                      <span className="text-[#FFB300] font-mono font-black">{a.timesSeen}</span>
                    </div>
                    <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#FFB300] rounded-full" style={{ width: `${(a.timesSeen / maxArtistSeen) * 100}%` }} />
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400 font-semibold italic">Log shows to view your top artists!</p>}
              </div>
            </div>

            {/* 2. TOP VENUES (TOP 10) */}
            <div
              onClick={() => setActiveSubView('venues')}
              className="bg-[#121619] p-5 rounded-2xl border border-[#222B30] hover:border-[#00E676]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#222B30]">
                <h3 className="text-sm sm:text-base font-black text-[#00E676] uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={18} /> TOP VENUES (TOP 10)
                </h3>
                <div className="flex items-center gap-1 text-xs font-black text-slate-300 group-hover:text-[#00E676] transition">
                  SEE ALL <ChevronRight size={18} />
                </div>
              </div>
              <div className="space-y-3">
                {venuesList.length > 0 ? venuesList.slice(0, 10).map((v, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-100">
                      <span>{i + 1}. {v.name}</span>
                      <span className="text-[#00E676] font-mono font-black">{v.visitCount}</span>
                    </div>
                    <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#00E676] rounded-full" style={{ width: `${(v.visitCount / maxVenueVisits) * 100}%` }} />
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400 font-semibold italic">Log shows to view your top venues!</p>}
              </div>
            </div>

            {/* 3. TOP CITIES (TOP 10) */}
            <div
              onClick={() => setActiveSubView('cities')}
              className="bg-[#121619] p-5 rounded-2xl border border-[#222B30] hover:border-[#00B0FF]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#222B30]">
                <h3 className="text-sm sm:text-base font-black text-[#00B0FF] uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={18} /> TOP CITIES (TOP 10)
                </h3>
                <div className="flex items-center gap-1 text-xs font-black text-slate-300 group-hover:text-[#00B0FF] transition">
                  SEE ALL <ChevronRight size={18} />
                </div>
              </div>
              <div className="space-y-3">
                {citiesList.length > 0 ? citiesList.slice(0, 10).map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-100">
                      <span>{i + 1}. {c.city} {c.state ? `(${c.state})` : ''}</span>
                      <span className="text-[#00B0FF] font-mono font-black">{c.visitCount}</span>
                    </div>
                    <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#00B0FF] rounded-full" style={{ width: `${(c.visitCount / maxCityVisits) * 100}%` }} />
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400 font-semibold italic">Log shows to view your top cities!</p>}
              </div>
            </div>

            {/* 4. TOP STATES (TOP 10) */}
            <div
              onClick={() => setActiveSubView('states')}
              className="bg-[#121619] p-5 rounded-2xl border border-[#222B30] hover:border-[#E040FB]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#222B30]">
                <h3 className="text-sm sm:text-base font-black text-[#E040FB] uppercase tracking-wider flex items-center gap-2">
                  <Flag size={18} /> TOP STATES (TOP 10)
                </h3>
                <div className="flex items-center gap-1 text-xs font-black text-slate-300 group-hover:text-[#E040FB] transition">
                  SEE ALL <ChevronRight size={18} />
                </div>
              </div>
              <div className="space-y-3">
                {statesList.length > 0 ? statesList.slice(0, 10).map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-100">
                      <span>{i + 1}. {s.state}</span>
                      <span className="text-[#E040FB] font-mono font-black">{s.visitCount}</span>
                    </div>
                    <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#E040FB] rounded-full" style={{ width: `${(s.visitCount / maxStateVisits) * 100}%` }} />
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400 font-semibold italic">Log shows to view your top states!</p>}
              </div>
            </div>

            {/* 5. TOP YEARS (TOP 10) */}
            <div
              onClick={() => setActiveSubView('years')}
              className="bg-[#121619] p-5 rounded-2xl border border-[#222B30] hover:border-[#FF7A00]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#222B30]">
                <h3 className="text-sm sm:text-base font-black text-[#FF7A00] uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={18} /> TOP YEARS (TOP 10)
                </h3>
                <div className="flex items-center gap-1 text-xs font-black text-slate-300 group-hover:text-[#FF7A00] transition">
                  SEE ALL <ChevronRight size={18} />
                </div>
              </div>
              <div className="space-y-3">
                {yearsList.length > 0 ? yearsList.slice(0, 10).map((y, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-100">
                      <span>{i + 1}. Year {y.year}</span>
                      <span className="text-[#FF7A00] font-mono font-black">{y.count} shows</span>
                    </div>
                    <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#FF7A00] rounded-full" style={{ width: `${(y.count / maxYearShows) * 100}%` }} />
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400 font-semibold italic">Log shows to view your top years!</p>}
              </div>
            </div>

            {/* 6. DAYS OF THE WEEK */}
            <div
              onClick={() => setActiveSubView('days')}
              className="bg-[#121619] p-5 rounded-2xl border border-[#222B30] hover:border-[#FF4081]/60 transition cursor-pointer shadow-lg group"
            >
              <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[#222B30]">
                <h3 className="text-sm sm:text-base font-black text-[#FF4081] uppercase tracking-wider flex items-center gap-2">
                  <Clock size={18} /> DAYS OF THE WEEK
                </h3>
                <div className="flex items-center gap-1 text-xs font-black text-slate-300 group-hover:text-[#FF4081] transition">
                  SEE ALL <ChevronRight size={18} />
                </div>
              </div>
              <div className="space-y-3">
                {daysList.length > 0 ? daysList.slice(0, 10).map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-100">
                      <span>{i + 1}. {d.day}</span>
                      <span className="text-[#FF4081] font-mono font-black">{d.count} ({d.percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#0A0D0E] rounded-full overflow-hidden border border-[#222B30]">
                      <div className="h-full bg-[#FF4081] rounded-full" style={{ width: `${(d.count / maxDayShows) * 100}%` }} />
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400 font-semibold italic">Log shows to view days of week breakdown!</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
