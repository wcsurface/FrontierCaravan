'use client';

import React from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { PRESET_VENUES } from '../engine/venueDataset';
import { TicketStubCard } from './TicketStubCard';
import { GlassNavBar } from './GlassNavBar';
import { ArrowLeft, MapPin, Calendar, Users, FileText, Music, Edit3, Trash2, Camera } from 'lucide-react';

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

  const city = venue?.city || presetVenue?.city || 'Noblesville';
  const state = venue?.stateProvince || presetVenue?.stateProvince || 'Indiana';
  const country = venue?.country || presetVenue?.country || 'USA';

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
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between">
      {/* Header with LiveLore Logo */}
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
        <button
          onClick={() => onEdit(concert.id)}
          className="p-2 text-[#FFB300] hover:text-amber-300 transition rounded-full z-10 flex items-center gap-1 font-bold text-xs"
        >
          <Edit3 size={22} />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
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
              {headliner?.name || 'STEVIE RAY VAUGHAN'}
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
            <p className="text-base font-black text-white uppercase font-sans">
              {venue?.name || 'Deer Creek Music Center'}
            </p>
            <p className="text-xs sm:text-sm font-extrabold text-[#00E676] tracking-wide mt-1">
              {locationString}
            </p>
          </div>

          {/* Concert Photo Memories (VIP Feature) */}
          {isPremium && concert.photoUris && concert.photoUris.length > 0 && (
            <div className="border-t border-[#222B30] pt-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-2">
                <Camera size={12} /> CONCERT PHOTO MEMORIES
              </span>
              <div className="grid grid-cols-3 gap-2">
                {concert.photoUris.map((uri, idx) => (
                  <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-[#FFB300]/50 shadow-md">
                    <img src={uri} alt="Concert Memory" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Parsed Setlist Tracks if present */}
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

          {/* EDIT SHOW & DELETE SHOW Buttons */}
          <div className="pt-2 space-y-3">
            <button
              onClick={() => onEdit(concert.id)}
              className="w-full py-3 bg-gradient-to-r from-[#FFB300] to-[#FFA000] hover:from-[#FFC107] hover:to-[#FFB300] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,179,0,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Edit3 size={16} /> EDIT SHOW
            </button>

            {/* DELETE SHOW Button */}
            <button
              onClick={handleDelete}
              className="w-full py-3 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white font-extrabold text-xs uppercase tracking-wider rounded-xl border border-rose-900/60 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Trash2 size={16} /> DELETE SHOW
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphic 4-Button Navigation Bar */}
      <GlassNavBar currentView="setlist" onNavigate={onNavigate} />
    </div>
  );
};
