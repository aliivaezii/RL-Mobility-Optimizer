import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function Cards({ activePlan = 0 }) {
  const groupRef = useRef();
  const cardsRef = useRef([]);

  const plans = [
    { color: "#22c55e" },
    { color: "#3b82f6" },
    { color: "#8b5cf6" },
  ];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.35) * 0.08;
    }
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      const offset = i - activePlan;
      const targetZ = i === activePlan ? 0.35 : -Math.abs(offset) * 0.1;
      const targetY = offset * 0.3;
      const targetRotX = i === activePlan ? 0 : offset * 0.08;
      const targetOpacity = i === activePlan ? 1 : 0.45;
      card.position.z += (targetZ - card.position.z) * 0.06;
      card.position.y += (targetY - card.position.y) * 0.06;
      card.rotation.x += (targetRotX - card.rotation.x) * 0.06;
      if (card.material) card.material.opacity += (targetOpacity - card.material.opacity) * 0.06;
    });
  });

  return (
    <group ref={groupRef}>
      {plans.map((plan, i) => (
        <group key={i}>
          <mesh
            ref={(el) => { cardsRef.current[i] = el; }}
            position={[0, (i - activePlan) * 0.3, i === activePlan ? 0.35 : -0.1]}
          >
            <boxGeometry args={[2.2, 1.3, 0.025]} />
            <meshStandardMaterial
              color={plan.color}
              metalness={0.5}
              roughness={0.5}
              transparent
              opacity={i === activePlan ? 1 : 0.45}
            />
          </mesh>
          {/* Card chip */}
          <mesh position={[-0.6, (i - activePlan) * 0.3 + 0.15, i === activePlan ? 0.37 : -0.07]}>
            <boxGeometry args={[0.25, 0.18, 0.005]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Card lines */}
          {[0, -0.15, -0.3].map((y, j) => (
            <mesh key={j} position={[0.3, (i - activePlan) * 0.3 + y, i === activePlan ? 0.37 : -0.07]}>
              <boxGeometry args={[0.8, 0.04, 0.003]} />
              <meshBasicMaterial color="#fff" transparent opacity={0.15} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function CardStack({ activePlan = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 42 }}
      style={{ width: "100%", height: "120px" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 2, 4]} intensity={0.5} />
      <Cards activePlan={activePlan} />
    </Canvas>
  );
}
