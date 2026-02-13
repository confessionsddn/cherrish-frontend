import { useState } from 'react'
import './PremiumSubscriptionModal.css'
import { API_URL } from '../../services/api';

// ✅ REPLACE WITH YOUR ACTUAL PREMIUM PAYMENT LINK
const PREMIUM_PAYMENT_LINK = 'https://rzp.io/rzp/gRbUsl7'; // Replace with your ₹99 link

const AURA_FEATURES = [
  { icon: '🎨', title: 'Unlimited Confessions', desc: 'No credit cost ever.' },
  { icon: '🎤', title: 'Daily Free Voice Note', desc: '30-sec recording.' },
  { icon: '⭐', title: '10 Spotlight Boosts', desc: 'Refreshed per month.' },
  { icon: '👤', title: 'Free Username Change', desc: 'One-time change allowed.' },
  { icon: '💰', title: '150 Bonus Credits', desc: 'When free tier runs out.' },
  { icon: '👑', title: 'Premium Badge', desc: 'Displayed on all posts.' },
]

export default function PremiumSubscriptionModal({ onClose }) {
  const [processing, setProcessing] = useState(false)

  // ✅ UPDATED: Use payment link instead of Razorpay SDK
  const handleSubscribe = () => {
    if (!PREMIUM_PAYMENT_LINK || PREMIUM_PAYMENT_LINK === 'https://rzp.io/l/bbbbbbbb') {
      alert('❌ Premium payment link not configured! Please set up your Razorpay payment link first.');
      return;
    }
    
    // Store pending payment info (optional - for tracking)
    localStorage.setItem('pending_payment', JSON.stringify({
      type: 'premium',
      plan: 'monthly',
      price: 99,
      timestamp: Date.now()
    }));
    
    // Open payment link in new tab
    window.open(PREMIUM_PAYMENT_LINK, '_blank');
    
    // Show notification
    alert(`👑 Opening payment page...\n\nComplete the payment to activate Premium!\n\nYour premium benefits will be activated automatically after successful payment.`);
    
    // Close modal
    onClose();
  }

  return (
    <div className="aura-overlay" onClick={onClose}>
      <div className="aura-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="aura-glow-bg"></div>
        <div className="floating-crown">👑</div>
        
        <button className="aura-close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
        </button>

        {/* LEFT PANEL */}
        <div className="aura-left-panel">
            <div className="holo-card">
                <div className="holo-shine"></div>
                <div className="card-header">
                    <span>VIP ACCESS</span>
                    <i className="fas fa-infinity"></i>
                </div>
                <div className="card-body">
                    <h1>AURA<br/>PASS</h1>
                    <div className="card-chip">
                        <div className="chip-lines"></div>
                    </div>
                    <p className="card-number">**** **** **** ELITE</p>
                </div>
                <div className="card-footer">
                    <span>MEMBER SINCE 2024</span>
                    <span className="master-logo">///</span>
                </div>
            </div>
            
            <div className="price-explainer">
                <div className="discount-row">
                    <span className="strike">₹319</span>
                    <div className="save-tag">SAVE 69%</div>
                </div>
                <div className="final-price-row">
                    <span className="current-price">₹99</span>
                    <span className="period">/month</span>
                </div>
            </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="aura-right-panel">
            <div className="panel-header">
                <h2>UNLOCK GOD MODE</h2>
                <p>Don't just post. Dominate.</p>
            </div>

            {/* --- AUTOMATIC INFINITE SCROLL SECTION --- */}
            <div className="features-auto-scroll-mask">
                <div className="features-track">
                    {/* Map TWICE for seamless loop */}
                    {[...AURA_FEATURES, ...AURA_FEATURES].map((f, i) => (
                        <div key={i} className="aura-feature-row">
                            <div className="feature-icon-glow">{f.icon}</div>
                            <div className="feature-texts">
                                <h4>{f.title}</h4>
                                <p>{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                className="activate-aura-btn"
                onClick={handleSubscribe}
                disabled={processing}
            >
                <span className="btn-content">
                    {processing ? 'SYNCING AURA...' : 'ACTIVATE AURA PASS ⚡'}
                </span>
            </button>
            
            <p className="micro-terms">Recurring billing. Cancel anytime. No hidden fees.</p>
        </div>

      </div>
    </div>
  )
}
