import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Globe() {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x += 0.0008;
    }
  });

  const spherePoints = useMemo(() => {
    const count = 1600;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const green = new THREE.Color("#4ade80");
    const blue = new THREE.Color("#38bdf8");

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.6;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = Math.random() > 0.5 ? green : blue;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors };
  }, []);

  // Latitude lines
  const latLines = useMemo(() => {
    const lines = [];
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts = [];
      const phi = ((90 - lat) * Math.PI) / 180;
      for (let lon = 0; lon <= 360; lon += 5) {
        const theta = (lon * Math.PI) / 180;
        pts.push(
          new THREE.Vector3(
            1.6 * Math.sin(phi) * Math.cos(theta),
            1.6 * Math.cos(phi),
            1.6 * Math.sin(phi) * Math.sin(theta)
          )
        );
      }
      lines.push(pts);
    }
    return lines;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[1.58, 36, 36]} />
        <meshBasicMaterial
          color="#19547B"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>

      {/* Points on sphere surface */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={spherePoints.positions.length / 3}
            array={spherePoints.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={spherePoints.colors.length / 3}
            array={spherePoints.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>

      {/* Latitude rings */}
      {latLines.map((pts, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pts.length}
              array={new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#22783c" transparent opacity={0.12} />
        </line>
      ))}

      {/* Turin marker — glowing dot */}
      <mesh position={[0.55, 1.05, 1.0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
      <mesh position={[0.55, 1.05, 1.0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.25} />
      </mesh>

      {/* Ambient glow ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.75, 1.85, 64]} />
        <meshBasicMaterial
          color="#22783c"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function FloatingDust() {
  const ref = useRef();
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#22783c"
        size={0.025}
        transparent
        opacity={0.2}
        sizeAttenuation
      />
    </points>
  );
}

export default function GlobeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.3} />
      <Globe />
      <FloatingDust />
    </Canvas>
  );
}
