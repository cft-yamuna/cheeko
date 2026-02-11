import { useState, useEffect, useRef, useCallback } from 'react';
import cardContent from '../data/cardContent';

const PARTICLE_COLORS = ['#FFD503', '#E8423F', '#FF8C42', '#7C5CFC', '#00C9A7', '#FF6B8A'];

export default function Device({ insertedCard, contentIndex, isPlaying, onKnobClick, lang }) {
  const [ledsActive, setLedsActive] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [changing, setChanging] = useState(false);
  const [knobRotation, setKnobRotation] = useState(0);
  const [particles, setParticles] = useState([]);
  const [cardAnim, setCardAnim] = useState('');
  const containerRef = useRef(null);
  const prevCardRef = useRef(null);
  const particleIdRef = useRef(0);

  const data = insertedCard ? cardContent[insertedCard] : null;
  const items = data ? data.items[lang] || data.items['en'] : [];
  const currentItem = items[contentIndex] || null;

  useEffect(() => {
    if (insertedCard && insertedCard !== prevCardRef.current) {
      setCardAnim('animating');
      const t1 = setTimeout(() => setLedsActive(true), 300);
      const t2 = setTimeout(() => {
        setScreenOn(true);
        spawnParticles();
      }, 800);
      prevCardRef.current = insertedCard;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    if (!insertedCard && prevCardRef.current) {
      setCardAnim('ejecting');
      setLedsActive(false);
      setScreenOn(false);
      const t = setTimeout(() => {
        setCardAnim('');
        prevCardRef.current = null;
      }, 800);
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
    const newParticles = Array.from({ length: 15 }, () => {
      const tx = (Math.random() - 0.5) * 150;
      const ty = (Math.random() - 0.5) * 100 - 30;
      return {
        id: particleIdRef.current++,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        tx, ty,
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  return (
    <div className="device-container" ref={containerRef}>
      {/* Inserting/Ejecting Card */}
      {(cardAnim || insertedCard) && data && (
        <div className={`inserting-card ${cardAnim}`}>
          <div className="inserting-card-inner" style={{ background: data.bg }}>
            <div className="card-icon">{data.icon}</div>
            <div className="card-label">{data.title}</div>
          </div>
        </div>
      )}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle burst"
          style={{
            background: p.color,
            left: '50%',
            top: '30px',
            '--tx': p.tx + 'px',
            '--ty': p.ty + 'px',
          }}
        />
      ))}

      {/* 3D Device */}
      <div className="device-3d-wrapper">
        {/* Left shadow edge for 3D depth */}
        <div className="device-shadow-edge" />

        {/* Main device body */}
        <div className={`device ${isPlaying ? 'playing' : ''}`}>
          {/* Card Slot */}
          <div className="card-slot">
            <div className="slot-opening" />
          </div>

          {/* 3 dark indicator dots */}
          <div className="device-leds">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`led ${ledsActive ? 'active' : ''}`} style={{ transitionDelay: `${i * 0.15}s` }} />
            ))}
          </div>

          {/* Screen - large dark rounded rectangle */}
          <div className={`device-screen ${screenOn ? 'on' : ''}`}>
            {!screenOn && (
              <div className="screen-off-text">Insert a card</div>
            )}
            {screenOn && currentItem && (
              <div className={`screen-content ${changing ? 'changing' : ''}`}>
                <div className="content-title">{currentItem.title}</div>
                <div className="content-body">{currentItem.text}</div>
                <div className="content-index">{contentIndex + 1} / {items.length}</div>
              </div>
            )}
          </div>

          {/* Dark circular knob - centered */}
          <div className="device-knob-area">
            <div
              className={`knob ${!insertedCard ? 'disabled' : ''}`}
              title="Click to play next content"
              role="button"
              tabIndex={insertedCard ? 0 : -1}
              aria-label="Play next content"
              onClick={handleKnobClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleKnobClick(); } }}
              style={{ transform: `rotate(${knobRotation}deg)` }}
            >
              <div className="knob-ring" />
              <div className="knob-center" />
              <div className="knob-indicator" />
            </div>
            <div className="knob-label">NEXT &#8635;</div>
          </div>

          {/* Speaker grille - bottom left, diagonal dark lines */}
          <div className="device-speaker">
            <div className="speaker-grille">
              <span /><span /><span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      </div>

      {/* Sound Waves */}
      <div className={`sound-waves ${isPlaying ? 'active' : ''}`}>
        <div className="wave w1" />
        <div className="wave w2" />
        <div className="wave w3" />
      </div>
    </div>
  );
}
