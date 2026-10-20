import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GridEngine, ItemDef, PlacedItem, ShapeCoord } from '../engine/GridEngine';
import { ITEM_CATALOG } from '../engine/ItemCatalog';
import { HapticBridge } from '../engine/HapticBridge';
import { AudioController } from '../engine/AudioController';

export interface LevelConfig {
  levelNumber: number;
  rows: number;
  cols: number;
  obstacles: ShapeCoord[];
  availableItems: string[]; // Keys of ITEM_CATALOG
  targetStars: number;
  movesAllowed: number;
  timeLimitSec: number;
}

export interface DecorItem {
  id: string;
  category: 'signage' | 'awning' | 'cat_bed' | 'slushie' | 'flooring';
  name: string;
  costStars: number;
  costCoins: number;
  unlocked: boolean;
  selectedVariant: number; // 0, 1, 2
}

interface GameState {
  // Currencies
  coins: number;
  stars: number;
  lives: number;
  maxLives: number;
  lastLifeRefillTime: number;

  // Active Session
  currentLevel: number;
  grid: GridEngine;
  placedItems: PlacedItem[];
  itemQueue: ItemDef[];
  stagedItem: ItemDef | null;
  movesRemaining: number;
  secondsRemaining: number;
  isPlaying: boolean;
  isWon: boolean;
  isGameOver: boolean;
  comboCount: number;

  // Meta Progression
  decorations: Record<string, DecorItem>;
  shopCatName: string;
  catAffection: number;

  // Actions
  initLevel: (lvl: LevelConfig) => void;
  selectItemForPlacement: (item: ItemDef) => void;
  attemptPlacement: (r: number, c: number) => boolean;
  undoLastPlacement: () => void;
  tickTimer: () => void;
  unlockDecor: (decorId: string, variant: number) => boolean;
  addCurrencies: (coins: number, stars: number) => void;
  consumeLife: () => boolean;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 450,
      stars: 12,
      lives: 5,
      maxLives: 5,
      lastLifeRefillTime: Date.now(),

      currentLevel: 1,
      grid: new GridEngine(6, 6),
      placedItems: [],
      itemQueue: [],
      stagedItem: null,
      movesRemaining: 25,
      secondsRemaining: 90,
      isPlaying: false,
      isWon: false,
      isGameOver: false,
      comboCount: 0,

      decorations: {
        neon_sign: {
          id: 'neon_sign',
          category: 'signage',
          name: 'Classic Magenta Neon Sign',
          costStars: 2,
          costCoins: 100,
          unlocked: true,
          selectedVariant: 0
        },
        awning_retro: {
          id: 'awning_retro',
          category: 'awning',
          name: 'Teal & Coral Striped Canopy',
          costStars: 3,
          costCoins: 200,
          unlocked: false,
          selectedVariant: 0
        },
        cat_cushion: {
          id: 'cat_cushion',
          category: 'cat_bed',
          name: 'Heated Velvet Noodle Bed',
          costStars: 4,
          costCoins: 350,
          unlocked: false,
          selectedVariant: 0
        },
        slushie_dispenser: {
          id: 'slushie_dispenser',
          category: 'slushie',
          name: 'Twin-Vortex Glitch Slush Machine',
          costStars: 5,
          costCoins: 500,
          unlocked: false,
          selectedVariant: 0
        }
      },
      shopCatName: 'Mochi',
      catAffection: 1,

      initLevel: (lvl: LevelConfig) => {
        const grid = new GridEngine(lvl.rows, lvl.cols, lvl.obstacles);
        const queue: ItemDef[] = lvl.availableItems.map((k) => ITEM_CATALOG[k]).filter(Boolean);

        set({
          currentLevel: lvl.levelNumber,
          grid,
          placedItems: [],
          itemQueue: queue.slice(1),
          stagedItem: queue[0] || null,
          movesRemaining: lvl.movesAllowed,
          secondsRemaining: lvl.timeLimitSec,
          isPlaying: true,
          isWon: false,
          isGameOver: false,
          comboCount: 0,
        });
      },

