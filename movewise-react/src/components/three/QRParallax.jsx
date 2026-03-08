import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Layers() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.025;
      ref.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.03;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
    }
  });

  return (
    <group ref={ref}>
      {/* Layered depth planes */}
      {[0, 0.18, 0.36].map((z, i) => (
        <mesh key={i} position={[0, 0, z]}>
          <planeGeometry args={[2.6 - i * 0.4, 2.6 - i * 0.4]} />
          <meshBasicMaterial
            color={["#dc7814", "#ff9f43", "#ffcc80"][i]}
            transparent
            opacity={0.06 - i * 0.015}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Corner accent dots */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y], i) => (
        <mesh key={`c${i}`} position={[x, y, 0.4]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshBasicMaterial color="#ffcc80" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Subtle floating particles */}
      {[...Array(12)].map((_, i) => (
        <mesh key={`p${i}`} position={[(Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0.2 + Math.random() * 0.3]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshBasicMaterial color="#dc7814" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function QRParallax() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 50 }}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
      gl={{ alpha: true }}
    >
      <Layers />
    </Canvas>
  );
}
