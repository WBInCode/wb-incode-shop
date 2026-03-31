"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingParticles({ count = 300 }) {
  const mesh = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, [count]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.03;
    mesh.current.rotation.x += delta * 0.01;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#30e87a"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function WireframeShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.05;
    groupRef.current.rotation.z += delta * 0.02;
  });

  const shapes = useMemo(() => {
    return [
      { position: [-3, 2, -5] as [number, number, number], scale: 1.2, speed: 0.3 },
      { position: [4, -1, -4] as [number, number, number], scale: 0.8, speed: 0.5 },
      { position: [-1, -3, -6] as [number, number, number], scale: 1.5, speed: 0.2 },
      { position: [2, 3, -7] as [number, number, number], scale: 0.6, speed: 0.4 },
      { position: [-4, -2, -3] as [number, number, number], scale: 1.0, speed: 0.35 },
    ];
  }, []);

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <FloatingShape key={i} {...shape} index={i} />
      ))}
    </group>
  );
}

function FloatingShape({
  position,
  scale,
  speed,
  index,
}: {
  position: [number, number, number];
  scale: number;
  speed: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(t * speed + index) * 0.5;
    meshRef.current.rotation.x = t * speed * 0.5;
    meshRef.current.rotation.z = t * speed * 0.3;
  });

  const geometries = [
    <icosahedronGeometry key="ico" args={[scale * 0.5, 0]} />,
    <octahedronGeometry key="oct" args={[scale * 0.5, 0]} />,
    <tetrahedronGeometry key="tet" args={[scale * 0.5, 0]} />,
    <dodecahedronGeometry key="dod" args={[scale * 0.4, 0]} />,
    <boxGeometry key="box" args={[scale * 0.5, scale * 0.5, scale * 0.5]} />,
  ];

  return (
    <mesh ref={meshRef} position={position}>
      {geometries[index % geometries.length]}
      <meshBasicMaterial
        color="#30e87a"
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

export default function Scene3DBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <FloatingParticles />
        <WireframeShapes />
      </Canvas>
    </div>
  );
}
