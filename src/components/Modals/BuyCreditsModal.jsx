import { useState } from 'react'
import './BuyCreditsModal.css'

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

const handlePurchase = async (pkg) => {
  setProcessing(true)
  console.log('🛒 Starting purchase for:', pkg.name)

  try {
    const res = await fetch(`${API_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ package_type: pkg.id })
    })

    const data = await res.json()
    console.log('📦 Order response:', data)

    if (!data.success) {
      alert('❌ Failed: ' + (data.error || 'Unknown error'))
      setProcessing(false)
      return
    }

    if (typeof window.Razorpay === 'undefined') {
      alert('❌ Razorpay not loaded! Refresh page.')
      setProcessing(false)
      return
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: 'LOVECONFESS',
      description: `${pkg.name} - ${pkg.credits + pkg.bonus} Credits`,
      order_id: data.order_id,
      handler: async function (response) {
        try {
          const verifyRes = await fetch(`${API_URL}/api/payments/verify-payment`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            alert(`✅ ${verifyData.credits_added} credits added!`)
            window.location.reload()
          } else {
            alert('❌ Verification failed')
          }
        } catch (error) {
          alert('❌ Verification error')
        }
      },
      theme: { color: '#FF69B4' },
      modal: {
        ondismiss: function() {
          setProcessing(false)
        }
      }
    }

    const rzp = new window.Razorpay(options)
    rzp.open()

  } catch (error) {
    console.error('❌ Error:', error)
    alert('❌ Failed: ' + error.message)
    setProcessing(false)
  }
}


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="neo-modal-container wide-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER SECTION */}
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