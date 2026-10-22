'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEncoreStore } from '../store/useEncoreStore';
import { parseRawSetlist } from '../engine/setlistParser';
import { searchVenues, PRESET_VENUES, VenueRecord } from '../engine/venueDataset';
import { GlassNavBar } from './GlassNavBar';
import { Plus, Trash2, MapPin, Camera, Crown, Star, MoveHorizontal, Image as ImageIcon, X } from 'lucide-react';

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
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Pre-populate if editing existing concert, OR reset if creating a new concert
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
    } else {
      // ALWAYS Reset Form for a Clean New Entry Form
      resetForm();
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
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoUris(prev => (prev.length < 5 ? [...prev, reader.result as string] : prev));
        }
      };
      reader.readAsDataURL(file);
    });
    setShowPhotoSourceModal(false);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUris(photoUris.filter((_, i) => i !== index));
  };

  const handleSetPrimaryPhoto = (index: number) => {
    if (index === 0 || index >= photoUris.length) return;
    const updated = [...photoUris];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setPhotoUris(updated);
  };

  // Drag and Drop reorder handlers
  const handleDragStart = (index: number) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const updated = [...photoUris];
    const [draggedItem] = updated.splice(draggedIdx, 1);
    updated.splice(targetIdx, 0, draggedItem);
    setPhotoUris(updated);
    setDraggedIdx(null);
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
      {/* Hidden File Inputs for Camera vs Multi-Select Camera Roll Choice */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        multiple
        ref={galleryInputRef}
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Header with LiveLore Logo */}
      <header className="relative flex flex-col items-center justify-center w-full pt-4 sm:pt-6 pb-2 shrink-0">
        <img
          src="/assets/livelore_logo.png"
          alt="LiveLore"
          className="h-28 sm:h-32 w-auto object-contain drop-shadow-[0_0_20px_rgba(0,230,118,0.45)] filter contrast-105"
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

        {/* Concert Photo Attachment Section - POSITIONED DIRECTLY BELOW NOTES & ABOVE SUBMIT BUTTON */}
        <div className="bg-[#121619] p-4 rounded-xl border border-[#222B30] space-y-3 my-1">
          <div>
            <label className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#FFB300] flex items-center gap-1.5">
              <Camera size={18} /> CONCERT PHOTOS ({photoUris.length}/5)
            </label>
            {!isPremium && (
              <div className="text-sm sm:text-base font-black uppercase text-[#FFB300] flex items-center gap-1.5 mt-1">
                <Crown size={16} /> VIP PASS ($4.99 ONE-TIME)
              </div>
            )}
          </div>

          {isPremium ? (
            <div className="space-y-3">
              {photoUris.length > 0 && (
                <div className="text-[11px] text-slate-300 font-bold flex items-center gap-1">
                  <MoveHorizontal size={14} className="text-[#FFB300]" />
                  <span>First photo is the <strong>Primary Photo</strong> on ticket stub. Drag or tap ⭐ to set Primary!</span>
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {photoUris.map((uri, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={() => handleDrop(idx)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition shadow-md group ${
                      idx === 0
                        ? 'border-[#FFB300] ring-2 ring-[#FFB300]/50'
                        : 'border-[#222B30] hover:border-slate-500'
                    }`}
                  >
                    <img src={uri} alt={`Concert Photo ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />

                    {/* Primary Photo Badge */}
                    {idx === 0 ? (
                      <div className="absolute top-1 left-1 bg-[#FFB300] text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase tracking-tighter flex items-center gap-0.5 shadow-md">
                        <Star size={10} className="fill-slate-950" /> PRIMARY
                      </div>
                    ) : (
                      /* Set as Primary Button */
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryPhoto(idx)}
                        title="Set as Primary Photo"
                        className="absolute top-1 left-1 bg-black/80 hover:bg-[#FFB300] text-[#FFB300] hover:text-slate-950 p-1 rounded-full transition shadow-md opacity-90 group-hover:opacity-100"
                      >
                        <Star size={12} />
                      </button>
                    )}

                    {/* Delete Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      title="Delete Photo"
                      className="absolute top-1 right-1 bg-black/80 hover:bg-rose-600 text-rose-300 hover:text-white p-1 rounded-full transition shadow-md opacity-90 group-hover:opacity-100"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Add Photo Button (Disabled when 5/5 max reached) */}
                {photoUris.length < 5 ? (
                  <button
                    type="button"
                    onClick={() => setShowPhotoSourceModal(true)}
                    className="aspect-square rounded-xl border-2 border-dashed border-[#FFB300]/60 bg-[#111618] hover:bg-[#1a2126] transition flex flex-col items-center justify-center cursor-pointer text-[#FFB300] p-1"
                  >
                    <Plus size={22} />
                    <span className="text-[10px] font-black uppercase mt-1">Add Photo</span>
                  </button>
                ) : (
                  <div className="aspect-square rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 text-[9px] font-bold text-center p-1">
                    <span>5/5 Max</span>
                    <span>Delete to Add</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Non-VIP Interactive Upgrade Prompt */
            <div className="p-3 bg-[#111618] rounded-xl border border-[#222B30] text-center space-y-2">
              <p className="text-xs sm:text-sm text-slate-100 font-bold leading-relaxed">
                Upgrade to VIP status and add photos of the band, ticket stubs, your crew, and more!
              </p>
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="w-full py-3.5 bg-[#FFB300] hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition"
              >
                <Camera size={18} /> + ADD PHOTOS (UPGRADE TO VIP)
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="my-2">
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#00FFA3] hover:to-[#00E676] text-slate-950 font-black text-xl uppercase tracking-widest rounded-full shadow-[0_0_22px_rgba(0,230,118,0.5)] active:scale-[0.98] transition-transform"
          >
            {concertIdToEdit ? '💾 SAVE EDITS' : '+ ADD CONCERT'}
          </button>
        </div>
      </form>

      {/* Photo Source Selection Popup Modal (Live Photo / Camera vs Multi-Select Camera Roll) */}
      {showPhotoSourceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121619] border border-[#FFB300] rounded-2xl p-6 max-w-xs w-full space-y-4 shadow-2xl relative text-center">
            <button
              onClick={() => setShowPhotoSourceModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-black text-[#FFB300] uppercase tracking-wider">
              Choose Photo Source
            </h3>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPhotoSourceModal(false);
                  if (cameraInputRef.current) cameraInputRef.current.click();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#FFB300] to-[#FFA000] text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
              >
                <Camera size={20} /> 📸 Take Live Photo
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPhotoSourceModal(false);
                  if (galleryInputRef.current) galleryInputRef.current.click();
                }}
                className="w-full py-3.5 bg-[#1C2128] border border-[#FFB300] text-[#FFB300] font-black text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-95 transition"
              >
                <ImageIcon size={20} /> 🖼️ Select Up to 5 Photos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
