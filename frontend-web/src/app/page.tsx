'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { BodegaCanvas } from '../components/BodegaCanvas';
import { RenovationScene } from '../components/RenovationScene';
import { LEVEL_DATABASE } from '../engine/LevelDatabase';
import { Heart, Plus, Star, Zap, Home, Play, Sparkles, RefreshCcw } from 'lucide-react';

export default function HomeView() {
  const [activeTab, setActiveTab] = useState<'puzzle' | 'renovate'>('puzzle');
  const {
    currentLevel,
    initLevel,
    undoLastPlacement,
    movesRemaining,
    lives,
    coins,
    stars,
    tickTimer
  } = useGameStore();

  useEffect(() => {
    initLevel(LEVEL_DATABASE[(currentLevel - 1) % LEVEL_DATABASE.length]);
  }, [currentLevel, initLevel]);

  useEffect(() => {
    const timer = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [tickTimer]);

  const handleNextLevel = () => {
    useGameStore.setState((s) => ({ currentLevel: s.currentLevel + 1 }));
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen bg-[#070112] text-slate-100 p-2 sm:p-3 select-none font-sans overflow-hidden">
      {/* PASS 5: GLOSSY CASUAL UI HUD OVERLAY */}
      {/* 1. Top HUD Capsules */}
      <header className="flex items-center justify-between w-full max-w-md pt-2 px-1 z-30">
        {/* Glossy Red Heart Capsule */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-2 border-pink-400/60 rounded-full pl-1.5 pr-1 py-1 shadow-xl shadow-purple-950/80 backdrop-blur-md">
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-rose-400 to-rose-600 border border-rose-200 flex items-center justify-center shadow">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-black text-sm text-white px-1">{lives}</span>
          <button className="w-6 h-6 rounded-full bg-emerald-500 border border-emerald-300 flex items-center justify-center text-white active:scale-95 transition">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Amber Coin Capsule */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-950/90 to-indigo-950/90 border-2 border-amber-400/60 rounded-full pl-1.5 pr-1 py-1 shadow-xl shadow-purple-950/80 backdrop-blur-md">
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 border border-amber-200 flex items-center justify-center font-black text-amber-950 text-xs shadow">
            C
          </div>
          <span className="font-black text-sm text-amber-200 px-1">{coins.toLocaleString()}</span>
          <button className="w-6 h-6 rounded-full bg-emerald-500 border border-emerald-300 flex items-center justify-center text-white active:scale-95 transition">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* Yellow Star Mastery Progress Bar */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-2 border-indigo-400/60 rounded-full px-2.5 py-1 shadow-xl shadow-purple-950/80 backdrop-blur-md">
          <div className="w-7 h-7 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border border-yellow-200 flex items-center justify-center shadow">
            <Star className="w-4 h-4 text-amber-950 fill-amber-950" />
          </div>
          <span className="font-black text-sm text-white">{stars}</span>
          <div className="w-12 h-2.5 bg-purple-950 rounded-full overflow-hidden border border-purple-700">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full w-3/4 rounded-full" />
          </div>
        </div>
      </header>

      {/* 2. Puffy Rounded 3D "Midnight Mart" Logo with Sparkle Stars */}
      <div className="relative my-1 text-center z-20">
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-cyan-400 to-amber-300 rounded-2xl blur-md opacity-75 animate-pulse"></div>
        <div className="relative px-6 py-1 bg-[#180838] border-2 border-cyan-300 rounded-2xl shadow-2xl">
          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-pink-400 to-cyan-300 drop-shadow-[0_4px_10px_rgba(255,0,127,0.8)] uppercase">
            Midnight Mart
          </h1>
          <div className="absolute -top-2 -right-3 text-amber-300">
            <Sparkles className="w-5 h-5 fill-amber-300" />
          </div>
          <div className="absolute -bottom-2 -left-3 text-yellow-300">
            <Star className="w-4 h-4 fill-yellow-300" />
          </div>
        </div>
      </div>

      {/* 3. Main Viewport */}
      <div className="flex-1 w-full max-w-md my-auto flex flex-col items-center justify-center relative">
        {activeTab === 'puzzle' ? (
          <div className="w-full flex flex-col items-center relative">
            <BodegaCanvas onLevelComplete={handleNextLevel} />

            {/* Bottom Booster Action Bubbles & Large 3D MOVES Badge */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end pointer-events-auto z-30">
              {/* Circular Booster Action Bubbles */}
              <div className="flex items-center gap-2">
                {/* Slushie Freeze */}
                <button className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-600 border-2 border-cyan-200 shadow-xl flex items-center justify-center active:scale-95 transition">
                  <span className="text-xl">🍧</span>
                  <span className="absolute -bottom-1 -right-1 bg-pink-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full border border-white">
                    0
                  </span>
                </button>

                {/* Magic Magnet / Undo */}
                <button
                  onClick={undoLastPlacement}
                  className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-purple-400 to-indigo-600 border-2 border-purple-200 shadow-xl flex items-center justify-center active:scale-95 transition"
                >
                  <RefreshCcw className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full border border-white">
                    +
                  </span>
                </button>
              </div>

              {/* Right Boosters & Large Purple-Rimmed 3D MOVES Badge */}
              <div className="flex items-center gap-3">
                {/* Lightning Shuffle */}
                <button className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 border-2 border-amber-200 shadow-xl flex items-center justify-center active:scale-95 transition">
                  <Zap className="w-6 h-6 text-white fill-white" />
                  <span className="absolute -bottom-1 -right-1 bg-purple-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-full border border-white">
                    1
                  </span>
                </button>

                {/* Large Purple 3D MOVES Badge */}
                <div className="flex flex-col items-center justify-center bg-gradient-to-b from-purple-600 via-indigo-700 to-purple-900 border-4 border-indigo-300/90 rounded-3xl px-5 py-2 shadow-2xl min-w-[92px]">
                  <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest">MOVES</span>
                  <span className="text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{movesRemaining}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <RenovationScene />
        )}
      </div>

      {/* 4. Bottom Dock Navigation */}
      <nav className="flex items-center justify-around w-full max-w-md py-2.5 px-6 bg-[#16082e]/95 backdrop-blur-lg rounded-3xl border-2 border-purple-800/60 shadow-2xl z-30">
        <button
          onClick={() => setActiveTab('puzzle')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-black tracking-wider transition ${
            activeTab === 'puzzle' ? 'text-pink-400 scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          PACK
        </button>
        <button
          onClick={() => setActiveTab('renovate')}
          className={`flex flex-col items-center gap-0.5 text-[11px] font-black tracking-wider transition ${
            activeTab === 'renovate' ? 'text-cyan-400 scale-105' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          DECOR
        </button>
      </nav>
    </main>
  );
}
