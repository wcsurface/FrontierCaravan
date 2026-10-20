'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { usePlayerStateStore } from '../store/PlayerStateStore';
import { Zap, Shield, Rocket, Flame, Crosshair, AlertTriangle } from 'lucide-react';

/**
 * 3D Starship Mesh Component
 */
function StarshipMesh({ speed }: { speed: number }) {
  const shipRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (shipRef.current) {
      shipRef.current.rotation.z = Math.sin(Date.now() * 0.003) * 0.05;
      shipRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.15;
    }
  });

  return (
    <group ref={shipRef} position={[0, -0.5, 0]}>
      {/* Fuselage Body */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.6, 2.8, 5]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Wings */}
      <mesh position={[0, -0.2, 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.1, 2.2, 0.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Cockpit Glass */}
      <mesh position={[0, 0.4, 0.3]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.9} transparent opacity={0.85} />
      </mesh>

      {/* Engine Thruster Glow */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.1, 0.6, 12]} />
        <meshBasicMaterial color={speed > 500 ? '#f97316' : '#06b6d4'} />
      </mesh>
    </group>
  );
}

/**
 * Procedural Planet & Asteroid Field
 */
function PlanetMesh() {
  const planetRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group position={[12, 5, -25]}>
      {/* Planet Sphere */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[7, 32, 32]} />
        <meshStandardMaterial color="#10b981" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Planetary Atmosphere Glow */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[7, 32, 32]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.18} />
      </mesh>

      {/* Orbital Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[8.5, 11, 32]} />
        <meshBasicMaterial color="#059669" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/**
 * Warden Eye Scout Drone (Enemy)
 */
function WardenDroneMesh() {
  const wardenRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (wardenRef.current) {
      wardenRef.current.position.x = -6 + Math.sin(Date.now() * 0.002) * 2;
      wardenRef.current.position.y = 2 + Math.cos(Date.now() * 0.003) * 1;
    }
  });

  return (
    <group ref={wardenRef} position={[-6, 2, -10]}>
      {/* Floating Eye Sphere */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Red Glowing Oculus */}
      <mesh position={[0, 0, 0.6]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

export const SpaceCanvas: React.FC = () => {
  const {
    pilotName,
    units,
    nanites,
    hazardProtection,
    lifeSupportOxygen,
    activeHazardType,
    wardenHeatLevel,
    wardenThreatName,
    ships,
    activeShipIndex,
    fireMultiTool,
    triggerWardenEscalation,
    warpJumpToSystem,
    currentSystem,
  } = usePlayerStateStore();

  const [speed, setSpeed] = useState(320);
  const activeShip = ships[activeShipIndex] || ships[0];

  const handleThrustBoost = () => {
    setSpeed((s) => (s >= 800 ? 320 : s + 250));
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Three.js R3F Canvas */}
      <Canvas camera={{ position: [0, 1, 5], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 15]} intensity={1.4} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Stars radius={100} depth={50} count={3500} factor={4} saturation={0} fade speed={1.5} />
        <PlanetMesh />
        <WardenDroneMesh />
        <StarshipMesh speed={speed} />

        <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
      </Canvas>

      {/* Top HUD Overview */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center bg-slate-900/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700 shadow-xl text-xs font-bold text-slate-200">
        <div className="flex items-center gap-4">
          <div className="text-cyan-400 font-extrabold flex items-center gap-1.5">
            <Rocket size={16} /> {pilotName}
          </div>
          <div className="text-emerald-400">💰 {units.toLocaleString()} Units</div>
          <div className="text-purple-400">🔮 {nanites.toLocaleString()} Nanites</div>
        </div>

        {/* Hazard Protection & Life Support */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
            <Shield size={14} className="text-amber-400" />
            <span>Hazard ({activeHazardType}): <span className="text-amber-400">{hazardProtection}%</span></span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700">
            <Zap size={14} className="text-cyan-400" />
            <span>O2: <span className="text-cyan-400">{lifeSupportOxygen}%</span></span>
          </div>
        </div>
      </div>

      {/* Wardens Escalation Heat Banner */}
      <div className="absolute top-16 left-3 z-10 flex items-center gap-2 bg-rose-950/80 border border-rose-600 text-rose-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
        <AlertTriangle size={16} className="text-rose-400 animate-pulse" />
        <span>Warden Heat: <span className="text-rose-400">{wardenThreatName}</span></span>
        <button
          onClick={() => triggerWardenEscalation(1)}
          className="ml-2 px-2 py-0.5 bg-rose-700 hover:bg-rose-600 text-white rounded text-[10px] uppercase font-black"
        >
          Engage
        </button>
      </div>

      {/* Flight Control Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-end">
        {/* Ship Stats */}
        <div className="bg-slate-900/90 backdrop-blur-md p-3.5 rounded-xl border border-slate-700 text-xs text-slate-300 shadow-xl space-y-1">
          <div className="font-bold text-cyan-400 flex items-center gap-1.5">
            <Rocket size={16} /> {activeShip.name} ({activeShip.shipClass})
          </div>
          <div>Hull Integrity: <span className="text-emerald-400 font-bold">{activeShip.hullHp}%</span></div>
          <div>Hyperdrive Range: <span className="text-amber-400 font-bold">{activeShip.hyperdriveRangeLy} LY</span></div>
        </div>

        {/* Crosshair & Flight Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fireMultiTool()}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition uppercase"
          >
            <Crosshair size={16} /> Fire Lasers
          </button>
          <button
            onClick={handleThrustBoost}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition uppercase"
          >
            <Flame size={16} /> Thrust Boost ({speed} U/s)
          </button>
        </div>
      </div>
    </div>
  );
};
