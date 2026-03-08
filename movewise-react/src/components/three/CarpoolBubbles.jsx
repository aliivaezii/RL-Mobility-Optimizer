import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Bubbles({ matches }) {
  const ref = useRef();

  const bubbles = useMemo(() => {
    const list = matches || [];
    return list.map((m, i) => {
      const angle = (i / Math.max(list.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const dist = 1.1 + Math.random() * 0.3;
      return {
        pos: [Math.cos(angle) * dist, Math.sin(angle) * dist, 0],
        overlap: (m.overlap || 50) / 100,
        color: ["#a78bfa", "#c084fc", "#818cf8", "#7c3aed"][i % 4],
        size: 0.12 + ((m.overlap || 50) / 100) * 0.13,
      };
    });
  }, [matches]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 0.04;
      ref.current.children.forEach((child, i) => {
        if (child.userData?.float) {
          child.position.y += Math.sin(state.clock.elapsedTime * 0.7 + i * 2) * 0.0008;
        }
      });
    }
  });

  return (
    <group ref={ref}>
      {/* User at center */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.08} />
      </mesh>

      {/* Match bubbles + link lines */}
      {bubbles.map((b, i) => (
        <group key={i} userData={{ float: true }}>
          {/* Connection line */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, 0, 0, ...b.pos])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color={b.color} transparent opacity={b.overlap * 0.5 + 0.1} />
          </line>
          {/* Bubble */}
          <mesh position={b.pos}>
            <sphereGeometry args={[b.size, 16, 16]} />
            <meshStandardMaterial color={b.color} transparent opacity={0.85} />
          </mesh>
          {/* Glow */}
          <mesh position={b.pos}>
            <sphereGeometry args={[b.size + 0.06, 16, 16]} />
            <meshBasicMaterial color={b.color} transparent opacity={0.12} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function CarpoolBubbles({ matches = [] }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 42 }}
      style={{ width: "100%", height: "140px" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 2, 3]} intensity={0.4} />
      <Bubbles matches={matches} />
    </Canvas>
  );
}
