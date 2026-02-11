import { useRef } from 'react';
import { motion } from 'framer-motion';
import RFIDCard from './RFIDCard';

export default function CardShelf({ cardIds, insertedCard, onCardClick, onDragToDevice, deviceRef }) {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  return (
    <div className="card-shelf-container">
      {/* Library header */}
      <div className="shelf-header">
        <div className="shelf-header-left">
          <div className="shelf-header-icon-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </div>
          <div>
            <h3 className="shelf-title">Content Library</h3>
            <p className="shelf-subtitle">{cardIds.length} learning cards available</p>
          </div>
        </div>
        <div className="shelf-nav-arrows">
          <button className="shelf-arrow" onClick={() => scroll(-1)} aria-label="Scroll left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button className="shelf-arrow" onClick={() => scroll(1)} aria-label="Scroll right">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* Horizontal scrollable card row */}
      <div className="shelf-scroll-track" ref={scrollRef}>
        <div className="shelf-card-row">
          {cardIds.map((id, i) => (
            <motion.div
              key={id}
              className="shelf-card-slot"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <RFIDCard
                cardId={id}
                isInserted={insertedCard === id}
                onCardClick={onCardClick}
                onDragToDevice={onDragToDevice}
                deviceRef={deviceRef}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Drag hint */}
      <div className="shelf-drag-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-6 0v4"/><path d="M18 8h-1a2 2 0 0 0-2 2v1H9v-1a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-7a2 2 0 0 0-2-2z"/></svg>
        <span>Drag a card to the device or click to insert</span>
      </div>
    </div>
  );
}
