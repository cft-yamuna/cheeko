import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Device from './Device';
import RFIDCard from './RFIDCard';
import cardContent, { leftCards, rightCards } from '../data/cardContent';
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
    setTimeout(() => { setFlyingCard(null); onDone(); }, 1500);
  }, []);

  const dropCardIntoDevice = useCallback((cardId, dropPoint, onDone) => {
    if (!deviceRef.current) { onDone(); return; }
    const deviceRect = deviceRef.current.getBoundingClientRect();
    const slotX = deviceRect.left + deviceRect.width / 2;
    const slotY = deviceRect.top - 10;
    setDroppingCard({
      cardId,
      startX: dropPoint?.x || slotX,
      startY: dropPoint?.y || (slotY - 120),
      slotX, slotY,
      width: 80, height: 110,
    });
    setTimeout(() => { setDroppingCard(null); onDone(); }, 1300);
  }, []);

  const handleCardClick = useCallback((cardId, cardEl) => {
    if (animatingRef.current) return;
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

  // Render a single shelf row — shows info tooltip in place of inserted card
  const renderShelfRow = (id) => {
    const isActive = insertedCard === id;
    return (
      <div className="shelf-row" key={id}>
        <div className="shelf-back-panel" />
        <div className="shelf-card-slot">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key="info"
                className="shelf-info-tooltip"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="shelf-info-header">What's on Screen?</div>
                <div className="shelf-info-content">
                  <div className="shelf-info-text">
                    {currentItem ? (
                      <>
                        <span className="shelf-info-title">{currentItem.title}</span>
                        <span className="shelf-info-body">{currentItem.text}</span>
                      </>
                    ) : (
                      <span className="shelf-info-empty">Loading...</span>
                    )}
                  </div>
                  <div className="shelf-info-right">
                    {currentData?.cardImage && (
                      <img className="shelf-info-img" src={currentData.cardImage} alt="" draggable={false} />
                    )}
                    <div className="shelf-info-progress-bar">
                      <div
                        className="shelf-info-progress-fill"
                        style={{ width: `${((contentIndex + 1) / currentItems.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <RFIDCard
                  cardId={id}
                  isInserted={false}
                  onCardClick={handleCardClick}
                  onDragToDevice={handleCardDrag}
                  deviceRef={deviceRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="shelf-surface" />
      </div>
    );
  };

  return (
    <div className="demo-page">
      {/* Header */}
      <header className="demo-header">
        <span className="demo-header-logo">Cheek<span className="logo-o">o</span></span>
        <div className="demo-header-right">
          <button className="demo-cart-btn" onClick={onCart} aria-label="Add to cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span>Add to Cart</span>
          </button>
          <button className="demo-hamburger" onClick={handleBack} aria-label="Go back">
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="demo-main">
        <div className="demo-grid">
          {/* LEFT: Wooden Bookshelf */}
          <div className="bookshelf">
            {leftCards.map(renderShelfRow)}
          </div>

          {/* CENTER: Device + Instructions */}
          <div className="device-center">
            {!insertedCard && (
              <p className="device-instruction-top">
                Click a card to play a story for <strong>{userName}</strong>!
              </p>
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

            <p className="device-instruction-bottom">
              Rotate knob for next track &amp; new visuals!
            </p>
          </div>

          {/* RIGHT: Wooden Bookshelf */}
          <div className="bookshelf">
            {rightCards.map(renderShelfRow)}
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="demo-footer">
        <span>Click a card to play a story for <strong>{userName}</strong></span>
      </footer>

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
  const dx = endX - startX;
  const dy = endY - startY;

  return (
    <motion.div
      className="flying-card-arc"
      style={{ width, height, left: startX - width / 2, top: startY - height / 2 }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
      animate={{
        x: [0, dx, dx],
        y: [0, dy - 20, dy + 60],
        scale: [1, 0.8, 0.8],
        opacity: [1, 1, 1],
        clipPath: ['inset(0 0 0% 0)', 'inset(0 0 0% 0)', 'inset(0 0 100% 0)'],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.2,
        times: [0, 0.65, 1],
        x: { duration: 1.2, times: [0, 0.65, 1], ease: 'linear' },
        y: { duration: 1.2, times: [0, 0.65, 1], ease: [0.25, -0.3, 0.5, 1] },
        scale: { duration: 1.2, times: [0, 0.65, 1], ease: 'linear' },
        clipPath: { duration: 1.2, times: [0, 0.65, 1], ease: 'linear' },
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
      style={{ width, height, left: startX - width / 2, top: startY - height / 2 }}
      initial={{ x: 0, y: 0, scale: 0.8, opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
      animate={{
        x: [0, dx, dx],
        y: [0, dy - 20, dy + 60],
        scale: [0.8, 0.8, 0.8],
        opacity: [1, 1, 1],
        clipPath: ['inset(0 0 0% 0)', 'inset(0 0 0% 0)', 'inset(0 0 100% 0)'],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 1.2,
        times: [0, 0.65, 1],
        x: { duration: 1.2, times: [0, 0.65, 1], ease: 'linear' },
        y: { duration: 1.2, times: [0, 0.65, 1], ease: [0.25, -0.3, 0.5, 1] },
        scale: { duration: 1.2, times: [0, 0.65, 1], ease: 'linear' },
        clipPath: { duration: 1.2, times: [0, 0.65, 1], ease: 'linear' },
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
