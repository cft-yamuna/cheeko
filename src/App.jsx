import { useState, useEffect } from 'react';
import DemoPage from './components/DemoPage';
import CartPage from './components/CartPage';

function App() {
  const [page, setPage] = useState('demo'); // 'demo' | 'cart'

  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
    }
  }, []);

  const goToCart = () => {
    setPage('cart');
    window.scrollTo(0, 0);
  };

  if (page === 'cart') {
    return (
      <CartPage
        onBack={() => { setPage('demo'); window.scrollTo(0, 0); }}
      />
    );
  }

  return (
    <DemoPage
      onCart={goToCart}
    />
  );
}

export default App;
