'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStateStore } from '../../store/PlayerStateStore';

export const WardenEntities: React.FC = () => {
  const { wardenHeatLevel } = usePlayerStateStore();
  const droneGroupRef = useRef<THREE.Group>(null);
  const quadGroupRef = useRef<THREE.Group>(null);
  const dreadnoughtGroupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    // Level 1-2 Scout Drone Sinusoidal Hovering
    if (droneGroupRef.current) {
      droneGroupRef.current.position.y = 2.5 + Math.sin(Date.now() * 0.003) * 0.4;
      droneGroupRef.current.rotation.y += delta * 0.5;
    }

    // Level 3-4 Quad / Hardframe Mech
    if (quadGroupRef.current) {
      quadGroupRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.3;
    }

    // Level 5 Orbital Capital Dreadnought
    if (dreadnoughtGroupRef.current) {
      dreadnoughtGroupRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      {/* Level 1-2 Scout Drone */}
      {wardenHeatLevel >= 1 && (
        <group ref={droneGroupRef} position={[-4, 2.5, -6]}>
          <mesh castShadow>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
          </mesh>
          {/* Glowing Red Oculus Eye */}
          <mesh position={[0, 0, 0.55]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
        </group>
      )}

      {/* Level 3-4 Quad Mech */}
      {wardenHeatLevel >= 3 && (
        <group ref={quadGroupRef} position={[6, 0.8, -8]}>
          {/* Chassis */}
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.8, 2.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Legs */}
          {[-0.9, 0.9].map((x) =>
            [-0.9, 0.9].map((z) => (
              <mesh key={`${x}_${z}`} position={[x, -0.6, z]}>
                <cylinderGeometry args={[0.1, 0.1, 1.0, 8]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            ))
          )}
        </group>
      )}

      {/* Level 5 Capital Dreadnought */}
      {wardenHeatLevel >= 5 && (
        <group ref={dreadnoughtGroupRef} position={[0, 25, -45]}>
          <mesh castShadow>
            <boxGeometry args={[12, 4, 30]} />
            <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.95} />
          </mesh>
          {/* Warp Tear Halo */}
          <mesh scale={[1.2, 1.2, 1.2]}>
            <torusGeometry args={[16, 0.8, 16, 64]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};
