'use client';

import React from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { ArrowLeft } from 'lucide-react';

interface SetlistDetailViewProps {
  concertId: string;
  onBack: () => void;
}

export const SetlistDetailView: React.FC<SetlistDetailViewProps> = ({ concertId, onBack }) => {
  const { concerts, artists, setlistItems } = useEncoreStore();

  const concert = concerts.find((c) => c.id === concertId) || concerts[0];
  const artist = artists.find((a) => a.id === concert?.headlineArtistId);
  const items = setlistItems.filter((s) => s.concertId === concert?.id);

  const mainTracks = items.filter((s) => !s.isEncore);
  const encoreTracks = items.filter((s) => s.isEncore);

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto font-mono bg-grid-lines">
      {/* Header with 2X Larger LiveLore Logo */}
      <header className="relative flex items-center justify-between w-full pt-2 pb-6 my-1">
        <button
          onClick={onBack}
          className="p-2 text-slate-200 hover:text-white transition rounded-full z-10"
        >
          <ArrowLeft size={26} />
        </button>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-10">
          <img
            src="/assets/livelore_logo.png"
            alt="LiveLore"
            className="h-24 sm:h-28 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.4)] filter contrast-105"
          />
        </div>
        <div className="w-10 z-10" />
      </header>

      {/* Artist Subtitle */}
      <div className="text-center my-3">
        <h2 className="text-lg font-extrabold text-[#FFB300] uppercase tracking-widest font-sans">
          {artist?.name || 'THE CURE'}
        </h2>
      </div>

      {/* Track List */}
      <div className="max-w-md mx-auto w-full space-y-2.5 my-4 px-2">
        {mainTracks.map((track) => (
          <div key={track.id} className="text-sm font-semibold text-slate-200 flex items-center gap-3">
            <span className="text-slate-500 font-mono min-w-[24px]">{track.position}.</span>
            <span className="text-slate-100">{track.songTitle}</span>
          </div>
        ))}

        {/* Encore Section Pill Badge */}
        {encoreTracks.length > 0 && (
          <>
            <div className="my-5">
              <span className="inline-block bg-[#00E676] text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-[0_0_12px_rgba(0,230,118,0.5)] tracking-wider uppercase font-sans">
                ENCORE
              </span>
            </div>

            {encoreTracks.map((track) => (
              <div key={track.id} className="text-sm font-semibold text-slate-200 flex items-center gap-3">
                <span className="text-slate-500 font-mono min-w-[24px]">{track.position}.</span>
                <span className="text-slate-100">{track.songTitle}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
