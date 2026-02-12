import { useRef } from 'react';
import { motion } from 'framer-motion';
import cardContent from '../data/cardContent';

export default function RFIDCard({ cardId, isInserted, onCardClick, onDragToDevice, deviceRef }) {
  const data = cardContent[cardId];
  const cardRef = useRef(null);
  const didDragRef = useRef(false);

  const handleDragStart = () => {
    didDragRef.current = true;
  };

  const handleDragEnd = (e, info) => {
    if (!deviceRef?.current) return;
    const deviceRect = deviceRef.current.getBoundingClientRect();

    // Use info.point (pointer position at release) for hit detection
    const pointerX = info.point.x;
    const pointerY = info.point.y;

    const inX = pointerX >= deviceRect.left - 80 && pointerX <= deviceRect.right + 80;
    const inY = pointerY >= deviceRect.top - 80 && pointerY <= deviceRect.bottom + 80;

    if (inX && inY) {
      onDragToDevice(cardId);
    }
  };

  const handleClick = () => {
    // Skip click if a drag just happened
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    onCardClick(cardId, cardRef.current);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`rfid-card ${isInserted ? 'rfid-inserted' : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(cardId, cardRef.current); } }}
      role="button"
      tabIndex={0}
      aria-label={`${data.title} card${isInserted ? ' — currently playing' : ''}`}
      drag={!isInserted}
      dragSnapToOrigin
      dragElastic={0.6}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileHover={!isInserted ? { y: -12, scale: 1.03 } : { scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      whileDrag={{ scale: 1.08, zIndex: 100, boxShadow: '0 30px 60px rgba(0,0,0,0.35), 0 0 40px rgba(232,132,44,0.25)' }}
      style={{ zIndex: isInserted ? 0 : 1, '--card-color': data.color }}
    >
      <div className="rfid-card-visual">
        {data.cardImage ? (
          <img src={data.cardImage} alt={data.title} className="rfid-card-img" draggable={false} loading="lazy" decoding="async" />
        ) : (
          <div className="rfid-card-gradient" style={{ background: data.bg }}>
            <span className="rfid-card-icon">{data.icon}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
