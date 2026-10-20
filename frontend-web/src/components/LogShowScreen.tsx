'use client';

import React, { useState } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { parseRawSetlist } from '../engine/setlistParser';
import { searchVenues, PRESET_VENUES, VenueRecord } from '../engine/venueDataset';
import { GlassNavBar } from './GlassNavBar';
import { ArrowLeft, Plus, Trash2, MapPin } from 'lucide-react';

interface LogShowScreenProps {
  onBack: () => void;
  onSaved: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const LogShowScreen: React.FC<LogShowScreenProps> = ({ onBack, onSaved, onNavigate }) => {
  const { saveConcert } = useEncoreStore();

  const [headlineBand, setHeadlineBand] = useState('');
  const [openers, setOpeners] = useState<string[]>(['']);
  const [dateStr, setDateStr] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [country, setCountry] = useState('');
  const [notesText, setNotesText] = useState('');

  const [venueSuggestions, setVenueSuggestions] = useState<VenueRecord[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const resetForm = () => {
    setHeadlineBand('');
    setOpeners(['']);
    setDateStr('');
    setVenueName('');
    setCity('');
    setStateProvince('');
    setCountry('');
    setNotesText('');
    setVenueSuggestions([]);
    setIsDropdownOpen(false);
  };

  const handleOpenerChange = (index: number, value: string) => {
    const updated = [...openers];
    updated[index] = value;
    setOpeners(updated);
  };

  const handleAddOpenerField = () => {
    setOpeners([...openers, '']);
  };

  const handleRemoveOpenerField = (index: number) => {
    if (openers.length > 1) {
      setOpeners(openers.filter((_, i) => i !== index));
    } else {
      setOpeners(['']);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '');

    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
    }

    setDateStr(formatted);
  };

  const handleVenueChange = (val: string) => {
    setVenueName(val);
    const q = val.trim().toLowerCase();

    if (q.length > 0) {
      const results = searchVenues(val);
      setVenueSuggestions(results);
      setIsDropdownOpen(true);

      const exactOrStartMatch = PRESET_VENUES.find(
        v => v.venue.toLowerCase() === q || v.venue.toLowerCase().startsWith(q)
      );

      if (exactOrStartMatch) {
        setCity(exactOrStartMatch.city);
        setStateProvince(exactOrStartMatch.stateProvince);
        setCountry(exactOrStartMatch.country);
      }
    } else {
      setVenueSuggestions([]);
      setIsDropdownOpen(false);
      setCity('');
      setStateProvince('');
      setCountry('');
    }
  };

  const handleSelectVenue = (record: VenueRecord) => {
    setVenueName(record.venue);
    setCity(record.city);
    setStateProvince(record.stateProvince);
    setCountry(record.country);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headlineBand || !venueName) return;

    let dateMs = Date.now();
    if (dateStr) {
      const parts = dateStr.split(/[\/\.-]/);
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        let year = parseInt(parts[2], 10);
        if (year < 100) year += 2000;
        dateMs = new Date(year, month, day).getTime();
      }
    }

    const combinedOpeners = openers.filter(o => o.trim().length > 0).join(', ');
    const parsedTracks = parseRawSetlist(notesText);

    saveConcert({
      date: dateMs,
      headlineArtistName: headlineBand.trim(),
      openingArtistName: combinedOpeners,
      venueName: venueName.trim(),
      venueCity: city.trim() || 'Noblesville',
      venueCountry: country.trim() || 'USA',
      setlist: parsedTracks,
      notes: notesText.trim(),
      rating: 5.0,
      ticketPrice: 45,
    });

    resetForm();
    onSaved();
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none bg-grid-lines overflow-y-auto justify-between">
      {/* Header with LiveLore Logo */}
      <header className="relative flex items-center justify-between w-full pt-3 pb-6 my-1">
        <button
          onClick={() => { resetForm(); onBack(); }}
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

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full pb-2 pt-2">
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

        {/* Dynamic Opener Fields */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Opener
          </label>
          <div className="space-y-2">
            {openers.map((opener, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={idx === 0 ? "Opener" : `Opener ${idx + 1}`}
                  value={opener}
                  onChange={(e) => handleOpenerChange(idx, e.target.value)}
                  className="flex-1 bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
                />
                {openers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOpenerField(idx)}
                    className="p-3 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddOpenerField}
            className="mt-2 flex items-center gap-1.5 text-xs font-extrabold text-[#FFB300] hover:text-amber-300 transition py-1"
          >
            <Plus size={14} className="stroke-[3]" /> + Add Another Opener
          </button>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Date (DD/MM/YY)
          </label>
          <input
            type="text"
            placeholder="DD/MM/YY"
            value={dateStr}
            onChange={handleDateChange}
            maxLength={10}
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition font-mono"
          />
        </div>

        {/* Venue Input */}
        <div className="relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Venue *
          </label>
          <input
            type="text"
            placeholder="Search or enter Venue"
            value={venueName}
            onChange={(e) => handleVenueChange(e.target.value)}
            onFocus={() => venueName.trim().length > 0 && setIsDropdownOpen(true)}
            required
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
          />

          {isDropdownOpen && venueSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#121619] border border-[#FFB300]/80 rounded-xl shadow-2xl z-50 overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#222B30]">
              {venueSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectVenue(item)}
                  className="p-3 hover:bg-[#1C2328] cursor-pointer transition flex items-start gap-2.5"
                >
                  <MapPin size={16} className="text-[#FFB300] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-slate-100">{item.venue}</div>
                    <div className="text-xs text-[#00E676] font-extrabold">
                      {item.city}, {item.stateProvince}, {item.country}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Info Fields */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FFB300] mb-1 truncate">
              State / Province
            </label>
            <input
              type="text"
              placeholder="State"
              value={stateProvince}
              onChange={(e) => setStateProvince(e.target.value)}
              className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
              Country
            </label>
            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)]"
            />
          </div>
        </div>

        {/* Combined Notes / Setlist Field */}
        <div className="flex-1 flex flex-col min-h-[140px]">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#FFB300] mb-1">
            Notes
          </label>
          <textarea
            placeholder="Notes (Setlist, who were you with, venue vibe, crowd energy)"
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={4}
            className="w-full flex-1 bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg p-4 text-slate-200 placeholder-slate-500 outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition resize-none text-sm leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="my-2">
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#00FFA3] hover:to-[#00E676] text-slate-950 font-black text-xl uppercase tracking-widest rounded-full shadow-[0_0_22px_rgba(0,230,118,0.5)] active:scale-[0.98] transition-transform"
          >
            + ADD
          </button>
        </div>
      </form>

      {/* Glassmorphic 4-Button Navigation Bar */}
      <GlassNavBar currentView="log" onNavigate={onNavigate} />
    </div>
  );
};
