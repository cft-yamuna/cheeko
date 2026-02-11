import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-cheeko">CHEEKO</span>
              <span className="logo-star">&#10038;</span>
            </div>
            <p className="footer-desc">
              AI-powered learning companion with a built-in display that plays stories, rhymes & lessons. Multilingual and magical.
            </p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#try-demo">Try Demo</a>
            <a href="#reviews">Reviews</a>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Blog</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Shipping Info</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 CheekoAI. All rights reserved. Made with &#10084;&#65039; in India.</p>
        </div>
      </div>
    </footer>
  );
}
