import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Device from './Device';
import RFIDCard from './RFIDCard';
import cardContent, { allCardIds } from '../data/cardContent';
import '../styles/DemoPage.css';

const LANG_MAP = { en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN' };

export default function DemoPage({ userName, userLang, onBack, onCart }) {
  const [insertedCard, setInsertedCard] = useState(null);
  const [contentIndex, setContentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flyingCard, setFlyingCard] = useState(null);
  const [droppingCard, setDroppingCard] = useState(null);
  const deviceRef = useRef(null);
  const animatingRef = useRef(false);

  // Derived now-playing data
  const currentData = insertedCard ? cardContent[insertedCard] : null;
  const currentItems = useMemo(() => {
    if (!currentData) return [];
    return currentData.items[userLang] || currentData.items['en'];
  }, [currentData, userLang]);
  const currentItem = currentItems[contentIndex] || null;

  // Step bar: which step is active
  const activeStep = !insertedCard ? 1 : (flyingCard || droppingCard) ? 2 : 3;

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { stopSpeech(); onBack(); }
      if (e.key === ' ' && insertedCard) { e.preventDefault(); handleKnobClick(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [insertedCard, contentIndex]);

  const speakContent = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.lang = LANG_MAP[userLang] || 'en-US';
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find((v) => v.lang.startsWith(utterance.lang));
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  }, [userLang]);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const playContent = useCallback((cardId, index) => {
    const data = cardContent[cardId];
    const items = data.items[userLang] || data.items['en'];
    const item = items[index];
    if (item) setTimeout(() => speakContent(item.speech), 500);
  }, [userLang, speakContent]);

  // Launch the flying card arc animation
  const launchFlyingCard = useCallback((cardId, cardEl, onDone) => {
    if (!cardEl || !deviceRef.current) { onDone(); return; }

    const cardRect = cardEl.getBoundingClientRect();
    const deviceRect = deviceRef.current.getBoundingClientRect();

    const startX = cardRect.left + cardRect.width / 2;
    const startY = cardRect.top + cardRect.height / 2;
    const endX = deviceRect.left + deviceRect.width / 2;
    const endY = deviceRect.top - 10;

    const flyW = cardRect.width * 0.7;
    const flyH = cardRect.height * 0.7;

    setFlyingCard({ cardId, startX, startY, endX, endY, width: flyW, height: flyH });

    setTimeout(() => {
      setFlyingCard(null);
      onDone();
    }, 1800);
  }, []);

  // Drop card straight down into device (for drag)
  const dropCardIntoDevice = useCallback((cardId, onDone) => {
    if (!deviceRef.current) { onDone(); return; }
    const deviceRect = deviceRef.current.getBoundingClientRect();
    const endX = deviceRect.left + deviceRect.width / 2;
    const startY = deviceRect.top - 120;
    const endY = deviceRect.top - 10;
    const flyW = 80;
    const flyH = 110;

    setDroppingCard({ cardId, x: endX, startY, endY, width: flyW, height: flyH });

    setTimeout(() => {
      setDroppingCard(null);
      onDone();
    }, 1100);
  }, []);

  const handleCardClick = useCallback((cardId, cardEl) => {
    if (animatingRef.current) return;

    // Click inserted card → eject it
    if (insertedCard === cardId) {
      stopSpeech();
      setInsertedCard(null);
      setContentIndex(0);
      return;
    }

    animatingRef.current = true;
    stopSpeech();

    const doInsert = () => {
      launchFlyingCard(cardId, cardEl, () => {
        setInsertedCard(cardId);
        setContentIndex(0);
        setTimeout(() => playContent(cardId, 0), 400);
        animatingRef.current = false;
      });
    };

    if (insertedCard) {
      setInsertedCard(null);
      setContentIndex(0);
      setTimeout(doInsert, 300);
    } else {
      doInsert();
    }
  }, [insertedCard, playContent, launchFlyingCard]);

  const handleCardDrag = useCallback((cardId) => {
    if (animatingRef.current) return;
    if (insertedCard === cardId) return;

    animatingRef.current = true;
    stopSpeech();

    if (insertedCard) {
      setInsertedCard(null);
      setContentIndex(0);
    }

    dropCardIntoDevice(cardId, () => {
      setInsertedCard(cardId);
      setContentIndex(0);
      setTimeout(() => playContent(cardId, 0), 400);
      animatingRef.current = false;
    });
  }, [insertedCard, playContent, dropCardIntoDevice]);

  const handleKnobClick = useCallback(() => {
    if (!insertedCard) return;
    const data = cardContent[insertedCard];
    const items = data.items[userLang] || data.items['en'];
    const nextIndex = (contentIndex + 1) % items.length;
    stopSpeech();
    setContentIndex(nextIndex);
    setTimeout(() => playContent(insertedCard, nextIndex), 400);
  }, [insertedCard, contentIndex, userLang, playContent]);

  const handlePrevContent = useCallback(() => {
    if (!insertedCard) return;
    const data = cardContent[insertedCard];
    const items = data.items[userLang] || data.items['en'];
    const prevIndex = (contentIndex - 1 + items.length) % items.length;
    stopSpeech();
    setContentIndex(prevIndex);
    setTimeout(() => playContent(insertedCard, prevIndex), 400);
  }, [insertedCard, contentIndex, userLang, playContent]);

  const handleTrackClick = useCallback((index) => {
    if (!insertedCard) return;
    if (index === contentIndex) return;
    stopSpeech();
    setContentIndex(index);
    setTimeout(() => playContent(insertedCard, index), 400);
  }, [insertedCard, contentIndex, playContent]);

  const handleEject = useCallback(() => {
    if (!insertedCard) return;
    stopSpeech();
    setInsertedCard(null);
    setContentIndex(0);
  }, [insertedCard]);

  const handleBack = useCallback(() => {
    stopSpeech();
    setInsertedCard(null);
    setContentIndex(0);
    onBack();
  }, [onBack]);

  return (
    <div className="demo-page">
      {/* Header */}
      <header className="demo-page-header">
        <div className="container demo-header-inner">
          <motion.button
            className="demo-back-btn"
            onClick={handleBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span className="back-text">Back</span>
          </motion.button>

          <div className="demo-logo">
            <span className="logo-cheeko">CHEEKO</span>
            <span className="logo-star">&#10038;</span>
          </div>

          <div className="demo-header-right">
            <motion.button
              className="demo-cart-btn"
              onClick={onCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Buy Now"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span className="cart-btn-text">Buy Now</span>
            </motion.button>
            <div className="demo-user-badge">
              <span className="user-avatar">{userName[0]?.toUpperCase()}</span>
              <span className="user-name">{userName}</span>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Step Bar */}
      <div className="how-it-works-bar">
        <div className="hiw-steps">
          <div className={`hiw-step ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'done' : ''}`}>
            <span className="hiw-num">1</span>
            <span className="hiw-label">Pick a Card</span>
          </div>
          <div className="hiw-connector">
            <span className="hiw-dot" style={{ animationDelay: '0s' }} />
            <span className="hiw-dot" style={{ animationDelay: '0.2s' }} />
            <span className="hiw-dot" style={{ animationDelay: '0.4s' }} />
          </div>
          <div className={`hiw-step ${activeStep === 2 ? 'active' : ''} ${activeStep > 2 ? 'done' : ''}`}>
            <span className="hiw-num">2</span>
            <span className="hiw-label">Insert</span>
          </div>
          <div className="hiw-connector">
            <span className="hiw-dot" style={{ animationDelay: '0.1s' }} />
            <span className="hiw-dot" style={{ animationDelay: '0.3s' }} />
            <span className="hiw-dot" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className={`hiw-step ${activeStep === 3 ? 'active' : ''}`}>
            <span className="hiw-num">3</span>
            <span className="hiw-label">Listen</span>
          </div>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <main className="demo-main">
        <div className="demo-grid">
          {/* LEFT: Card Panel */}
          <div className="card-panel">
            <div className="card-panel-header">
              <span className="card-panel-label">Your Cards</span>
              <span className="card-panel-hint">Click or drag to device</span>
            </div>
            <div className="card-panel-grid">
              {allCardIds.map((id, i) => {
                const data = cardContent[id];
                const items = data.items[userLang] || data.items['en'];
                const isActive = insertedCard === id;
                return (
                  <motion.div
                    key={id}
                    className={`card-tile ${isActive ? 'card-tile-active' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="card-tile-img">
                      <RFIDCard
                        cardId={id}
                        isInserted={isActive}
                        onCardClick={handleCardClick}
                        onDragToDevice={handleCardDrag}
                        deviceRef={deviceRef}
                      />
                      {isActive && <span className="card-tile-badge">Playing</span>}
                    </div>
                    <div className="card-tile-info">
                      <span className="card-tile-icon">{data.icon}</span>
                      <span className="card-tile-title">{data.title}</span>
                      <span className="card-tile-count">{items.length} tracks</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CENTER: Device Hero */}
          <div className="device-hero">
            {/* Animated rings behind device */}
            <div className="device-ring device-ring-1" aria-hidden="true" />
            <div className="device-ring device-ring-2" aria-hidden="true" />
            <div className="device-ring device-ring-3" aria-hidden="true" />

            {/* Spotlight glow */}
            <div className="device-spotlight" aria-hidden="true" />

            <motion.div
              ref={deviceRef}
              className="demo-device-wrap"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <Device
                insertedCard={insertedCard}
                contentIndex={contentIndex}
                isPlaying={isPlaying}
                onKnobClick={handleKnobClick}
                lang={userLang}
                isReceiving={!!flyingCard || !!droppingCard}
              />
            </motion.div>

            {/* Device pedestal / surface shadow */}
            <div className="device-pedestal" aria-hidden="true" />
          </div>

          {/* RIGHT: Now Playing Panel */}
          <div className="now-playing-panel">
            <AnimatePresence mode="wait">
              {!insertedCard ? (
                <motion.div
                  key="np-empty"
                  className="np-empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="np-empty-visual">
                    <div className="np-empty-card-anim">
                      <div className="np-empty-card-ghost" />
                      <div className="np-empty-card-ghost np-ghost-2" />
                      <div className="np-empty-card-ghost np-ghost-3" />
                    </div>
                    <div className="np-empty-device-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="3"/>
                        <line x1="8" y1="6" x2="16" y2="6"/>
                        <circle cx="12" cy="14" r="3"/>
                      </svg>
                    </div>
                  </div>
                  <p className="np-empty-title">Waiting for a card...</p>
                  <p className="np-empty-desc">Pick a card and click or drag it to the Cheeko device to hear it come alive!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="np-active"
                  className="np-active"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Card header */}
                  <div className="np-header">
                    <span className="np-header-icon" style={{ background: currentData.bg }}>{currentData.icon}</span>
                    <div className="np-header-info">
                      <span className="np-header-title">{currentData.title}</span>
                      <span className="np-header-count">{currentItems.length} tracks</span>
                    </div>
                    <button className="np-eject-btn" onClick={handleEject} title="Eject card" aria-label="Eject card">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                    </button>
                  </div>

                  {/* Waveform equalizer */}
                  <div className={`np-waveform ${isPlaying ? 'np-waveform-playing' : ''}`}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        className="np-bar"
                        style={{ animationDelay: `${i * 0.08}s`, height: `${20 + Math.random() * 60}%` }}
                      />
                    ))}
                  </div>

                  {/* Current content display */}
                  <div className="np-current">
                    <span className="np-current-label">NOW PLAYING</span>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${insertedCard}-${contentIndex}`}
                        className="np-current-content"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="np-current-title">{currentItem?.title}</div>
                        <div className="np-current-text">{currentItem?.text}</div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Playback controls */}
                  <div className="np-controls">
                    <button className="np-ctrl-btn" onClick={handlePrevContent} aria-label="Previous track">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button className="np-ctrl-btn np-ctrl-play" onClick={handleKnobClick} aria-label="Play next">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
                    </button>
                    <button className="np-ctrl-btn" onClick={handleKnobClick} aria-label="Next track">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                  </div>

                  {/* Track list */}
                  <div className="np-tracklist">
                    {currentItems.map((item, i) => (
                      <button
                        key={i}
                        className={`np-track ${i === contentIndex ? 'np-track-active' : ''}`}
                        onClick={() => handleTrackClick(i)}
                      >
                        <span className="np-track-num">{i + 1}</span>
                        <span className="np-track-title">{item.title}</span>
                        {i === contentIndex && isPlaying && (
                          <span className="np-track-eq" aria-label="Playing">
                            <span /><span /><span />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Bottom tip */}
      <div className="demo-footer-tip">
        <span>&#128161;</span> Tip: Click a card to insert, click again to eject. Press <kbd>Space</kbd> for next, <kbd>Esc</kbd> to go back
      </div>

      {/* Flying card arc animation (click) */}
      <AnimatePresence>
        {flyingCard && (
          <FlyingCardArc key={'fly-' + flyingCard.cardId + Date.now()} flying={flyingCard} />
        )}
      </AnimatePresence>

      {/* Dropping card animation (drag) */}
      <AnimatePresence>
        {droppingCard && (
          <DroppingCard key={'drop-' + droppingCard.cardId + Date.now()} dropping={droppingCard} />
        )}
      </AnimatePresence>
    </div>
  );
}

function FlyingCardArc({ flying }) {
  const { cardId, startX, startY, endX, endY, width, height } = flying;
  const data = cardContent[cardId];

  // High dramatic arc
  const peakY = Math.min(startY, endY) - 210;
  const midX = (startX + endX) / 2;

  // Smooth 5-point arc control points
  const q1X = startX + (midX - startX) * 0.55;
  const q1Y = startY + (peakY - startY) * 0.7;
  const q3X = midX + (endX - midX) * 0.55;
  const q3Y = peakY + (endY - peakY) * 0.35;

  return (
    <motion.div
      className="flying-card-arc"
      style={{ width, height }}
      initial={{
        left: startX - width / 2,
        top: startY - height / 2,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        left: [
          startX - width / 2,     // K1: start
          q1X - width / 2,        // K2: rising
          midX - width / 2,       // K3: arc peak
          q3X - width / 2,        // K4: descending
          endX - width / 2,       // K5: above slot
          endX - width / 2,       // K6: entering slot
          endX - width / 2,       // K7: inside slot
        ],
        top: [
          startY - height / 2,    // K1: start
          q1Y - height / 2,       // K2: rising
          peakY - height / 2,     // K3: arc peak
          q3Y - height / 2,       // K4: descending
          endY - height / 2,      // K5: above slot
          endY + 20,              // K6: entering slot
          endY + 55,              // K7: inside slot
        ],
        scale: [1, 1.08, 0.86, 0.62, 0.48, 0.38, 0.18],
        scaleX: [1, 1.02, 1, 0.85, 0.62, 0.48, 0.3],
        opacity: [1, 1, 1, 1, 0.9, 0.5, 0],
        rotate: [0, -15, -5, 5, 1, 0, 0],
      }}
      exit={{ opacity: 0, scale: 0.05 }}
      transition={{
        duration: 1.7,
        times: [0, 0.14, 0.33, 0.52, 0.68, 0.84, 1],
        ease: [0.22, 1, 0.36, 1],
        left: { ease: 'easeInOut' },
        top: { ease: [0.25, 0.1, 0.25, 1] },
      }}
    >
      {data.cardImage ? (
        <img src={data.cardImage} alt="" className="flying-card-img" draggable={false} loading="eager" decoding="async" />
      ) : (
        <div className="flying-card-gradient" style={{ background: data.bg }}>
          <span>{data.icon}</span>
        </div>
      )}
    </motion.div>
  );
}

function DroppingCard({ dropping }) {
  const { cardId, x, startY, endY, width, height } = dropping;
  const data = cardContent[cardId];

  return (
    <motion.div
      className="flying-card-arc"
      style={{ width, height }}
      initial={{
        left: x - width / 2,
        top: startY - height / 2,
        scale: 0.9,
        opacity: 1,
        rotate: -3,
      }}
      animate={{
        top: [
          startY - height / 2,      // start: above device
          startY - height / 2 - 14,  // slight lift (hover)
          endY - height / 2,         // at slot opening
          endY + 22,                  // entering slot
          endY + 50,                  // inside slot
        ],
        scale: [0.9, 0.88, 0.52, 0.38, 0.15],
        scaleX: [1, 1, 0.68, 0.5, 0.3],
        opacity: [1, 1, 0.95, 0.5, 0],
        rotate: [-3, 0, 0, 0, 0],
      }}
      exit={{ opacity: 0, scale: 0.05 }}
      transition={{
        duration: 1.0,
        times: [0, 0.1, 0.45, 0.72, 1],
        ease: [0.22, 1, 0.36, 1],
        top: { ease: [0.45, 0.05, 0.55, 1] },
      }}
    >
      {data.cardImage ? (
        <img src={data.cardImage} alt="" className="flying-card-img" draggable={false} loading="eager" decoding="async" />
      ) : (
        <div className="flying-card-gradient" style={{ background: data.bg }}>
          <span>{data.icon}</span>
        </div>
      )}
    </motion.div>
  );
}