      selectItemForPlacement: (item: ItemDef) => {
        set({ stagedItem: item });
        AudioController.playPop();
        HapticBridge.light();
      },

      attemptPlacement: (r: number, c: number) => {
        const { grid, stagedItem, placedItems, movesRemaining, comboCount, itemQueue } = get();
        if (!stagedItem || movesRemaining <= 0) return false;

        if (grid.canPlace(stagedItem, r, c)) {
          const placed = grid.place(stagedItem, r, c);
          const newPlaced = [...placedItems, placed];
          const newMoves = movesRemaining - 1;
          const nextCombo = comboCount + 1;

          AudioController.playSnap(nextCombo);
          HapticBridge.medium();

          // Check Win Condition
          const full = grid.isFull();
          const nextQueue = [...itemQueue];
          const nextStaged = nextQueue.shift() || null;

          set({
            grid,
            placedItems: newPlaced,
            stagedItem: nextStaged,
            itemQueue: nextQueue,
            movesRemaining: newMoves,
            comboCount: nextCombo,
            isWon: full,
            isPlaying: !full,
          });

          if (full) {
            AudioController.playFanfare();
            HapticBridge.heavy();
            get().addCurrencies(100 + nextCombo * 10, 1);
          }

          return true;
        } else {
          AudioController.playThud();
          HapticBridge.reject();
          set({ comboCount: 0 });
          return false;
        }
      },

      undoLastPlacement: () => {
        const { grid, placedItems, itemQueue, stagedItem } = get();
        if (placedItems.length === 0) return;

        const last = placedItems[placedItems.length - 1];
        grid.remove(last);

        const restoredItemDef = ITEM_CATALOG[last.defId];
        const newQueue = stagedItem ? [stagedItem, ...itemQueue] : itemQueue;

        set({
          grid,
          placedItems: placedItems.slice(0, -1),
          stagedItem: restoredItemDef,
          itemQueue: newQueue,
        });

        HapticBridge.light();
      },

      tickTimer: () => {
        const { secondsRemaining, isPlaying, isWon } = get();
        if (!isPlaying || isWon) return;

        if (secondsRemaining <= 1) {
          set({ secondsRemaining: 0, isPlaying: false, isGameOver: true });
          AudioController.playThud();
          HapticBridge.reject();
        } else {
          set({ secondsRemaining: secondsRemaining - 1 });
        }
      },

      unlockDecor: (decorId: string, variant: number) => {
        const { decorations, stars, coins } = get();
        const decor = decorations[decorId];
        if (!decor) return false;

        if (stars >= decor.costStars && coins >= decor.costCoins) {
          set({
            stars: stars - decor.costStars,
            coins: coins - decor.costCoins,
            decorations: {
              ...decorations,
              [decorId]: {
                ...decor,
                unlocked: true,
                selectedVariant: variant
              }
            }
          });
          AudioController.playFanfare();
          HapticBridge.heavy();
          return true;
        }
        return false;
      },

      addCurrencies: (coinsToAdd: number, starsToAdd: number) => {
        set((state) => ({
          coins: state.coins + coinsToAdd,
          stars: state.stars + starsToAdd
        }));
      },

      consumeLife: () => {
        const { lives } = get();
        if (lives > 0) {
          set({ lives: lives - 1, lastLifeRefillTime: Date.now() });
          return true;
        }
        return false;
      }
    }),
    {
      name: 'midnight_mart_save_v4',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        coins: state.coins,
        stars: state.stars,
        lives: state.lives,
        lastLifeRefillTime: state.lastLifeRefillTime,
        currentLevel: state.currentLevel,
        decorations: state.decorations,
        shopCatName: state.shopCatName,
        catAffection: state.catAffection,
      })
    }
  )
);
