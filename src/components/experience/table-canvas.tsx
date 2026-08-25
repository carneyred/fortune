"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { useLowPower, usePrefersReducedMotion } from "@/hooks/use-prefers";
import { assetPath } from "@/lib/asset-path";

type TableCanvasProps = {
  reveal: boolean;
  intensity?: number;
};

function Candle({ position }: { position: [number, number, number] }) {
  const light = useRef<THREE.PointLight>(null);
  const flame = useRef<THREE.Mesh>(null);
  const reduced = usePrefersReducedMotion();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flicker = reduced
      ? 1
      : 1 + Math.sin(t * 8.2) * 0.07 + Math.sin(t * 17.4) * 0.045;
    if (light.current) light.current.intensity = 6.4 * flicker;
    if (flame.current) {
      flame.current.scale.set(0.85 + flicker * 0.12, 1.1 * flicker, 0.85);
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.045, 0.055, 0.42, 12]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
      </mesh>
      <mesh ref={flame} position={[0, 0.46, 0]}>
        <coneGeometry args={[0.035, 0.12, 8]} />
        <meshBasicMaterial color="#ffb066" />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 0.52, 0]}
        color="#ffb066"
        distance={9}
        decay={2}
      />
    </group>
  );
}

function RisingField({
  count,
  color,
  origin,
  spread,
  speed,
}: {
  count: number;
  color: string;
  origin: [number, number, number];
  spread: number;
  speed: number;
}) {
  const points = useRef<THREE.Points>(null);
  const seeds = useMemo(() => {
    const unit = (n: number) => {
      const x = Math.sin(n * 127.1 + count * 13.7) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, index) => ({
      x: origin[0] + (unit(index + 1) - 0.5) * spread,
      y: origin[1] + unit(index + 17) * 1.4,
      z: origin[2] + (unit(index + 31) - 0.5) * spread,
      phase: unit(index + 53) * Math.PI * 2,
    }));
  }, [count, origin, spread]);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    seeds.forEach((seed, index) => {
      positions[index * 3] = seed.x;
      positions[index * 3 + 1] = seed.y;
      positions[index * 3 + 2] = seed.z;
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, seeds]);

  useFrame(({ clock }) => {
    const attr = points.current?.geometry.getAttribute("position");
    if (!attr) return;
    const t = clock.elapsedTime;
    seeds.forEach((seed, index) => {
      const y = ((seed.y + t * speed + seed.phase) % 1.8) + origin[1];
      attr.setXYZ(
        index,
        seed.x + Math.sin(t * 0.6 + seed.phase) * 0.08,
        y,
        seed.z,
      );
    });
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.035}
        transparent
        opacity={0.28}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function TableScene({ reveal, intensity }: { reveal: boolean; intensity: number }) {
  const cameraTarget = useRef(new THREE.Vector3(0, 1.15, 3.8));
  const lookTarget = useRef(new THREE.Vector3(0, 0.15, 0));
  const reduced = usePrefersReducedMotion();

  useFrame(({ camera }) => {
    const desiredCam = reveal
      ? new THREE.Vector3(-1.35, 1.35, 3.35)
      : new THREE.Vector3(0, 1.15, 3.8);
    const desiredLook = reveal
      ? new THREE.Vector3(-0.2, 0.2, 0)
      : new THREE.Vector3(0, 0.15, 0);
    const lerp = reduced ? 1 : 0.035;
    cameraTarget.current.lerp(desiredCam, lerp);
    lookTarget.current.lerp(desiredLook, lerp);
    camera.position.copy(cameraTarget.current);
    camera.lookAt(lookTarget.current);
  });

  return (
    <>
      <color attach="background" args={["#070504"]} />
      <fog attach="fog" args={["#070504", 6, 14]} />
      <ambientLight intensity={0.08 * intensity} color="#4a3220" />
      <hemisphereLight args={["#3a2418", "#080604", 0.22 * intensity]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#1a100c" roughness={0.96} metalness={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.1]}>
        <ringGeometry args={[2.7, 2.74, 64]} />
        <meshBasicMaterial color="#3d2c18" transparent opacity={0.35} />
      </mesh>
      <Candle position={[1.85, 0, 0.55]} />
      <RisingField
        count={28}
        color="#9a8b7a"
        origin={[-1.7, 0.2, 0.4]}
        spread={0.18}
        speed={0.12}
      />
      <RisingField
        count={22}
        color="#ffb066"
        origin={[1.85, 0.45, 0.55]}
        spread={0.1}
        speed={0.16}
      />
      <RisingField
        count={40}
        color="#d8c7a4"
        origin={[0, 0.4, 0]}
        spread={3.4}
        speed={0.04}
      />
    </>
  );
}

export function TableCanvas({ reveal, intensity = 1 }: TableCanvasProps) {
  const lowPower = useLowPower();
  const reduced = usePrefersReducedMotion();

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={lowPower || reduced ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 1.15, 3.8], fov: 42 }}
        gl={{ antialias: !lowPower, alpha: false, powerPreference: "default" }}
      >
        <TableScene reveal={reveal} intensity={lowPower ? 0.75 : intensity} />
      </Canvas>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-multiply"
        style={{ backgroundImage: `url(${assetPath("/textures/table-wood.jpg")})` }}
      />
    </div>
  );
}
