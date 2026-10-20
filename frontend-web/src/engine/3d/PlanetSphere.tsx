'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
import { PlanetData } from '../procedural/UniverseMatrix';
import { createAtmosphereMaterial } from './AtmosphereShader';

interface PlanetSphereProps {
  planet: PlanetData;
  position?: [number, number, number];
  scale?: number;
  viewMode?: '3d_space' | 'tactical_isometric';
}

const noise3D = createNoise3D();

/**
 * Calculates mathematical terrain elevation at spherical or planar coordinate
 */
export function getTerrainHeightAt(x: number, z: number, seed: number = 42): number {
  const scale1 = 0.05;
  const scale2 = 0.12;
  const n1 = noise3D(x * scale1, seed, z * scale1) * 2.5;
  const n2 = noise3D(x * scale2, seed + 100, z * scale2) * 0.8;
  return Math.max(0, n1 + n2);
}

export const PlanetSphere: React.FC<PlanetSphereProps> = ({
  planet,
  position = [0, 0, 0],
  scale = 10,
  viewMode = 'tactical_isometric',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Generate Procedural Heightmap Geometry & Vertex Colors
  const { geometry, waterGeometry } = useMemo(() => {
    const segments = viewMode === 'tactical_isometric' ? 64 : 48;
    const geo = new THREE.PlaneGeometry(30, 30, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const posAttr = geo.attributes.position;
    const colors: number[] = [];

    const colorGrass = new THREE.Color('#22c55e');
    const colorRock = new THREE.Color('#475569');
    const colorSand = new THREE.Color('#eab308');
    const colorSnow = new THREE.Color('#f8fafc');

    if (planet.biome === 'Scorched') colorGrass.set('#ef4444');
    if (planet.biome === 'Frozen') colorGrass.set('#38bdf8');
    if (planet.biome === 'Toxic') colorGrass.set('#a855f7');

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);

      const height = getTerrainHeightAt(x, z, planet.radiusKm);
      posAttr.setY(i, height);

      // Biome color interpolation based on elevation & slope
      let vertexColor = colorGrass;
      if (height < 0.3) vertexColor = colorSand;
      else if (height > 2.2) vertexColor = colorSnow;
      else if (height > 1.2) vertexColor = colorRock;

      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    // Water Plane Geometry
    const wGeo = new THREE.PlaneGeometry(30, 30);
    wGeo.rotateX(-Math.PI / 2);

    return { geometry: geo, waterGeometry: wGeo };
  }, [planet, viewMode]);

  // Atmosphere Shader Material
  const atmosphereMaterial = useMemo(() => {
    const colorMap: Record<string, string> = {
      Lush: '#38bdf8',
      Scorched: '#f97316',
      Frozen: '#93c5fd',
      Radioactive: '#eab308',
      Toxic: '#c084fc',
    };
    return createAtmosphereMaterial({ color: colorMap[planet.biome] || '#38bdf8' });
  }, [planet]);

  useFrame((_, delta) => {
    if (meshRef.current && viewMode === '3d_space') {
      meshRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Terrain Surface */}
      <mesh ref={meshRef} geometry={geometry} receiveShadow castShadow>
        <meshStandardMaterial vertexColors roughness={0.8} metalness={0.1} flatShading />
      </mesh>

      {/* Water Plane (for Lush/Ocean biomes) */}
      {(planet.biome === 'Lush' || planet.biome === 'Ocean') && (
        <mesh geometry={waterGeometry} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.8} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Atmospheric Scattering Outer Shell */}
      {viewMode === '3d_space' && (
        <mesh ref={atmosphereRef} material={atmosphereMaterial} scale={1.12}>
          <sphereGeometry args={[1, 32, 32]} />
        </mesh>
      )}
    </group>
  );
};
