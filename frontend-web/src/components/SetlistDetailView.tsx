'use client';

import React from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { TicketStubCard } from './TicketStubCard';
import { ArrowLeft, MapPin, Calendar, Users, FileText, Music } from 'lucide-react';

interface SetlistDetailViewProps {
  concertId: string;
  onBack: () => void;
}

export const SetlistDetailView: React.FC<SetlistDetailViewProps> = ({ concertId, onBack }) => {
  const { concerts, artists, venues, setlistItems } = useEncoreStore();

  const concert = concerts.find((c) => c.id === concertId) || concerts[0];
  if (!concert) {
    return (
      <div className="p-4 text-center text-slate-400">
        Show not found. <button onClick={onBack} className="text-[#00E676] underline">Go Back</button>
      </div>
    );
  }

  const headliner = artists.find((a) => a.id === concert.headlineArtistId);
  const opener = artists.find((a) => a.id === concert.openingArtistId);
  const venue = venues.find((v) => v.id === concert.venueId);
  const items = setlistItems.filter((s) => s.concertId === concert.id);

  const formattedDate = new Date(concert.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const mainTracks = items.filter((s) => !s.isEncore);
  const encoreTracks = items.filter((s) => s.isEncore);

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines">
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

      {/* Featured Ticket Stub Graphic */}
      <div className="max-w-md mx-auto w-full my-2">
        <TicketStubCard concert={concert} artist={headliner} venue={venue} />
      </div>

      {/* Show Details Card */}
      <div className="max-w-md mx-auto w-full bg-[#121619] p-5 rounded-2xl border border-[#222B30] shadow-xl space-y-4 my-3">
        {/* Headline Band */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300] block mb-1">
            HEADLINE BAND
          </span>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight font-serif">
            {headliner?.name || 'AEROSMITH'}
          </h2>
        </div>

        {/* Opener(s) */}
        {opener?.name && (
          <div className="border-t border-[#222B30] pt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-1">
              <Users size={12} /> OPENER(S)
            </span>
            <p className="text-sm font-bold text-slate-200 font-serif">
              {opener.name}
            </p>
          </div>
        )}

        {/* Date & Day of Week */}
        <div className="border-t border-[#222B30] pt-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-1">
            <Calendar size={12} /> DATE
          </span>
          <p className="text-sm font-extrabold text-slate-200">
            {formattedDate}
          </p>
        </div>

        {/* Venue & Location */}
        <div className="border-t border-[#222B30] pt-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-1">
            <MapPin size={12} /> VENUE & LOCATION
          </span>
          <p className="text-sm font-extrabold text-slate-200">
            {venue?.name || 'Market Square Arena'}
          </p>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {venue?.city || 'Indianapolis'}, {venue?.country || 'USA'}
          </p>
        </div>

        {/* Show Notes */}
        {concert.generalNotes && (
          <div className="border-t border-[#222B30] pt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-1">
              <FileText size={12} /> NOTES & MEMORIES
            </span>
            <p className="text-sm text-slate-200 leading-relaxed font-sans bg-[#0A0D0E] p-3 rounded-xl border border-[#222B30] whitespace-pre-wrap">
              {concert.generalNotes}
            </p>
          </div>
        )}

        {/* Tracklist / Setlist Songs if parsed */}
        {items.length > 0 && (
          <div className="border-t border-[#222B30] pt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00E676] flex items-center gap-1.5 mb-2">
              <Music size={12} /> PARSED SETLIST TRACKS
            </span>
            <div className="space-y-1.5 font-mono text-xs text-slate-300 bg-[#0A0D0E] p-3 rounded-xl border border-[#222B30]">
              {mainTracks.map((t) => (
                <div key={t.id} className="flex gap-2">
                  <span className="text-slate-500">{t.position}.</span>
                  <span>{t.songTitle}</span>
                </div>
              ))}
              {encoreTracks.length > 0 && (
                <>
                  <div className="text-[10px] font-black text-[#00E676] uppercase pt-2">ENCORE</div>
                  {encoreTracks.map((t) => (
                    <div key={t.id} className="flex gap-2">
                      <span className="text-slate-500">{t.position}.</span>
                      <span>{t.songTitle}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Back CTA Button */}
      <div className="max-w-md mx-auto w-full my-3">
        <button
          onClick={onBack}
          className="w-full py-3.5 bg-[#121619] hover:bg-[#1C2328] text-slate-200 hover:text-white font-extrabold text-sm uppercase tracking-wider rounded-full border border-[#222B30] transition"
        >
          ← BACK TO DIARY
        </button>
      </div>
    </div>
  );
};
