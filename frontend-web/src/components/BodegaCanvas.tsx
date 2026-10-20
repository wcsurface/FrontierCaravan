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
    isGameOver
  } = useGameStore();

  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Layout Constants
  const CELL_SIZE = 54;
  const GRID_ORIGIN_X = 40;
  const GRID_ORIGIN_Y = 120;

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

    // 1. Clear & Background Gradient (Neon Cyber Bodega counter)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#0F091F');
    bgGrad.addColorStop(0.5, '#1A0B2E');
    bgGrad.addColorStop(1, '#080114');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Basket Container Backdrop (Acrylic Pink / Teal Edge)
    const basketW = grid.cols * CELL_SIZE + 20;
    const basketH = grid.rows * CELL_SIZE + 20;
    ctx.save();
    ctx.fillStyle = '#160829';
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    if (typeof (ctx as any).roundRect === 'function') {
      (ctx as any).roundRect(GRID_ORIGIN_X - 10, GRID_ORIGIN_Y - 10, basketW, basketH, 16);
    } else {
      ctx.rect(GRID_ORIGIN_X - 10, GRID_ORIGIN_Y - 10, basketW, basketH);
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3. Draw Grid Slots
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const x = GRID_ORIGIN_X + c * CELL_SIZE;
        const y = GRID_ORIGIN_Y + r * CELL_SIZE;
        const val = grid.matrix[r][c];

        ctx.save();
        if (val === 1) {
          // Obstacle slot (cardboard)
          ctx.fillStyle = '#301844';
          ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          ctx.strokeStyle = '#632c8d';
          ctx.strokeRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        } else {
          // Empty playable slot
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8);
          } else {
            ctx.rect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          }
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 4. Render Placed Items with Chunky 3D Border & Neon Accents
    for (const item of placedItems) {
      for (const [dr, dc] of item.shape) {
        const x = GRID_ORIGIN_X + (item.gridX + dc) * CELL_SIZE;
        const y = GRID_ORIGIN_Y + (item.gridY + dr) * CELL_SIZE;

        ctx.save();
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6, 10);
        } else {
          ctx.rect(x + 3, y + 3, CELL_SIZE - 6, CELL_SIZE - 6);
        }
        ctx.fill();

        // Chunky light bevel (top/left)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 6, y + CELL_SIZE - 6);
        ctx.lineTo(x + 6, y + 6);
        ctx.lineTo(x + CELL_SIZE - 6, y + 6);
        ctx.stroke();

        ctx.restore();
      }
    }

    // 5. Draw Placement Target Ghost if Dragging
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
          ctx.fillStyle = isValid ? 'rgba(0, 255, 163, 0.45)' : 'rgba(255, 0, 85, 0.45)';
          ctx.strokeStyle = isValid ? '#00FFA3' : '#FF0055';
          ctx.lineWidth = 2;
          ctx.shadowColor = isValid ? '#00FFA3' : '#FF0055';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 8);
          } else {
            ctx.rect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    // 6. Draw Staged/Held Item under Pointer with Elastic Drag Scale
    if (isDragging && stagedItem) {
      ctx.save();
      const scale = 1.08;
      ctx.translate(pointerPos.x, pointerPos.y);
      ctx.scale(scale, scale);

      ctx.shadowColor = stagedItem.glowColor;
      ctx.shadowBlur = 20;

      for (const [dr, dc] of stagedItem.shape) {
        const ox = dc * CELL_SIZE - (stagedItem.width * CELL_SIZE) / 2;
        const oy = dr * CELL_SIZE - (stagedItem.height * CELL_SIZE) / 2;

        ctx.fillStyle = stagedItem.color;
        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(ox + 3, oy + 3, CELL_SIZE - 6, CELL_SIZE - 6, 10);
        } else {
          ctx.rect(ox + 3, oy + 3, CELL_SIZE - 6, CELL_SIZE - 6);
        }
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
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
    <div className="relative w-full h-[520px] flex justify-center items-center select-none touch-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[420px] rounded-2xl shadow-2xl border border-purple-900/50"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
};
