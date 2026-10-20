'use client';

import React, { useState, useRef } from 'react';
import { usePlayerStateStore } from '../store/PlayerStateStore';
import { Crosshair, Zap, Hammer, Scan, LogOut, ArrowUp } from 'lucide-react';

interface TouchOverlayProps {
  onMoveStick?: (x: number, y: number) => void;
  onAimStick?: (x: number, y: number) => void;
}

export const TouchOverlay: React.FC<TouchOverlayProps> = ({
  onMoveStick,
  onAimStick,
}) => {
  const { fireMultiTool, rechargeLifeSupport, baseBuildingActive, isInSpaceFlight } =
    usePlayerStateStore();

  const [leftStickActive, setLeftStickActive] = useState(false);
  const [leftStickPos, setLeftStickPos] = useState({ x: 0, y: 0 });
  const leftCenterRef = useRef({ x: 0, y: 0 });

  const handleLeftTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    leftCenterRef.current = { x: touch.clientX, y: touch.clientY };
    setLeftStickActive(true);
    setLeftStickPos({ x: 0, y: 0 });
  };

  const handleLeftTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!leftStickActive) return;
    const touch = e.touches[0];
    const dx = touch.clientX - leftCenterRef.current.x;
    const dy = touch.clientY - leftCenterRef.current.y;
    const dist = Math.min(50, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    const normX = (Math.cos(angle) * dist) / 50;
    const normY = (Math.sin(angle) * dist) / 50;

    setLeftStickPos({ x: normX * 35, y: normY * 35 });

    if (onMoveStick) {
      onMoveStick(normX, normY);
    }
  };

  const handleLeftTouchEnd = () => {
    setLeftStickActive(false);
    setLeftStickPos({ x: 0, y: 0 });
    if (onMoveStick) {
      onMoveStick(0, 0);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex justify-between p-4">
      {/* Left Touch Joystick Zone */}
      <div
        onTouchStart={handleLeftTouchStart}
        onTouchMove={handleLeftTouchMove}
        onTouchEnd={handleLeftTouchEnd}
        className="pointer-events-auto w-1/2 h-full flex items-end pb-10 pl-6"
      >
        <div className="relative w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-700/80 backdrop-blur-sm flex items-center justify-center shadow-2xl">
          <div
            className="w-12 h-12 rounded-full bg-cyan-500/80 border border-cyan-300 shadow-lg transition-transform duration-75"
            style={{
              transform: `translate(${leftStickPos.x}px, ${leftStickPos.y}px)`,
            }}
          />
        </div>
      </div>

      {/* Right Action Buttons Overlay */}
      <div className="pointer-events-auto flex flex-col justify-end items-end gap-3 pb-8 pr-4">
        <div className="flex gap-2">
          {/* Scan Button */}
          <button
            onClick={() => rechargeLifeSupport('Oxygen')}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 active:bg-slate-800 text-cyan-400 flex items-center justify-center shadow-lg"
          >
            <Scan size={20} />
          </button>

          {/* Jetpack / Jump Button */}
          <button
            onClick={() => rechargeLifeSupport('Oxygen')}
            className="w-12 h-12 rounded-full bg-slate-900/80 border border-slate-700 active:bg-slate-800 text-amber-400 flex items-center justify-center shadow-lg"
          >
            <ArrowUp size={20} />
          </button>
        </div>

        <div className="flex gap-2">
          {/* Multi-Tool Fire / Mining Laser Button */}
          <button
            onClick={() => fireMultiTool()}
            className="w-16 h-16 rounded-full bg-rose-600/90 border-2 border-rose-400 active:bg-rose-700 text-white flex items-center justify-center shadow-2xl"
          >
            <Crosshair size={26} />
          </button>

          {/* Action / Interact Button */}
          <button
            onClick={() => rechargeLifeSupport('Oxygen')}
            className="w-14 h-14 rounded-full bg-cyan-600/90 border-2 border-cyan-400 active:bg-cyan-700 text-white flex items-center justify-center shadow-xl"
          >
            <Zap size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
