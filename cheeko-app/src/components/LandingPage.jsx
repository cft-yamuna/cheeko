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
                <span className="price-badge">SOLD OUT</span>
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
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Close button */}
              <button className="modal-close" onClick={() => setFormVisible(false)} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>

              <div className="form-icon">🧸</div>
              <h2 className="form-title">Start the interactive demo</h2>
              <p className="form-subtitle">
                See how it works — pick cards, hear stories, rotate the knob.
                All from your browser.
              </p>

              <form className="demo-form" onSubmit={handleDemoSubmit}>
                <div className="field">
                  <label htmlFor="childName">Your child's name</label>
                  <input
                    id="childName"
                    type="text"
                    placeholder="Enter name\u2026"
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    required
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                <div className="field">
                  <label id="lang-label">Language</label>
                  <div className="lang-options" role="radiogroup" aria-labelledby="lang-label">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'hi', label: 'Hindi' },
                      { code: 'te', label: 'Telugu' },
                      { code: 'ta', label: 'Tamil' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        className={`lang-btn ${demoLang === l.code ? 'active' : ''}`}
                        onClick={() => setDemoLang(l.code)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="cta-primary submit-cta"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Demo
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
