'use client';

import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Users, HeartPulse, Smile, AlertCircle, ShieldAlert } from 'lucide-react';

export const CrewRoster: React.FC = () => {
  const { crew, morale, scrap, healCrew } = useGameStore();

  const isMutinyRisk = morale <= 30;

  return (
    <div className="w-full h-full bg-wasteland-900 p-4 overflow-y-auto select-none flex flex-col gap-4">
      {/* Header & Overall Morale */}
      <div className="bg-wasteland-800 p-4 rounded-xl border border-wasteland-600 shadow-md flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2">
            <Users size={20} /> Convoy Crew & Roster
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage crew roles, health, and morale
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold bg-wasteland-700 px-3 py-1.5 rounded-lg border border-wasteland-600">
            Overall Morale: <span className={morale <= 30 ? 'text-rose-400 font-extrabold' : 'text-emerald-400'}>{morale}%</span>
          </div>
        </div>
      </div>

      {/* Mutiny Risk Banner */}
      {isMutinyRisk && (
        <div className="bg-rose-950/80 border border-rose-600 text-rose-200 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse">
          <ShieldAlert size={18} className="text-rose-400 shrink-0" />
          <span>
            CRITICAL MUTINY WARNING! Low crew morale increases risk of sabotage or abandonment at next node!
          </span>
        </div>
      )}

      {/* Crew Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {crew.map((member) => (
          <div
            key={member.id}
            className="bg-wasteland-800 p-4 rounded-xl border border-wasteland-600 hover:border-orange-500/50 transition shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-200 text-sm">
                  {member.role}: <span className="text-orange-400">{member.name}</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-wasteland-700 text-slate-300 border border-wasteland-600">
                  {member.perk}
                </span>
              </div>

              {/* Healthbar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <HeartPulse size={12} className="text-rose-400" /> Health
                  </span>
                  <span>{member.hp}%</span>
                </div>
                <div className="w-full bg-wasteland-900 rounded-full h-2 overflow-hidden border border-wasteland-700">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${member.hp}%` }}
                  />
                </div>
              </div>

              {/* Morale bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Smile size={12} className="text-yellow-400" /> Morale
                  </span>
                  <span>{member.morale}%</span>
                </div>
                <div className="w-full bg-wasteland-900 rounded-full h-2 overflow-hidden border border-wasteland-700">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${member.morale}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-wasteland-700">
              <button
                onClick={() => healCrew(member.id)}
                disabled={scrap < 15 || member.hp >= 100}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition"
              >
                <HeartPulse size={14} /> Medical Field Treatment (-15 Scrap)
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
