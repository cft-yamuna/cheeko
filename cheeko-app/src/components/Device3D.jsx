import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/* ======== 3D CHEEKO DEVICE ======== */
function CheekDevice({ isHovered }) {
  const groupRef = useRef();
  const knobRef = useRef();
  const cardRef = useRef();
  const [knobAngle, setKnobAngle] = useState(0);

  // Gentle idle rotation
  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.15 + (isHovered ? 0.3 : 0);
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.03;
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
    }
    // Knob slow rotation
    if (knobRef.current) {
      setKnobAngle((prev) => prev + 0.005);
      knobRef.current.rotation.z = knobAngle;
    }
    // Card bobbing
    if (cardRef.current) {
      const t = state.clock.elapsedTime;
      cardRef.current.position.y = 1.72 + Math.sin(t * 1.5) * 0.06;
    }
  });

  const deviceBlack = '#1a1a1a';
  const accentOrange = '#D4870E';
  const screenGreen = '#003300';

  return (
    <group ref={groupRef} scale={1.3}>
      {/* Main body */}
      <RoundedBox args={[1.2, 2.2, 0.45]} radius={0.12} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color={deviceBlack} roughness={0.3} metalness={0.6} />
      </RoundedBox>

      {/* Front face plate (slightly raised) */}
      <RoundedBox args={[1.05, 2.05, 0.08]} radius={0.08} smoothness={4} position={[0, 0, 0.2]}>
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} />
      </RoundedBox>

      {/* Card slot */}
      <mesh position={[0, 1.12, 0.18]}>
        <boxGeometry args={[0.5, 0.06, 0.12]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>

      {/* RFID Card poking out */}
      <group ref={cardRef}>
        <RoundedBox args={[0.42, 0.55, 0.03]} radius={0.04} smoothness={4} position={[0, 1.72, 0.18]}>
          <meshStandardMaterial color="#FF6B8A" roughness={0.5} metalness={0.2} />
        </RoundedBox>
        {/* Card stripe */}
        <mesh position={[0, 1.6, 0.2]}>
          <boxGeometry args={[0.3, 0.04, 0.01]} />
          <meshStandardMaterial color="#FF8FA3" roughness={0.5} />
        </mesh>
      </group>

      {/* LEDs */}
      {[-0.18, 0, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.85, 0.25]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial
            color={accentOrange}
            emissive={accentOrange}
            emissiveIntensity={1.5 + Math.sin(Date.now() * 0.003 + i) * 0.5}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Screen */}
      <RoundedBox args={[0.8, 0.55, 0.04]} radius={0.04} smoothness={4} position={[0, 0.45, 0.23]}>
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.3} />
      </RoundedBox>
      {/* Screen glass */}
      <RoundedBox args={[0.72, 0.47, 0.02]} radius={0.03} smoothness={4} position={[0, 0.45, 0.26]}>
        <meshStandardMaterial
          color={screenGreen}
          emissive="#00ff44"
          emissiveIntensity={0.15}
          roughness={0.1}
          metalness={0.3}
        />
      </RoundedBox>

      {/* Knob */}
      <group position={[0, -0.2, 0.25]} ref={knobRef}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
          <meshStandardMaterial color={accentOrange} roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Knob indicator dot */}
        <mesh position={[0, 0.051, 0.12]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
        </mesh>
      </group>

      {/* Speaker grille lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`sp-${i}`} position={[0, -0.65 - i * 0.07, 0.24]}>
          <boxGeometry args={[0.45 - Math.abs(i - 2) * 0.06, 0.02, 0.02]} />
          <meshStandardMaterial color={accentOrange} roughness={0.4} metalness={0.6} opacity={0.6} transparent />
        </mesh>
      ))}
    </group>
  );
}

/* ======== FLOATING CARD ELEMENTS ======== */
function FloatingCard({ position, color, rotation, children }) {
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position} rotation={rotation}>
        <RoundedBox args={[0.5, 0.7, 0.03]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color={color} roughness={0.4} metalness={0.2} />
        </RoundedBox>
      </group>
    </Float>
  );
}

/* ======== MAIN CANVAS ======== */
export default function Device3D({ className = '' }) {
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Fallback for very low-end devices
  if (isMobile) {
    return (
      <div className={`device3d-fallback ${className}`}>
        <div className="fallback-device">
          <div className="fb-slot-area">
            <div className="fb-card-poking"><span>&#127925;</span></div>
            <div className="fb-slot" />
          </div>
          <div className="fb-leds"><span /><span /><span /></div>
          <div className="fb-screen"><span>&#9835; Rhyme Time</span></div>
          <div className="fb-knob"><div className="fb-knob-dot" /></div>
          <div className="fb-speaker"><span /><span /><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`device3d-canvas ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 2, 4]} intensity={0.5} color="#FFD503" />
        <pointLight position={[0, -1, 3]} intensity={0.4} color="#D4870E" />

        <CheekDevice isHovered={hovered} />

        {/* Floating cards */}
        <FloatingCard position={[-1.8, 0.8, -0.5]} color="#FF6B8A" rotation={[0, 0.3, -0.1]} />
        <FloatingCard position={[1.9, 0.3, -0.3]} color="#7C5CFC" rotation={[0, -0.2, 0.1]} />
        <FloatingCard position={[-1.5, -0.7, -0.2]} color="#00C9A7" rotation={[0, 0.2, 0.15]} />

        <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={4} blur={2.5} far={4} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
