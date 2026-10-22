'use client';

import React from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { PRESET_VENUES, toStateAbbr } from '../engine/venueDataset';
import { TicketStubCard } from './TicketStubCard';
import { GlassNavBar } from './GlassNavBar';
import { MapPin, Calendar, Users, FileText, Music, Edit3, Trash2, Camera, Star } from 'lucide-react';

interface SetlistDetailViewProps {
  concertId: string;
  onBack: () => void;
  onEdit: (concertId: string) => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const SetlistDetailView: React.FC<SetlistDetailViewProps> = ({ concertId, onBack, onEdit, onNavigate }) => {
  const { concerts, artists, venues, setlistItems, deleteConcert, isPremium } = useEncoreStore();

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

  const presetVenue = PRESET_VENUES.find(
    v => v.venue.toLowerCase() === (venue?.name || '').toLowerCase()
  );

  const city = (venue?.city || presetVenue?.city || 'Noblesville').trim();
  const rawState = venue?.stateProvince || presetVenue?.stateProvince || 'IN';
  const state = toStateAbbr(rawState);
  const country = (venue?.country || presetVenue?.country || 'USA').trim();

  const locationString = `${city}, ${state}, ${country}`;

  const mainTracks = items.filter((s) => !s.isEncore);
  const encoreTracks = items.filter((s) => s.isEncore);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this show from your vault?')) {
      deleteConcert(concert.id);
      onBack();
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between min-h-screen">
      {/* Header with LiveLore Logo - Byte-for-byte identical to Home page header */}
      <header className="relative flex flex-col items-center justify-center w-full pt-4 sm:pt-6 pb-2 shrink-0">
        <img
          src="/assets/livelore_logo.png"
          alt="LiveLore"
          className="h-28 sm:h-32 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.45)] filter contrast-105"
        />
        <GlassNavBar currentView="setlist" onNavigate={onNavigate} />
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto max-w-md mx-auto w-full pb-6">
        {/* Featured Ticket Stub Graphic */}
        <div className="w-full my-2">
          <TicketStubCard concert={concert} artist={headliner} venue={venue} />
        </div>

        {/* Show Details Card - Enlarged Readability Across All Fields */}
        <div className="w-full bg-[#121619] p-6 rounded-2xl border border-[#222B30] shadow-xl space-y-4 my-3">
          {/* Headline Artist */}
          <div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFB300] block mb-1.5">
              HEADLINE ARTIST
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-serif">
              {headliner?.name || 'STEVIE RAY VAUGHAN'}
            </h2>
          </div>

          {/* Opener(s) */}
          {opener?.name && (
            <div className="border-t border-[#222B30] pt-3.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-1.5">
                <Users size={16} /> OPENER(S)
              </span>
              <p className="text-base sm:text-lg font-extrabold text-slate-100 font-serif">
                {opener.name}
              </p>
            </div>
          )}

          {/* Date & Day of Week */}
          <div className="border-t border-[#222B30] pt-3.5">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-1.5">
              <Calendar size={16} /> DATE
            </span>
            <p className="text-base sm:text-lg font-extrabold text-slate-100">
              {formattedDate}
            </p>
          </div>

          {/* Venue & Location */}
          <div className="border-t border-[#222B30] pt-3.5">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-1.5">
              <MapPin size={16} /> VENUE & LOCATION
            </span>
            <p className="text-base sm:text-lg font-extrabold text-white uppercase font-sans">
              {venue?.name || 'Deer Creek Music Center'}
            </p>
            <p className="text-sm sm:text-base font-extrabold text-[#00E676] tracking-wide mt-1">
              {locationString}
            </p>
          </div>

          {/* Concert Photo Memories Gallery (VIP Feature - Up to 5 Photos) */}
          {isPremium && concert.photoUris && concert.photoUris.length > 0 && (
            <div className="border-t border-[#222B30] pt-3.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-2">
                <Camera size={16} /> CONCERT PHOTO MEMORIES ({concert.photoUris.length}/5)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {concert.photoUris.map((uri, idx) => (
                  <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border shadow-md ${
                    idx === 0 ? 'border-[#FFB300] ring-2 ring-[#FFB300]/50' : 'border-[#222B30]'
                  }`}>
                    <img src={uri} alt={`Concert Memory ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 bg-[#FFB300] text-slate-950 font-black text-[8px] px-1 py-0.5 rounded uppercase tracking-tighter flex items-center gap-0.5 shadow-md">
                        <Star size={8} className="fill-slate-950" /> PRIMARY
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Show Notes */}
          {concert.generalNotes && (
            <div className="border-t border-[#222B30] pt-3.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-1.5">
                <FileText size={16} /> NOTES & MEMORIES
              </span>
              <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans bg-[#0A0D0E] p-4 rounded-xl border border-[#222B30] whitespace-pre-wrap font-semibold">
                {concert.generalNotes}
              </p>
            </div>
          )}

          {/* Parsed Setlist Tracks if present */}
          {items.length > 0 && (
            <div className="border-t border-[#222B30] pt-3.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#00E676] flex items-center gap-1.5 mb-2">
                <Music size={16} /> PARSED SETLIST TRACKS
              </span>
              <div className="space-y-2 font-mono text-sm sm:text-base font-bold text-slate-200 bg-[#0A0D0E] p-4 rounded-xl border border-[#222B30]">
                {mainTracks.map((t) => (
                  <div key={t.id} className="flex gap-2">
                    <span className="text-slate-500">{t.position}.</span>
                    <span>{t.songTitle}</span>
                  </div>
                ))}
                {encoreTracks.length > 0 && (
                  <>
                    <div className="text-xs sm:text-sm font-black text-[#00E676] uppercase pt-2">ENCORE</div>
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

          {/* EDIT SHOW & DELETE SHOW Buttons */}
          <div className="pt-3 space-y-3">
            <button
              onClick={() => onEdit(concert.id)}
              className="w-full py-3.5 bg-gradient-to-r from-[#FFB300] to-[#FFA000] hover:from-[#FFC107] hover:to-[#FFB300] text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,179,0,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Edit3 size={18} /> EDIT SHOW
            </button>

            {/* DELETE SHOW Button */}
            <button
              onClick={handleDelete}
              className="w-full py-3.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white font-black text-sm sm:text-base uppercase tracking-wider rounded-xl border border-rose-900/60 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Trash2 size={18} /> DELETE SHOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
