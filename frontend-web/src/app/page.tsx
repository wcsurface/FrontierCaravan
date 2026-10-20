'use client';

import React, { useState, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';
import { BodegaCanvas } from '../components/BodegaCanvas';
import { RenovationScene } from '../components/RenovationScene';
import { LEVEL_DATABASE } from '../engine/LevelDatabase';
import { Play, RotateCcw, Home, Heart } from 'lucide-react';

export default function HomeView() {
  const [activeTab, setActiveTab] = useState<'puzzle' | 'renovate'>('puzzle');
  const {
    currentLevel,
    initLevel,
    undoLastPlacement,
    movesRemaining,
    secondsRemaining,
    lives,
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
    <main className="flex flex-col items-center justify-between min-h-screen bg-[#070112] text-slate-100 p-2 sm:p-4 select-none">
      {/* Top App Header & Heart Counter */}
      <header className="flex items-center justify-between w-full max-w-md px-4 py-2 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-purple-900/40">
        <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
          <Heart className="w-4 h-4 fill-rose-500" />
          <span>{lives}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold px-2.5 py-1 bg-purple-900/50 rounded-lg border border-purple-700/40 text-purple-200">
            Moves: <strong className="text-white">{movesRemaining}</strong>
          </div>
          <div className="text-xs font-semibold px-2.5 py-1 bg-cyan-900/50 rounded-lg border border-cyan-700/40 text-cyan-200">
            Time: <strong className="text-white">{secondsRemaining}s</strong>
          </div>
        </div>
      </header>

      {/* Main View Switcher */}
      <div className="flex-1 w-full max-w-md my-auto flex flex-col items-center justify-center">
        {activeTab === 'puzzle' ? (
          <div className="w-full flex flex-col items-center">
            <BodegaCanvas onLevelComplete={handleNextLevel} />

            {/* Quick Puzzle Action Toolbar */}
            <div className="flex items-center justify-center gap-4 mt-3 w-full">
              <button
                onClick={undoLastPlacement}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-xs font-bold text-slate-200 active:scale-95 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Undo
              </button>
            </div>
          </div>
        ) : (
          <RenovationScene />
        )}
      </div>

      {/* Bottom Floating Navigation Dock */}
      <nav className="flex items-center justify-around w-full max-w-md py-2 px-6 bg-slate-900/90 backdrop-blur-lg rounded-3xl border border-purple-800/40 shadow-2xl">
        <button
          onClick={() => setActiveTab('puzzle')}
          className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider ${
            activeTab === 'puzzle' ? 'text-pink-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          PACK
        </button>
        <button
          onClick={() => setActiveTab('renovate')}
          className={`flex flex-col items-center gap-1 text-[11px] font-black tracking-wider ${
            activeTab === 'renovate' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          DECOR
        </button>
      </nav>
    </main>
  );
}
