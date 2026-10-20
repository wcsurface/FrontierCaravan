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
    <div className="flex flex-col w-full h-full bg-[#121212] text-slate-100 p-4 select-none overflow-y-auto font-mono">
      {/* Header */}
      <header className="flex items-center gap-4 mb-2 pt-2">
        <button
          onClick={onBack}
          className="p-2 text-slate-200 hover:text-white transition rounded-full"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-black tracking-wider uppercase font-sans text-white">
          SETLIST
        </h1>
      </header>

      {/* Artist Subtitle */}
      <div className="text-center my-3">
        <h2 className="text-base font-extrabold text-slate-400 uppercase tracking-widest">
          {artist?.name || 'THE CURE'}
        </h2>
      </div>

      {/* Track List */}
      <div className="max-w-md mx-auto w-full space-y-2.5 my-4 px-2">
        {mainTracks.map((track) => (
          <div key={track.id} className="text-sm font-semibold text-slate-200 flex items-center gap-3">
            <span className="text-slate-500 font-mono min-w-[20px]">{track.position}.</span>
            <span className="text-slate-100">{track.songTitle}</span>
          </div>
        ))}

        {/* Encore Section */}
        {encoreTracks.length > 0 && (
          <>
            <div className="my-5">
              <span className="inline-block bg-[#00E676] text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-[0_0_12px_rgba(0,230,118,0.5)] tracking-wider uppercase">
                ENCORE
              </span>
            </div>

            {encoreTracks.map((track) => (
              <div key={track.id} className="text-sm font-semibold text-slate-200 flex items-center gap-3">
                <span className="text-slate-500 font-mono min-w-[20px]">{track.position}.</span>
                <span className="text-slate-100">{track.songTitle}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
