import { create } from 'zustand';
import { nativeBridge } from '../lib/nativeBridge';

export type BiomeType = 'Safe Highway' | 'Contested Pass' | 'Toxic Mire';

export interface MapNode {
  id: number;
  name: string;
  biome: BiomeType;
  dangerLevel: number;
  connections: number[];
  x: number;
  y: number;
  visited: boolean;
}

export interface CargoInventory {
  bioFuel: number;
  waterRations: number;
  scrapMetal: number;
  preFallTech: number;
}

export interface CrewMember {
  id: string;
  role: 'Driver' | 'Gunner' | 'Mechanic' | 'Quartermaster';
  name: string;
  hp: number;
  morale: number;
  perk: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  options: {
    label: string;
    action: 'resolve_help' | 'resolve_fight' | 'resolve_bypass';
  }[];
}

export interface GameState {
  runId: string;
  seed: string;
  antiTamperHash: string;
  isOnline: boolean;
  activeTab: 'map' | 'combat' | 'market' | 'crew';

  // Resources
  fuel: number;
  food: number;
  scrap: number;
  armor: number;
  morale: number;
  cargo: CargoInventory;

  // Roster & Map
  crew: CrewMember[];
  currentNodeId: number;
  nodes: MapNode[];
  activeEvent: GameEvent | null;
  marketPrices: Record<string, number>;

  // Actions
  setActiveTab: (tab: 'map' | 'combat' | 'market' | 'crew') => void;
  startNewRun: (customSeed?: string) => Promise<void>;
  travelToNode: (targetNodeId: number) => void;
  buyGood: (key: keyof CargoInventory, amount: number, price: number) => void;
  sellGood: (key: keyof CargoInventory, amount: number, price: number) => void;
  resolveEventChoice: (choice: 'resolve_help' | 'resolve_fight' | 'resolve_bypass') => void;
  triggerAbility: (ability: 'nitro' | 'smoke' | 'repair') => void;
  healCrew: (crewId: string) => void;
  syncWithBackend: () => Promise<void>;
  setOnlineStatus: (status: boolean) => void;
}

const DEFAULT_CARGO: CargoInventory = {
  bioFuel: 10,
  waterRations: 20,
  scrapMetal: 50,
  preFallTech: 2,
};

const INITIAL_CREW: CrewMember[] = [
  { id: '1', role: 'Driver', name: 'Kael', hp: 100, morale: 85, perk: 'Nitro Duration +20%' },
  { id: '2', role: 'Gunner', name: 'Vex', hp: 90, morale: 80, perk: 'Turret Fire Rate +15%' },
  { id: '3', role: 'Mechanic', name: 'Doc', hp: 100, morale: 90, perk: 'Auto Repair +5%' },
  { id: '4', role: 'Quartermaster', name: 'Jett', hp: 85, morale: 75, perk: 'Trade Margin +10%' },
];

function generateProceduralNodes(seed: string): MapNode[] {
  const biomes: BiomeType[] = ['Safe Highway', 'Contested Pass', 'Toxic Mire'];
  const nodesList: MapNode[] = [];
  const totalCols = 5;
  const rowsPerCol = 4;

  let nodeCounter = 0;
  for (let c = 0; c < totalCols; c++) {
    for (let r = 0; r < rowsPerCol; r++) {
      const biome = biomes[(c + r) % biomes.length];
      nodesList.push({
        id: nodeCounter,
        name: `Sector-${nodeCounter + 1}`,
        biome: biome,
        dangerLevel: (c + 1) * 15,
        connections: [],
        x: 15 + c * 20,
        y: 15 + r * 22,
        visited: nodeCounter === 0,
      });
      nodeCounter++;
    }
  }

  // Interconnect branching paths
  nodesList.forEach((n, idx) => {
    const row = idx % rowsPerCol;
    const col = Math.floor(idx / rowsPerCol);

    if (col < totalCols - 1) {
      const nextColStart = (col + 1) * rowsPerCol;
      // Connect to same row in next column
      n.connections.push(nextColStart + row);
      // Branch connection
      if (row > 0) n.connections.push(nextColStart + (row - 1));
      if (row < rowsPerCol - 1) n.connections.push(nextColStart + (row + 1));
    }
  });

  return nodesList;
}

