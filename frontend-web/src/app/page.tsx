'use client';

import React, { useState } from 'react';
import { usePlayerStateStore, MultiToolMode } from '../store/PlayerStateStore';
import { SpaceCanvas } from '../components/SpaceCanvas';
import {
  Rocket,
  Compass,
  Hammer,
  BookOpen,
  Shield,
  Zap,
  Crosshair,
  Wifi,
  Globe,
  Flame,
  Radio,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const {
    pilotName,
    units,
    nanites,
    hazardProtection,
    lifeSupportOxygen,
    activeHazardType,
    rechargeHazardProtection,
    rechargeLifeSupport,
    multiToolMode,
    setMultiToolMode,
    ships,
    activeShipIndex,
    switchActiveShip,
    placedBaseParts,
    placeBasePart,
    factionReputation,
    indigoSimulationStep,
    claimDiscovery,
    syncCloudSave,
  } = usePlayerStateStore();

  const [activeTab, setActiveTab] = useState<'flight' | 'base' | 'codex' | 'garage' | 'lore'>('flight');

  const activeShip = ships[activeShipIndex] || ships[0];

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      {/* Navigation Header */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0 text-xs font-bold">
        <div className="flex items-center gap-3">
          <div className="text-cyan-400 font-black text-sm tracking-wider uppercase flex items-center gap-1.5">
            <Sparkles size={16} /> TELOS: INFINITE HORIZON
          </div>
          <div className="text-slate-400 font-semibold border-l border-slate-700 pl-3">
            Pilot: <span className="text-slate-200">{pilotName}</span>
          </div>
        </div>

        {/* Global HUD Stats */}
        <div className="flex items-center gap-4">
          <div className="text-emerald-400 font-extrabold">💰 {units.toLocaleString()} Units</div>
          <div className="text-purple-400 font-extrabold">🔮 {nanites.toLocaleString()} Nanites</div>
          <button
            onClick={() => syncCloudSave()}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded border border-slate-700 text-slate-300 text-[11px] transition"
          >
            <Wifi size={12} className="text-emerald-400" /> Cloud Sync
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        {/* TAB 1: 3D SPACE FLIGHT & PLANETARY CANVAS */}
        {activeTab === 'flight' && <SpaceCanvas />}

        {/* TAB 2: BASE BUILDING ENGINE */}
        {activeTab === 'base' && (
          <div className="w-full h-full p-6 overflow-y-auto bg-slate-950 flex flex-col gap-5">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                  <Hammer size={20} /> Planetary & Orbital Base Construction
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Snap-grid structural components & automated resource extraction
                </p>
              </div>
              <div className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                Structures Placed: <span className="text-cyan-400">{placedBaseParts.length}</span>
              </div>
            </div>

            {/* Base Parts Construction Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: 'Alloy', desc: 'Heavy structural frame resistant to extreme atmospheric pressure.' },
                { type: 'Solar Panel', desc: 'Photovoltaic generator supplying 45kW clean power grid.' },
                { type: 'EM Generator', desc: 'Harvests planetary electromagnetic hotspots for infinite energy.' },
                { type: 'Battery', desc: 'High-density lithium ion storage bank (2,000kWh).' },
                { type: 'Extractor', desc: 'Automated deep-crust mineral and gas extraction unit.' },
                { type: 'Exocraft Bay', desc: 'Deploys Roamer Buggy and Hovercraft for surface traversal.' },
              ].map((part) => (
                <div key={part.type} className="bg-slate-900 p-4 rounded-xl border border-slate-800 hover:border-cyan-500/50 transition flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-cyan-400 text-sm mb-1">{part.type} Module</h3>
                    <p className="text-xs text-slate-400 mb-3">{part.desc}</p>
                  </div>
                  <button
                    onClick={() => placeBasePart({ type: part.type as any, x: 0, y: 0, z: 0, rotation: 0 })}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition uppercase tracking-wide"
                  >
                    Construct
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DISCOVERY CODEX */}
        {activeTab === 'codex' && (
          <div className="w-full h-full p-6 overflow-y-auto bg-slate-950 flex flex-col gap-5">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                  <Compass size={20} /> Galactic Discovery Codex
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Register first-to-discover claims for systems, biomes, and procedural species
                </p>
              </div>
              <button
                onClick={() => claimDiscovery(50000, 1000)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition uppercase"
              >
                + Register New Discovery
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-cyan-400 text-sm">System: Telos Prime</span>
                  <span className="text-xs font-bold text-emerald-400">+50,000 Units</span>
                </div>
                <p className="text-xs text-slate-400">O-Class Blue Giant | 6 Planets | Dominant: The Atomin</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-cyan-400 text-sm">Planet: Zephyr-9 A</span>
                  <span className="text-xs font-bold text-emerald-400">+25,000 Units</span>
                </div>
                <p className="text-xs text-slate-400">Biome: Lush Overgrowth | Flora: 18 Species | Warden Level 1</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MULTI-TOOL & FLEET GARAGE */}
        {activeTab === 'garage' && (
          <div className="w-full h-full p-6 overflow-y-auto bg-slate-950 flex flex-col gap-5">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h2 className="text-lg font-bold text-rose-400 flex items-center gap-2 mb-3">
                <Crosshair size={20} /> Multi-Tool Weaponry & Mining Engine
              </h2>
              <div className="flex flex-wrap gap-2">
                {[
                  'Mining Laser',
                  'Terrain Manipulator',
                  'Scatter Blaster',
                  'Boltrifle',
                  'Pulse Blaster',
                  'Fire Spear',
                  'Plasma Grenades',
                ].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setMultiToolMode(mode as MultiToolMode)}
                    className={`px-3.5 py-2 rounded-lg font-bold text-xs transition border ${
                      multiToolMode === mode
                        ? 'bg-rose-600 text-white border-rose-500 shadow'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Fleet Manager */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2 mb-3">
                <Rocket size={20} /> Starship Fleet Manager
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ships.map((ship, idx) => (
                  <div
                    key={ship.id}
                    onClick={() => switchActiveShip(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      activeShipIndex === idx
                        ? 'bg-slate-800 border-cyan-500 shadow-lg'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <h3 className="font-bold text-cyan-400 text-sm">{ship.name}</h3>
                    <p className="text-xs text-slate-400 mb-2">Class: {ship.shipClass}</p>
                    <div className="text-xs font-semibold text-slate-300">
                      Hyperdrive Range: <span className="text-amber-400">{ship.hyperdriveRangeLy} LY</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DEEP LORE & STORY JOURNAL */}
        {activeTab === 'lore' && (
          <div className="w-full h-full p-6 overflow-y-auto bg-slate-950 flex flex-col gap-5">
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2 mb-2">
                <BookOpen size={20} /> The Anomaly: Entity Indigo
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Telos is a decaying universal simulation created by the ancient Atomin to escape a dying Earth.
                The enigmatic entity "Indigo" calls to you across the void, urging you to uncover the 16 glyphs
                and make the ultimate decision: reboot the universal simulation or witness its final moments.
              </p>
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-xs font-bold text-cyan-400">
                Simulation Iteration Progress: Step {indigoSimulationStep} / 5
              </div>
            </div>

            {/* Civilizations Reputation */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h3 className="font-bold text-slate-200 text-sm mb-3">Galactic Faction Standings</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="text-amber-400">The Obi (Merchants)</div>
                  <div className="text-slate-200 mt-1">Reputation: {factionReputation.obi}</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="text-cyan-400">The Cybon (Cybernetics)</div>
                  <div className="text-slate-200 mt-1">Reputation: {factionReputation.cybon}</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="text-rose-400">The Kraden (Slayers)</div>
                  <div className="text-slate-200 mt-1">Reputation: {factionReputation.kraden}</div>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="text-purple-400">The Atomin (Amnesiacs)</div>
                  <div className="text-slate-200 mt-1">Reputation: {factionReputation.atomin}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="h-14 bg-slate-900 border-t border-slate-800 flex justify-around items-center z-20 shrink-0">
        <button
          onClick={() => setActiveTab('flight')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'flight'
              ? 'text-cyan-400 border-cyan-500 bg-slate-800/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Rocket size={18} />
          <span className="text-[10px] mt-0.5">3D Flight</span>
        </button>

        <button
          onClick={() => setActiveTab('base')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'base'
              ? 'text-cyan-400 border-cyan-500 bg-slate-800/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Hammer size={18} />
          <span className="text-[10px] mt-0.5">Base Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('codex')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'codex'
              ? 'text-cyan-400 border-cyan-500 bg-slate-800/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Compass size={18} />
          <span className="text-[10px] mt-0.5">Codex</span>
        </button>

        <button
          onClick={() => setActiveTab('garage')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'garage'
              ? 'text-cyan-400 border-cyan-500 bg-slate-800/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Crosshair size={18} />
          <span className="text-[10px] mt-0.5">Garage</span>
        </button>

        <button
          onClick={() => setActiveTab('lore')}
          className={`flex flex-col items-center justify-center w-full h-full text-xs font-bold transition border-b-2 ${
            activeTab === 'lore'
              ? 'text-cyan-400 border-cyan-500 bg-slate-800/60'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <BookOpen size={18} />
          <span className="text-[10px] mt-0.5">Lore Journal</span>
        </button>
      </nav>
    </div>
  );
}
