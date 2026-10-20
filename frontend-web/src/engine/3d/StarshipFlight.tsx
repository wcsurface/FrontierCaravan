'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStateStore } from '../../store/PlayerStateStore';

interface StarshipFlightProps {
  onPositionChange?: (pos: THREE.Vector3) => void;
  viewPerspective?: 'tactical_isometric' | 'chase_3d';
}

export const StarshipFlight: React.FC<StarshipFlightProps> = ({
  onPositionChange,
  viewPerspective = 'tactical_isometric',
}) => {
  const shipGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { ships, activeShipIndex } = usePlayerStateStore();

  const activeShip = ships[activeShipIndex] || ships[0];

  // Physics state vectors
  const velocity = useRef(new THREE.Vector3());
  const rotationEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useFrame((_, delta) => {
    if (!shipGroupRef.current) return;

    // Apply linear velocity damping (space vs atmospheric friction)
    velocity.current.multiplyScalar(0.96);
    shipGroupRef.current.position.addScaledVector(velocity.current, delta);

    if (onPositionChange) {
      onPositionChange(shipGroupRef.current.position.clone());
    }

    // Camera Spring-Arm Logic
    if (viewPerspective === 'tactical_isometric') {
      // Warcraft-style Isometric Top-Down Camera
      const targetCamPos = shipGroupRef.current.position.clone().add(new THREE.Vector3(0, 18, 14));
      camera.position.lerp(targetCamPos, 0.1);
      camera.lookAt(shipGroupRef.current.position);
    } else {
      // 3D Chase Camera with dynamic spring lag
      const targetCamPos = shipGroupRef.current.position
        .clone()
        .add(new THREE.Vector3(0, 3, 7).applyEuler(shipGroupRef.current.rotation));
      camera.position.lerp(targetCamPos, 0.08);
      camera.lookAt(shipGroupRef.current.position.clone().add(new THREE.Vector3(0, 0.5, -4)));
    }
  });

  return (
    <group ref={shipGroupRef} position={[0, 1.5, 0]}>
      {/* 3D Starship Model Mesh */}
      <mesh castShadow receiveShadow>
        <coneGeometry args={[0.7, 2.8, 5]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Wings */}
      <mesh position={[0, -0.2, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.1, 2.4, 0.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Cockpit Canopy */}
      <mesh position={[0, 0.4, 0.3]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#22d3ee" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
      </mesh>

      {/* Thruster Engine Glow */}
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.22, 0.08, 0.5, 12]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>
    </group>
  );
};
