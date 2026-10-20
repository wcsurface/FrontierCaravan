'use client';

import React from 'react';
import { Concert, Artist, Venue } from '../engine/concertService';
import { Heart } from 'lucide-react';

interface TicketStubCardProps {
  concert: Concert;
  artist?: Artist;
  venue?: Venue;
  onClick?: () => void;
}

export const TicketStubCard: React.FC<TicketStubCardProps> = ({
  concert,
  artist,
  venue,
  onClick,
}) => {
  const formattedDate = new Date(concert.date)
    .toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .toUpperCase();

  const artistName = artist?.name || 'THE CURE';
  const venueName = venue?.name || 'Red Rocks';

  return (
    <div
      onClick={onClick}
      className="relative w-full bg-[#f3ebd7] text-slate-900 rounded-2xl shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer select-none overflow-hidden my-3 border border-[#e2d5b6] flex"
    >
      {/* Left Perforated Circular Notches */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#121212] rounded-full z-10" />

      {/* Main Ticket Body */}
      <div className="flex-1 p-4 pl-6 pr-3 flex flex-col justify-between border-r-2 border-dashed border-[#d1c29e]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase font-serif">
              {artistName}
            </h3>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">
              {venueName}
            </p>
          </div>

          {/* Green Heart Pin Notch */}
          <div className="w-6 h-6 rounded-md bg-[#00E676] flex items-center justify-center shadow-sm">
            <Heart size={14} className="text-slate-900 fill-slate-900" />
          </div>
        </div>

        {/* Highlighted Amber Date Badge */}
        <div className="mt-3">
          <span className="inline-block bg-[#ffb300] text-slate-950 font-extrabold text-xs tracking-wider px-3 py-1 rounded-md shadow-sm border border-[#e6a100]">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Right Perforated Stub Section with Barcode */}
      <div className="w-20 p-3 bg-[#ebe1c7] flex flex-col items-center justify-center gap-2 relative">
        <div className="h-16 w-10 flex gap-0.5 items-center justify-center opacity-85">
          {/* Simulated Vertical Barcode Lines */}
          <div className="w-1 h-full bg-slate-900" />
          <div className="w-0.5 h-full bg-slate-900" />
          <div className="w-1.5 h-full bg-slate-900" />
          <div className="w-0.5 h-full bg-slate-900" />
          <div className="w-1 h-full bg-slate-900" />
          <div className="w-2 h-full bg-slate-900" />
          <div className="w-0.5 h-full bg-slate-900" />
        </div>
        <span className="text-[9px] font-mono font-bold text-slate-600 tracking-tighter rotate-90">
          {concert.id.substring(0, 8)}
        </span>
      </div>

      {/* Right Perforated Circular Notches */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#121212] rounded-full z-10" />
    </div>
  );
};
