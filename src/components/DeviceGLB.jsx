import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import cardContent from '../data/cardContent';

const PARTICLE_COLORS = ['#FFD503', '#5A8A9A', '#FF8C42', '#3D6575', '#00C9A7', '#FF6B8A'];

function FitCamera({ containerRef }) {
  const { camera, scene, gl } = useThree();
  const fitted = useRef(false);

  useFrame(() => {
    if (fitted.current) return;
    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const fitDim = size.x;
    const fov = camera.fov * (Math.PI / 180);
    const aspect = camera.aspect;
    const dist = (fitDim / 2) / (Math.tan(fov / 2) * aspect) * 1.3;
    camera.position.set(center.x, center.y, dist);
    camera.lookAt(center);
    camera.updateProjectionMatrix();

    // Calculate model top edge in screen pixels
    const topPoint = new THREE.Vector3(center.x, box.max.y, center.z);
    topPoint.project(camera);
    const canvasWidth = gl.domElement.clientWidth;
    const canvasHeight = gl.domElement.clientHeight;
    const topPx = (1 - topPoint.y) / 2 * canvasHeight;

    // Calculate model horizontal center in screen pixels
    const centerPoint = center.clone();
    centerPoint.project(camera);
    const centerXPx = (1 + centerPoint.x) / 2 * canvasWidth;

    if (containerRef?.current) {
      containerRef.current.style.setProperty('--model-top', `${topPx}px`);
      containerRef.current.style.setProperty('--model-center-x', `${centerXPx}px`);
    }

    fitted.current = true;
  });

  return null;
}

function GLBModel({ onClick }) {
  const { scene } = useGLTF('/device.glb');
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef();

  return (
    <group
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; }}
    >
      <primitive object={clonedScene} scale={10} />
    </group>
  );
}

export default function DeviceGLB({ insertedCard, contentIndex, isPlaying, onKnobClick, lang, isReceiving }) {
  const [ledsActive, setLedsActive] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [changing, setChanging] = useState(false);
  const [knobRotation, setKnobRotation] = useState(0);
  const [particles, setParticles] = useState([]);
  const [cardAnim, setCardAnim] = useState('');
  const containerRef = useRef(null);
  const glbCanvasRef = useRef(null);
  const prevCardRef = useRef(null);
  const particleIdRef = useRef(0);

  const data = insertedCard ? cardContent[insertedCard] : null;
  const items = data ? data.items[lang] || data.items['en'] : [];
  const currentItem = items[contentIndex] || null;

  useEffect(() => {
    if (insertedCard && insertedCard !== prevCardRef.current) {
      setKnobRotation(0);
      setCardAnim('animating');
      const t1 = setTimeout(() => setLedsActive(true), 350);
      const t2 = setTimeout(() => setScreenOn(true), 800);
      const t3 = setTimeout(() => spawnParticles(), 950);
      const t4 = setTimeout(() => setCardAnim(''), 1200);
      prevCardRef.current = insertedCard;
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
    if (!insertedCard && prevCardRef.current) {
      setKnobRotation(0);
      setCardAnim('ejecting');
      setLedsActive(false);
      setScreenOn(false);
      const t = setTimeout(() => {
        setCardAnim('');
        prevCardRef.current = null;
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [insertedCard]);

  useEffect(() => {
    if (screenOn && currentItem) {
      setChanging(true);
      const t = setTimeout(() => setChanging(false), 400);
      return () => clearTimeout(t);
    }
  }, [contentIndex, insertedCard]);

  const handleKnobClick = useCallback(() => {
    if (!insertedCard) return;
    setKnobRotation((prev) => prev + 90);
    onKnobClick();
  }, [insertedCard, onKnobClick]);

  const spawnParticles = () => {
    const newParticles = Array.from({ length: 22 }, () => {
      const tx = (Math.random() - 0.5) * 200;
      const ty = (Math.random() - 0.5) * 130 - 40;
      const size = 3 + Math.random() * 6;
      return {
        id: particleIdRef.current++,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        tx, ty, size,
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  };

  return (
    <div className="device-container" ref={containerRef}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle burst"
          style={{
            background: p.color,
            left: '50%',
            top: '30px',
            width: p.size + 'px',
            height: p.size + 'px',
            '--tx': p.tx + 'px',
            '--ty': p.ty + 'px',
          }}
        />
      ))}

      <div className="device-3d-wrapper">
        <div
          ref={glbCanvasRef}
          className={`device-glb-canvas ${isPlaying ? 'playing' : ''} ${cardAnim === 'animating' ? 'receiving' : ''}`}
        >

          {(isReceiving || cardAnim === 'animating') && (
            <div className="slot-glow" />
          )}

          {insertedCard && data && (
            <div className="peeking-card">
              {data.cardImage ? (
                <img src={data.cardImage} alt={data.title} className="peeking-card-img" draggable={false} />
              ) : (
                <div className="peeking-card-gradient" style={{ background: data.bg }}>
                  <span>{data.icon}</span>
                </div>
              )}
            </div>
          )}

          <Canvas
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <directionalLight position={[-3, 2, 4]} intensity={0.5} color="#FFD503" />
            <Suspense fallback={null}>
              <GLBModel onClick={handleKnobClick} />
              <FitCamera containerRef={glbCanvasRef} />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}

useGLTF.preload('/device.glb');
