import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import DemoPage from './components/DemoPage';
import CartPage from './components/CartPage';

function App() {
  const [page, setPage] = useState('landing'); // 'landing' | 'demo' | 'cart'
  const [userName, setUserName] = useState('');
  const [userLang, setUserLang] = useState('en');
  const [prevPage, setPrevPage] = useState('landing');

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }
  }, []);

  const handleStartDemo = ({ name, lang }) => {
    setUserName(name);
    setUserLang(lang);
    setPage('demo');
    window.scrollTo(0, 0);
  };

  const goToCart = (from) => {
    setPrevPage(from || page);
    setPage('cart');
    window.scrollTo(0, 0);
  };

  if (page === 'cart') {
    return (
      <CartPage
        onBack={() => { setPage(prevPage); window.scrollTo(0, 0); }}
      />
    );
  }

  if (page === 'demo') {
    return (
      <DemoPage
        userName={userName}
        userLang={userLang}
        onBack={() => { setPage('landing'); window.scrollTo(0, 0); }}
        onCart={() => goToCart('demo')}
      />
    );
  }

  return <LandingPage onStartDemo={handleStartDemo} onCart={() => goToCart('landing')} />;
}

export default App;
