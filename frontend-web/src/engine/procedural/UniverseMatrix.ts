/**
 * TELOS: INFINITE HORIZON - PROCEDURAL UNIVERSE MATRIX
 * Deterministic Lehmer / SplitMix32 PRNG Star System Generator
 */

export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M' | 'Wolf-Rayet' | 'Black Hole' | 'Anomaly';

export type EconomyType =
  | 'Mining'
  | 'Manufacturing'
  | 'Tech'
  | 'Scientific'
  | 'Trading'
  | 'Advanced Materials'
  | 'Power Generation';

export type WealthRating =
  | 'Destitute'
  | 'Struggling'
  | 'Developing'
  | 'Medium'
  | 'Prosperous'
  | 'Flourishing';

export type BiomeType =
  | 'Lush'
  | 'Scorched'
  | 'Frozen'
  | 'Radioactive'
  | 'Toxic'
  | 'Dead Moon'
  | 'Glitch'
  | 'Ocean'
  | 'Corrupted';

export type MineralHotspot =
  | 'Sodium'
  | 'Phosphorus'
  | 'Dioxite'
  | 'Uranium'
  | 'Ferrite'
  | 'Cadmium'
  | 'Emeril'
  | 'Indium'
  | 'Nanites';

export interface PlanetData {
  id: string;
  name: string;
  index: number;
  biome: BiomeType;
  distanceFromStarAU: number;
  radiusKm: number;
  gravityG: number;
  temperatureC: number;
  atmospherePressureAtm: number;
  hasRings: boolean;
  waterCoveragePct: number;
  faunaSpeciesCount: number;
  floraSpeciesCount: number;
  primaryMineral: MineralHotspot;
  secondaryMineral: MineralHotspot;
  wardenThreatLevel: number; // 1-5 escalation level
  discoveredBy?: string;
}

export interface StarSystem {
  id: string;
  seed: number;
  coordinateHash: string;
  name: string;
  x: number; // Light-years from galactic core
  y: number;
  z: number;
  spectralClass: SpectralClass;
  starColorHex: string;
  economy: EconomyType;
  wealth: WealthRating;
  isOutlawSystem: boolean;
  securityLevel: number; // 0 (Outlaw) to 5 (Heavy Warden Fleet)
  planetCount: number;
  planets: PlanetData[];
  dominantFaction: 'The Obi' | 'The Cybon' | 'The Kraden' | 'The Atomin';
  spaceStationPresent: boolean;
}

