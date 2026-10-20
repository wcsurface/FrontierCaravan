'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Zap, Shield, Wrench, Wind } from 'lucide-react';

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isEnemy: boolean;
}

interface Raider {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  vx: number;
}

export const CombatCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { armor, fuel, scrap, triggerAbility } = useGameStore();

  const [treadsDamage, setTreadsDamage] = useState(10);
  const [turretDamage, setTurretDamage] = useState(5);
  const [cargoLeaks, setCargoLeaks] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight - 120;

    let playerX = 80;
    let playerY = canvas.height / 2;
    let bullets: Bullet[] = [];
    let raiders: Raider[] = [
      { id: '1', x: canvas.width - 100, y: canvas.height / 2 - 40, hp: 60, maxHp: 60, vx: 1.5 },
      { id: '2', x: canvas.width - 140, y: canvas.height / 2 + 40, hp: 60, maxHp: 60, vx: 1.8 },
    ];

    let tick = 0;

    const gameLoop = () => {
      tick++;
      ctx.fillStyle = '#0f1115';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Highway Road
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(0, canvas.height / 2 - 100, canvas.width, 200);

      // Lane Markers
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 4;
      ctx.setLineDash([30, 20]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Auto Fire Turret
      if (tick % 25 === 0) {
        bullets.push({
          x: playerX + 60,
          y: playerY,
          vx: 10,
          vy: (Math.random() - 0.5) * 1.5,
          isEnemy: false,
        });
      }

      // Raider Counter-Attack
      if (tick % 45 === 0) {
        raiders.forEach((r) => {
          bullets.push({
            x: r.x,
            y: r.y,
            vx: -7,
            vy: (Math.random() - 0.5) * 2,
            isEnemy: true,
          });
        });
      }

      // Update & Render Bullets
      bullets.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;

        ctx.fillStyle = b.isEnemy ? '#ef4444' : '#eab308';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.isEnemy ? 3.5 : 4, 0, Math.PI * 2);
        ctx.fill();

        // Player bullet collision with raiders
        if (!b.isEnemy) {
          raiders.forEach((r) => {
            if (Math.hypot(r.x - b.x, r.y - b.y) < 22) {
              r.hp -= 12;
              b.x = 99999;
            }
          });
        }
      });
      bullets = bullets.filter((b) => b.x > 0 && b.x < canvas.width);

      // Render Player Convoy
      ctx.fillStyle = '#ed8936';
      ctx.fillRect(playerX, playerY - 20, 60, 40); // Body
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(playerX + 40, playerY - 12, 16, 24); // Turret
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(playerX + 5, playerY - 24, 18, 6); // Treads top
      ctx.fillRect(playerX + 5, playerY + 18, 18, 6); // Treads bot

      // Update & Render Raiders
      raiders.forEach((r) => {
        r.x -= r.vx;
        if (r.x < 120) r.x = canvas.width - 80;

        ctx.fillStyle = '#dc2626';
        ctx.fillRect(r.x - 20, r.y - 15, 40, 30);

        // Raider Healthbar
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(r.x - 20, r.y - 22, (r.hp / r.maxHp) * 40, 4);
      });

      raiders = raiders.filter((r) => r.hp > 0);
      if (raiders.length === 0 && tick > 120) {
        // Respawn wave
        raiders = [
          { id: 'w1', x: canvas.width - 80, y: canvas.height / 2 - 35, hp: 80, maxHp: 80, vx: 1.2 },
          { id: 'w2', x: canvas.width - 120, y: canvas.height / 2 + 35, hp: 80, maxHp: 80, vx: 1.5 },
        ];
      }

      animId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-full bg-wasteland-900 select-none overflow-hidden flex flex-col">
      {/* Top Combat HUD */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center bg-wasteland-800/90 backdrop-blur-md px-4 py-2 rounded-lg border border-wasteland-600 shadow-md">
        <div className="flex gap-4 text-xs font-bold">
          <div>
            Chassis: <span className="text-orange-400">{armor}%</span>
          </div>
          <div>
            Treads: <span className="text-emerald-400">-{treadsDamage}%</span>
          </div>
          <div>
            Turrets: <span className="text-yellow-400">-{turretDamage}%</span>
          </div>
          <div>
            Cargo Leaks: <span className="text-rose-400">{cargoLeaks}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerAbility('nitro')}
            className="flex items-center gap-1 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs px-3 py-1.5 rounded transition"
          >
            <Zap size={14} /> Nitro (-5 Fuel)
          </button>
          <button
            onClick={() => triggerAbility('smoke')}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded transition"
          >
            <Wind size={14} /> Smoke Screen
          </button>
          <button
            onClick={() => triggerAbility('repair')}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded transition"
          >
            <Wrench size={14} /> Repair (-20 Scrap)
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