export const useGameStore = create<GameState>((set, get) => ({
  runId: 'run_' + Date.now(),
  seed: 'WAS-2084-ALPHA',
  antiTamperHash: 'hash_init_001',
  isOnline: true,
  activeTab: 'map',

  fuel: 100,
  food: 60,
  scrap: 250,
  armor: 100,
  morale: 85,
  cargo: { ...DEFAULT_CARGO },
  crew: [...INITIAL_CREW],

  currentNodeId: 0,
  nodes: generateProceduralNodes('WAS-2084-ALPHA'),
  activeEvent: null,
  marketPrices: {
    bioFuel: 15,
    waterRations: 8,
    scrapMetal: 20,
    preFallTech: 110,
  },

  setActiveTab: (tab) => {
    nativeBridge.vibrate(30);
    nativeBridge.playAudioCue('click');
    set({ activeTab: tab });
  },

  startNewRun: async (customSeed) => {
    const newSeed = customSeed || 'SEED-' + Math.floor(Math.random() * 900000 + 100000);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://frontiercaravan-production.up.railway.app';

    let runData = null;
    try {
      const res = await fetch(`${backendUrl}/api/runs/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: newSeed, deviceId: nativeBridge.getDeviceId() }),
      });
      if (res.ok) {
        runData = await res.json();
      }
    } catch (e) {
      console.warn('Backend unavailable, generating local run seed:', e);
    }

    const newNodes = generateProceduralNodes(newSeed);
    const updatedState = {
      runId: runData?.runId || 'run_' + Date.now(),
      seed: newSeed,
      antiTamperHash: runData?.antiTamperHash || 'hash_' + Date.now(),
      fuel: runData?.initialResources?.fuel || 100,
      food: runData?.initialResources?.food || 60,
      scrap: runData?.initialResources?.scrap || 250,
      armor: 100,
      morale: 85,
      cargo: { ...DEFAULT_CARGO },
      crew: [...INITIAL_CREW],
      currentNodeId: 0,
      nodes: newNodes,
      activeEvent: null,
      activeTab: 'map' as const,
    };

    set(updatedState);
    nativeBridge.saveLocalState(updatedState);
  },

  travelToNode: (targetNodeId) => {
    const { nodes, currentNodeId, fuel, food, armor, morale } = get();
    const currentNode = nodes[currentNodeId];
    const targetNode = nodes[targetNodeId];

    if (!currentNode || !targetNode) return;
    if (!currentNode.connections.includes(targetNodeId)) return;

    nativeBridge.vibrate(50);
    nativeBridge.playAudioCue('click');

    const fuelCost = targetNode.biome === 'Contested Pass' ? 12 : 8;
    const foodCost = 5;
    const armorDamage = targetNode.biome === 'Toxic Mire' ? 8 : 2;

    const newFuel = Math.max(0, fuel - fuelCost);
    const newFood = Math.max(0, food - foodCost);
    const newArmor = Math.max(0, armor - armorDamage);
    const newMorale = newFood === 0 ? Math.max(0, morale - 10) : morale;

    const updatedNodes = nodes.map((n) =>
      n.id === targetNodeId ? { ...n, visited: true } : n
    );

    // Trigger procedural encounter
    const event: GameEvent = {
      id: `evt_${targetNodeId}`,
      title: `Arrival at ${targetNode.name} (${targetNode.biome})`,
      description:
        targetNode.biome === 'Toxic Mire'
          ? 'Acrid mist covers broken highway lanes. Scavengers wave a warning flag near a rusted tanker.'
          : targetNode.biome === 'Contested Pass'
          ? 'Armed raider buggies block the mountain pass. Demand toll or force passage.'
          : 'A trade convoy rests at an abandoned station. Local traders offer surplus supplies.',
      options: [
        { label: 'Assist / Trade', action: 'resolve_help' },
        { label: 'Fight Raiders', action: 'resolve_fight' },
        { label: 'Bypass / Ignore', action: 'resolve_bypass' },
      ],
    };

    const newState = {
      currentNodeId: targetNodeId,
      nodes: updatedNodes,
      fuel: newFuel,
      food: newFood,
      armor: newArmor,
      morale: newMorale,
      activeEvent: event,
    };

    set(newState);
    nativeBridge.saveLocalState({ ...get(), ...newState });
  },

  buyGood: (key, amount, price) => {
    const { scrap, cargo } = get();
    const totalPrice = price * amount;
    if (scrap >= totalPrice) {
      nativeBridge.vibrate(30);
      nativeBridge.playAudioCue('buy');
      set({
        scrap: scrap - totalPrice,
        cargo: { ...cargo, [key]: cargo[key] + amount },
      });
    }
  },

  sellGood: (key, amount, price) => {
    const { scrap, cargo } = get();
    if (cargo[key] >= amount) {
      nativeBridge.vibrate(30);
      nativeBridge.playAudioCue('buy');
      set({
        scrap: scrap + price * amount,
        cargo: { ...cargo, [key]: cargo[key] - amount },
      });
    }
  },

  resolveEventChoice: (action) => {
    const { scrap, morale, armor } = get();
    nativeBridge.vibrate(40);

    if (action === 'resolve_help') {
      set({
        scrap: scrap + 40,
        morale: Math.min(100, morale + 5),
        activeEvent: null,
      });
    } else if (action === 'resolve_fight') {
      set({
        activeEvent: null,
        activeTab: 'combat',
      });
    } else {
      set({
        morale: Math.max(0, morale - 3),
        activeEvent: null,
      });
    }
  },

  triggerAbility: (ability) => {
    const { fuel, armor, scrap } = get();
    nativeBridge.vibrate(70);

    if (ability === 'nitro' && fuel >= 5) {
      nativeBridge.playAudioCue('shoot');
      set({ fuel: fuel - 5 });
    } else if (ability === 'repair' && scrap >= 20) {
      nativeBridge.playAudioCue('click');
      set({ armor: Math.min(100, armor + 15), scrap: scrap - 20 });
    } else if (ability === 'smoke') {
      nativeBridge.playAudioCue('warning');
    }
  },

  healCrew: (crewId) => {
    const { crew, scrap } = get();
    if (scrap >= 15) {
      nativeBridge.vibrate(30);
      set({
        scrap: scrap - 15,
        crew: crew.map((c) =>
          c.id === crewId ? { ...c, hp: Math.min(100, c.hp + 25) } : c
        ),
      });
    }
  },

  syncWithBackend: async () => {
    const state = get();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'https://frontiercaravan-production.up.railway.app';
    try {
      const res = await fetch(`${backendUrl}/api/runs/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: state.runId,
          currentNodeId: state.currentNodeId,
          resources: {
            fuel: state.fuel,
            food: state.food,
            scrap: state.scrap,
            armor: state.armor,
            morale: state.morale,
          },
          cargo: state.cargo,
          antiTamperHash: state.antiTamperHash,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ antiTamperHash: data.newHash || state.antiTamperHash });
      }
    } catch (e) {
      console.warn('Sync failed, offline local state preserved:', e);
    }
  },

  setOnlineStatus: (status) => {
    set({ isOnline: status });
  },
}));
