import { useState, useEffect, useCallback, useRef } from 'react';
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
    }, 1400);
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
    }, 900);
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

    // Eject old card instantly (no delay — user already dragged the new one to device)
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

  const handleBack = useCallback(() => {
    stopSpeech();
    setInsertedCard(null);
    setContentIndex(0);
    onBack();
  }, [onBack]);

  return (
    <div className="demo-page">
      {/* Decorative background elements */}
      <div className="demo-bg-decor" aria-hidden="true">
        <div className="decor-blob decor-blob-1" />
        <div className="decor-blob decor-blob-2" />
        <div className="decor-blob decor-blob-3" />
        <div className="decor-float decor-float-1">🎵</div>
        <div className="decor-float decor-float-2">📚</div>
        <div className="decor-float decor-float-3">🔢</div>
        <div className="decor-float decor-float-4">🐻</div>
        <div className="decor-float decor-float-5">🎧</div>
      </div>

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

      {/* Main: Left shelves + Right device */}
      <main className="demo-main">
        <div className="demo-split">
          {/* LEFT: Bookshelf with 2 rows of 3 */}
          <div className="demo-shelves-col">
            <div className="bookshelf">
              <div className="shelf-row">
                <div className="shelf-books">
                  {allCardIds.slice(0, 3).map((id, i) => (
                    <motion.div
                      key={id}
                      className="book-slot"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <RFIDCard
                        cardId={id}
                        isInserted={insertedCard === id}
                        onCardClick={handleCardClick}
                        onDragToDevice={handleCardDrag}
                        deviceRef={deviceRef}
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="shelf-plank" />
              </div>
              <div className="shelf-row">
                <div className="shelf-books">
                  {allCardIds.slice(3, 6).map((id, i) => (
                    <motion.div
                      key={id}
                      className="book-slot"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <RFIDCard
                        cardId={id}
                        isInserted={insertedCard === id}
                        onCardClick={handleCardClick}
                        onDragToDevice={handleCardDrag}
                        deviceRef={deviceRef}
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="shelf-plank" />
              </div>
            </div>
          </div>

          {/* RIGHT: Device (dominant) */}
          <div className="demo-device-col">
            <motion.div
              ref={deviceRef}
              className="demo-device-wrap"
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
              <Device
                insertedCard={insertedCard}
                contentIndex={contentIndex}
                isPlaying={isPlaying}
                onKnobClick={handleKnobClick}
                lang={userLang}
              />
            </motion.div>
          </div>
        </div>

        {/* Mobile: Card grid (hidden on desktop) */}
        <div className="mobile-cards-area">
          <h3 className="mobile-cards-title">Tap a card to insert</h3>
          <div className="mobile-cards-grid">
            {allCardIds.map((id, i) => {
              const data = cardContent[id];
              return (
                <motion.button
                  key={id}
                  className={`mobile-card-item ${insertedCard === id ? 'inserted' : ''}`}
                  style={{ background: data.bg }}
                  onClick={() => handleCardClick(id, null)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Insert ${data.title} card`}
                >
                  <div className="mobile-card-chip" />
                  <span className="mobile-card-icon">{data.icon}</span>
                  <span className="mobile-card-label">{data.title}</span>
                </motion.button>
              );
            })}
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

  // Arc peak: midpoint X, well above both start and end Y
  const peakY = Math.min(startY, endY) - 180;
  const midX = (startX + endX) / 2;

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
        left: [startX - width / 2, midX - width / 2, endX - width / 2],
        top: [startY - height / 2, peakY - height / 2, endY - height / 2],
        scale: [1, 0.88, 0.5],
        opacity: [1, 1, 0.8],
        rotate: [0, -6, 0],
      }}
      exit={{ opacity: 0, scale: 0.3 }}
      transition={{
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        left: { duration: 1.2, ease: 'easeInOut' },
        top: { duration: 1.2, ease: [0.32, 0, 0.67, 1] },
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
      }}
      animate={{
        top: endY - height / 2,
        scale: 0.5,
        opacity: [1, 1, 0],
      }}
      exit={{ opacity: 0, scale: 0.3 }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
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
