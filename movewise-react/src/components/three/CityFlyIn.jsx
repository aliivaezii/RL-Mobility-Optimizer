import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function City() {
  const { camera } = useThree();
  const elapsed = useRef(0);
  const DURATION = 5.5;

  const buildings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 80; i++) {
      const z = -i * 1.2 - 3;
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (1.2 + Math.random() * 1.8);
      const h = 0.3 + Math.random() * 2.8;
      const w = 0.25 + Math.random() * 0.5;
      const hue = 140 + Math.random() * 80;
      arr.push({ x, z, h, w, color: `hsl(${hue}, 45%, ${22 + Math.random() * 18}%)` });
    }
    return arr;
  }, []);

  const roadDashes = useMemo(() => Array.from({ length: 40 }, (_, i) => -i * 2.5 - 1), []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    const t = Math.min(elapsed.current / DURATION, 1);
    const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    camera.position.z = 3 - ease * 95;
    camera.position.y = 1.8 + Math.sin(ease * Math.PI) * 0.6;
    camera.rotation.x = -0.12 - ease * 0.02;
  });

  return (
    <>
      {/* Sky/ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -45]}>
        <planeGeometry args={[10, 120]} />
        <meshBasicMaterial color="#0a1220" />
      </mesh>
      {/* Road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -45]}>
        <planeGeometry args={[1.8, 120]} />
        <meshBasicMaterial color="#1a2535" />
      </mesh>
      {/* Road center dashes */}
      {roadDashes.map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[0.06, 0.7]} />
          <meshBasicMaterial color="#3b5068" />
        </mesh>
      ))}
      {/* Buildings */}
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial color={b.color} />
        </mesh>
      ))}
      {/* Start: Caselle green marker */}
      <mesh position={[0, 0.4, 1]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
      <mesh position={[0, 0.4, 1]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.15} />
      </mesh>
      {/* Mode markers along route */}
      <mesh position={[-1.0, 0.25, -15]}>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color="#a3e635" emissive="#a3e635" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[1.2, 0.35, -40]}>
        <boxGeometry args={[0.7, 0.35, 1.2]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-0.8, 0.15, -70]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.3} />
      </mesh>
      {/* End: Orbassano blue marker */}
      <mesh position={[0, 0.4, -90]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, 0.4, -90]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
      </mesh>
    </>
  );
}

export default function CityFlyIn() {
  return (
    <Canvas
      camera={{ position: [0, 1.8, 3], fov: 50 }}
      style={{ position: "absolute", inset: 0, zIndex: 0 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.5} />
      <fog attach="fog" args={["#0a1628", 8, 45]} />
      <City />
    </Canvas>
  );
}
