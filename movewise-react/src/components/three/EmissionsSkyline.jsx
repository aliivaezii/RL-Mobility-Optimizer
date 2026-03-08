import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function Skyline({ data }) {
  const ref = useRef();

  const buildings = useMemo(() => {
    if (!data?.length) return [];
    const maxCO2 = Math.max(...data.map((d) => d.co2));
    return data.map((d, i) => ({
      height: (d.co2 / maxCO2) * 2.2,
      x: (i - (data.length - 1) / 2) * 1.3,
      color: d.color || "#94a3b8",
    }));
  }, [data]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.18;
    }
  });

  return (
    <group ref={ref} position={[0, -0.6, 0]}>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 2.5]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.15} />
      </mesh>

      {buildings.map((b, i) => (
        <group key={i}>
          {/* Building */}
          <mesh position={[b.x, b.height / 2, 0]}>
            <boxGeometry args={[0.65, b.height, 0.65]} />
            <meshStandardMaterial
              color={b.color}
              transparent
              opacity={0.88}
              metalness={0.2}
              roughness={0.7}
            />
          </mesh>
          {/* Windows */}
          {Array.from({ length: Math.floor(b.height * 3) }, (_, j) => (
            <mesh key={j} position={[b.x, 0.15 + j * 0.28, 0.33]}>
              <planeGeometry args={[0.1, 0.06]} />
              <meshBasicMaterial color="#fff" transparent opacity={0.25 + Math.random() * 0.15} />
            </mesh>
          ))}
          {/* Roof glow */}
          <mesh position={[b.x, b.height + 0.05, 0]}>
            <boxGeometry args={[0.68, 0.03, 0.68]} />
            <meshBasicMaterial color={b.color} transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function EmissionsSkyline({ data = [] }) {
  return (
    <Canvas
      camera={{ position: [0, 0.8, 4], fov: 38 }}
      style={{ width: "100%", height: "130px" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 3]} intensity={0.55} />
      <Skyline data={data} />
    </Canvas>
  );
}
