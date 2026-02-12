import { useState, useEffect, useRef, useCallback } from 'react';
import cardContent from '../data/cardContent';

const PARTICLE_COLORS = ['#FFD503', '#5A8A9A', '#FF8C42', '#3D6575', '#00C9A7', '#FF6B8A'];

export default function Device({ insertedCard, contentIndex, isPlaying, onKnobClick, lang, isReceiving }) {
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
      // Staggered reveal: LEDs → screen on → particles → done
      const t1 = setTimeout(() => setLedsActive(true), 350);
      const t2 = setTimeout(() => setScreenOn(true), 800);
      const t3 = setTimeout(() => spawnParticles(), 950);
      const t4 = setTimeout(() => setCardAnim(''), 1200);
      prevCardRef.current = insertedCard;
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
    if (!insertedCard && prevCardRef.current) {
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
      {/* Particles */}
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

      {/* 3D Device */}
      <div className="device-3d-wrapper">
        {/* Main device body */}
        <div className={`device ${isPlaying ? 'playing' : ''} ${cardAnim === 'animating' ? 'receiving' : ''}`}>

          {/* Slot glow — pulses while card approaches or inserts */}
          {(isReceiving || cardAnim === 'animating') && (
            <div className="slot-glow" />
          )}

          {/* Card peeking out of slot */}
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

          {/* Dark circular knob - centered with rotation arrows */}
          <div className="device-knob-area">
            <div className="knob-wrapper">
              {/* Left curved arrow — arcs up along left side */}
              <svg className="knob-arrow knob-arrow-left" width="20" height="60" viewBox="0 0 20 60" fill="none" aria-hidden="true">
                <path d="M14 55 A22 22 0 0 1 14 5" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M10 10 L14 3 L18 10" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
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
              {/* Right curved arrow — arcs down along right side */}
              <svg className="knob-arrow knob-arrow-right" width="20" height="60" viewBox="0 0 20 60" fill="none" aria-hidden="true">
                <path d="M6 5 A22 22 0 0 1 6 55" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M2 50 L6 57 L10 50" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
          </div>

          {/* Speaker grille - round shape lines */}
          <div className="device-speaker">
            <div className="speaker-grille">
              <span /><span /><span /><span /><span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
