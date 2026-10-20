'use client';

import React from 'react';
import { Concert, Artist, Venue } from '../engine/concertService';

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
      className="relative w-full aspect-[2.85/1] max-w-md mx-auto my-3 cursor-pointer select-none transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl rounded-xl overflow-hidden"
    >
      {/* Real Authentic Vintage Ticket Stub Background Asset */}
      <img
        src="/assets/vintage_ticket_stub.png"
        alt="Vintage Ticket Stub"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* Styled Authentic Paper Fallback Background */}
      <div className="absolute inset-0 bg-[#f4e4bc] border-2 border-[#d6c294] rounded-xl z-[-1]" />

      {/* Text Overlay Positioned Perfectly Inside Ticket Boxes */}
      <div className="relative z-10 w-full h-full flex px-3 py-2 text-[#322312]">
        {/* Left Side: Barcode Margin */}
        <div className="w-[12%] h-full flex flex-col justify-between items-center py-1 opacity-70">
          <span className="text-[9px] font-bold font-mono rotate-90 origin-center text-[#423220]">
            95
          </span>
          <span className="text-[8px] font-bold font-mono tracking-widest text-[#423220] -rotate-90">
            ADVANCE
          </span>
        </div>

        {/* Center Section: Main Ticket Frame */}
        <div className="w-[58%] h-full flex flex-col justify-between pl-1 pr-2 py-1">
          {/* Top Main Box: HEADLINE ARTIST */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-1 my-0.5">
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#1c1208] leading-none font-serif drop-shadow-sm">
              {artistName}
            </h3>
            <p className="text-[11px] font-bold text-[#475569] mt-0.5 uppercase tracking-wide">
              {venueName}
            </p>
          </div>

          {/* Bottom Box: HIGHLIGHTED CONCERT DATE BADGE */}
          <div className="h-[32%] flex border-t-2 border-[#423220]/50 pt-0.5 items-center justify-center">
            <div className="bg-[#FFB300] text-[#0A0D0E] font-black text-xs uppercase tracking-wider px-3 py-0.5 rounded shadow-sm border border-[#ffa000]">
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Right Section: Perforated Stub & Admission Details */}
        <div className="w-[30%] h-full flex flex-col justify-between items-center pl-2 py-1 border-l-2 border-dotted border-[#423220]/40">
          <div className="text-[10px] font-black tracking-widest text-[#1c1208] uppercase rotate-90 my-auto">
            ADMIT ONE
          </div>
          <div className="text-[8px] font-mono font-bold text-[#423220] tracking-tighter">
            GEN | SEC 7 | 3977
          </div>
        </div>
      </div>
    </div>
  );
};
