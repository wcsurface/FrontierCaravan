'use client';

import React, { useState } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { parseRawSetlist } from '../engine/setlistParser';
import { ArrowLeft } from 'lucide-react';

interface LogShowScreenProps {
  onBack: () => void;
  onSaved: () => void;
}

export const LogShowScreen: React.FC<LogShowScreenProps> = ({ onBack, onSaved }) => {
  const { saveConcert } = useEncoreStore();

  const [headlineBand, setHeadlineBand] = useState('');
  const [openingBand, setOpeningBand] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [venueName, setVenueName] = useState('');
  const [setlistText, setSetlistText] = useState('');
  const [notesText, setNotesText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headlineBand || !venueName) return;

    // Parse date or default to today
    let dateMs = Date.now();
    if (dateStr) {
      const parts = dateStr.split(/[\/\.-]/);
      if (parts.length === 3) {
        // DD/MM/YY format
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        dateMs = new Date(year, month, day).getTime();
      }
    }

    // Parse raw setlist text
    const parsedTracks = parseRawSetlist(setlistText);

    saveConcert({
      date: dateMs,
      headlineArtistName: headlineBand.trim(),
      openingArtistName: openingBand.trim(),
      venueName: venueName.trim(),
      venueCity: 'Local City',
      setlist: parsedTracks,
      notes: notesText.trim(),
      rating: 5.0,
      ticketPrice: 45,
    });

    onSaved();
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none bg-grid-lines overflow-y-auto">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6 pt-2">
        <button
          onClick={onBack}
          className="p-2 text-slate-200 hover:text-white transition rounded-full"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-black tracking-wider uppercase font-sans text-white">
          LOG SHOW
        </h1>
      </header>

      {/* Form Inputs (Dark #111618 background, rounded 8px, 1.5px Amber #FFB300 border) */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3.5 max-w-md mx-auto w-full pb-6">
        {/* Headline Band */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Headline Band *
          </label>
          <input
            type="text"
            placeholder="Headline Band"
            value={headlineBand}
            onChange={(e) => setHeadlineBand(e.target.value)}
            required
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
          />
        </div>

        {/* Opening Band */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Opening Band
          </label>
          <input
            type="text"
            placeholder="Opening Band (Opener)"
            value={openingBand}
            onChange={(e) => setOpeningBand(e.target.value)}
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
          />
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Date
          </label>
          <input
            type="text"
            placeholder="Date (DD/MM/YY)"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
          />
        </div>

        {/* Venue Input */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Venue *
          </label>
          <input
            type="text"
            placeholder="Venue"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
          />
        </div>

        {/* Setlist Textarea */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Setlist
          </label>
          <textarea
            placeholder="Setlist (e.g. 1. Song Name 2. Next Song)"
            value={setlistText}
            onChange={(e) => setSetlistText(e.target.value)}
            rows={5}
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg p-3.5 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        {/* Notes Textarea */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Notes
          </label>
          <textarea
            placeholder="Notes (Crowd energy, ticket stub, acoustic versions, guest features)"
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={3}
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg p-3.5 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition resize-none text-sm leading-relaxed"
          />
        </div>

        {/* Emerald Pill CTA Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#00FFA3] hover:to-[#00E676] text-slate-950 font-black text-sm uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(0,230,118,0.4)] active:scale-[0.98] transition-transform my-3"
        >
          + ADD TO DIARY
        </button>
      </form>
    </div>
  );
};
