import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Arc({ selected = 0 }) {
  const ref = useRef();
  const colors = ["#4ade80", "#fbbf24", "#38bdf8"];

  const curve = useMemo(() => {
    const h = [1.8, 1.0, 2.2][selected] || 1.8;
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-2.8, -0.4, 0),
      new THREE.Vector3(0, h, -0.6),
      new THREE.Vector3(2.8, -0.4, 0)
    );
  }, [selected]);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.04, 8, false);
  }, [curve]);

  const trailGeo = useMemo(() => {
    return new THREE.TubeGeometry(curve, 64, 0.12, 8, false);
  }, [curve]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
    }
  });

  return (
    <group ref={ref}>
      {/* Ground grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[7, 3]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.15} />
      </mesh>
      {[...Array(6)].map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(i - 2.5) * 1.2, -0.49, 0]}>
          <planeGeometry args={[0.01, 3]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.2} />
        </mesh>
      ))}

      {/* Glow trail */}
      <mesh geometry={trailGeo}>
        <meshBasicMaterial color={colors[selected]} transparent opacity={0.1} />
      </mesh>
      {/* Main arc */}
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial
          color={colors[selected]}
          emissive={colors[selected]}
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Start: Caselle */}
      <group position={[-2.8, -0.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#22c55e" transparent opacity={0.15} />
        </mesh>
      </group>

      {/* Midpoint: Transfer */}
      <group position={[0, curve.getPoint(0.5).y, -0.6]}>
        <mesh>
          <octahedronGeometry args={[0.08]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* End: Orbassano */}
      <group position={[2.8, -0.4, 0]}>
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
        </mesh>
      </group>
    </group>
  );
}

export default function RouteArc({ selected = 0 }) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 4.5], fov: 42 }}
      style={{ width: "100%", height: "150px", borderRadius: "16px" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 4, 3]} intensity={0.4} />
      <Arc selected={selected} />
    </Canvas>
  );
}
