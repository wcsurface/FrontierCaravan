'use client';

import React, { useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerStateStore, BasePart } from '../../store/PlayerStateStore';

interface BaseBuilderProps {
  gridSize?: number;
  snapUnit?: number;
}

export const BaseBuilder: React.FC<BaseBuilderProps> = ({
  gridSize = 40,
  snapUnit = 2.0,
}) => {
  const { camera, raycaster, scene } = useThree();
  const { placedBaseParts, placeBasePart, selectedBasePartType } = usePlayerStateStore();

  const ghostRef = useRef<THREE.Group>(null);
  const [ghostPosition, setGhostPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [isValidAnchor, setIsValidAnchor] = useState<boolean>(true);

  // Handle Raycast Grid Snapping
  const handlePointerMove = (e: any) => {
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const targetPoint = new THREE.Vector3();
    raycaster.setFromCamera(e.pointer, camera);

    if (raycaster.ray.intersectPlane(plane, targetPoint)) {
      // Snap coordinates to discrete snap grid
      const snappedX = Math.round(targetPoint.x / snapUnit) * snapUnit;
      const snappedZ = Math.round(targetPoint.z / snapUnit) * snapUnit;
      const snappedY = 0; // Surface plane y

      setGhostPosition([snappedX, snappedY, snappedZ]);

      // Check collision/anchor validity against existing parts
      const hasOverlap = placedBaseParts.some(
        (p) => Math.hypot(p.x - snappedX, p.z - snappedZ) < 0.8
      );
      setIsValidAnchor(!hasOverlap);
    }
  };

  const handlePointerDown = (e: any) => {
    if (e.button !== 0) return; // Primary click
    if (!isValidAnchor) return;

    placeBasePart({
      type: selectedBasePartType,
      x: ghostPosition[0],
      y: ghostPosition[1],
      z: ghostPosition[2],
      rotation: 0,
    });
  };

  return (
    <group onPointerMove={handlePointerMove} onPointerDown={handlePointerDown}>
      {/* Structural Grid Floor */}
      <gridHelper args={[gridSize, gridSize / snapUnit, '#334155', '#1e293b']} position={[0, 0.01, 0]} />

      {/* Render Placed Base Parts */}
      {placedBaseParts.map((part) => (
        <group key={part.id} position={[part.x, part.y + 0.5, part.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.8, 1.0, 1.8]} />
            <meshStandardMaterial
              color={
                part.type === 'Alloy'
                  ? '#0284c7'
                  : part.type === 'Solar Panel'
                  ? '#eab308'
                  : part.type === 'EM Generator'
                  ? '#a855f7'
                  : '#475569'
              }
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>
        </group>
      ))}

      {/* Real-time Holographic Ghost Placement Preview */}
      <group ref={ghostRef} position={ghostPosition}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.8, 1.0, 1.8]} />
          <meshBasicMaterial
            color={isValidAnchor ? '#22c55e' : '#ef4444'}
            transparent
            opacity={0.55}
            wireframe
          />
        </mesh>
      </group>
    </group>
  );
};
