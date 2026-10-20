'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { TraversalMap } from '../components/TraversalMap';
import { CombatCanvas } from '../components/CombatCanvas';
import { TradeLedger } from '../components/TradeLedger';
import { CrewRoster } from '../components/CrewRoster';
import {
  Map,
  Swords,
  Coins,
  Users,
  Fuel,
  Apple,
  Hammer,
  Shield,
  Smile,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    fuel,
    food,
    scrap,
    armor,
    morale,
    isOnline,
    setOnlineStatus,
    syncWithBackend,
    startNewRun,
  } = useGameStore();

  useEffect(() => {
    // Listen to native bridge network status callbacks
    window.onNativeNetworkStatusChange = (status: boolean) => {
      setOnlineStatus(status);
    };

    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return (
    <div className="flex flex-col h-screen w-screen bg-wasteland-900 overflow-hidden select-none">
      {/* Top HUD Header */}
      <header className="h-12 bg-wasteland-800 border-b-2 border-wasteland-600 px-3 flex items-center justify-between text-xs font-bold text-slate-200 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-orange-400">
            <Fuel size={14} /> <span>{fuel}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <Apple size={14} /> <span>{food}</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <Coins size={14} /> <span>{scrap}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-400">
            <Shield size={14} /> <span>{armor}%</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Smile size={14} /> <span>{morale}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Online/Offline Status Indicator */}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
              isOnline
                ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                : 'bg-rose-950 text-rose-400 border-rose-700'
            }`}
          >
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          <button
            onClick={() => syncWithBackend()}
            title="Sync with cloud backend"
            className="p-1.5 bg-wasteland-700 hover:bg-wasteland-600 active:bg-wasteland-800 rounded-md border border-wasteland-600 text-slate-300 transition"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* View Content */}
      <main className="flex-1 relative overflow-hidden bg-wasteland-900">
        {activeTab === 'map' && <TraversalMap />}
        {activeTab === 'combat' && <CombatCanvas />}
        {activeTab === 'market' && <TradeLedger />}
        {activeTab === 'crew' && <CrewRoster />}
      </main>

      {/* Bottom Nav Bar */}
      <nav className="h-14 bg-wasteland-800 border-t-2 border-wasteland-600 flex justify-around items-center z-20 shrink-0">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'map'
              ? 'text-orange-400 border-orange-500 bg-wasteland-700/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Map size={18} />
          <span className="text-[10px] mt-0.5">Map</span>
        </button>

        <button
          onClick={() => setActiveTab('combat')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'combat'
              ? 'text-orange-400 border-orange-500 bg-wasteland-700/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Swords size={18} />
          <span className="text-[10px] mt-0.5">Skirmish</span>
        </button>

        <button
          onClick={() => setActiveTab('market')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'market'
              ? 'text-orange-400 border-orange-500 bg-wasteland-700/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Coins size={18} />
          <span className="text-[10px] mt-0.5">Market</span>
        </button>

        <button
          onClick={() => setActiveTab('crew')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'crew'
              ? 'text-orange-400 border-orange-500 bg-wasteland-700/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Users size={18} />
          <span className="text-[10px] mt-0.5">Crew</span>
        </button>
      </nav>
    </div>
  );
}
