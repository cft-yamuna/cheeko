import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../styles/Navbar.css';

export default function Navbar({ onTryDemo }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <span>&#127881; <strong>SOLD OUT!</strong> Due to high demand, new orders are paused. <a href="#try-demo">Try the demo!</a></span>
      </div>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#" className="nav-logo">
            <span className="logo-cheeko">CHEEKO</span>
            <span className="logo-star">&#10038;</span>
          </a>

          <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileOpen(false)}>How It Works</a>
            <a href="#try-demo" onClick={() => setMobileOpen(false)}>Try Demo</a>
            <a href="#reviews" onClick={() => setMobileOpen(false)}>Reviews</a>
          </div>

          <div className="nav-actions">
            <motion.button
              className="nav-cta"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTryDemo}
            >
              Notify Me
            </motion.button>

            <button
              className={`mobile-toggle ${mobileOpen ? 'open' : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
