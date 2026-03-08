import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function Trophy({ spinning }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;
    if (spinning) {
      ref.current.rotation.y += 0.12;
    } else {
      ref.current.rotation.y += 0.005;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
    }
  });

  return (
    <group ref={ref}>
      {/* Base */}
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.18, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.85} roughness={0.15} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.07, 0.12, 0.5, 8]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cup */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.38, 0.12, 0.65, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Handles */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.42, 0.2, 0]} rotation={[0, 0, side * 0.3]}>
          <torusGeometry args={[0.12, 0.025, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Star */}
      <mesh position={[0, 0.7, 0]}>
        <octahedronGeometry args={[0.1]} />
        <meshStandardMaterial color="#fff" emissive="#fbbf24" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

export default function TrophyScene({ spinning = false }) {
  return (
    <Canvas
      camera={{ position: [0, 0.1, 2.5], fov: 38 }}
      style={{ width: "100%", height: "120px" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 4]} intensity={0.7} />
      <pointLight position={[-2, 1, -1]} intensity={0.25} color="#fbbf24" />
      <Trophy spinning={spinning} />
    </Canvas>
  );
}
