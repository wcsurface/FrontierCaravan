import { create } from 'zustand';
import { nativeBridge } from '../lib/nativeBridge';
import { BiomeType, StarSystem, PlanetData, MineralHotspot } from '../engine/procedural/UniverseMatrix';

export type MultiToolMode =
  | 'Mining Laser'
  | 'Terrain Manipulator'
  | 'Scatter Blaster'
  | 'Boltrifle'
  | 'Pulse Blaster'
  | 'Fire Spear'
  | 'Plasma Grenades';

export type ShipClass =
  | 'Fighter'
  | 'Hauler'
  | 'Explorer'
  | 'Shuttle'
  | 'Exotic'
  | 'Solar'
  | 'Living Ship'
  | 'Warden Interceptor';

export interface Starship {
  id: string;
  name: string;
  shipClass: ShipClass;
  hullHp: number;
  shieldHp: number;
  hyperdriveRangeLy: number;
  modules: {
    fuselage: string;
    wings: string;
    thruster: string;
    reactor: string;
  };
}

export interface BasePart {
  id: string;
  type: 'Wood' | 'Stone' | 'Alloy' | 'Solar Panel' | 'EM Generator' | 'Battery' | 'Extractor' | 'Exocraft Bay';
  x: number;
  y: number;
  z: number;
  rotation: number;
}

export interface PlayerState {
  // Account & Economy
  pilotName: string;
  units: number;
  nanites: number;

  // Hazard & Survival
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  lifeSupportOxygen: number; // 0-100%
  hazardProtection: number; // 0-100%
  activeHazardType: 'Cold' | 'Heat' | 'Toxin' | 'Radiation' | 'None';

  // Multi-Tool
  multiToolMode: MultiToolMode;
  multiToolHeat: number; // 0-100%
  ammoCount: number;

  // Starships & Fleet
  ships: Starship[];
  activeShipIndex: number;
  hyperdriveCharged: boolean;
  speedKph: number;

  // The Wardens Escalation (0 to 5)
  wardenHeatLevel: number;
  wardenThreatName: string;

  // Base Building
  baseBuildingActive: boolean;
  selectedBasePartType: BasePart['type'];
  placedBaseParts: BasePart[];

  // Lore & Story Progression
  factionReputation: {
    obi: number;
    cybon: number;
    kraden: number;
    atomin: number;
  };
  indigoSimulationStep: number; // Story progress 1-5

  // Navigation & Location
  currentSystem: StarSystem | null;
  currentPlanet: PlanetData | null;
  isInSpaceFlight: boolean;

  // Actions
  setMultiToolMode: (mode: MultiToolMode) => void;
  rechargeHazardProtection: (element: 'Sodium' | 'Battery') => void;
  rechargeLifeSupport: (element: 'Oxygen') => void;
  fireMultiTool: () => void;
  triggerWardenEscalation: (amount: number) => void;
  placeBasePart: (part: Omit<BasePart, 'id'>) => void;
  switchActiveShip: (index: number) => void;
  warpJumpToSystem: (targetSystem: StarSystem) => void;
  claimDiscovery: (rewardUnits: number, rewardNanites: number) => void;
  syncCloudSave: () => Promise<void>;
}

const DEFAULT_SHIPS: Starship[] = [
  {
    id: 'ship_01',
    name: 'Horizon Alpha',
    shipClass: 'Fighter',
    hullHp: 100,
    shieldHp: 100,
    hyperdriveRangeLy: 45,
    modules: {
      fuselage: 'Apex Sleek',
      wings: 'Vector Wing-X',
      thruster: 'Ion Drive Mk2',
      reactor: 'Fusion Core',
    },
  },
];

