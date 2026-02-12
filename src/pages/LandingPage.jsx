import { useState } from 'react'
import './LandingPage.css'

// API URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function LandingPage() {
  const [showAnimation, setShowAnimation] = useState(false)
 const legalLinks = [
    { path: '/contact-us', label: 'Contact Us' },
    { path: '/terms-and-conditions', label: 'Terms & Conditions' },
    { path: '/refunds-and-cancellation-policy', label: 'Refunds & Cancellation' }
  ]
  const handleGoogleLogin = () => {
    setShowAnimation(true)
    setTimeout(() => {
      window.location.href = `${API_BASE_URL}/auth/google`
    }, 800)
  }

  return (
    <div className="neo-landing-page">
      {/* Background Decor */}
      <div className="neo-background-grid"></div>
      
      {/* Floating Neo Shapes (SVG VERSION) */}
      <div className="neo-floating-shapes">
        
        {/* Shape 1: The Bolt (Yellow) */}
        <div className="neo-shape shape-1">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M55 5L15 60H45L35 95L85 40H50L55 5Z" fill="#FFC900" stroke="black" strokeWidth="4"/>
          </svg>
        </div>

        {/* Shape 2: The Block Heart (Pink) */}
        <div className="neo-shape shape-2">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 30V10H30V30H50V10H70V30H90V50H70V70H50V90H30V70H10V50H30V30H10Z" fill="#FF90E8" stroke="black" strokeWidth="4"/>
          </svg>
        </div>

        {/* Shape 3: The Thick X (Red) */}
        <div className="neo-shape shape-3">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 10L50 40L80 10L90 20L60 50L90 80L80 90L50 60L20 90L10 80L40 50L10 20L20 10Z" fill="#FF4444" stroke="black" strokeWidth="4"/>
          </svg>
        </div>

        {/* Shape 4: The 4-Point Sparkle (Cyan) */}
        <div className="neo-shape shape-4">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L65 35L100 50L65 65L50 100L35 65L0 50L35 35L50 0Z" fill="#23A6D5" stroke="black" strokeWidth="4"/>
          </svg>
        </div>

        {/* Shape 5: The Geo Eye (White) */}
        <div className="neo-shape shape-5">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 50C20 20 80 20 95 50C80 80 20 80 5 50Z" fill="white" stroke="black" strokeWidth="4"/>
            <circle cx="50" cy="50" r="15" fill="black"/>
            <circle cx="55" cy="45" r="5" fill="white"/>
          </svg>
        </div>

        {/* Shape 6: The Spiky Burst (Green) */}
        <div className="neo-shape shape-6">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0L60 30L90 20L75 50L100 70L70 80L50 100L30 80L0 70L25 50L10 20L40 30L50 0Z" fill="#00E054" stroke="black" strokeWidth="4"/>
          </svg>
        </div>

      </div>

      <div className="neo-landing-card pop-in">
         <div className="landing-legal-header">
          {legalLinks.map((link) => (
            <button
              key={link.path}
              className="landing-legal-btn"
              onClick={() => (window.location.href = link.path)}
            >
              {link.label}
            </button>
          ))}
        </div>
        {/* Marquee Banner */}
        <div className="marquee-container">
          <div className="marquee-content">
            <span>NO FILTERS • NO NAMES • JUST TRUTH • </span>
            <span>NO FILTERS • NO NAMES • JUST TRUTH • </span>
            <span>NO FILTERS • NO NAMES • JUST TRUTH • </span>
          </div>
        </div>

        {/* Logo Section */}
        <div className="neo-header">
          <div className="neo-logo-box">
            <i className="fas fa-heart-crack"></i>
          </div>
          <h1 className="neo-title">Cherrish</h1>
          <div className="neo-badge">THE #1 ANONYMOUS NETWORK</div>
        </div>

        {/* Features - Sticker Style */}
        <div className="neo-features">
          <div className="neo-feature-card color-pink">
            <i className="fas fa-mask"></i>
            <h3>HIDDEN</h3>
            <p>100% Anon.</p>
          </div>
          <div className="neo-feature-card color-yellow">
            <i className="fas fa-fire"></i>
            <h3>SPICY</h3>
            <p>Zero Filter.</p>
          </div>
          <div className="neo-feature-card color-blue">
            <i className="fas fa-lock"></i>
            <h3>SAFE</h3>
            <p>Verified.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="neo-cta-section">
          <button 
            className={`neo-google-btn ${showAnimation ? 'loading' : ''}`}
            onClick={handleGoogleLogin}
            disabled={showAnimation}
          >
            {showAnimation ? (
              <span className="btn-text">🚀 LAUNCHING...</span>
            ) : (
              <div className="btn-inner">
                <div className="google-icon-wrapper">
                  <i className="fab fa-google"></i>
                </div>
                <div className="btn-text-group">
                  <span className="btn-label">JOIN THE CHAOS</span>
                  <span className="btn-sub">SIGN IN WITH GOOGLE</span>
                </div>
              </div>
            )}
          </button>
          
          <p className="neo-security-text">
            <i className="fas fa-shield-cat"></i> EXCLUSIVE FOR COLLEGE STUDENTS ONLY!
          </p> 
        </div>

        {/* Footer */}
        <div className="neo-footer">
          <p>MADE FOR STUDENTS BY A STUDENT WITH LOVE ❤️</p>
        </div>
      </div>
    </div>
  )
}
