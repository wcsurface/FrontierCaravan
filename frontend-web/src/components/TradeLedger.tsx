'use client';

import React from 'react';
import { useGameStore, CargoInventory } from '../store/gameStore';
import { Coins, Package, ShoppingCart, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface TradeGood {
  key: keyof CargoInventory;
  name: string;
  basePrice: number;
  unit: string;
  description: string;
}

const TRADE_GOODS: TradeGood[] = [
  { key: 'bioFuel', name: 'Bio-Fuel', basePrice: 15, unit: 'Liters', description: 'Combustible organic fuel required for convoy engine operation.' },
  { key: 'waterRations', name: 'Water Rations', basePrice: 8, unit: 'Packs', description: 'Purified water containers vital for crew morale and survival.' },
  { key: 'scrapMetal', name: 'Scrap Metal', basePrice: 20, unit: 'Tons', description: 'Raw salvaged metal utilized for field repairs and fabrication.' },
  { key: 'preFallTech', name: 'Pre-Fall Tech', basePrice: 110, unit: 'Units', description: 'High-grade ancient electronics valued highly in boomtown markets.' },
];

export const TradeLedger: React.FC = () => {
  const { scrap, cargo, currentNodeId, nodes, buyGood, sellGood } = useGameStore();

  const currentNode = nodes.find((n) => n.id === currentNodeId);
  const biome = currentNode?.biome || 'Safe Highway';

  const getPriceMultiplier = (key: keyof CargoInventory): number => {
    if (biome === 'Toxic Mire' && (key === 'waterRations' || key === 'bioFuel')) return 1.45;
    if (biome === 'Contested Pass' && (key === 'scrapMetal' || key === 'preFallTech')) return 1.35;
    return 1.0;
  };

  const totalCargoUnits = Object.values(cargo).reduce((acc, curr) => acc + curr, 0);

  return (
    <div className="w-full h-full bg-wasteland-900 p-4 overflow-y-auto select-none flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex justify-between items-center bg-wasteland-800 p-4 rounded-xl border border-wasteland-600 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
            <Coins size={20} /> Wasteland Trade Ledger
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Local Sector Market ({biome})
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="bg-wasteland-700 px-3 py-1.5 rounded-lg border border-wasteland-600">
            Available Scrap: <span className="text-yellow-400">💰 {scrap}</span>
          </div>
          <div className="bg-wasteland-700 px-3 py-1.5 rounded-lg border border-wasteland-600">
            Cargo Capacity: <span className="text-orange-400">📦 {totalCargoUnits} / 250</span>
          </div>
        </div>
      </div>

      {/* Trade Goods List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TRADE_GOODS.map((good) => {
          const multiplier = getPriceMultiplier(good.key);
          const price = Math.round(good.basePrice * multiplier);
          const owned = cargo[good.key] || 0;

          return (
            <div
              key={good.key}
              className="bg-wasteland-800 p-4 rounded-xl border border-wasteland-600 hover:border-orange-500/50 transition shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                    <Package size={16} className="text-orange-400" />
                    {good.name}
                  </h3>
                  <div className="text-xs font-bold text-yellow-400 bg-wasteland-700 px-2 py-0.5 rounded border border-wasteland-600">
                    💰 {price} Scrap / {good.unit}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-3">{good.description}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-wasteland-700">
                <span className="text-xs text-slate-300 font-semibold">
                  Owned: <span className="text-orange-400">{owned}</span>
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => buyGood(good.key, 1, price)}
                    disabled={scrap < price}
                    className="flex items-center gap-1 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 disabled:opacity-40 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    <ShoppingCart size={14} /> Buy (+1)
                  </button>
                  <button
                    onClick={() => sellGood(good.key, 1, Math.round(price * 0.85))}
                    disabled={owned <= 0}
                    className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 disabled:opacity-40 text-slate-200 font-bold text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    Sell (-1)
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
