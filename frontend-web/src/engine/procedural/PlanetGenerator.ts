import { PlanetData, SplitMix32 } from './UniverseMatrix';

export interface TerrainVertex {
  x: number;
  y: number;
  z: number;
  height: number;
  biomeColor: string;
}

export interface ResourceNode {
  id: string;
  type: string;
  x: number;
  y: number;
  z: number;
  yieldAmount: number;
}

export class PlanetGenerator {
  /**
   * Generates spherical terrain vertices with 3D noise simulation
   */
  static generateTerrainMesh(planet: PlanetData, resolution: number = 32): TerrainVertex[] {
    const rng = new SplitMix32(planet.radiusKm);
    const vertices: TerrainVertex[] = [];
    const baseRadius = 10; // Normalized 3D viewport radius

    const colorMap: Record<string, string> = {
      Lush: '#22c55e',
      Scorched: '#ef4444',
      Frozen: '#38bdf8',
      Radioactive: '#eab308',
      Toxic: '#a855f7',
      'Dead Moon': '#64748b',
      Glitch: '#ec4899',
      Ocean: '#0284c7',
      Corrupted: '#881337',
    };

    const biomeColor = colorMap[planet.biome] || '#10b981';

    for (let lat = 0; lat <= resolution; lat++) {
      const theta = (lat * Math.PI) / resolution;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= resolution; lon++) {
        const phi = (lon * 2 * Math.PI) / resolution;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        // Simple procedural noise perturbation
        const noise = (Math.sin(lat * 0.4) * Math.cos(lon * 0.4) + rng.nextFloat() * 0.2) * 0.8;
        const radius = baseRadius + noise;

        const x = radius * sinTheta * cosPhi;
        const y = radius * cosTheta;
        const z = radius * sinTheta * sinPhi;

        vertices.push({
          x,
          y,
          z,
          height: noise,
          biomeColor,
        });
      }
    }

    return vertices;
  }

  /**
   * Deterministically places mineral resource hotspots on the planet surface
   */
  static generateResourceHotspots(planet: PlanetData, count: number = 12): ResourceNode[] {
    const rng = new SplitMix32(planet.radiusKm * 31);
    const hotspots: ResourceNode[] = [];

    for (let i = 0; i < count; i++) {
      const theta = rng.nextFloat() * Math.PI;
      const phi = rng.nextFloat() * 2 * Math.PI;
      const radius = 10.2; // Slightly above terrain

      hotspots.push({
        id: `node_${planet.id}_${i}`,
        type: i % 2 === 0 ? planet.primaryMineral : planet.secondaryMineral,
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.cos(theta),
        x1: radius * Math.sin(theta) * Math.sin(phi),
        y1: radius * Math.cos(theta),
        z: radius * Math.sin(theta) * Math.sin(phi),
        yieldAmount: rng.nextInt(150, 600),
      } as ResourceNode);
    }

    return hotspots;
  }
}
