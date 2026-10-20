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

  const [artistName, setArtistName] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [venueName, setVenueName] = useState('');
  const [setlistText, setSetlistText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistName || !venueName) return;

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
      artistName: artistName.trim(),
      venueName: venueName.trim(),
      venueCity: 'Local City',
      setlist: parsedTracks,
      rating: 5.0,
      ticketPrice: 45,
    });

    onSaved();
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#121212] text-slate-100 p-4 select-none">
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

      {/* Form Fields with Glowing Amber Borders (Exact Match to Image) */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
        {/* Artist Input */}
        <div>
          <input
            type="text"
            placeholder="Artist"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            required
            className="w-full bg-[#181818] border-2 border-[#ffb300]/70 focus:border-[#ffb300] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-lg transition"
          />
        </div>

        {/* Date Input */}
        <div>
          <input
            type="text"
            placeholder="Date (DD/MM/YY)"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full bg-[#181818] border-2 border-[#ffb300]/70 focus:border-[#ffb300] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-lg transition"
          />
        </div>

        {/* Venue Input */}
        <div>
          <input
            type="text"
            placeholder="Venue"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
            className="w-full bg-[#181818] border-2 border-[#ffb300]/70 focus:border-[#ffb300] rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-lg transition"
          />
        </div>

        {/* Setlist / Notes Textarea */}
        <div className="flex-1 flex flex-col">
          <textarea
            placeholder="Setlist / Notes"
            value={setlistText}
            onChange={(e) => setSetlistText(e.target.value)}
            rows={8}
            className="w-full flex-1 bg-[#181818] border-2 border-[#ffb300]/70 focus:border-[#ffb300] rounded-2xl p-4 text-slate-200 placeholder-slate-500 outline-none shadow-lg transition resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        {/* Glowing Mint Green CTA Button (Exact Match) */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#00FFA3] hover:to-[#00E676] text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(0,230,118,0.4)] active:scale-[0.98] transition-transform my-2"
        >
          + ADD TO DIARY
        </button>
      </form>
    </div>
  );
};
