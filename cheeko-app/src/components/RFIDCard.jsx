import { useRef } from 'react';
import { motion } from 'framer-motion';
import cardContent from '../data/cardContent';

export default function RFIDCard({ cardId, isInserted, onCardClick, onDragToDevice, deviceRef }) {
  const data = cardContent[cardId];
  const cardRef = useRef(null);

  const handleDragEnd = (e, info) => {
    if (!deviceRef?.current) return;
    const deviceRect = deviceRef.current.getBoundingClientRect();
    const cardRect = cardRef.current?.getBoundingClientRect();
    if (!cardRect) return;

    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    const inX = cardCenterX >= deviceRect.left - 60 && cardCenterX <= deviceRect.right + 60;
    const inY = cardCenterY >= deviceRect.top - 60 && cardCenterY <= deviceRect.bottom + 60;

    if (inX && inY) {
      onDragToDevice(cardId);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`rfid-card ${isInserted ? 'rfid-inserted' : ''}`}
      onClick={() => !isInserted && onCardClick(cardId)}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isInserted) { e.preventDefault(); onCardClick(cardId); } }}
      role="button"
      tabIndex={isInserted ? -1 : 0}
      aria-label={`${data.title} card${isInserted ? ' — currently playing' : ''}`}
      drag={!isInserted}
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={handleDragEnd}
      whileHover={!isInserted ? { y: -18, scale: 1.06, rotateY: 4, rotateX: -2 } : {}}
      whileTap={!isInserted ? { scale: 0.96 } : {}}
      whileDrag={{ scale: 1.12, zIndex: 100, rotateY: 0, rotateX: 0, boxShadow: '0 30px 60px rgba(0,0,0,0.35), 0 0 40px rgba(232,132,44,0.25)' }}
      style={{ zIndex: isInserted ? 0 : 1 }}
    >
      {/* Card artwork area */}
      <div className="rfid-card-artwork">
        {data.cardImage ? (
          <img src={data.cardImage} alt={data.title} className="rfid-card-img" draggable={false} width="150" height="148" />
        ) : (
          <div className="rfid-card-gradient" style={{ background: data.bg }}>
            <div className="rfid-card-pattern" />
            <span className="rfid-card-icon">{data.icon}</span>
          </div>
        )}

        {/* Glossy overlay */}
        <div className="rfid-card-gloss" />
      </div>

      {/* Card info strip at bottom */}
      <div className="rfid-card-info">
        <span className="rfid-card-title">{data.title}</span>
        <span className="rfid-card-category">CHEEKO</span>
      </div>

      {/* RFID chip */}
      <div className="rfid-chip">
        <div className="rfid-chip-lines">
          <span /><span /><span /><span />
        </div>
      </div>

      {/* Inserted overlay */}
      {isInserted && (
        <div className="rfid-inserted-overlay">
          <div className="rfid-inserted-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
            <span>Playing</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