export const usePlayerStateStore = create<PlayerState>((set, get) => ({
  pilotName: 'Traveler-2084',
  units: 125000,
  nanites: 1200,

  health: 100,
  maxHealth: 100,
  shield: 100,
  maxShield: 100,
  lifeSupportOxygen: 100,
  hazardProtection: 85,
  activeHazardType: 'Toxin',

  multiToolMode: 'Mining Laser',
  multiToolHeat: 0,
  ammoCount: 240,

  ships: [...DEFAULT_SHIPS],
  activeShipIndex: 0,
  hyperdriveCharged: true,
  speedKph: 0,

  wardenHeatLevel: 1,
  wardenThreatName: 'Level 1: Scout Drones',

  baseBuildingActive: false,
  selectedBasePartType: 'Alloy',
  placedBaseParts: [],

  factionReputation: {
    obi: 12,
    cybon: 25,
    kraden: 8,
    atomin: 40,
  },
  indigoSimulationStep: 1,

  currentSystem: null,
  currentPlanet: null,
  isInSpaceFlight: true,

  setMultiToolMode: (mode) => {
    nativeBridge.vibrate(30);
    nativeBridge.playAudioCue('click');
    set({ multiToolMode: mode });
  },

  rechargeHazardProtection: (element) => {
    const { hazardProtection, units } = get();
    nativeBridge.vibrate(50);
    nativeBridge.playAudioCue('buy');
    set({
      hazardProtection: 100,
      units: element === 'Battery' ? Math.max(0, units - 500) : units,
    });
  },

  rechargeLifeSupport: () => {
    nativeBridge.vibrate(40);
    nativeBridge.playAudioCue('buy');
    set({ lifeSupportOxygen: 100 });
  },

  fireMultiTool: () => {
    const { multiToolHeat, multiToolMode, ammoCount } = get();
    nativeBridge.vibrate(70);
    nativeBridge.playAudioCue('shoot');

    if (multiToolMode === 'Mining Laser') {
      set({ multiToolHeat: Math.min(100, multiToolHeat + 12) });
    } else {
      set({ ammoCount: Math.max(0, ammoCount - 1) });
    }
  },

  triggerWardenEscalation: (amount) => {
    const { wardenHeatLevel } = get();
    const newLevel = Math.min(5, Math.max(0, wardenHeatLevel + amount));
    const threatNames = [
      'Cleared',
      'Level 1: Scout Drones',
      'Level 2: Combat Patrol Drones',
      'Level 3: Quadruped Quad Walkers',
      'Level 4: Bipedal Hardframe Mechs',
      'Level 5: Orbital Capital Dreadnought',
    ];

    nativeBridge.vibrate(100);
    nativeBridge.playAudioCue('warning');

    set({
      wardenHeatLevel: newLevel,
      wardenThreatName: threatNames[newLevel],
    });
  },

  placeBasePart: (part) => {
    const { placedBaseParts } = get();
    nativeBridge.vibrate(40);
    nativeBridge.playAudioCue('click');

    const newPart: BasePart = {
      ...part,
      id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    set({ placedBaseParts: [...placedBaseParts, newPart] });
  },

  switchActiveShip: (index) => {
    const { ships } = get();
    if (ships[index]) {
      nativeBridge.vibrate(50);
      set({ activeShipIndex: index });
    }
  },

  warpJumpToSystem: (targetSystem) => {
    nativeBridge.vibrate(150);
    nativeBridge.playAudioCue('explosion');
    set({
      currentSystem: targetSystem,
      currentPlanet: targetSystem.planets[0] || null,
      hyperdriveCharged: true,
      wardenHeatLevel: 1,
      wardenThreatName: 'Level 1: Scout Drones',
    });
  },

  claimDiscovery: (rewardUnits, rewardNanites) => {
    const { units, nanites } = get();
    nativeBridge.vibrate(80);
    nativeBridge.playAudioCue('buy');
    set({
      units: units + rewardUnits,
      nanites: nanites + rewardNanites,
    });
  },

  syncCloudSave: async () => {
    const state = get();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://frontiercaravan-production.up.railway.app';
    try {
      await fetch(`${backendUrl}/api/save/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pilotName: state.pilotName,
          units: state.units,
          nanites: state.nanites,
          placedBaseParts: state.placedBaseParts,
          ships: state.ships,
          currentSystemId: state.currentSystem?.id,
        }),
      });
    } catch (e) {
      console.warn('[PlayerStateStore] Cloud save sync deferred (offline):', e);
    }
  },
}));
