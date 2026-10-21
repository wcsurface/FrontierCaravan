'use client';

import React, { useState, useEffect } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { parseRawSetlist } from '../engine/setlistParser';
import { searchVenues, PRESET_VENUES, VenueRecord } from '../engine/venueDataset';
import { GlassNavBar } from './GlassNavBar';
import { Plus, Trash2, MapPin, Camera, Crown } from 'lucide-react';

interface LogShowScreenProps {
  concertIdToEdit?: string;
  onBack: () => void;
  onSaved: () => void;
  onNavigate: (view: 'diary' | 'log' | 'stats' | 'auth') => void;
}

export const LogShowScreen: React.FC<LogShowScreenProps> = ({ concertIdToEdit, onBack, onSaved, onNavigate }) => {
  const { saveConcert, updateConcert, concerts, artists, venues, setlistItems, isPremium } = useEncoreStore();

  const [headlineBand, setHeadlineBand] = useState('');
  const [openers, setOpeners] = useState<string[]>(['']);
  const [dateStr, setDateStr] = useState('');
  const [venueName, setVenueName] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [country, setCountry] = useState('');
  const [notesText, setNotesText] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const [venueSuggestions, setVenueSuggestions] = useState<VenueRecord[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Pre-populate if editing existing concert
  useEffect(() => {
    if (concertIdToEdit) {
      const concert = concerts.find(c => c.id === concertIdToEdit);
      if (concert) {
        const headliner = artists.find(a => a.id === concert.headlineArtistId);
        const opener = artists.find(a => a.id === concert.openingArtistId);
        const venueObj = venues.find(v => v.id === concert.venueId);

        setHeadlineBand(headliner?.name || '');
        if (opener?.name) {
          setOpeners(opener.name.split(',').map(s => s.trim()));
        }
        setVenueName(venueObj?.name || '');
        setCity(venueObj?.city || 'Noblesville');
        setStateProvince(venueObj?.stateProvince || 'IN');
        setCountry(venueObj?.country || 'USA');
        setNotesText(concert.generalNotes || '');
        setPhotoUris(concert.photoUris || []);

        if (concert.date) {
          const dObj = new Date(concert.date);
          if (!isNaN(dObj.getTime())) {
            const m = String(dObj.getMonth() + 1).padStart(2, '0');
            const d = String(dObj.getDate()).padStart(2, '0');
            const y = String(dObj.getFullYear()).slice(-2);
            setDateStr(`${m}/${d}/${y}`);
          }
        }
      }
    }
  }, [concertIdToEdit, concerts, artists, venues]);

  const resetForm = () => {
    setHeadlineBand('');
    setOpeners(['']);
    setDateStr('');
    setVenueName('');
    setCity('');
    setStateProvince('');
    setCountry('');
    setNotesText('');
    setPhotoUris([]);
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    files.forEach(file => {
      if (photoUris.length >= 3) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoUris(prev => (prev.length < 3 ? [...prev, reader.result as string] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUris(photoUris.filter((_, i) => i !== index));
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
        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        let year = parseInt(parts[2], 10);
        if (year < 100) year = year > 30 ? 1900 + year : 2000 + year;
        dateMs = new Date(year, month, day).getTime();
      }
    }

    const combinedOpeners = openers.filter(o => o.trim().length > 0).join(', ');
    const parsedTracks = parseRawSetlist(notesText);

    const inputData = {
      date: dateMs,
      headlineArtistName: headlineBand.trim(),
      openingArtistName: combinedOpeners,
      venueName: venueName.trim(),
      venueCity: city.trim() || 'Noblesville',
      venueCountry: country.trim() || 'USA',
      photoUris,
      setlist: parsedTracks,
      notes: notesText.trim(),
      rating: 5.0,
      ticketPrice: 45,
    };

    if (concertIdToEdit) {
      updateConcert(concertIdToEdit, inputData);
    } else {
      saveConcert(inputData);
    }

    resetForm();
    onSaved();
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#0A0D0E] text-slate-100 p-4 select-none bg-grid-lines overflow-y-auto justify-between">
      {/* Header with LiveLore Logo & Glass Navbar Positioned Directly Under Logo */}
      <header className="relative flex flex-col items-center justify-center w-full pt-6 sm:pt-10 pb-4 shrink-0">
        <img
          src="/assets/livelore_logo.png"
          alt="LiveLore"
          className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.4)] filter contrast-105"
        />
        <GlassNavBar currentView="log" onNavigate={onNavigate} />
      </header>

      {/* Form Inputs */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full pb-6 pt-2">
        {/* Headline Band */}
        <div>
          <label className="block text-sm sm:text-base font-black uppercase tracking-wider text-[#FFB300] mb-1.5">
            Headline Band *
          </label>
          <input
            type="text"
            placeholder="Headline Band"
            value={headlineBand}
            onChange={(e) => setHeadlineBand(e.target.value)}
            required
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3.5 text-base sm:text-lg font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
          />
        </div>

        {/* Dynamic Opener Fields */}
        <div>
          <label className="block text-sm sm:text-base font-black uppercase tracking-wider text-[#FFB300] mb-1.5">
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
                  className="flex-1 bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3.5 text-base sm:text-lg font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
                />
                {openers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOpenerField(idx)}
                    className="p-3 text-slate-400 hover:text-rose-400 transition"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddOpenerField}
            className="mt-2 flex items-center gap-1.5 text-sm font-extrabold text-[#FFB300] hover:text-amber-300 transition py-1"
          >
            <Plus size={16} className="stroke-[3]" /> + Add Another Opener
          </button>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm sm:text-base font-black uppercase tracking-wider text-[#FFB300] mb-1.5">
            Date (MM/DD/YY)
          </label>
          <input
            type="text"
            placeholder="MM/DD/YY"
            value={dateStr}
            onChange={handleDateChange}
            maxLength={10}
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3.5 text-base sm:text-lg font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition font-mono"
          />
        </div>

        {/* Venue Input */}
        <div className="relative">
          <label className="block text-sm sm:text-base font-black uppercase tracking-wider text-[#FFB300] mb-1.5">
            Venue *
          </label>
          <input
            type="text"
            placeholder="Search or enter Venue"
            value={venueName}
            onChange={(e) => handleVenueChange(e.target.value)}
            onFocus={() => venueName.trim().length > 0 && setIsDropdownOpen(true)}
            required
            className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-4 py-3.5 text-base sm:text-lg font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition"
          />

          {isDropdownOpen && venueSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#121619] border border-[#FFB300]/80 rounded-xl shadow-2xl z-50 overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#222B30]">
              {venueSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectVenue(item)}
                  className="p-3 hover:bg-[#1C2328] cursor-pointer transition flex items-start gap-2.5"
                >
                  <MapPin size={18} className="text-[#FFB300] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-base font-bold text-slate-100">{item.venue}</div>
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
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#FFB300] mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-3 py-3 text-sm sm:text-base font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)]"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#FFB300] mb-1 truncate">
              State
            </label>
            <input
              type="text"
              placeholder="State"
              value={stateProvince}
              onChange={(e) => setStateProvince(e.target.value)}
              className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-3 py-3 text-sm sm:text-base font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)]"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wider text-[#FFB300] mb-1">
              Country
            </label>
            <input
              type="text"
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg px-3 py-3 text-sm sm:text-base font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)]"
            />
          </div>
        </div>

        {/* Concert Photo Attachment (Premium Feature - $4.99 Price) */}
        <div className="bg-[#121619] p-3.5 rounded-xl border border-[#222B30] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#FFB300] flex items-center gap-1.5">
              <Camera size={16} /> Concert Photos ({photoUris.length}/3)
            </label>
            {!isPremium && (
              <span className="text-[10px] font-black uppercase text-[#FFB300] bg-[#FFB300]/10 px-2 py-0.5 rounded border border-[#FFB300]/30 flex items-center gap-1">
                <Crown size={10} /> VIP Pass ($4.99)
              </span>
            )}
          </div>

          {isPremium ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {photoUris.map((uri, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#FFB300]/60 group">
                    <img src={uri} alt="Concert Photo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 bg-black/80 text-rose-400 p-1 rounded-full opacity-90 hover:opacity-100 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {photoUris.length < 3 && (
                  <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[#FFB300]/60 bg-[#111618] hover:bg-[#1a2126] transition flex flex-col items-center justify-center cursor-pointer text-[#FFB300]">
                    <Plus size={20} />
                    <span className="text-[9px] font-bold uppercase mt-0.5">Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-[#111618] rounded-lg border border-[#222B30] text-center space-y-1.5">
              <p className="text-xs text-slate-300 font-medium">
                Unlock Photo Feature & 100% AD-Free Experience!
              </p>
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="text-xs font-black text-[#FFB300] hover:underline uppercase tracking-wider flex items-center justify-center gap-1 mx-auto"
              >
                <Crown size={12} /> Upgrade for $4.99 One-Time
              </button>
            </div>
          )}
        </div>

        {/* Combined Notes / Setlist Field */}
        <div className="flex-1 flex flex-col min-h-[140px]">
          <label className="block text-sm sm:text-base font-black uppercase tracking-wider text-[#FFB300] mb-1.5">
            Notes
          </label>
          <textarea
            placeholder="Notes (Setlist, who were you with, venue vibe, crowd energy)"
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={4}
            className="w-full flex-1 bg-[#111618] border-[1.5px] border-[#FFB300] rounded-lg p-4 text-base sm:text-lg font-extrabold text-slate-100 placeholder:text-slate-400 placeholder:font-semibold outline-none shadow-[0_0_10px_rgba(255,179,0,0.15)] focus:shadow-[0_0_15px_rgba(255,179,0,0.3)] transition resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="my-2">
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#00FFA3] hover:to-[#00E676] text-slate-950 font-black text-xl uppercase tracking-widest rounded-full shadow-[0_0_22px_rgba(0,230,118,0.5)] active:scale-[0.98] transition-transform"
          >
            {concertIdToEdit ? '💾 SAVE EDITS' : '+ ADD'}
          </button>
        </div>
      </form>
    </div>
  );
};
