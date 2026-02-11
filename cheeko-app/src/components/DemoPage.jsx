import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Device from './Device';
import RFIDCard from './RFIDCard';
import cardContent, { allCardIds } from '../data/cardContent';
import '../styles/DemoPage.css';

const LANG_MAP = { en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN' };

// Group cards into shelves of 3
function chunkCards(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const cardShelves = chunkCards(allCardIds, 3);

export default function DemoPage({ userName, userLang, onBack, onCart }) {
  const [insertedCard, setInsertedCard] = useState(null);
  const [contentIndex, setContentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const deviceRef = useRef(null);

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

  const handleCardClick = useCallback((cardId) => {
    if (insertedCard === cardId) return;
    stopSpeech();
    if (insertedCard) {
      setInsertedCard(null);
      setContentIndex(0);
      setTimeout(() => {
        setInsertedCard(cardId);
        setContentIndex(0);
        setTimeout(() => playContent(cardId, 0), 900);
      }, 900);
    } else {
      setInsertedCard(cardId);
      setContentIndex(0);
      setTimeout(() => playContent(cardId, 0), 900);
    }
  }, [insertedCard, playContent]);

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
    stopSpeech();
    setInsertedCard(null);
    setContentIndex(0);
  }, []);

  const handleBack = useCallback(() => {
    stopSpeech();
    setInsertedCard(null);
    setContentIndex(0);
    onBack();
  }, [onBack]);

  const currentCardData = insertedCard ? cardContent[insertedCard] : null;

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

      {/* Now Playing / Idle Bar */}
      <AnimatePresence mode="wait">
        {insertedCard && currentCardData ? (
          <motion.div
            key="now-playing"
            className="now-playing-bar"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container now-playing-inner">
              <div className="now-playing-left">
                <div className="now-playing-dot" />
                <div className="now-playing-card-badge" style={{ background: currentCardData.bg }}>
                  <span>{currentCardData.icon}</span>
                </div>
                <div className="now-playing-info">
                  <span className="now-playing-label">Now Playing</span>
                  <span className="now-playing-title">{currentCardData.title}</span>
                </div>
              </div>
              <div className="now-playing-right">
                <span className="now-playing-hint">
                  Press <kbd>Space</kbd> for next
                </span>
                <motion.button
                  className="now-playing-eject"
                  onClick={handleEject}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  Eject
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle-bar"
            className="idle-instruction-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="container idle-instruction-inner">
              <span className="idle-dot" />
              <span>Choose a card from the library and drag it to the device</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main: Left shelves + Right device */}
      <main className="demo-main">
        <div className="demo-split">
          {/* LEFT: Card Shelves */}
          <div className="demo-shelves-col">
            <div className="shelves-header">
              <div className="shelves-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <div>
                <h3 className="shelves-title">Content Library</h3>
                <p className="shelves-subtitle">{allCardIds.length} learning cards</p>
              </div>
            </div>

            <div className="shelves-list">
              {cardShelves.map((shelfCards, si) => (
                <div key={si} className="card-shelf">
                  <div className="shelf-cards-row">
                    {shelfCards.map((id, ci) => (
                      <motion.div
                        key={id}
                        className="shelf-card-slot"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + si * 0.18 + ci * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <RFIDCard
                          cardId={id}
                          isInserted={insertedCard === id}
                          onCardClick={handleCardClick}
                          onDragToDevice={handleCardClick}
                          deviceRef={deviceRef}
                        />
                      </motion.div>
                    ))}
                  </div>
                  {/* Wooden shelf ledge */}
                  <div className="shelf-ledge">
                    <div className="shelf-ledge-top" />
                    <div className="shelf-ledge-front" />
                  </div>
                </div>
              ))}
            </div>

            <div className="shelves-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M18 8h-1a2 2 0 0 0-2 2v1H9v-1a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-7a2 2 0 0 0-2-2z"/></svg>
              <span>Drag a card to the device or click to insert</span>
            </div>
          </div>

          {/* CENTER: Visual connector */}
          <div className="demo-connector">
            <motion.div
              className="connector-arrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="connector-dots">
                <span className="connector-dot" style={{ animationDelay: '0s' }} />
                <span className="connector-dot" style={{ animationDelay: '0.3s' }} />
                <span className="connector-dot" style={{ animationDelay: '0.6s' }} />
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="connector-chevron"><path d="M9 18l6-6-6-6"/></svg>
            </motion.div>
          </div>

          {/* RIGHT: Device + info */}
          <div className="demo-device-col">
            <motion.div
              ref={deviceRef}
              className="demo-device-wrap"
              initial={{ opacity: 0, scale: 0.88, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <Device
                insertedCard={insertedCard}
                contentIndex={contentIndex}
                isPlaying={isPlaying}
                onKnobClick={handleKnobClick}
                lang={userLang}
              />
            </motion.div>

            {/* Device info below */}
            <motion.div
              className="device-info-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            >
              <div className="device-info-label">
                <span className="device-info-dot" />
                Cheeko AI Device
              </div>
              <p className="device-info-desc">
                Insert a learning card to hear stories, rhymes & lessons. Rotate the knob for next content.
              </p>
              <motion.button
                className="device-buy-cta"
                onClick={onCart}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="buy-cta-price">&#8377;3,999</span>
                <span className="buy-cta-text">Order Now</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
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
                  onClick={() => handleCardClick(id)}
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
        <span>&#128161;</span> Tip: Drag cards to device or click them. Press <kbd>Space</kbd> for next, <kbd>Esc</kbd> to go back
      </div>
    </div>
  );
}
