'use client';

import React from 'react';
import { Concert, Artist, Venue } from '../engine/concertService';
import { useEncoreStore } from '../store/useEncoreStore';

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
  const { artists, isPremium } = useEncoreStore();

  const formattedDate = new Date(concert.date)
    .toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .toUpperCase();

  // Headliner always on top
  const headlinerObj = artist || artists.find(a => a.id === concert.headlineArtistId);
  const headlinerName = headlinerObj?.name || 'AEROSMITH';

  // Openers list
  let openersList: string[] = [];
  if (concert.openingArtistId) {
    const openerObj = artists.find(a => a.id === concert.openingArtistId);
    if (openerObj?.name) {
      openersList = openerObj.name.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const totalBands = 1 + openersList.length;

  let headlinerSize = 'text-xl sm:text-2xl';
  let openerSize = 'text-xs sm:text-sm';
  let andSize = 'text-[10px] sm:text-xs';

  if (totalBands === 2) {
    headlinerSize = 'text-lg sm:text-xl';
    openerSize = 'text-xs sm:text-sm';
  } else if (totalBands === 3) {
    headlinerSize = 'text-base sm:text-lg';
    openerSize = 'text-[11px] sm:text-xs';
  } else if (totalBands >= 4) {
    headlinerSize = 'text-sm sm:text-base';
    openerSize = 'text-[10px] sm:text-[11px]';
  }

  const venueName = venue?.name || 'Deer Creek Music Center';
  const featuredPhoto = (isPremium && concert.photoUris && concert.photoUris.length > 0) ? concert.photoUris[0] : null;

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
          {/* Top Main Box: DYNAMICALLY CENTERED BANDS (Headliner on top) */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-1 my-0.5 overflow-hidden">
            {/* Always Headliner on Top */}
            <h3 className={`${headlinerSize} font-black uppercase tracking-tight text-[#1c1208] leading-none font-serif drop-shadow-sm`}>
              {headlinerName}
            </h3>

            {/* If there are openers */}
            {openersList.length > 0 && (
              <div className="flex flex-col items-center justify-center mt-0.5">
                <span className={`${andSize} font-serif italic font-bold text-[#423220]/80 my-0.5`}>
                  and
                </span>
                <div className="flex flex-wrap items-center justify-center gap-x-1.5 leading-tight">
                  {openersList.slice(0, 4).map((opener, i) => (
                    <span key={i} className={`${openerSize} font-extrabold text-[#2b1c0e] font-serif`}>
                      {opener}{i < Math.min(openersList.length, 4) - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Box: VENUE & HIGHLIGHTED CONCERT DATE BADGE */}
          <div className="h-[28%] flex border-t-2 border-[#423220]/50 pt-0.5 items-center justify-between px-1">
            <span className="text-[10px] sm:text-xs font-black uppercase text-[#2b1c0e] truncate max-w-[55%]">
              {venueName}
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase text-[#d97706] tracking-wider">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Right Section: Perforated Stub & Admission / Premium Photo Stub Feature */}
        <div className="w-[30%] h-full flex flex-col justify-between items-center pl-1 py-1 border-l-2 border-dotted border-[#423220]/40 overflow-hidden relative">
          {featuredPhoto ? (
            /* Premium Feature: Custom Photo Embedded Inside Ticket Stub ADMIT ONE Box */
            <div className="w-full h-full rounded-lg overflow-hidden border border-[#423220]/60 relative group">
              <img
                src={featuredPhoto}
                alt="Concert Photo Memory"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-0.5">
                <span className="text-[7px] font-black text-amber-300 uppercase tracking-widest font-mono">
                  VIP MEMORY
                </span>
              </div>
            </div>
          ) : (
            /* Default ADMIT ONE Stub Details */
            <>
              <div className="text-[10px] font-black tracking-widest text-[#1c1208] uppercase rotate-90 my-auto">
                ADMIT ONE
              </div>
              <div className="text-[8px] font-mono font-bold text-[#423220] tracking-tighter">
                GEN | SEC 7 | 3977
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
