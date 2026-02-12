import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/LandingPage.css';

export default function LandingPage({ onStartDemo, onCart }) {
  const [demoName, setDemoName] = useState('');
  const [demoLang, setDemoLang] = useState('en');
  const [formVisible, setFormVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const showForm = () => setFormVisible(true);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!demoName.trim()) return;
    onStartDemo({ name: demoName.trim(), lang: demoLang });
  };

  return (
    <div className="landing">
      {/* ===== YELLOW NAV BAR ===== */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <span className="brand-name">Cheeko</span>
          </div>

          <div className="nav-links">
            <a href="#" className="nav-link active">Home</a>
            <a href="#" className="nav-link">Our Story</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onCart(); }}>Shop</a>
            <a href="#" className="nav-link">Contact</a>
          </div>

          <div className="nav-actions">
            <motion.button
              className="nav-demo-btn"
              onClick={showForm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Demo
            </motion.button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`} />
          </button>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <a href="#" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Our Story</a>
              <a href="#" className="mobile-link" onClick={(e) => { e.preventDefault(); onCart(); setMobileMenuOpen(false); }}>Shop</a>
              <a href="#" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <button className="mobile-demo-btn" onClick={() => { showForm(); setMobileMenuOpen(false); }}>
                Try Demo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        {/* Blue S-curve background shape */}
        <svg className="hero-bg-shape" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0,0 H1440 V310
               C1340,370 1180,440 1000,480
               C820,520 640,570 480,640
               C320,710 160,790 0,830
               V0 Z"
            fill="#1B2A5E"
          />
        </svg>

        <div className="hero-inner">
          {/* Left text on blue area */}
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="hero-title">
              <span className="title-yellow">Your Child's All-in-One</span>
              {' '}Learning Companion.
            </h1>

            <p className="hero-subtitle">
              From Songs & Stories to Math, Future
              Skills, & More! Unlock a world of
              knowledge with a simple card!
            </p>

            <motion.button
              className="cta-primary"
              onClick={showForm}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              Try Demo
            </motion.button>
          </motion.div>

          {/* Right illustration */}
          <motion.div
            className="hero-illustration"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src="/hero-image.jpeg"
              alt="Child learning with Cheeko - Songs, Stories, Math, Future Skills, and Robot activities"
              className="hero-img"
              draggable={false}
              fetchPriority="high"
            />
          </motion.div>
        </div>
      </section>

      {/* ===== DEMO FORM MODAL ===== */}
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
                        <span className="submit-cta-text">Launch Demo</span>
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
