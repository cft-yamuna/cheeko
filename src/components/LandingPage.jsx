import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import '../styles/LandingPage.css';

const cardPreviews = [
  { icon: '🎵', label: 'Rhymes', color: '#FF6B8A' },
  { icon: '📚', label: 'Stories', color: '#7C5CFC' },
  { icon: '🅰️', label: 'ABC', color: '#00C9A7' },
  { icon: '🔢', label: 'Numbers', color: '#FFB830' },
  { icon: '🐻', label: 'Animals', color: '#2DC653' },
  { icon: '🎧', label: 'Music', color: '#FF8C42' },
];

export default function LandingPage({ onStartDemo, onCart }) {
  const [demoName, setDemoName] = useState('');
  const [demoLang, setDemoLang] = useState('en');
  const [formVisible, setFormVisible] = useState(false);

  // Device tilt on mouse move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [6, -6]), { stiffness: 120, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-6, 6]), { stiffness: 120, damping: 25 });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (formVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [formVisible]);

  // Close modal on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && formVisible) setFormVisible(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [formVisible]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const showForm = () => setFormVisible(true);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!demoName.trim()) return;
    onStartDemo({ name: demoName.trim(), lang: demoLang });
  };

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="brand-name">CHEEKO</span>
            <span className="brand-dot">&#10038;</span>
          </div>
          <div className="nav-actions">
            <motion.button
              className="nav-cart-btn"
              onClick={onCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Buy Now
            </motion.button>
            <motion.button
              className="nav-demo-btn"
              onClick={showForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Demo
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        {/* Ambient glows */}
        <div className="hero-glow" />
        <div className="hero-glow-secondary" />

        <div className="hero-content">
          {/* Left - Text */}
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="hero-tag"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="tag-dot" />
              AI-Powered Learning Device
            </motion.div>

            <h1 className="hero-title">
              Insert a card.
              <br />
              <span className="title-accent">Watch the magic.</span>
            </h1>

            <p className="hero-subtitle">
              Cheeko plays stories, rhymes & lessons on its built-in screen.
              Just pick a card, slide it in, and your child starts learning.
            </p>

            {/* Card preview chips */}
            <motion.div
              className="card-preview-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              {cardPreviews.map((card, i) => (
                <motion.div
                  key={card.label}
                  className="card-preview-chip"
                  style={{ '--chip-color': card.color }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                  whileHover={{ scale: 1.1, y: -3 }}
                >
                  <span>{card.icon}</span>
                  <small>{card.label}</small>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="hero-ctas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.button
                className="cta-primary"
                onClick={showForm}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                Try Interactive Demo
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </motion.button>
              <div className="hero-price-tag">
                {/* <span className="price-badge">SOLD OUT</span> */}
                <span className="price-amount">&#8377;3,999</span>
                <span className="price-old">&#8377;7,999</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Device */}
          <motion.div
            className="hero-device-wrap"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="device-perspective"
              style={{ rotateX, rotateY }}
            >
              <div className="device-glow-ring" />

              <img
                src="/1.jpeg"
                alt="Cheeko AI Device"
                className="device-image"
                draggable={false}
                width="360"
                height="480"
                fetchPriority="high"
              />

              {/* Floating cards */}
              <motion.div
                className="floating-card fc-top"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="fc-inner" style={{ background: 'linear-gradient(135deg, #FF6B8A, #FF8FA3)' }}>
                  <span>🎵</span>
                  <small>Rhymes</small>
                </div>
              </motion.div>

              <motion.div
                className="floating-card fc-bottom"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="fc-inner" style={{ background: 'linear-gradient(135deg, #7C5CFC, #9B8AFF)' }}>
                  <span>📚</span>
                  <small>Stories</small>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {!formVisible && (
            <motion.button
              className="scroll-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.5 }}
              onClick={showForm}
            >
              <span>Try the demo</span>
              <motion.svg
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <path d="M12 5v14M5 12l7 7 7-7"/>
              </motion.svg>
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      {/* Demo Form - Modal Popup */}
      <AnimatePresence>
        {formVisible && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => { if (e.target === e.currentTarget) setFormVisible(false); }}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.92, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Close button */}
              <button className="modal-close" onClick={() => setFormVisible(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>

              <div className="modal-split">
                {/* LEFT — Visual showcase panel */}
                <motion.div
                  className="modal-left"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="modal-left-bg" aria-hidden="true">
                    <span className="ml-blob ml-blob-1" />
                    <span className="ml-blob ml-blob-2" />
                  </div>

                  <div className="modal-device-showcase">
                    <img src="/1.jpeg" alt="Cheeko Device" className="modal-device-img" draggable={false} />
                    <span className="modal-device-ring" />
                  </div>

                  <div className="modal-left-text">
                    <h3 className="ml-tagline">Interactive AI Learning</h3>
                    <p className="ml-desc">Insert a card, hear a story. It's that simple.</p>
                  </div>

                  <div className="modal-left-features" aria-hidden="true">
                    <motion.div className="ml-feature" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <span className="ml-feat-icon">🎵</span><span>Rhymes & Songs</span>
                    </motion.div>
                    <motion.div className="ml-feature" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                      <span className="ml-feat-icon">📚</span><span>Stories</span>
                    </motion.div>
                    <motion.div className="ml-feature" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                      <span className="ml-feat-icon">🔢</span><span>Numbers & ABC</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* RIGHT — Form panel */}
                <div className="modal-right">
                  {/* Decorative corner shapes */}
                  <div className="mr-decor" aria-hidden="true">
                    <span className="mr-dot mr-dot-1" />
                    <span className="mr-dot mr-dot-2" />
                    <span className="mr-dot mr-dot-3" />
                  </div>

                  <motion.div
                    className="modal-right-header"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.45 }}
                  >
                    <div className="mr-badge-row">
                      <span className="mr-badge">
                        <span className="mr-badge-dot" />
                        Live Demo
                      </span>
                    </div>
                    <h2 className="form-title">
                      {demoName.trim() ? (
                        <>Hey <span className="title-name">{demoName.trim()}</span>, let's play!</>
                      ) : (
                        <>Who's ready to learn?</>
                      )}
                    </h2>
                    <p className="form-subtitle">Set up in seconds. No signup needed.</p>
                  </motion.div>

                  <form className="demo-form" onSubmit={handleDemoSubmit}>
                    <motion.div
                      className="field field-name"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <label htmlFor="childName">
                        <span className="field-step">1</span>
                        What's your child's name?
                      </label>
                      <div className="input-wrap">
                        <span className="input-icon" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </span>
                        <input
                          id="childName"
                          type="text"
                          placeholder="Type their name..."
                          value={demoName}
                          onChange={(e) => setDemoName(e.target.value)}
                          required
                          autoComplete="off"
                          autoFocus
                        />
                        <AnimatePresence>
                          {demoName.trim() && (
                            <motion.span
                              className="input-check"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    <motion.div
                      className="field field-lang"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38, duration: 0.4 }}
                    >
                      <label id="lang-label">
                        <span className="field-step">2</span>
                        Pick a language
                      </label>
                      <div className="lang-grid" role="radiogroup" aria-labelledby="lang-label">
                        {[
                          { code: 'en', label: 'English', icon: '🇬🇧' },
                          { code: 'hi', label: 'Hindi', icon: '🇮🇳' },
                          { code: 'te', label: 'Telugu', icon: '🇮🇳' },
                          { code: 'ta', label: 'Tamil', icon: '🇮🇳' },
                          { code: 'kn', label: 'Kannada', icon: '🇮🇳' },
                          { code: 'ml', label: 'Malayalam', icon: '🇮🇳' },
                          { code: 'mr', label: 'Marathi', icon: '🇮🇳' },
                          { code: 'bn', label: 'Bengali', icon: '🇮🇳' },
                        ].map((l, i) => (
                          <motion.button
                            key={l.code}
                            type="button"
                            className={`lang-card ${demoLang === l.code ? 'active' : ''}`}
                            onClick={() => setDemoLang(l.code)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.42 + i * 0.04, duration: 0.3 }}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.96 }}
                          >
                            <span className="lang-card-icon">{l.icon}</span>
                            <span className="lang-card-label">{l.label}</span>
                            {demoLang === l.code && (
                              <motion.span
                                className="lang-card-check"
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
                      className="submit-area"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.4 }}
                    >
                      <motion.button
                        type="submit"
                        className="cta-primary submit-cta"
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="submit-cta-text">
                          Launch Demo
                        </span>
                        <span className="submit-cta-arrow">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </span>
                      </motion.button>
                      <p className="submit-note">No account needed. Runs in your browser.</p>
                    </motion.div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
