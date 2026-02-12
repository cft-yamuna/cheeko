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
    }, 2100);
  }, []);

  // Drop card into device (for drag) — starts from actual drop position
  const dropCardIntoDevice = useCallback((cardId, dropPoint, onDone) => {
    if (!deviceRef.current) { onDone(); return; }
    const deviceRect = deviceRef.current.getBoundingClientRect();
    const slotX = deviceRect.left + deviceRect.width / 2;
    const slotY = deviceRect.top - 10;
    const flyW = 80;
    const flyH = 110;

    setDroppingCard({
      cardId,
      startX: dropPoint?.x || slotX,
      startY: dropPoint?.y || (slotY - 120),
      slotX,
      slotY,
      width: flyW,
      height: flyH,
    });

    setTimeout(() => {
      setDroppingCard(null);
      onDone();
    }, 1600);
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
        setTimeout(() => playContent(cardId, 0), 800);
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

  const handleCardDrag = useCallback((cardId, dropPoint) => {
    if (animatingRef.current) return;
    if (insertedCard === cardId) return;

    animatingRef.current = true;
    stopSpeech();

    if (insertedCard) {
      setInsertedCard(null);
      setContentIndex(0);
    }

    dropCardIntoDevice(cardId, dropPoint, () => {
      setInsertedCard(cardId);
      setContentIndex(0);
      setTimeout(() => playContent(cardId, 0), 800);
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

            {/* Slot hint — only when no card inserted */}
            {!insertedCard && (
              <div className="device-slot-hint">
                <svg className="hint-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <span>Insert a card</span>
              </div>
            )}

            {/* Floating sparkles around device */}
            {!insertedCard && (
              <div className="device-sparkles" aria-hidden="true">
                <span className="sparkle s1" />
                <span className="sparkle s2" />
                <span className="sparkle s3" />
                <span className="sparkle s4" />
                <span className="sparkle s5" />
                <span className="sparkle s6" />
                <span className="sparkle s7" />
                <span className="sparkle s8" />
              </div>
            )}

            <motion.div
              ref={deviceRef}
              className={`demo-device-wrap ${!insertedCard ? 'device-idle' : ''}`}
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

            {/* Tagline below device */}
            {!insertedCard && (
              <p className="device-tagline">Tap a card to bring it to life</p>
            )}
          </div>

          {/* RIGHT: Now Playing Panel — always visible */}
          <div className="now-playing-panel">
            {/* Decorative blobs */}
            <div className="np-blob np-blob-1" aria-hidden="true" />
            <div className="np-blob np-blob-2" aria-hidden="true" />

            <AnimatePresence mode="wait">
              {!insertedCard ? (
                <motion.div
                  key="np-idle"
                  className="np-idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Fun floating music notes */}
                  <div className="np-idle-notes" aria-hidden="true">
                    <span className="np-note n1">&#9835;</span>
                    <span className="np-note n2">&#9834;</span>
                    <span className="np-note n3">&#9833;</span>
                  </div>

                  <div className="np-idle-icon" aria-hidden="true">
                    <span className="np-idle-emoji">&#127911;</span>
                  </div>
                  <p className="np-idle-title">Ready to Play!</p>
                  <p className="np-idle-desc">Pick a card and tap it to hear the magic</p>
                  <div className="np-idle-bars" aria-hidden="true">
                    <span /><span /><span /><span /><span /><span /><span />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="np-active"
                  className="np-active"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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

                  {/* Now playing label */}
                  <div className="np-current">
                    <span className="np-current-label">&#127925; NOW PLAYING</span>
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

  // Gentle arc: only lift ~80px above the straight path
  const dx = endX - startX;
  const dy = endY - startY;
  const arcLift = -80;

  return (
    <motion.div
      className="flying-card-arc"
      style={{
        width,
        height,
        left: startX - width / 2,
        top: startY - height / 2,
      }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        // Phase 1: gentle float to above slot
        // Phase 2: brief hover
        // Phase 3: slide into slot
        x: [0, dx * 0.5, dx, dx, dx],
        y: [0, dy * 0.4 + arcLift, dy, dy + 30, dy + 55],
        scale: [1, 0.72, 0.55, 0.4, 0.2],
        scaleX: [1, 0.8, 0.65, 0.45, 0.25],
        opacity: [1, 1, 1, 0.6, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 2.0,
        // 0→55%: float to slot | 55→70%: hover | 70→100%: slide in
        times: [0, 0.55, 0.7, 0.88, 1],
        ease: 'easeInOut',
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
  const { cardId, startX, startY, slotX, slotY, width, height } = dropping;
  const data = cardContent[cardId];

  const dx = slotX - startX;
  const dy = slotY - startY;

  return (
    <motion.div
      className="flying-card-arc"
      style={{
        width,
        height,
        left: startX - width / 2,
        top: startY - height / 2,
      }}
      initial={{ x: 0, y: 0, scale: 0.8, opacity: 1 }}
      animate={{
        // Float to slot, hover, slide in
        x: [0, dx * 0.6, dx, dx, dx],
        y: [0, dy * 0.5, dy, dy + 30, dy + 55],
        scale: [0.8, 0.6, 0.5, 0.38, 0.18],
        scaleX: [1, 0.8, 0.65, 0.45, 0.25],
        opacity: [1, 1, 1, 0.6, 0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.5,
        times: [0, 0.45, 0.65, 0.85, 1],
        ease: 'easeInOut',
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
