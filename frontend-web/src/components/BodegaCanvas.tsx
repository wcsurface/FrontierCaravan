'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ItemDef, PlacedItem } from '../engine/GridEngine';
import { AudioController } from '../engine/AudioController';
import { HapticBridge } from '../engine/HapticBridge';

interface Props {
  onLevelComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
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
  } = useGameStore();

  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const particlesRef = useRef<Particle[]>([]);

  // Preloaded PNG Asset Sprites (with procedural fallback)
  const assetsRef = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const assetNames = [
      'mockup.png',
      'bg_bodega_counter.png',
      'basket_isometric_frame.png',
      'prop_mochi_cat.png',
      'prop_slushie_machine.png',
      'item_soda_cat.png',
      'item_bento_box.png',
      'item_bread_bun.png',
      'item_snack_purple.png',
      'item_snack_neon.png',
      'item_snack_cyan.png',
    ];

    assetNames.forEach((name) => {
      const img = new Image();
      img.src = `/assets/${name}`;
      img.onload = () => {
        assetsRef.current[name] = img;
      };
    });
  }, []);

  // Drag physics tracking
  const dragVelocity = useRef({ x: 0, y: 0 });
  const lastPointerPos = useRef({ x: 0, y: 0 });

  // Isometric Grid Layout Transformation Math
  const TILE_WIDTH = 58;
  const TILE_HEIGHT = 34;
  const ORIGIN_X = 200; // Centered in 400px wide canvas
  const ORIGIN_Y = 220;

  function toIso(r: number, c: number): { x: number; y: number } {
    const isoX = ORIGIN_X + (c - r) * (TILE_WIDTH / 2);
    const isoY = ORIGIN_Y + (c + r) * (TILE_HEIGHT / 2);
    return { x: isoX, y: isoY };
  }

  function fromIso(screenX: number, screenY: number): { r: number; c: number } {
    const dx = screenX - ORIGIN_X;
    const dy = screenY - ORIGIN_Y;

    const col = (dx / (TILE_WIDTH / 2) + dy / (TILE_HEIGHT / 2)) / 2;
    const row = (dy / (TILE_HEIGHT / 2) - dx / (TILE_WIDTH / 2)) / 2;

    return { r: Math.floor(row), c: Math.floor(col) };
  }

  // Particle Burst Explosion Generator
  const spawnParticleBurst = (x: number, y: number) => {
    const colors = ['#00FFA3', '#00F0FF', '#FF2A85', '#FFE600', '#FFFFFF'];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 2 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        life: 0,
        maxLife: 25 + Math.random() * 15,
      });
    }
  };

  // Procedural High-Detail Item Drawing Engine
  const drawProceduralItem = (
    ctx: CanvasRenderingContext2D,
    item: ItemDef | PlacedItem,
    x: number,
    y: number,
    scale: number = 1
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const itemId = 'defId' in item ? item.defId : item.id;
    const color = item.color || '#FF2A85';

    // Try drawing loaded sprite first
    const spriteName = itemId.includes('BENTO')
      ? 'item_bento_box.png'
      : itemId.includes('SODA')
      ? 'item_soda_cat.png'
      : itemId.includes('VINYL')
      ? 'item_snack_purple.png'
      : 'item_snack_neon.png';

    const spriteImg = assetsRef.current[spriteName];
    if (spriteImg && spriteImg.complete) {
      ctx.drawImage(spriteImg, -24, -24, 48, 48);
      ctx.restore();
      return;
    }

    if (itemId.includes('BENTO')) {
      // Bento Box: Rounded black container, white rice, red plum, edamame, salmon fillet
      ctx.fillStyle = '#111827';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-24, -20, 48, 40, 8);
      } else {
        ctx.rect(-24, -20, 48, 40);
      }
      ctx.fill();

      // Inner compartments
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(-20, -16, 20, 32); // Rice
      ctx.fillRect(2, -16, 18, 14);  // Edamame
      ctx.fillRect(2, 0, 18, 16);   // Salmon

      // White Rice + Red Plum
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-18, -14, 16, 28);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-10, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Green Edamame Pods
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(7, -9, 3, 0, Math.PI * 2);
      ctx.arc(14, -9, 3, 0, Math.PI * 2);
      ctx.fill();

      // Glazed Salmon Fillet
      ctx.fillStyle = '#ff7043';
      ctx.fillRect(4, 2, 14, 12);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(6, 4); ctx.lineTo(16, 4);
      ctx.moveTo(6, 8); ctx.lineTo(16, 8);
      ctx.stroke();

    } else if (itemId.includes('SODA')) {
      // Soda Can: Metallic cylindrical gradient, pull-tab, cat decal, specular stripes
      const grad = ctx.createLinearGradient(-14, 0, 14, 0);
      grad.addColorStop(0, '#00b894');
      grad.addColorStop(0.5, '#00ffa3');
      grad.addColorStop(1, '#00b894');
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-14, -22, 28, 44, 6);
      } else {
        ctx.rect(-14, -22, 28, 44);
      }
      ctx.fill();

      // Pull Tab
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-5, -24, 10, 4);

      // Cute Cat Face Decal
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, 0, 2, 2);
      ctx.fillRect(1, 0, 2, 2);

      // Specular glare stripe
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(-10, -20, 4, 40);

    } else {
      // Neon Cat Snack Pack (Default/Gummy/Melon Milk)
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(-16, -16, 32, 32, 8);
      } else {
        ctx.rect(-16, -16, 32, 32);
      }
      ctx.fill();

      // Cat Ears on Bag
      ctx.beginPath();
      ctx.moveTo(-12, -16); ctx.lineTo(-6, -24); ctx.lineTo(0, -16);
      ctx.moveTo(12, -16); ctx.lineTo(6, -24); ctx.lineTo(0, -16);
      ctx.fill();

      // Neon Star Emblem
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

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

    // PASS 1: ENVIRONMENT & BACKGROUND
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#1c0838');
    bgGrad.addColorStop(0.5, '#120524');
    bgGrad.addColorStop(1, '#070112');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ambient Additive Gradient Blends (Magenta Left, Cyan Center)
    const neonLeft = ctx.createRadialGradient(20, 100, 5, 20, 100, 180);
    neonLeft.addColorStop(0, 'rgba(255, 0, 127, 0.25)');
    neonLeft.addColorStop(1, 'rgba(255, 0, 127, 0)');
    ctx.fillStyle = neonLeft;
    ctx.fillRect(0, 0, width, height);

    const neonCenter = ctx.createRadialGradient(width / 2, 220, 10, width / 2, 220, 220);
    neonCenter.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
    neonCenter.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = neonCenter;
    ctx.fillRect(0, 0, width, height);

    // Slushie Machine (Left Counter)
    ctx.save();
    const slushieImg = assetsRef.current['prop_slushie_machine.png'];
    if (slushieImg && slushieImg.complete) {
      ctx.drawImage(slushieImg, 14, 55, 80, 105);
    } else {
      ctx.fillStyle = '#1e103d';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      if (typeof (ctx as any).roundRect === 'function') {
        (ctx as any).roundRect(14, 55, 80, 105, 12);
      } else {
        ctx.rect(14, 55, 80, 105);
      }
      ctx.fill();
      ctx.stroke();

      // Swirling Dual Slushie Bowls
      const slush1 = ctx.createLinearGradient(20, 65, 50, 110);
      slush1.addColorStop(0, '#ff007f');
      slush1.addColorStop(1, '#00e5ff');
      ctx.fillStyle = slush1;
      ctx.fillRect(22, 65, 30, 42);

      const slush2 = ctx.createLinearGradient(54, 65, 84, 110);
      slush2.addColorStop(0, '#ffe600');
      slush2.addColorStop(1, '#00ffa3');
      ctx.fillStyle = slush2;
      ctx.fillRect(52, 65, 30, 42);
    }
    ctx.restore();

    // Shop Cat Mochi sitting on Stool with Sinusoidal Breathing Bob (2.4s cycle)
    ctx.save();
    const catX = width - 65;
    const catBobY = 105 + Math.sin(Date.now() / 380) * 3; // 3px vertical bob
    const catImg = assetsRef.current['prop_mochi_cat.png'];

    if (catImg && catImg.complete) {
      ctx.drawImage(catImg, catX - 35, catBobY - 30, 70, 95);
    } else {
      // Stool
      ctx.fillStyle = '#581c87';
      ctx.fillRect(catX - 18, catBobY + 22, 36, 28);
      // Cat Body
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(catX, catBobY, 22, 0, Math.PI * 2);
      ctx.fill();
      // Ears
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(catX - 16, catBobY - 14);
      ctx.lineTo(catX - 6, catBobY - 28);
      ctx.lineTo(catX, catBobY - 14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(catX + 16, catBobY - 14);
      ctx.lineTo(catX + 6, catBobY - 28);
      ctx.lineTo(catX, catBobY - 14);
      ctx.fill();
      // Visor Hat
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(catX - 20, catBobY - 16, 40, 7);
      // Face
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(catX - 7, catBobY - 2, 2.8, 0, Math.PI * 2);
      ctx.arc(catX + 7, catBobY - 2, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // PASS 2: ISOMETRIC BASKET & GRID SLOTS
    ctx.save();
    const basketImg = assetsRef.current['basket_isometric_frame.png'];
    const basketW = grid.cols * TILE_WIDTH + 24;
    const basketH = grid.rows * TILE_HEIGHT + 24;

    if (basketImg && basketImg.complete) {
      ctx.drawImage(basketImg, ORIGIN_X - 100, ORIGIN_Y - 40, 200, 160);
    } else {
      ctx.fillStyle = 'rgba(22, 8, 41, 0.92)';
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 20;

      // Draw Isometric Acrylic Shopping Basket Frame
      ctx.beginPath();
      const p0 = toIso(-0.5, -0.5);
      const p1 = toIso(-0.5, grid.cols - 0.5);
      const p2 = toIso(grid.rows - 0.5, grid.cols - 0.5);
      const p3 = toIso(grid.rows - 0.5, -0.5);

      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Recessed Isometric Grid Slots
    for (let r = 0; r < grid.rows; r++) {
      for (let c = 0; c < grid.cols; c++) {
        const pt = toIso(r, c);
        const val = grid.matrix[r][c];

        ctx.save();
        ctx.beginPath();
        const halfW = TILE_WIDTH / 2 - 3;
        const halfH = TILE_HEIGHT / 2 - 2;

        ctx.moveTo(pt.x, pt.y - halfH);
        ctx.lineTo(pt.x + halfW, pt.y);
        ctx.lineTo(pt.x, pt.y + halfH);
        ctx.lineTo(pt.x - halfW, pt.y);
        ctx.closePath();

        if (val === 1) {
          ctx.fillStyle = '#301844';
          ctx.strokeStyle = '#632c8d';
        } else {
          ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        }
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    // PASS 3: 3D ITEM RENDERING & DEPTH SORTING (Y-Sort)
    const sortedPlaced = [...placedItems].sort((a, b) => {
      const depthA = a.gridY + a.gridX;
      const depthB = b.gridY + b.gridX;
      return depthA - depthB;
    });

    for (const item of sortedPlaced) {
      const isoPos = toIso(item.gridY, item.gridX);

      // Contact Occlusion Shadow
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(isoPos.x, isoPos.y + 8, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Procedural or Sprite Item
      drawProceduralItem(ctx, item, isoPos.x, isoPos.y - 12);

      // Top-down Gloss Spot-Light Highlight
      ctx.save();
      const gloss = ctx.createRadialGradient(isoPos.x, isoPos.y - 18, 2, isoPos.x, isoPos.y - 18, 16);
      gloss.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gloss;
      ctx.beginPath();
      ctx.arc(isoPos.x, isoPos.y - 18, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // PASS 4: DRAGGING & ELASTIC SNAP PHYSICS
    if (isDragging && stagedItem) {
      // Calculate Drag velocity vector
      const vx = pointerPos.x - lastPointerPos.current.x;
      const vy = pointerPos.y - lastPointerPos.current.y;
      dragVelocity.current = { x: vx, y: vy };
      lastPointerPos.current = { x: pointerPos.x, y: pointerPos.y };

      // Holographic Placement Silhouette Preview
      if (hoverCell) {
        const [hr, hc] = hoverCell;
        const isValid = grid.canPlace(stagedItem, hr, hc);
        const isoHover = toIso(hr, hc);

        ctx.save();
        ctx.fillStyle = isValid ? 'rgba(0, 255, 163, 0.45)' : 'rgba(255, 0, 85, 0.45)';
        ctx.strokeStyle = isValid ? '#00FFA3' : '#FF0055';
        ctx.lineWidth = 3;
        ctx.shadowColor = isValid ? '#00FFA3' : '#FF0055';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        const halfW = TILE_WIDTH / 2;
        const halfH = TILE_HEIGHT / 2;
        ctx.moveTo(isoHover.x, isoHover.y - halfH);
        ctx.lineTo(isoHover.x + halfW, isoHover.y);
        ctx.lineTo(isoHover.x, isoHover.y + halfH);
        ctx.lineTo(isoHover.x - halfW, isoHover.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Dynamic Floor Drop Shadow under held item
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(pointerPos.x, pointerPos.y + 18, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Held Staged Item under Pointer with 1.12x Elastic Drag Scale
      drawProceduralItem(ctx, stagedItem, pointerPos.x, pointerPos.y - 10, 1.12);
    }

    // Render Particle Burst Explosions
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      const alpha = 1 - p.life / p.maxLife;
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

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
      AudioController.playFanfare();
      HapticBridge.heavy();
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
    lastPointerPos.current = { x: px, y: py };

    AudioController.playPop();
    HapticBridge.light();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setPointerPos({ x: px, y: py });

    const isoCell = fromIso(px, py);
    if (
      isoCell.r >= 0 &&
      isoCell.r < grid.rows &&
      isoCell.c >= 0 &&
      isoCell.c < grid.cols
    ) {
      setHoverCell([isoCell.r, isoCell.c]);
    } else {
      setHoverCell(null);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (hoverCell && stagedItem) {
      const [r, c] = hoverCell;
      const success = attemptPlacement(r, c);

      if (success) {
        const iso = toIso(r, c);
        spawnParticleBurst(iso.x, iso.y);
      }
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
