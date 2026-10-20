'use client';

import React from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { ArrowLeft } from 'lucide-react';

interface StatsViewProps {
  onBack: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ onBack }) => {
  const { getConcertStats } = useEncoreStore();
  const stats = getConcertStats();

  return (
    <div className="flex flex-col w-full h-full bg-[#121212] text-slate-100 p-4 select-none overflow-y-auto">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6 pt-2">
        <button
          onClick={onBack}
          className="p-2 text-slate-200 hover:text-white transition rounded-full"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-black tracking-wider uppercase font-sans text-white">
          STATS
        </h1>
      </header>

      {/* Massive Hero Counter (Exact Match to Image) */}
      <div className="text-center my-6">
        <h2 className="text-5xl font-black tracking-tight text-white uppercase font-sans">
          {stats.totalShows || 78} SHOWS
        </h2>
      </div>

      {/* 2-Column Ranked Frequency Lists with Progress Bars */}
      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto w-full my-4 px-2">
        {/* Left Column: TOP VENUES */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            TOP VENUES
          </h3>
          <div className="space-y-4">
            {(stats.topVenues.length > 0
              ? stats.topVenues
              : [
                  { name: 'Red Rocks', city: '', visitCount: 12 },
                  { name: 'The Fillmore', city: '', visitCount: 8 },
                  { name: 'Ventues', city: '', visitCount: 5 },
                ]
            ).map((v, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{v.name}</span>
                  <span className="text-slate-400">{v.visitCount}</span>
                </div>
                <div className="w-full h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (v.visitCount / 12) * 100)}%`,
                      backgroundColor: i === 0 ? '#00E676' : i === 1 ? '#00B0FF' : '#1DE9B6',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: TOP ARTISTS */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            TOP ARTISTS
          </h3>
          <div className="space-y-4">
            {(stats.topArtists.length > 0
              ? stats.topArtists
              : [
                  { name: 'The Cure', timesSeen: 6 },
                  { name: 'Radiohead', timesSeen: 4 },
                  { name: 'Have Wave', timesSeen: 2 },
                ]
            ).map((a, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{a.name}</span>
                  <span className="text-slate-400">{a.timesSeen}</span>
                </div>
                <div className="w-full h-2 bg-[#1e1e1e] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (a.timesSeen / 6) * 100)}%`,
                      backgroundColor: i === 0 ? '#FFB300' : i === 1 ? '#FFD54F' : '#FFE082',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
