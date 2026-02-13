import { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/CartPage.css';

export default function CartPage({ onBack }) {
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '' });

  const price = 3999;
  const mrp = 7999;
  const total = price * qty;
  const savings = (mrp - price) * qty;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Order placed! We'll contact you at ${form.phone} to confirm.`);
  };

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div className="container cart-header-inner">
          <motion.button
            className="cart-back-btn"
            onClick={onBack}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </motion.button>
          <div className="cart-logo">
            <span className="logo-cheeko">CHEEKO</span>
            <span className="logo-star">&#10038;</span>
          </div>
          <div style={{ width: 80 }} />
        </div>
      </header>

      <main className="cart-main">
        <div className="container">
          <motion.h1
            className="cart-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Your Order
          </motion.h1>

          <div className="cart-grid">
            {/* Product Card */}
            <motion.div
              className="cart-product-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="product-image-wrap">
                <img src="/1.png" alt="Cheeko AI Device" className="product-img" width="280" height="280" loading="lazy" />
              </div>
              <div className="product-details">
                <h2 className="product-name">Cheeko AI Learning Device</h2>
                <p className="product-desc">Interactive learning with RFID cards. Includes 6 content cards: Rhymes, Stories, ABC, Numbers, Animals & Music.</p>
                <div className="product-pricing">
                  <span className="product-price">&#8377;{price.toLocaleString()}</span>
                  <span className="product-mrp">&#8377;{mrp.toLocaleString()}</span>
                  <span className="product-discount">{Math.round((1 - price / mrp) * 100)}% OFF</span>
                </div>
                <div className="product-qty">
                  <span className="qty-label">Quantity:</span>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="Decrease quantity">-</button>
                    <span className="qty-value">{qty}</span>
                    <button className="qty-btn" onClick={() => setQty(qty + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <div className="product-cards-included">
                  <span className="cards-label">Cards included:</span>
                  <div className="cards-chips">
                    {['Rhymes', 'Stories', 'ABC', 'Numbers', 'Animals', 'Music'].map((c) => (
                      <span key={c} className="card-chip">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Order Form */}
            <motion.div
              className="cart-form-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="form-card-title">Delivery Details</h3>
              <form className="cart-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="cart-name">Full Name</label>
                    <input id="cart-name" name="name" type="text" placeholder="Your name\u2026" autoComplete="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="cart-phone">Phone Number</label>
                    <input id="cart-phone" name="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" value={form.phone} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="cart-email">Email</label>
                  <input id="cart-email" name="email" type="email" placeholder="your@email.com" autoComplete="email" spellCheck={false} value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-field">
                  <label htmlFor="cart-address">Delivery Address</label>
                  <textarea id="cart-address" name="address" placeholder="House no., Street, Landmark\u2026" autoComplete="street-address" value={form.address} onChange={handleChange} required rows={3} />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="cart-city">City</label>
                    <input id="cart-city" name="city" type="text" placeholder="City\u2026" autoComplete="address-level2" value={form.city} onChange={handleChange} required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="cart-pincode">Pincode</label>
                    <input id="cart-pincode" name="pincode" type="text" inputMode="numeric" placeholder="560001" autoComplete="postal-code" value={form.pincode} onChange={handleChange} required />
                  </div>
                </div>

                {/* Order summary */}
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal ({qty} item{qty > 1 ? 's' : ''})</span>
                    <span>&#8377;{total.toLocaleString()}</span>
                  </div>
                  <div className="summary-row savings">
                    <span>You save</span>
                    <span>-&#8377;{savings.toLocaleString()}</span>
                  </div>
                  <div className="summary-row shipping">
                    <span>Shipping</span>
                    <span className="free-shipping">FREE</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>&#8377;{total.toLocaleString()}</span>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="place-order-btn"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Place Order &#8211; &#8377;{total.toLocaleString()}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