// SplitMix32 PRNG
export class SplitMix32 {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  nextFloat(): number {
    let z = (this.state += 0x9e3779b9) >>> 0;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
    return ((z ^ (z >>> 15)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  pickOne<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

const STAR_PREFIXES = ['Telos', 'Zephyr', 'Aethel', 'Kronos', 'Vesper', 'Astra', 'Cygnus', 'Hyperion', 'Orion', 'Elysium', 'Solstice', 'Nadir'];
const STAR_SUFFIXES = ['Prime', 'Major', 'Nexa', 'IX', 'Void', 'Horizon', 'V', 'Boreal', 'Aeterna', 'Omega', 'Relic'];

const FACTIONS: StarSystem['dominantFaction'][] = ['The Obi', 'The Cybon', 'The Kraden', 'The Atomin'];
const ECONOMIES: EconomyType[] = ['Mining', 'Manufacturing', 'Tech', 'Scientific', 'Trading', 'Advanced Materials', 'Power Generation'];
const WEALTH_RATINGS: WealthRating[] = ['Destitute', 'Struggling', 'Developing', 'Medium', 'Prosperous', 'Flourishing'];

const SPECTRAL_COLORS: Record<SpectralClass, string> = {
  O: '#60a5fa', // Blue
  B: '#93c5fd', // Deep Sky Blue
  A: '#f8fafc', // White
  F: '#fef08a', // Yellow White
  G: '#eab308', // Yellow Sol
  K: '#f97316', // Orange
  M: '#ef4444', // Red Dwarf
  'Wolf-Rayet': '#c084fc', // Purple Giant
  'Black Hole': '#111827', // Dark Hole
  Anomaly: '#22c55e', // Emerald Anomaly
};

export class UniverseMatrix {
  private masterSeed: number;

  constructor(masterSeedString: string = 'TELOS_SEED_2084_INFINITE') {
    let hash = 0;
    for (let i = 0; i < masterSeedString.length; i++) {
      hash = (hash << 5) - hash + masterSeedString.charCodeAt(i);
      hash |= 0;
    }
    this.masterSeed = Math.abs(hash);
  }

  /**
   * Deterministically generates a star system given its galactic coordinates (x, y, z)
   */
  getSystemAt Voxel(x: number, y: number, z: number): StarSystem {
    // Generate system seed from coordinate hash
    const coordHashSeed = Math.abs((x * 73856093) ^ (y * 19349663) ^ (z * 83492791) ^ this.masterSeed);
    const rng = new SplitMix32(coordHashSeed);

    const name = `${rng.pickOne(STAR_PREFIXES)} ${rng.pickOne(STAR_SUFFIXES)}-${rng.nextInt(10, 99)}`;
    const spectralClass: SpectralClass = rng.pickOne([
      'O', 'B', 'A', 'F', 'G', 'K', 'M', 'Wolf-Rayet', 'Black Hole', 'Anomaly'
    ]);
    const starColorHex = SPECTRAL_COLORS[spectralClass];
    const isOutlawSystem = rng.nextFloat() < 0.18;
    const securityLevel = isOutlawSystem ? 0 : rng.nextInt(1, 5);
    const planetCount = rng.nextInt(2, 8);

    const planets: PlanetData[] = [];
    for (let i = 0; i < planetCount; i++) {
      planets.push(this.generatePlanet(rng, name, i, planetCount));
    }

    return {
      id: `sys_${x}_${y}_${z}`,
      seed: coordHashSeed,
      coordinateHash: `TELOS_VOX_${x}_${y}_${z}`,
      name,
      x,
      y,
      z,
      spectralClass,
      starColorHex,
      economy: rng.pickOne(ECONOMIES),
      wealth: rng.pickOne(WEALTH_RATINGS),
      isOutlawSystem,
      securityLevel,
      planetCount,
      planets,
      dominantFaction: rng.pickOne(FACTIONS),
      spaceStationPresent: !isOutlawSystem || rng.nextFloat() > 0.4,
    };
  }

  private generatePlanet(rng: SplitMix32, systemName: string, index: number, totalPlanets: number): PlanetData {
    const distanceAU = (index + 1) * 0.4 + rng.nextFloat() * 0.3;
    let biome: BiomeType = 'Lush';

    if (distanceAU < 0.6) biome = rng.pickOne(['Scorched', 'Radioactive', 'Toxic']);
    else if (distanceAU > 2.2) biome = rng.pickOne(['Frozen', 'Dead Moon', 'Corrupted']);
    else biome = rng.pickOne(['Lush', 'Ocean', 'Glitch', 'Toxic', 'Radioactive']);

    const minerals: MineralHotspot[] = [
      'Sodium', 'Phosphorus', 'Dioxite', 'Uranium', 'Ferrite', 'Cadmium', 'Emeril', 'Indium', 'Nanites'
    ];

    return {
      id: `plt_${systemName.toLowerCase().replace(/\s+/g, '_')}_${index + 1}`,
      name: `${systemName} ${String.fromCharCode(65 + index)}`,
      index,
      biome,
      distanceFromStarAU: Number(distanceAU.toFixed(2)),
      radiusKm: rng.nextInt(3200, 12800),
      gravityG: Number((0.6 + rng.nextFloat() * 0.9).toFixed(2)),
      temperatureC: biome === 'Scorched' ? rng.nextInt(120, 450) : biome === 'Frozen' ? rng.nextInt(-160, -30) : rng.nextInt(10, 35),
      atmospherePressureAtm: Number((0.4 + rng.nextFloat() * 1.8).toFixed(2)),
      hasRings: rng.nextFloat() < 0.3,
      waterCoveragePct: biome === 'Ocean' ? rng.nextInt(85, 98) : biome === 'Lush' ? rng.nextInt(40, 75) : rng.nextInt(0, 15),
      faunaSpeciesCount: biome === 'Dead Moon' || biome === 'Glitch' ? 0 : rng.nextInt(4, 14),
      floraSpeciesCount: biome === 'Dead Moon' ? 0 : rng.nextInt(6, 22),
      primaryMineral: rng.pickOne(minerals),
      secondaryMineral: rng.pickOne(minerals),
      wardenThreatLevel: rng.nextInt(1, 5),
    };
  }
}
