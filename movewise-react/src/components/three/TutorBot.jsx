import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Robot({ wave }) {
  const group = useRef();
  const armR = useRef();
  const antenna = useRef();
  const eyeL = useRef();
  const eyeR = useRef();

  const legL = useRef();
  const legR = useRef();
  const head = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // body bob + side lean + breathing scale
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.8) * 0.08;
      group.current.rotation.y = Math.sin(t * 0.6) * 0.15;
      group.current.rotation.z = Math.sin(t * 0.9) * 0.04;
      const breathe = 1 + Math.sin(t * 2.2) * 0.015;
      group.current.scale.set(breathe, breathe, breathe);
    }
    // head tilt — looks around curiously
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 1.2) * 0.1;
      head.current.rotation.x = Math.sin(t * 0.8) * 0.06;
    }
    // wave right arm — more energetic when waving
    if (armR.current) {
      armR.current.rotation.z = wave
        ? Math.sin(t * 5) * 0.6 - 0.8
        : Math.sin(t * 1.5) * 0.12 - 0.2;
    }
    // antenna wiggle — faster & bouncier
    if (antenna.current) {
      antenna.current.rotation.z = Math.sin(t * 4) * 0.2;
      antenna.current.rotation.x = Math.cos(t * 3) * 0.1;
    }
    // Blink eyes — more natural random-feeling blinks
    if (eyeL.current && eyeR.current) {
      const blinkCycle = Math.sin(t * 2.5) > 0.96 || Math.sin(t * 5.1) > 0.98;
      eyeL.current.scale.y = blinkCycle ? 0.1 : 1;
      eyeR.current.scale.y = blinkCycle ? 0.1 : 1;
    }
    // Leg bounce — gentle walking motion
    if (legL.current) legL.current.rotation.x = Math.sin(t * 2.5) * 0.15;
    if (legR.current) legR.current.rotation.x = Math.sin(t * 2.5 + Math.PI) * 0.15;
  });

  const bodyMat = new THREE.MeshStandardMaterial({ color: "#22c55e", metalness: 0.3, roughness: 0.4 });
  const headMat = new THREE.MeshStandardMaterial({ color: "#4ade80", metalness: 0.2, roughness: 0.3 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.5 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: "#1e293b" });
  const accentMat = new THREE.MeshStandardMaterial({ color: "#38bdf8", metalness: 0.5, roughness: 0.3 });
  const antennaMat = new THREE.MeshStandardMaterial({ color: "#facc15", emissive: "#facc15", emissiveIntensity: 0.4 });

  return (
    <group ref={group}>
      {/* Body */}
      <mesh position={[0, -0.3, 0]} material={bodyMat}>
        <boxGeometry args={[0.6, 0.7, 0.4]} />
      </mesh>
      {/* Chest light */}
      <mesh position={[0, -0.2, 0.21]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} />
      </mesh>

      {/* Head */}
      <group ref={head}>
        <mesh position={[0, 0.25, 0]} material={headMat}>
          <boxGeometry args={[0.5, 0.4, 0.35]} />
        </mesh>

      {/* Eyes */}
      <group position={[-0.12, 0.3, 0.18]} ref={eyeL}>
        <mesh material={eyeMat}>
          <sphereGeometry args={[0.07, 12, 12]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} material={pupilMat}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
      </group>
      <group position={[0.12, 0.3, 0.18]} ref={eyeR}>
        <mesh material={eyeMat}>
          <sphereGeometry args={[0.07, 12, 12]} />
        </mesh>
        <mesh position={[0, 0, 0.04]} material={pupilMat}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
      </group>

      {/* Mouth - smile */}
      <mesh position={[0, 0.15, 0.18]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.06, 0.015, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      </group>

      {/* Antenna */}
      <group ref={antenna} position={[0, 0.5, 0]}>
        <mesh material={accentMat}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        </mesh>
        <mesh position={[0, 0.13, 0]} material={antennaMat}>
          <sphereGeometry args={[0.05, 12, 12]} />
        </mesh>
      </group>

      {/* Left arm */}
      <mesh position={[-0.4, -0.3, 0]} rotation={[0, 0, 0.2]} material={accentMat}>
        <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
      </mesh>
      {/* Right arm (waving) */}
      <mesh ref={armR} position={[0.4, -0.15, 0]} rotation={[0, 0, -0.2]} material={accentMat}>
        <capsuleGeometry args={[0.06, 0.3, 4, 8]} />
      </mesh>

      {/* Legs */}
      <mesh ref={legL} position={[-0.15, -0.85, 0]} material={accentMat}>
        <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
      </mesh>
      <mesh ref={legR} position={[0.15, -0.85, 0]} material={accentMat}>
        <capsuleGeometry args={[0.06, 0.25, 4, 8]} />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.15, -1.05, 0.05]} material={bodyMat}>
        <boxGeometry args={[0.14, 0.06, 0.2]} />
      </mesh>
      <mesh position={[0.15, -1.05, 0.05]} material={bodyMat}>
        <boxGeometry args={[0.14, 0.06, 0.2]} />
      </mesh>
    </group>
  );
}

export default function TutorBot({ wave = false }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 40 }}
      style={{ width: "100%", height: 180 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 2]} intensity={1} />
      <pointLight position={[-2, 1, 1]} intensity={0.4} color="#4ade80" />
      <Robot wave={wave} />
    </Canvas>
  );
}
