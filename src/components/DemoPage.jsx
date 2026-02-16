import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeviceGLB from './DeviceGLB';
import cardContent, { leftCards, rightCards } from '../data/cardContent';
import '../styles/DemoPage.css';

const LANG_MAP = { en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN' };

const LANGUAGES = [
  { code: 'en', label: 'English', icon: '🇬🇧' },
  { code: 'hi', label: 'Hindi', icon: '🇮🇳' },
  { code: 'te', label: 'Telugu', icon: '🇮🇳' },
  { code: 'ta', label: 'Tamil', icon: '🇮🇳' },
  { code: 'kn', label: 'Kannada', icon: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', icon: '🇮🇳' },
  { code: 'mr', label: 'Marathi', icon: '🇮🇳' },
  { code: 'bn', label: 'Bengali', icon: '🇮🇳' },
];

export default function DemoPage({ onCart }) {
  const [userName, setUserName] = useState('');
  const [userLang, setUserLang] = useState('en');
  const [insertedCard, setInsertedCard] = useState(null);
  const [contentIndex, setContentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [flyingCard, setFlyingCard] = useState(null);
  const [droppingCard, setDroppingCard] = useState(null);
  const [showNameForm, setShowNameForm] = useState(false);
  const [demoName, setDemoName] = useState('');
  const [demoLang, setDemoLang] = useState('en');
  const [hasRotated, setHasRotated] = useState(false);
  const [hasClickedCard, setHasClickedCard] = useState(false);
  const pendingAction = useRef(null);
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showNameForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showNameForm]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && showNameForm) { setShowNameForm(false); pendingAction.current = null; }
      if (e.key === ' ' && insertedCard && !showNameForm) { e.preventDefault(); handleKnobClick(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [insertedCard, contentIndex, showNameForm]);

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
    const flyW = 80;
    const flyH = 110;
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

  const executeCardClick = useCallback((cardId, cardEl) => {
    animatingRef.current = true;
    setHasClickedCard(true);
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

  const handleCardClick = useCallback((cardId, cardEl) => {
    if (animatingRef.current) return;
    if (insertedCard === cardId) {
      stopSpeech();
      setInsertedCard(null);
      setContentIndex(0);
      return;
    }
    // If no name entered yet, show the name form and store the pending action
    if (!userName) {
      pendingAction.current = { type: 'click', cardId, cardEl };
      setShowNameForm(true);
      return;
    }
    executeCardClick(cardId, cardEl);
  }, [insertedCard, userName, executeCardClick]);

  const executeCardDrag = useCallback((cardId, dropPoint) => {
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

  const handleCardDrag = useCallback((cardId, dropPoint) => {
    if (animatingRef.current) return;
    if (insertedCard === cardId) return;
    // If no name entered yet, show the name form and store the pending action
    if (!userName) {
      pendingAction.current = { type: 'drag', cardId, dropPoint };
      setShowNameForm(true);
      return;
    }
    executeCardDrag(cardId, dropPoint);
  }, [insertedCard, userName, executeCardDrag]);

  const handleKnobClick = useCallback(() => {
    if (!insertedCard) return;
    const data = cardContent[insertedCard];
    const items = data.items[userLang] || data.items['en'];
    const nextIndex = (contentIndex + 1) % items.length;
    stopSpeech();
    setContentIndex(nextIndex);
    setHasRotated(true);
    setTimeout(() => playContent(insertedCard, nextIndex), 400);
  }, [insertedCard, contentIndex, userLang, playContent]);

  const handleEject = useCallback(() => {
    if (!insertedCard) return;
    stopSpeech();
    setInsertedCard(null);
    setContentIndex(0);
  }, [insertedCard]);

  const handleNameSubmit = useCallback((e) => {
    e.preventDefault();
    if (!demoName.trim()) return;
    const name = demoName.trim();
    const lang = demoLang;
    setUserName(name);
    setUserLang(lang);
    setShowNameForm(false);
    // Execute the pending card action
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) {
      setTimeout(() => {
        if (action.type === 'click') {
          executeCardClick(action.cardId, action.cardEl);
        } else if (action.type === 'drag') {
          executeCardDrag(action.cardId, action.dropPoint);
        }
      }, 300);
    }
  }, [demoName, demoLang, executeCardClick, executeCardDrag]);

  // Render a single card tray — shows info tooltip or 3 fanned mini-cards
  const renderShelfRow = (id) => {
    const isActive = insertedCard === id;
    const data = cardContent[id];
    const images = data.cardImages || [data.cardImage, data.cardImage, data.cardImage];
    return (
      <div className="card-tray" key={id} style={{ '--tray-color': data.color }}>
        <div className="tray-inner">
          <div
            className={`fanned-cards ${isActive ? 'fanned-active' : ''}`}
            onClick={(e) => handleCardClick(id, e.currentTarget)}
          >
            {images.slice(0, 3).map((img, i) => (
              <div key={i} className={`fanned-card fanned-card-${i}`}>
                <img
                  src={img}
                  alt=""
                  draggable={false}
                  onError={(e) => { e.target.src = data.cardImage; }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="tray-label">{data.title}</div>
      </div>
    );
  };

  return (
    <div className="demo-page">
      <span className="demo-brand">AI Kids Buddy</span>
      {/* Glass container */}
      <div className="demo-glass">
        <main className="demo-main">
          <div className="demo-grid">
            {/* LEFT: Card Trays */}
            <div className="bookshelf">
              {leftCards.map(renderShelfRow)}
            </div>

            {/* CENTER: Device + Instructions */}
            <div className="device-center">
              <motion.div
                ref={deviceRef}
                className={`demo-device-wrap ${!insertedCard ? 'device-idle' : ''}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              >
                <DeviceGLB
                  insertedCard={insertedCard}
                  contentIndex={contentIndex}
                  isPlaying={isPlaying}
                  onKnobClick={handleKnobClick}
                  lang={userLang}
                  isReceiving={!!flyingCard || !!droppingCard}
                />
              </motion.div>

            </div>

            {/* RIGHT: Card Trays */}
            <div className="bookshelf">
              {rightCards.map(renderShelfRow)}
            </div>
          </div>
        </main>
      </div>

      {/* Hint bubble */}
      <AnimatePresence mode="wait">
        {!hasClickedCard && !showNameForm && (
          <motion.div
            key="hint-click"
            className="hint-bubble"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hint-text">Click a card to see the magic!</span>
            <img src="/arrow.svg" alt="" className="hint-arrow-img" draggable={false} />
          </motion.div>
        )}
        {insertedCard && !showNameForm && !hasRotated && (
          <motion.div
            key="hint-knob"
            className="hint-bubble"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hint-text">Rotate the knob to view more!</span>
            <img src="/arrow.svg" alt="" className="hint-arrow-img" draggable={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name entry modal */}
      <AnimatePresence>
        {showNameForm && (
          <motion.div
            className="name-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => { if (e.target === e.currentTarget) { setShowNameForm(false); pendingAction.current = null; } }}
          >
            <motion.div
              className="name-modal-card"
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                className="name-modal-close"
                onClick={() => { setShowNameForm(false); pendingAction.current = null; }}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>

              <div className="name-modal-split">
                {/* LEFT — Device showcase panel */}
                <motion.div
                  className="name-modal-left"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="name-modal-device-showcase">
                    <img src="/1.png" alt="Cheeko Device" className="name-modal-device-img" draggable={false} />
                  </div>
                  <div className="name-modal-left-text">
                    <h3 className="name-modal-tagline">Interactive AI Learning</h3>
                    <p className="name-modal-desc">Insert a card, hear a story. It's that simple.</p>
                  </div>
                  <div className="name-modal-left-features">
                    <motion.div className="name-modal-feature" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <span className="name-modal-feat-icon">🎵</span><span>Rhymes & Songs</span>
                    </motion.div>
                    <motion.div className="name-modal-feature" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                      <span className="name-modal-feat-icon">📚</span><span>Stories</span>
                    </motion.div>
                    <motion.div className="name-modal-feature" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                      <span className="name-modal-feat-icon">🔢</span><span>Numbers & ABC</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* RIGHT — Form panel */}
                <div className="name-modal-right">
                  <motion.div
                    className="name-modal-header"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45 }}
                  >
                    <h2 className="name-modal-title">
                      {demoName.trim() ? (
                        <>Hey <span className="name-modal-highlight">{demoName.trim()}</span>, let's play!</>
                      ) : (
                        <>Who's ready to learn?</>
                      )}
                    </h2>
                    <p className="name-modal-subtitle">Set up in seconds. No signup needed.</p>
                  </motion.div>

                  <form className="name-modal-form" onSubmit={handleNameSubmit}>
                    <motion.div
                      className="name-modal-field"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <label htmlFor="childNameInput">
                        <span className="name-modal-step">1</span>
                        What's your child's name?
                      </label>
                      <div className="name-modal-input-wrap">
                        <span className="name-modal-input-icon" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <input
                          id="childNameInput"
                          type="text"
                          placeholder="Type their name..."
                          value={demoName}
                          onChange={(e) => setDemoName(e.target.value)}
                          required
                          autoComplete="off"
                          autoFocus
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      className="name-modal-field"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38, duration: 0.4 }}
                    >
                      <label>
                        <span className="name-modal-step">2</span>
                        Pick a language
                      </label>
                      <div className="name-modal-lang-grid">
                        {LANGUAGES.map((l, i) => (
                          <motion.button
                            key={l.code}
                            type="button"
                            className={`name-modal-lang ${demoLang === l.code ? 'active' : ''}`}
                            onClick={() => setDemoLang(l.code)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.42 + i * 0.04, duration: 0.3 }}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            <span className="name-modal-lang-label">{l.label}</span>
                            {demoLang === l.code && (
                              <motion.span
                                className="name-modal-lang-check"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                              </motion.span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      className="name-modal-submit-area"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                    >
                      <motion.button
                        type="submit"
                        className="name-modal-submit"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span>Continue</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </motion.button>
                      <p className="name-modal-note">No account needed. Runs in your browser.</p>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
