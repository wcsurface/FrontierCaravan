'use client';

import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Star, Coins, Check } from 'lucide-react';

export const RenovationScene: React.FC = () => {
  const { stars, coins, decorations, unlockDecor, shopCatName } = useGameStore();

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-slate-950 text-white p-4 rounded-3xl border border-fuchsia-800/40 shadow-2xl">
      {/* Top Banner Status */}
      <div className="flex items-center justify-between pb-3 border-b border-fuchsia-900/40">
        <div>
          <h2 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400">
            {shopCatName}&apos;S MIDNIGHT MART
          </h2>
          <p className="text-xs text-fuchsia-300">Renovate & Restore the Bodega</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 px-2 py-1 rounded-full text-amber-300 font-bold text-xs">
            <Coins className="w-3.5 h-3.5" />
            {coins}
          </div>
          <div className="flex items-center gap-1 bg-fuchsia-500/20 border border-fuchsia-500/40 px-2 py-1 rounded-full text-fuchsia-300 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-fuchsia-400" />
            {stars}
          </div>
        </div>
      </div>

      {/* Isometric 2.5D Room Viewport Representation */}
      <div className="relative w-full h-48 my-4 rounded-2xl overflow-hidden bg-gradient-to-b from-[#1c0f38] to-[#0a0314] border border-cyan-500/30 flex items-center justify-center">
        {/* Neon Bodega Sign Visual */}
        <div className={`absolute top-4 transition-all duration-500 ${decorations.neon_sign?.unlocked ? 'opacity-100 scale-100' : 'opacity-20 scale-95'}`}>
          <div className="text-2xl font-black text-pink-500 drop-shadow-[0_0_15px_#ff007f] tracking-widest uppercase">
            ✦ OPEN 24/7 ✦
          </div>
        </div>

        {/* Counter & Cat Bed */}
        <div className="absolute bottom-6 flex items-end justify-between w-full px-8">
          <div className={`flex flex-col items-center transition-all ${decorations.cat_cushion?.unlocked ? 'scale-100 opacity-100' : 'opacity-25'}`}>
            <span className="text-2xl">🐱</span>
            <div className="text-[10px] bg-purple-900/80 px-2 py-0.5 rounded text-pink-200 mt-1">
              {decorations.cat_cushion?.unlocked ? 'Warm Velvet Pad' : 'Cardboard Box'}
            </div>
          </div>

          <div className={`flex flex-col items-center transition-all ${decorations.slushie_dispenser?.unlocked ? 'scale-100 opacity-100' : 'opacity-25'}`}>
            <span className="text-2xl">🍧</span>
            <div className="text-[10px] bg-cyan-900/80 px-2 py-0.5 rounded text-cyan-200 mt-1">
              Vortex Slush
            </div>
          </div>
        </div>
      </div>

      {/* Upgrades List */}
      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-64 pr-1">
        {Object.values(decorations).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-xl bg-purple-950/40 border border-purple-800/30 hover:border-fuchsia-500/50 transition-all"
          >
            <div>
              <div className="text-sm font-bold text-slate-100">{item.name}</div>
              <div className="text-xs text-purple-300/80">Category: {item.category}</div>
            </div>

            {item.unlocked ? (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-full">
                <Check className="w-3.5 h-3.5" /> Active
              </span>
            ) : (
              <button
                onClick={() => unlockDecor(item.id, 0)}
                disabled={stars < item.costStars || coins < item.costCoins}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black tracking-wide shadow-lg shadow-pink-900/30 active:scale-95 transition-transform"
              >
                <span className="flex items-center gap-0.5 text-pink-200">
                  <Star className="w-3 h-3 fill-pink-300" /> {item.costStars}
                </span>
                <span className="flex items-center gap-0.5 text-amber-200">
                  <Coins className="w-3 h-3" /> {item.costCoins}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
