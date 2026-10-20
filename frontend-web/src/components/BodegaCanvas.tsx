'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';

interface Props {
  onLevelComplete: () => void;
}

export const BodegaCanvas: React.FC<Props> = ({ onLevelComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    grid,
    placedItems,
    stagedItem,
    attemptPlacement,
    isWon,
    isGameOver,
    shopCatName
  } = useGameStore();

  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Layout Constants
  const CELL_SIZE = 52;
  const GRID_ORIGIN_X = 55;
  const GRID_ORIGIN_Y = 220;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // 1. Clear & Deep Purple Cyber-Bodega Ambient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1c0838');
    bgGrad.addColorStop(0.4, '#15062c');
    bgGrad.addColorStop(1, '#090216');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Background Environment (Isometric Counter, Slushie Machine & Shop Cat)
    // Slushie Machine (Top Left)
    ctx.save();
    ctx.fillStyle = '#1e103d';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(15, 65, 90, 110, 12);
    } else {
      ctx.rect(15, 65, 90, 110);
    }
    ctx.fill();
    ctx.stroke();

    // Dual Slushie Bowls (Rainbow Glow)
    const slushGrad1 = ctx.createLinearGradient(25, 75, 55, 125);
    slushGrad1.addColorStop(0, '#ff007f');
    slushGrad1.addColorStop(1, '#00e5ff');
    ctx.fillStyle = slushGrad1;
    ctx.fillRect(23, 75, 34, 45);

    const slushGrad2 = ctx.createLinearGradient(60, 75, 90, 125);
    slushGrad2.addColorStop(0, '#ffe600');
    slushGrad2.addColorStop(1, '#00ffa3');
    ctx.fillStyle = slushGrad2;
    ctx.fillRect(58, 75, 34, 45);
    ctx.restore();

    // Shop Cat "Mochi" sitting on Stool (Top Right)
    ctx.save();
    const catX = width - 75;
    const catY = 120;
    // Stool
    ctx.fillStyle = '#581c87';
    ctx.fillRect(catX - 20, catY + 25, 40, 30);
    // Cat Body
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(catX, catY, 24, 0, Math.PI * 2);
    ctx.fill();
    // Ears
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(catX - 18, catY - 15);
    ctx.lineTo(catX - 8, catY - 30);
    ctx.lineTo(catX - 2, catY - 15);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(catX + 18, catY - 15);
    ctx.lineTo(catX + 8, catY - 30);
    ctx.lineTo(catX + 2, catY - 15);
    ctx.fill();
    // Visor Hat
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(catX - 22, catY - 18, 44, 8);
    // Face
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.arc(catX - 8, catY - 2, 3, 0, Math.PI * 2);
    ctx.arc(catX + 8, catY - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Draw Isometric Glowing Neon Shopping Basket Container
    const basketW = grid.cols * CELL_SIZE + 24;
    const basketH = grid.rows * CELL_SIZE + 24;
    ctx.save();
    ctx.fillStyle = 'rgba(22, 8, 41, 0.9)';
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(GRID_ORIGIN_X - 12, GRID_ORIGIN_Y - 12, basketW, basketH, 20);
    } else {
      ctx.rect(GRID_ORIGIN_X - 12, GRID_ORIGIN_Y - 12, basketW, basketH);
    }
    ctx.fill();
    ctx.stroke();

    // Plastic Mesh Grid Lines (Glowing Basket Texture)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= basketW; i += 18) {
      ctx.beginPath();
      ctx.moveTo(GRID_ORIGIN_X - 12 + i, GRID_ORIGIN_Y - 12);
      ctx.lineTo(GRID_ORIGIN_X - 12 + i, GRID_ORIGIN_Y - 12 + basketH);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Draw Grid Slots Inside Basket
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const x = GRID_ORIGIN_X + c * CELL_SIZE;
        const y = GRID_ORIGIN_Y + r * CELL_SIZE;
        const val = grid.matrix[r][c];

        ctx.save();
        if (val === 1) {
          // Obstacle slot
          ctx.fillStyle = '#2e1052';
          ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          ctx.strokeStyle = '#7e22ce';
          ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else {
          // Playable slot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 10);
          } else {
            ctx.rect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          }
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 5. Render High-Detail Placed Items with Cute Cat Graphics & Neon Emblems
    for (const item of placedItems) {
      for (const [dr, dc] of item.shape) {
        const x = GRID_ORIGIN_X + (item.gridX + dc) * CELL_SIZE;
        const y = GRID_ORIGIN_Y + (item.gridY + dr) * CELL_SIZE;

        ctx.save();
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 12);
        } else {
          ctx.rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
        }
        ctx.fill();

        // Top glossy highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(x + 5, y + 5, CELL_SIZE - 10, (CELL_SIZE - 10) / 2, 6);
        } else {
          ctx.rect(x + 5, y + 5, CELL_SIZE - 10, (CELL_SIZE - 10) / 2);
        }
        ctx.fill();

        // Cute Cat Emblem in center of single blocks
        if (item.shape.length === 1 || (dr === 0 && dc === 0)) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, 8, 0, Math.PI * 2);
          ctx.fill();
          // Cat Ears
          ctx.beginPath();
          ctx.moveTo(x + CELL_SIZE / 2 - 8, y + CELL_SIZE / 2 - 4);
          ctx.lineTo(x + CELL_SIZE / 2 - 4, y + CELL_SIZE / 2 - 12);
          ctx.lineTo(x + CELL_SIZE / 2, y + CELL_SIZE / 2 - 6);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(x + CELL_SIZE / 2 + 8, y + CELL_SIZE / 2 - 4);
          ctx.lineTo(x + CELL_SIZE / 2 + 4, y + CELL_SIZE / 2 - 12);
          ctx.lineTo(x + CELL_SIZE / 2, y + CELL_SIZE / 2 - 6);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // 6. Draw Placement Target Ghost if Dragging
    if (isDragging && stagedItem && hoverCell) {
      const [hr, hc] = hoverCell;
      const isValid = grid.canPlace(stagedItem, hr, hc);

      for (const [dr, dc] of stagedItem.shape) {
        const tr = hr + dr;
        const tc = hc + dc;
        const x = GRID_ORIGIN_X + tc * CELL_SIZE;
        const y = GRID_ORIGIN_Y + tr * CELL_SIZE;

        if (tr >= 0 && tr < grid.rows && tc >= 0 && tc < grid.cols) {
          ctx.save();
          ctx.fillStyle = isValid ? 'rgba(0, 255, 163, 0.5)' : 'rgba(255, 0, 85, 0.5)';
          ctx.strokeStyle = isValid ? '#00FFA3' : '#FF0055';
          ctx.lineWidth = 3;
          ctx.shadowColor = isValid ? '#00FFA3' : '#FF0055';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 10);
          } else {
            ctx.rect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 7. Draw Staged/Held Item under Pointer
    if (isDragging && stagedItem) {
      ctx.save();
      const scale = 1.1;
      ctx.translate(pointerPos.x, pointerPos.y);
      ctx.scale(scale, scale);

      ctx.shadowColor = stagedItem.glowColor;
      ctx.shadowBlur = 24;

      for (const [dr, dc] of stagedItem.shape) {
        const ox = dc * CELL_SIZE - (stagedItem.width * CELL_SIZE) / 2;
        const oy = dr * CELL_SIZE - (stagedItem.height * CELL_SIZE) / 2;

        ctx.fillStyle = stagedItem.color;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(ox + 3, oy + 3, CELL_SIZE - 6, CELL_SIZE - 6, 12);
        } else {
          ctx.rect(ox + 3, oy + 3, CELL_SIZE - 6, CELL_SIZE - 6);
        }
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [grid, placedItems, stagedItem, hoverCell, pointerPos, isDragging]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [render]);

  useEffect(() => {
    if (isWon) {
      const t = setTimeout(() => {
        onLevelComplete();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isWon, onLevelComplete]);

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!stagedItem || isWon || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    setIsDragging(true);
    setPointerPos({ x: px, y: py });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setPointerPos({ x: px, y: py });

    const gridX = px - GRID_ORIGIN_X;
    const gridY = py - GRID_ORIGIN_Y;

    const col = Math.floor(gridX / CELL_SIZE);
    const row = Math.floor(gridY / CELL_SIZE);

    if (row >= 0 && row < grid.rows && col >= 0 && col < grid.cols) {
      setHoverCell([row, col]);
    } else {
      setHoverCell(null);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (hoverCell && stagedItem) {
      const [r, c] = hoverCell;
      attemptPlacement(r, c);
    }
    setHoverCell(null);
  };

  return (
    <div className="relative w-full h-[580px] flex justify-center items-center select-none touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[420px] rounded-3xl shadow-2xl border-2 border-purple-800/60"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
};
