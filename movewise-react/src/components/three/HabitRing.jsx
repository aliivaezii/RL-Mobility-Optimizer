import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function Ring({ activeCount = 5, total = 14 }) {
  const ref = useRef();
  const ratio = activeCount / total;

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.08;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.12;
    }
  });

  const dots = useMemo(() => {
    return Array.from({ length: total }, (_, i) => {
      const angle = (i / total) * Math.PI * 2;
      const active = i < activeCount;
      return {
        x: Math.cos(angle) * 1.05,
        y: Math.sin(angle) * 1.05,
        active,
      };
    });
  }, [activeCount, total]);

  return (
    <group ref={ref}>
      {/* Background ring */}
      <mesh>
        <torusGeometry args={[1, 0.04, 8, 64]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.3} />
      </mesh>
      {/* Active arc */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1, 0.08, 12, 64, ratio * Math.PI * 2]} />
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      {/* Glow arc */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1, 0.18, 8, 64, ratio * Math.PI * 2]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.08} />
      </mesh>
      {/* Segment dots */}
      {dots.map((d, i) => (
        <mesh key={i} position={[d.x, d.y, 0]}>
          <sphereGeometry args={[d.active ? 0.055 : 0.025, 8, 8]} />
          <meshStandardMaterial
            color={d.active ? "#4ade80" : "#94a3b8"}
            emissive={d.active ? "#4ade80" : "#000"}
            emissiveIntensity={d.active ? 0.4 : 0}
          />
        </mesh>
      ))}
      {/* Center glow */}
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={ratio * 0.3} />
      </mesh>
    </group>
  );
}

export default function HabitRing({ activeCount = 5, total = 14 }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.8], fov: 42 }}
      style={{ width: "100%", height: "140px" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={0.5} />
      <Ring activeCount={activeCount} total={total} />
    </Canvas>
  );
}
