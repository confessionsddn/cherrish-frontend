import { useState } from 'react'
import './BuyCreditsModal.css'
import { API_URL } from '../../services/api';

// ✅ REPLACE THESE WITH YOUR ACTUAL RAZORPAY PAYMENT LINK URLs
const PAYMENT_LINKS = {
  starter: 'https://rzp.io/rzp/763naKvr',   // Replace with your ₹29 link
  popular: 'hhttps://rzp.io/rzp/I5RAYnTk',   // Replace with your ₹69 link
  best: 'https://rzp.io/rzp/uMqm09o',      // Replace with your ₹139 link
  elite: 'https://rzp.io/rzp/Am55h8W'      // Replace with your ₹249 link
};

//https://rzp.io/rzp/L3kw1Q20
const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'STARTER',
    credits: 70,
    bonus: 0,
    price: 29,
    icon: '💰',
    tag: 'BASIC',
    color: 'yellow'
  },
  {
    id: 'popular',
    name: 'POPULAR',
    credits: 200,
    bonus: 25,
    price: 69,
    icon: '🔥',
    tag: 'HOT',
    color: 'cyan',
    popular: true
  },
  {
    id: 'best',
    name: 'BEST VALUE',
    credits: 400,
    bonus: 50,
    price: 139,
    icon: '👑',
    tag: '-40% OFF',
    color: 'purple',
    bestValue: true
  },
  {
    id: 'elite',
    name: 'ELITE PACK',
    credits: 800,
    bonus: 100,
    price: 249,
    icon: '💎',
    tag: 'MAX SAVINGS',
    color: 'red'
  }
]

export default function BuyCreditsModal({ onClose, currentCredits }) {
  const [processing, setProcessing] = useState(false)

  // ✅ UPDATED: Use payment links instead of Razorpay SDK
  const handlePurchase = (pkg) => {
    const paymentLink = PAYMENT_LINKS[pkg.id];
    
    if (!paymentLink || paymentLink === 'https://rzp.io/l/xxxxxxxx') {
      alert('❌ Payment link not configured! Please set up your Razorpay payment links first.');
      return;
    }
    
    // Store pending payment info (optional - for tracking)
    localStorage.setItem('pending_payment', JSON.stringify({
      type: 'credits',
      package: pkg.id,
      packageName: pkg.name,
      credits: pkg.credits + pkg.bonus,
      price: pkg.price,
      timestamp: Date.now()
    }));
    
    // Open payment link in new tab
    window.open(paymentLink, '_blank');
    
    // Show notification
    alert(`💳 Opening payment page...\n\nComplete the payment to receive ${pkg.credits + pkg.bonus} credits!\n\nCredits will be added automatically after successful payment.`);
    
    // Close modal
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="neo-modal-container wide-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER SECTION */}
        <div className="neo-modal-header brand-gradient relative-header">
          
          {/* 1. HANGING STICKER (Absolute Positioned) */}
          <div className="starburst-sticker">
            <div className="starburst-shape"></div>
            <span className="starburst-text">SALE!</span>
          </div>

          {/* 2. CENTERED TITLE STACK */}
          <div className="header-content-punchy">
            <h2><i className="fas fa-coins"></i> STORE </h2>
            <div className="subtitle-badge">UNLOCK PREMIUM POWERS INSTANTLY!</div>
          </div>

          {/* 3. CLOSE BUTTON (Absolute Positioned) */}
          <button className="neo-close-btn absolute-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="neo-modal-body pattern-bg">
          
          {/* BALANCE BAR */}
          <div className="credits-flash-bar">
            <span>YOUR STASH:</span>
            <div className="flash-pill">
              <i className="fas fa-coins"></i> {currentCredits}
            </div>
          </div>

          {/* PACKAGES GRID */}
          <div className="neo-items-grid credits-grid">
            {CREDIT_PACKAGES.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`
                  neo-item-card credit-package color-${pkg.color} 
                  ${pkg.popular ? 'popular-glow' : ''} 
                  ${pkg.bestValue ? 'best-value-scale' : ''}
                `}
              >
                {/* Tag */}
                {pkg.tag && <span className={`neo-tag rotate-tag tag-${pkg.color}`}>{pkg.tag}</span>}
                
                <div className="package-header-group">
                    <div className="package-icon-bounce">{pkg.icon}</div>
                    <h3 className="package-name">{pkg.name}</h3>
                </div>
                
                <div className="package-mid-group">
                    <div className="package-credits-box">
                    <span className="base-amt">{pkg.credits}</span>
                    {pkg.bonus > 0 && <span className="bonus-amt">+{pkg.bonus} FREE</span>}
                    </div>

                    <div className="total-label">
                    = {pkg.credits + pkg.bonus} CREDITS
                    </div>
                </div>

                <div className="package-bottom-group">
                    <div className="price-tag">₹{pkg.price}</div>

                    <button 
                      className="neo-buy-btn buy-credits-btn"
                      onClick={() => handlePurchase(pkg)}
                      disabled={processing}
                    >
                      {processing ? '...' : 'BUY NOW ⚡'}
                    </button>

                    <div className="package-value">
                    ONLY ₹{(pkg.price / (pkg.credits + pkg.bonus)).toFixed(2)} / credit
                    </div>
                </div>
              </div>
            ))}
          </div>

          {/* TRUST BADGES */}
          <div className="trust-badges">
            <span><i className="fas fa-lock"></i> 256-BIT SECURE</span>
            <span><i className="fas fa-bolt"></i> INSTANT DELIVERY</span>
            <span><i className="fas fa-thumbs-up"></i> NO REFUNDS</span>
          </div>

        </div>
      </div>
    </div>
  )
}
