import { useState, useEffect, useCallback, useRef } from 'react';
import BackButton from './BackButton';
import CardShelf from './CardShelf';
import Device from './Device';
import cardContent, { leftCards, rightCards } from '../data/cardContent';
import '../styles/DemoScreen.css';

const LANG_MAP = { en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN' };

export default function DemoScreen({ userName, userLang, onBack }) {
  const [insertedCard, setInsertedCard] = useState(null);
  const [contentIndex, setContentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const speechRef = useRef(null);

  // Clean up speech on unmount
  useEffect(() => {
    return () => stopSpeech();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        stopSpeech();
        onBack();
      }
      if (e.key === ' ' && insertedCard) {
        e.preventDefault();
        handleKnobClick();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [insertedCard, contentIndex]);

  // Speak content
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
    speechRef.current = utterance;
  }, [userLang]);

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  // Play content for the currently inserted card at given index
  const playContent = useCallback((cardId, index) => {
    const data = cardContent[cardId];
    const items = data.items[userLang] || data.items['en'];
    const item = items[index];
    if (item) {
      setTimeout(() => speakContent(item.speech), 500);
    }
  }, [userLang, speakContent]);

  // Handle card click
  const handleCardClick = useCallback((cardId) => {
    if (insertedCard === cardId) return;

    stopSpeech();

    if (insertedCard) {
      // Eject first, then insert new
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

  // Handle knob click
  const handleKnobClick = useCallback(() => {
    if (!insertedCard) return;

    const data = cardContent[insertedCard];
    const items = data.items[userLang] || data.items['en'];
    const nextIndex = (contentIndex + 1) % items.length;

    stopSpeech();
    setContentIndex(nextIndex);
    setTimeout(() => playContent(insertedCard, nextIndex), 400);
  }, [insertedCard, contentIndex, userLang, playContent]);

  // Handle eject
  const handleEject = useCallback(() => {
    stopSpeech();
    setInsertedCard(null);
    setContentIndex(0);
  }, []);

  // Handle back
  const handleBack = useCallback(() => {
    stopSpeech();
    setInsertedCard(null);
    setContentIndex(0);
    onBack();
  }, [onBack]);

  return (
    <section className="demo-screen">
      <div className="demo-header">
        <h1 className="logo-text small">cheeko</h1>
        <div className="user-greeting">Hi, {userName}!</div>
        <BackButton onClick={handleBack} />
      </div>

      <div className="demo-instruction">
        {insertedCard ? (
          <>
            <span className="instruction-icon">&#128266;</span>
            <span>Listening... Rotate the knob for next content!</span>
          </>
        ) : (
          <>
            <span className="instruction-icon">&#128071;</span>
            <span>Click a card to insert it into the device!</span>
          </>
        )}
      </div>

      <div className="demo-area">
        <CardShelf
          title="Learning Cards"
          cardIds={leftCards}
          insertedCard={insertedCard}
          onCardClick={handleCardClick}
          side="left"
        />

        <Device
          insertedCard={insertedCard}
          contentIndex={contentIndex}
          isPlaying={isPlaying}
          onKnobClick={handleKnobClick}
          lang={userLang}
        />

        <CardShelf
          title="Fun Cards"
          cardIds={rightCards}
          insertedCard={insertedCard}
          onCardClick={handleCardClick}
          side="right"
        />
      </div>

      {insertedCard && (
        <div className="eject-area">
          <button className="eject-btn" onClick={handleEject}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            Eject Card
          </button>
        </div>
      )}
    </section>
  );
}
