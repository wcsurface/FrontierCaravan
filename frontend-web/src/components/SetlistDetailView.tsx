'use client';

import React, { useState } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { PRESET_VENUES, toStateAbbr } from '../engine/venueDataset';
import { TicketStubCard } from './TicketStubCard';
import { GlassNavBar } from './GlassNavBar';
import { MapPin, Calendar, Users, FileText, Music, Edit3, Trash2, Camera, Star, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SetlistDetailViewProps {
  concertId: string;
  onBack: () => void;
  onEdit: (concertId: string) => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const SetlistDetailView: React.FC<SetlistDetailViewProps> = ({ concertId, onBack, onEdit, onNavigate }) => {
  const { concerts, artists, venues, setlistItems, deleteConcert, isPremium } = useEncoreStore();

  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  const concert = concerts.find((c) => c.id === concertId) || concerts[0];
  if (!concert) {
    return (
      <div className="p-4 text-center text-slate-400">
        Concert not found. <button onClick={onBack} className="text-[#00E676] underline">Go Back</button>
      </div>
    );
  }

  const headliner = artists.find((a) => a.id === concert.headlineArtistId);
  const opener = artists.find((a) => a.id === concert.openingArtistId);
  const venue = venues.find((v) => v.id === concert.venueId);
  const items = setlistItems.filter((s) => s.concertId === concert.id);

  const photoUris = concert.photoUris || [];

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
    if (confirm('Are you sure you want to delete this concert from your vault?')) {
      deleteConcert(concert.id);
      onBack();
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIdx === null || photoUris.length === 0) return;
    setActivePhotoIdx((activePhotoIdx - 1 + photoUris.length) % photoUris.length);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIdx === null || photoUris.length === 0) return;
    setActivePhotoIdx((activePhotoIdx + 1) % photoUris.length);
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none overflow-y-auto bg-grid-lines justify-between min-h-screen relative">
      {/* Header with LiveLore Logo */}
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

        {/* Concert Details Card */}
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

          {/* Concert Notes */}
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

          {/* Concert Photo Memories Gallery (POSITIONED DIRECTLY ABOVE EDIT CONCERT BUTTON) */}
          {isPremium && photoUris.length > 0 && (
            <div className="border-t border-[#222B30] pt-4 my-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#FFB300] flex items-center gap-1.5 mb-2">
                <Camera size={18} /> CONCERT PHOTO MEMORIES ({photoUris.length}/5)
              </span>
              <p className="text-[11px] text-slate-400 font-semibold mb-2">Tap any photo to view full screen & cycle through gallery</p>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {photoUris.map((uri, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-transform hover:scale-105 active:scale-95 shadow-md ${
                      idx === 0 ? 'border-[#FFB300] ring-2 ring-[#FFB300]/50' : 'border-[#222B30]'
                    }`}
                  >
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

          {/* EDIT CONCERT & DELETE CONCERT Buttons */}
          <div className="pt-3 space-y-3">
            <button
              onClick={() => onEdit(concert.id)}
              className="w-full py-3.5 bg-gradient-to-r from-[#FFB300] to-[#FFA000] hover:from-[#FFC107] hover:to-[#FFB300] text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(255,179,0,0.3)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Edit3 size={18} /> EDIT CONCERT
            </button>

            {/* DELETE CONCERT Button */}
            <button
              onClick={handleDelete}
              className="w-full py-3.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white font-black text-sm sm:text-base uppercase tracking-wider rounded-xl border border-rose-900/60 active:scale-[0.98] transition flex items-center justify-center gap-2"
            >
              <Trash2 size={18} /> DELETE CONCERT
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Interactive Photo Gallery Lightbox Modal */}
      {activePhotoIdx !== null && photoUris.length > 0 && (
        <div
          onClick={() => setActivePhotoIdx(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2 px-2 shrink-0 z-10">
            <span className="text-sm font-black text-[#FFB300] uppercase tracking-wider">
              Photo {activePhotoIdx + 1} of {photoUris.length}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhotoIdx(null);
              }}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/80 rounded-full border border-slate-700"
            >
              <X size={22} />
            </button>
          </div>

          {/* Centered Image View with Left / Right Arrows */}
          <div className="relative flex-1 flex items-center justify-center w-full max-w-md mx-auto my-auto py-2">
            <img
              src={photoUris[activePhotoIdx]}
              alt={`Concert Photo ${activePhotoIdx + 1}`}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl border border-[#FFB300]/40 shadow-2xl"
            />

            {/* Left Arrow */}
            {photoUris.length > 1 && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-[#FFB300] text-[#FFB300] hover:text-slate-950 p-3 rounded-full border border-[#FFB300]/60 shadow-xl transition active:scale-95"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Right Arrow */}
            {photoUris.length > 1 && (
              <button
                type="button"
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900/80 hover:bg-[#FFB300] text-[#FFB300] hover:text-slate-950 p-3 rounded-full border border-[#FFB300]/60 shadow-xl transition active:scale-95"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Bottom Bar Controls */}
          {photoUris.length > 1 && (
            <div className="w-full max-w-md mx-auto flex items-center justify-between px-4 pb-4 shrink-0 gap-3">
              <button
                type="button"
                onClick={handlePrevPhoto}
                className="flex-1 py-3 bg-[#121619] border border-[#222B30] hover:border-[#FFB300] text-[#FFB300] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1"
              >
                <ChevronLeft size={16} /> PREVIOUS
              </button>
              <button
                type="button"
                onClick={handleNextPhoto}
                className="flex-1 py-3 bg-[#121619] border border-[#222B30] hover:border-[#FFB300] text-[#FFB300] font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1"
              >
                NEXT <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
