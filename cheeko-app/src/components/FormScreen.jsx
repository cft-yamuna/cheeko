import { useState } from 'react';
import BackButton from './BackButton';
import '../styles/FormScreen.css';

const languages = [
  { code: 'en', flag: '\u{1F1EC}\u{1F1E7}', name: 'English' },
  { code: 'hi', flag: '\u{1F1EE}\u{1F1F3}', name: 'Hindi' },
  { code: 'te', flag: '\u{1F1EE}\u{1F1F3}', name: 'Telugu' },
  { code: 'ta', flag: '\u{1F1EE}\u{1F1F3}', name: 'Tamil' },
];

export default function FormScreen({ onBack, onSubmit }) {
  const [name, setName] = useState('');
  const [lang, setLang] = useState('en');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), lang });
  };

  return (
    <section className="form-screen">
      <div className="form-container">
        <BackButton onClick={onBack} />

        <div className="form-header">
          <h1 className="logo-text small">cheeko</h1>
          <h2>Let's Get Started!</h2>
          <p>Tell us about yourself so we can personalize your experience</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">What's your name?</label>
            <input
              type="text"
              id="userName"
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="off"
            />
            <div className="input-icon">&#128075;</div>
          </div>

          <div className="form-group">
            <label>Choose your language</label>
            <div className="language-grid">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`lang-option ${lang === l.code ? 'selected' : ''}`}
                  onClick={() => setLang(l.code)}
                >
                  <span className="lang-flag">{l.flag}</span>
                  <span className="lang-name">{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="cta-button start-btn">
            <span>Start Exploring</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}
