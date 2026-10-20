'use client';

import React, { useEffect, useRef } from 'react';
import { useGameStore, MapNode, BiomeType } from '../store/gameStore';
import { Shield, Fuel, Flame, AlertTriangle } from 'lucide-react';

export const TraversalMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { nodes, currentNodeId, travelToNode, activeEvent, resolveEventChoice } =
    useGameStore();

  const currentNode = nodes.find((n) => n.id === currentNodeId);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight - 120;
      render();
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Connections
      ctx.strokeStyle = '#2d3748';
      ctx.lineWidth = 2.5;

      nodes.forEach((n) => {
        n.connections.forEach((targetId) => {
          const target = nodes.find((tn) => tn.id === targetId);
          if (!target) return;

          const startX = (n.x / 100) * canvas.width;
          const startY = (n.y / 100) * canvas.height;
          const endX = (target.x / 100) * canvas.width;
          const endY = (target.y / 100) * canvas.height;

          const isReachable =
            n.id === currentNodeId && currentNode?.connections.includes(targetId);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = isReachable ? '#ed8936' : '#2d3748';
          ctx.lineWidth = isReachable ? 3.5 : 2;
          ctx.setLineDash(isReachable ? [8, 4] : []);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      });

      // Draw Nodes
      nodes.forEach((n) => {
        const x = (n.x / 100) * canvas.width;
        const y = (n.y / 100) * canvas.height;
        const isCurrent = n.id === currentNodeId;
        const isReachable = currentNode?.connections.includes(n.id);

        ctx.beginPath();
        ctx.arc(x, y, isCurrent ? 16 : isReachable ? 12 : 9, 0, Math.PI * 2);

        if (isCurrent) {
          ctx.fillStyle = '#ed8936';
        } else if (n.visited) {
          ctx.fillStyle = '#4a5568';
        } else if (n.biome === 'Toxic Mire') {
          ctx.fillStyle = '#22c55e';
        } else if (n.biome === 'Contested Pass') {
          ctx.fillStyle = '#ef4444';
        } else {
          ctx.fillStyle = '#3b82f6';
        }

        ctx.fill();
        ctx.strokeStyle = isCurrent ? '#ffffff' : isReachable ? '#fba124' : '#1a202c';
        ctx.lineWidth = isCurrent || isReachable ? 3 : 1.5;
        ctx.stroke();

        // Label
        ctx.fillStyle = isCurrent ? '#ed8936' : '#94a3b8';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.name, x, y + 26);
      });
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [nodes, currentNodeId, currentNode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    nodes.forEach((n) => {
      const nodeX = (n.x / 100) * canvas.width;
      const nodeY = (n.y / 100) * canvas.height;
      const dist = Math.hypot(nodeX - x, nodeY - y);

      if (dist <= 25) {
        travelToNode(n.id);
      }
    });
  };

  const getBiomeBadgeClass = (biome: BiomeType) => {
    switch (biome) {
      case 'Toxic Mire':
        return 'bg-emerald-950 text-emerald-400 border-emerald-700';
      case 'Contested Pass':
        return 'bg-rose-950 text-rose-400 border-rose-700';
      default:
        return 'bg-blue-950 text-blue-400 border-blue-700';
    }
  };

  return (
    <div className="relative w-full h-full bg-wasteland-900 overflow-hidden select-none">
      {/* Top Node Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3 bg-wasteland-800/90 backdrop-blur-md px-3 py-2 rounded-lg border border-wasteland-600 shadow-lg">
        <div className="text-xs font-bold text-slate-300">
          Location: <span className="text-orange-400">#{currentNodeId + 1} {currentNode?.name}</span>
        </div>
        <div
          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getBiomeBadgeClass(
            currentNode?.biome || 'Safe Highway'
          )}`}
        >
          {currentNode?.biome}
        </div>
      </div>

      {/* Traversal Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer"
      />

      {/* Event Modal */}
      {activeEvent && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-wasteland-800 border-2 border-orange-500 rounded-xl p-5 max-w-md w-full shadow-2xl text-center">
            <div className="flex justify-center mb-3 text-orange-400">
              <AlertTriangle size={36} />
            </div>
            <h3 className="text-lg font-bold text-orange-400 mb-2">
              {activeEvent.title}
            </h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              {activeEvent.description}
            </p>
            <div className="flex flex-col gap-2">
              {activeEvent.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => resolveEventChoice(opt.action)}
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold rounded-lg text-xs uppercase tracking-wide transition shadow"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
